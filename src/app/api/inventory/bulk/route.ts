// app/api/inventory/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database.ts";
import { Logger } from "@/lib/logger.js";
import { z } from "zod";

const bulkInventorySchema = z.object({
  inventories: z
    .array(
      z.object({
        type: z.string().min(1),
        brand: z.string().min(1),
        category: z.string().min(1),
        name: z.string().min(1),
        quantity: z.number().min(0),
        accountId: z.number().optional().default(3), // Default to main account
      })
    )
    .min(1, "At least one inventory item is required"),
  uploadType: z.enum(["add", "replace"]).default("add"),
  userId: z.string().default("DASHBOARD"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = bulkInventorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { inventories, uploadType, userId } = validationResult.data;

    Logger.info("Starting bulk inventory upload", {
      count: inventories.length,
      uploadType,
      userId,
    });

    const processedInventories = await DatabaseService.transaction(
      async (client) => {
        const results = [];
        const errors = [];
        const currentTimestamp = new Date();

        // Batch process in chunks of 50 for better performance
        const BATCH_SIZE = 50;

        for (let i = 0; i < inventories.length; i += BATCH_SIZE) {
          const batch = inventories.slice(i, i + BATCH_SIZE);

          for (const inventoryData of batch) {
            try {
              // 1. Find active product with proper status filter
              const product = await DatabaseService.query(
                `SELECT id, name, type, brand, category 
                 FROM product 
                 WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) 
                 AND LOWER(TRIM(category)) = LOWER(TRIM($2)) 
                 AND LOWER(TRIM(brand)) = LOWER(TRIM($3)) 
                 AND LOWER(TRIM(type)) = LOWER(TRIM($4))
                 AND status = '10'`,
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
                errors.push({
                  item: inventoryData,
                  error: `Active product not found: ${inventoryData.type} | ${inventoryData.brand} | ${inventoryData.category} | ${inventoryData.name}`,
                });
                continue;
              }

              // 2. Get or create product lot (required for inventory)
              let productLot = await DatabaseService.query(
                `SELECT id FROM productlot 
                 WHERE productid = $1 AND accountid = $2`,
                {
                  params: [product.id, inventoryData.accountId],
                  transactionClient: client,
                  singleRow: true,
                }
              );

              if (!productLot) {
                // Create new product lot
                productLot = await DatabaseService.query(
                  `INSERT INTO productlot (productid, accountid, adddate, adduser, editdate, edituser)
                   VALUES ($1, $2, $3, $4, $3, $4)
                   RETURNING id`,
                  {
                    params: [
                      product.id,
                      inventoryData.accountId,
                      currentTimestamp,
                      userId,
                    ],
                    transactionClient: client,
                    singleRow: true,
                  }
                );
              }

              // 3. Check existing inventory for this lot
              const existingInventory = await DatabaseService.query(
                `SELECT id, onhandqty, allocatedqty, pickedqty 
                 FROM inventory 
                 WHERE productid = $1 AND lotid = $2`,
                {
                  params: [product.id, productLot.id],
                  transactionClient: client,
                  singleRow: true,
                }
              );

              let newQuantity = inventoryData.quantity;
              let inventoryResult;
              let action;
              let oldQuantity = 0;

              if (existingInventory) {
                // Update existing inventory
                oldQuantity = existingInventory.onhandqty || 0;

                if (uploadType === "add") {
                  newQuantity = oldQuantity + inventoryData.quantity;
                }
                // For "replace", newQuantity is already set to inventoryData.quantity

                inventoryResult = await DatabaseService.query(
                  `UPDATE inventory 
                   SET onhandqty = $1, 
                       editdate = $2, 
                       edituser = $3
                   WHERE id = $4
                   RETURNING *`,
                  {
                    params: [
                      newQuantity,
                      currentTimestamp,
                      userId,
                      existingInventory.id,
                    ],
                    transactionClient: client,
                    singleRow: true,
                  }
                );

                action = "updated";
              } else {
                // Create new inventory record
                inventoryResult = await DatabaseService.query(
                  `INSERT INTO inventory (
                     productid, lotid, onhandqty, allocatedqty, pickedqty, 
                     adddate, adduser, editdate, edituser
                   )
                   VALUES ($1, $2, $3, 0, 0, $4, $5, $4, $5)
                   RETURNING *`,
                  {
                    params: [
                      product.id,
                      productLot.id,
                      newQuantity,
                      currentTimestamp,
                      userId,
                    ],
                    transactionClient: client,
                    singleRow: true,
                  }
                );

                action = "created";
              }

              // 4. Log inventory movement (correct table name: inventorymove)
              const movementQuantity =
                uploadType === "add"
                  ? inventoryData.quantity
                  : newQuantity - oldQuantity;

              if (movementQuantity !== 0) {
                await DatabaseService.query(
                  `INSERT INTO inventorymove (
                     inventoryid, lotid, productid, movetype, quantity, 
                     movedate, adddate, adduser, editdate, edituser
                   )
                   VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $6, $7)`,
                  {
                    params: [
                      inventoryResult.id,
                      productLot.id,
                      product.id,
                      uploadType === "add" ? "BULK_ADD" : "BULK_REPLACE",
                      movementQuantity,
                      currentTimestamp,
                      userId,
                    ],
                    transactionClient: client,
                  }
                );
              }

              results.push({
                id: inventoryResult.id,
                productId: product.id,
                productName: product.name,
                lotId: productLot.id,
                action,
                oldQuantity,
                newQuantity,
                quantityChanged: movementQuantity,
                type: inventoryData.type,
                brand: inventoryData.brand,
                category: inventoryData.category,
              });
            } catch (itemError) {
              Logger.error("Error processing inventory item", {
                item: inventoryData,
                error: itemError,
              });

              errors.push({
                item: inventoryData,
                error:
                  itemError instanceof Error
                    ? itemError.message
                    : "Unknown processing error",
              });
            }
          }
        }

        return { results, errors };
      }
    );

    const { results, errors } = processedInventories;

    Logger.info("Bulk inventory upload completed", {
      processed: results.length,
      failed: errors.length,
      uploadType,
    });

    const response = {
      message: `Bulk inventory upload completed: ${results.length} processed, ${errors.length} failed`,
      summary: {
        total: inventories.length,
        processed: results.length,
        failed: errors.length,
        uploadType,
      },
      inventories: results,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    Logger.error("Bulk inventory upload failed", { error });

    return NextResponse.json(
      {
        message: "Internal server error during bulk inventory upload",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
