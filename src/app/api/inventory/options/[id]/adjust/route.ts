// app/api/inventory/[id]/adjust/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { z } from "zod";
import { Inventory } from "@/components/model/model";

const adjustInventorySchema = z.object({
  adjustmentType: z.enum(["ADD", "SUBTRACT", "SET"]),
  quantity: z.number().positive("Quantity must be positive"),
  reason: z.string().min(1, "Reason is required"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiParams = await params;
  try {
    const inventoryId = apiParams.id;
    const body = await request.json();
    const { adjustmentType, quantity, reason } =
      adjustInventorySchema.parse(body);

    const result = await DatabaseService.transaction(async (client) => {
      // Get current inventory
      const currentInventory = await DatabaseService.query<Inventory>(
        `SELECT * FROM inventory WHERE id = $1`,
        { params: [inventoryId], singleRow: true, transactionClient: client }
      );

      if (!currentInventory) {
        throw new Error("Inventory record not found");
      }

      let newOnHandQty;
      switch (adjustmentType) {
        case "ADD":
          newOnHandQty = currentInventory.onhandqty + quantity;
          break;
        case "SUBTRACT":
          newOnHandQty = Math.max(0, currentInventory.onhandqty - quantity);
          break;
        case "SET":
          newOnHandQty = quantity;
          break;
      }

      const newAvailableQty =
        newOnHandQty -
        currentInventory.allocatedqty -
        currentInventory.pickedqty;

      // Update inventory
      const updatedInventory = await DatabaseService.query(
        `UPDATE inventory 
         SET onhandqty = $1, availableqty = $2, editdate = CURRENT_TIMESTAMP, edituser = 'DASHBOARD'
         WHERE id = $3
         RETURNING *`,
        {
          params: [newOnHandQty, newAvailableQty, inventoryId],
          singleRow: true,
          transactionClient: client,
        }
      );

      // Record inventory movement
      await DatabaseService.query(
        `INSERT INTO inventorymove (
          inventoryid, productid, lotid, movetype, quantity, 
          movedate, adddate, adduser, editdate, edituser
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'DASHBOARD', CURRENT_TIMESTAMP, 'DASHBOARD')`,
        {
          params: [
            inventoryId,
            currentInventory.productid,
            currentInventory.lotid,
            `ADJUSTMENT_${adjustmentType}`,
            adjustmentType === "SUBTRACT" ? -quantity : quantity,
          ],
          transactionClient: client,
        }
      );

      return updatedInventory;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Adjust inventory error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
