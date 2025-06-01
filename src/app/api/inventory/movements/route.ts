// app/api/inventory/movements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inventoryId = searchParams.get("inventoryId");
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereClause = "1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (inventoryId) {
      whereClause += ` AND im.inventoryid = $${paramIndex}`;
      params.push(inventoryId);
      paramIndex++;
    }

    if (productId) {
      whereClause += ` AND im.productid = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    const movements = await DatabaseService.query(
      `SELECT 
        im.*,
        p.name as productname,
        p.brand,
        p.category
       FROM inventorymove im
       JOIN product p ON im.productid = p.id
       WHERE ${whereClause}
       ORDER BY im.movedate DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      { params: [...params, limit, offset] }
    );

    return NextResponse.json(movements);
  } catch (error) {
    console.error("Fetch movements error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
