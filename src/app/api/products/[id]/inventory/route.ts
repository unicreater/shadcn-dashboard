// app/api/products/[id]/inventory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { InventoryReport } from "@/components/model/model";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiParams = await params;
    const productId = apiParams.id;

    // Check inventory for this product
    const inventoryCheck = await DatabaseService.query<InventoryReport>(
      `SELECT 
        SUM(onhandqty) as total_onhand,
        SUM(allocatedqty) as total_allocated,
        SUM(pickedqty) as total_picked,
        COUNT(*) as inventory_records
       FROM inventory 
       WHERE productid = $1`,
      { params: [productId], singleRow: true }
    );

    const totalQuantity =
      (inventoryCheck.total_onhand || 0) +
      (inventoryCheck.total_allocated || 0) +
      (inventoryCheck.total_picked || 0);

    const hasInventory = totalQuantity > 0;

    return NextResponse.json({
      hasInventory,
      totalQuantity,
      details: {
        onHand: inventoryCheck.total_onhand || 0,
        allocated: inventoryCheck.total_allocated || 0,
        picked: inventoryCheck.total_picked || 0,
        records: inventoryCheck.inventory_records || 0,
      },
    });
  } catch (error) {
    console.error("Inventory check error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
