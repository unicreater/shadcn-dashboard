// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  type: z.string().min(1, "Type is required"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  status: z.string().default("10"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Check for duplicate product
    const existingProduct = await DatabaseService.query(
      `SELECT id FROM product 
       WHERE LOWER(name) = LOWER($1) 
       AND LOWER(category) = LOWER($2) 
       AND LOWER(brand) = LOWER($3) 
       AND LOWER(type) = LOWER($4)`,
      {
        params: [
          validatedData.name,
          validatedData.category,
          validatedData.brand,
          validatedData.type,
        ],
      }
    );

    if (existingProduct.length > 0) {
      return NextResponse.json(
        { message: "Product with this combination already exists" },
        { status: 409 }
      );
    }

    // Create product
    const newProduct = await DatabaseService.query(
      `INSERT INTO product (name, category, brand, type, price, description, status, adddate, adduser)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, 'DASHBOARD')
       RETURNING *`,
      {
        params: [
          validatedData.name,
          validatedData.category,
          validatedData.brand,
          validatedData.type,
          validatedData.price,
          validatedData.description || "",
          validatedData.status,
        ],
        singleRow: true,
      }
    );

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);

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
