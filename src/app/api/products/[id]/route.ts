// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Check if product exists
    const product = await DatabaseService.query(
      `SELECT id FROM product WHERE id = $1`,
      { params: [productId], singleRow: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete the product
    await DatabaseService.query(`DELETE FROM product WHERE id = $1`, {
      params: [productId],
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
