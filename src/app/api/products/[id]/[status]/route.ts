// app/api/products/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["10", "20"], {
    message: "Status must be '10' (Active) or '20' (Inactive)",
  }),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const body = await request.json();
    const { status } = statusSchema.parse(body);

    // Check if product exists
    const product = await DatabaseService.query(
      `SELECT id, status FROM product WHERE id = $1`,
      { params: [productId], singleRow: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Update product status
    const updatedProduct = await DatabaseService.query(
      `UPDATE product 
       SET status = $1, editdate = CURRENT_TIMESTAMP, edituser = 'DASHBOARD'
       WHERE id = $2
       RETURNING *`,
      { params: [status, productId], singleRow: true }
    );

    return NextResponse.json({
      message: `Product status updated to ${
        status === "10" ? "Active" : "Inactive"
      }`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Status update error:", error);

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
