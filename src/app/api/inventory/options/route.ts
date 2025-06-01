// app/api/inventory/options/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";

export async function GET(request: NextRequest) {
  try {
    // Get products for inventory creation
    const products = await DatabaseService.query(
      `SELECT p.id, p.name, p.brand, p.category, p.type
       FROM product p 
       WHERE p.status = '10' 
       ORDER BY p.brand ASC, p.name ASC`
    );

    // Get product lots
    const lots = await DatabaseService.query(
      `SELECT pl.id, pl.productid, p.name as productname, a.code as accountcode
       FROM productlot pl
       JOIN product p ON pl.productid = p.id
       JOIN account a ON pl.accountid = a.id
       ORDER BY p.name ASC`
    );

    // Get accounts
    const accounts = await DatabaseService.query(
      `SELECT id, code, description 
       FROM account 
       WHERE status = '10'
       ORDER BY code ASC`
    );

    return NextResponse.json({
      products: products.map((row) => ({
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category,
        type: row.type,
      })),
      lots: lots.map((row) => ({
        id: row.id,
        productid: row.productid,
        productname: row.productname,
        accountcode: row.accountcode,
      })),
      accounts: accounts.map((row) => ({
        id: row.id,
        code: row.code,
        description: row.description,
      })),
    });
  } catch (error) {
    console.error("Error fetching inventory options:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
