// app/api/inventory/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { Logger } from "@/lib/logger.js";
import { z } from "zod";

const updateInventorySchema = z.object({
  onhandqty: z
    .number()
    .min(0, "On hand quantity cannot be negative")
    .optional(),
  allocatedqty: z
    .number()
    .min(0, "Allocated quantity cannot be negative")
    .optional(),
  pickedqty: z.number().min(0, "Picked quantity cannot be negative").optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryId = parseInt(params.id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { message: "Invalid inventory ID" },
        { status: 400 }
      );
    }

    const inventory = await DatabaseService.query(
      `SELECT 
        i.id,
        i.productid,
        i.lotid,
        i.onhandqty,
        i.allocatedqty,
        i.pickedqty,
        (i.onhandqty - i.allocatedqty - i.pickedqty) as availableqty,
        i.adddate,
        i.adduser,
        i.editdate,
        i.edituser,
        p.name as productname,
        p.category as productcategory,
        p.brand as productbrand,
        p.type as producttype,
        p.price as productprice,
        pl.accountid,
        a.code as accountcode
      FROM inventory i
      INNER JOIN product p ON i.productid = p.id
      INNER JOIN productlot pl ON i.lotid = pl.id
      INNER JOIN account a ON pl.accountid = a.id
      WHERE i.id = $1`,
      { params: [inventoryId], singleRow: true }
    );

    if (!inventory) {
      return NextResponse.json(
        { message: "Inventory record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(inventory, { status: 200 });
  } catch (error) {
    Logger.error("Error fetching inventory item", { error, id: params.id });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryId = parseInt(params.id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { message: "Invalid inventory ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateInventorySchema.parse(body);

    Logger.info("Updating inventory record", {
      id: inventoryId,
      data: validatedData,
    });

    // Check if inventory exists
    const existingInventory = await DatabaseService.query(
      `SELECT * FROM inventory WHERE id = $1`,
      { params: [inventoryId], singleRow: true }
    );

    if (!existingInventory) {
      return NextResponse.json(
        { message: "Inventory record not found" },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (validatedData.onhandqty !== undefined) {
      updateFields.push(`onhandqty = $${paramIndex}`);
      updateValues.push(validatedData.onhandqty);
      paramIndex++;
    }

    if (validatedData.allocatedqty !== undefined) {
      updateFields.push(`allocatedqty = $${paramIndex}`);
      updateValues.push(validatedData.allocatedqty);
      paramIndex++;
    }

    if (validatedData.pickedqty !== undefined) {
      updateFields.push(`pickedqty = $${paramIndex}`);
      updateValues.push(validatedData.pickedqty);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    // Add metadata fields
    updateFields.push(`editdate = CURRENT_TIMESTAMP`);
    updateFields.push(`edituser = 'DASHBOARD'`);

    // Add inventory ID for WHERE clause
    updateValues.push(inventoryId);

    const updateQuery = `
      UPDATE inventory 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updatedInventory = await DatabaseService.query(updateQuery, {
      params: updateValues,
      singleRow: true,
    });

    // Log the inventory movement if quantities changed
    const quantityChanges = [];
    if (
      validatedData.onhandqty !== undefined &&
      validatedData.onhandqty !== existingInventory.onhandqty
    ) {
      quantityChanges.push({
        type: "MANUAL_ADJUST_ONHAND",
        quantity: validatedData.onhandqty - existingInventory.onhandqty,
      });
    }

    for (const change of quantityChanges) {
      await DatabaseService.query(
        `INSERT INTO inventorymove (
          inventoryid, lotid, productid, movetype, quantity, 
          movedate, adddate, adduser, editdate, edituser
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'DASHBOARD', CURRENT_TIMESTAMP, 'DASHBOARD')`,
        {
          params: [
            updatedInventory.id,
            existingInventory.lotid,
            existingInventory.productid,
            change.type,
            change.quantity,
          ],
        }
      );
    }

    // Calculate available quantity for response
    const availableqty =
      updatedInventory.onhandqty -
      updatedInventory.allocatedqty -
      updatedInventory.pickedqty;

    const response = {
      ...updatedInventory,
      availableqty,
    };

    Logger.info("Inventory record updated successfully", {
      inventoryId: updatedInventory.id,
      changes: validatedData,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    Logger.error("Update inventory error", { error, id: params.id });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryId = parseInt(params.id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { message: "Invalid inventory ID" },
        { status: 400 }
      );
    }

    Logger.info("Deleting inventory record", { id: inventoryId });

    // Check if inventory exists and has no allocations/picks
    const inventory = await DatabaseService.query(
      `SELECT * FROM inventory WHERE id = $1`,
      { params: [inventoryId], singleRow: true }
    );

    if (!inventory) {
      return NextResponse.json(
        { message: "Inventory record not found" },
        { status: 404 }
      );
    }

    if (inventory.allocatedqty > 0 || inventory.pickedqty > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete inventory with allocated or picked quantities",
        },
        { status: 409 }
      );
    }

    // Delete the inventory record
    await DatabaseService.query(`DELETE FROM inventory WHERE id = $1`, {
      params: [inventoryId],
    });

    // Log the deletion
    await DatabaseService.query(
      `INSERT INTO inventorymove (
        inventoryid, lotid, productid, movetype, quantity, 
        movedate, adddate, adduser, editdate, edituser
      )
      VALUES ($1, $2, $3, 'MANUAL_DELETE', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'DASHBOARD', CURRENT_TIMESTAMP, 'DASHBOARD')`,
      {
        params: [
          inventoryId,
          inventory.lotid,
          inventory.productid,
          -inventory.onhandqty,
        ],
      }
    );

    Logger.info("Inventory record deleted successfully", { inventoryId });

    return NextResponse.json(
      { message: "Inventory record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    Logger.error("Delete inventory error", { error, id: params.id });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
