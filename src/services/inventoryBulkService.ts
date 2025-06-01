// src/services/inventoryBulkService.ts
import { DatabaseService } from "@/services/database";

export interface InventoryItem {
  type: string;
  brand: string;
  category: string;
  name: string;
  quantity: number;
}

export interface BulkInventoryResult {
  processed: number;
  skipped: number;
  failed: number;
  items: Array<{
    item: InventoryItem;
    action: "created" | "updated" | "skipped" | "failed";
    reason?: string;
    oldQuantity?: number;
    newQuantity?: number;
  }>;
}

export class InventoryBulkService {
  static async processInventoryBatch(
    inventories: InventoryItem[],
    uploadType: "add" | "replace" = "add"
  ): Promise<BulkInventoryResult> {
    return await DatabaseService.transaction(async (client) => {
      const results: BulkInventoryResult = {
        processed: 0,
        skipped: 0,
        failed: 0,
        items: [],
      };

      for (const inventoryData of inventories) {
        try {
          // Find the product first
          const product = await DatabaseService.query(
            `SELECT id, name FROM product 
             WHERE LOWER(name) = LOWER($1) 
             AND LOWER(category) = LOWER($2) 
             AND LOWER(brand) = LOWER($3) 
             AND LOWER(type) = LOWER($4)`,
            {
              params: [
                inventoryData.name,
                inventoryData.category,
                inventoryData.brand,
                inventoryData.type,
              ],
              transactionClient: client,
              singleRow: true,
            }
          );

          if (!product) {
            results.failed++;
            results.items.push({
              item: inventoryData,
              action: "failed",
              reason: `Product not found: ${inventoryData.type}, ${inventoryData.brand}, ${inventoryData.category}, ${inventoryData.name}`,
            });
            continue;
          }

          // Check if inventory record already exists
          const existingInventory = await DatabaseService.query(
            `SELECT i.id, i.onhandqty, i.lotid 
             FROM inventory i
             JOIN lot l ON i.lotid = l.id
             WHERE i.productid = $1`,
            {
              params: [product.id],
              transactionClient: client,
              singleRow: true,
            }
          );

          let newQuantity = inventoryData.quantity;
          let action: "created" | "updated" = "created";
          let oldQuantity = 0;

          if (existingInventory) {
            // Update existing inventory
            oldQuantity = existingInventory.onhandqty;

            if (uploadType === "add") {
              newQuantity =
                existingInventory.onhandqty + inventoryData.quantity;
            }
            // For "replace", newQuantity is already set to inventoryData.quantity

            await DatabaseService.query(
              `UPDATE inventory 
               SET onhandqty = $1, moddate = CURRENT_TIMESTAMP, moduser = 'DASHBOARD'
               WHERE id = $2`,
              {
                params: [newQuantity, existingInventory.id],
                transactionClient: client,
              }
            );

            // Log the inventory movement
            await DatabaseService.query(
              `INSERT INTO inventorymovement (inventoryid, movetype, quantity, movedate, adduser)
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'DASHBOARD')`,
              {
                params: [
                  existingInventory.id,
                  uploadType === "add" ? "BULK_ADD" : "BULK_REPLACE",
                  uploadType === "add"
                    ? inventoryData.quantity
                    : newQuantity - oldQuantity,
                ],
                transactionClient: client,
              }
            );

            action = "updated";
          } else {
            // Find or create a lot for this product
            let lot = await DatabaseService.query(
              `SELECT id FROM lot WHERE productid = $1 LIMIT 1`,
              {
                params: [product.id],
                transactionClient: client,
                singleRow: true,
              }
            );

            if (!lot) {
              // Create a default lot
              lot = await DatabaseService.query(
                `INSERT INTO lot (productid, accountcode, adddate, adduser)
                 VALUES ($1, 'DEFAULT', CURRENT_TIMESTAMP, 'DASHBOARD')
                 RETURNING id`,
                {
                  params: [product.id],
                  transactionClient: client,
                  singleRow: true,
                }
              );
            }

            // Create new inventory record
            const newInventory = await DatabaseService.query(
              `INSERT INTO inventory (productid, lotid, onhandqty, allocatedqty, pickedqty, adddate, adduser)
               VALUES ($1, $2, $3, 0, 0, CURRENT_TIMESTAMP, 'DASHBOARD')
               RETURNING id`,
              {
                params: [product.id, lot.id, newQuantity],
                transactionClient: client,
                singleRow: true,
              }
            );

            // Log the inventory movement
            await DatabaseService.query(
              `INSERT INTO inventorymovement (inventoryid, movetype, quantity, movedate, adduser)
               VALUES ($1, 'BULK_CREATE', $2, CURRENT_TIMESTAMP, 'DASHBOARD')`,
              {
                params: [newInventory.id, newQuantity],
                transactionClient: client,
              }
            );
          }

          results.processed++;
          results.items.push({
            item: inventoryData,
            action,
            oldQuantity,
            newQuantity,
            reason:
              action === "updated"
                ? `${
                    uploadType === "add" ? "Added" : "Set"
                  } quantity from ${oldQuantity} to ${newQuantity}`
                : `Created new inventory with quantity ${newQuantity}`,
          });
        } catch (error) {
          console.error(`Error processing inventory item:`, error);
          results.failed++;
          results.items.push({
            item: inventoryData,
            action: "failed",
            reason: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return results;
    });
  }
}
