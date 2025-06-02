// app/api/products/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { z } from "zod";
import { Product } from "@/components/model/model";

const bulkProductSchema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        brand: z.string().min(1),
        type: z.string().min(1),
        price: z.number().positive(),
        description: z.string().optional(),
        status: z.string().default("10"),
      })
    )
    .min(1, "At least one product is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = bulkProductSchema.parse(body);

    const createdProducts = await DatabaseService.transaction(
      async (client) => {
        const results = [];

        for (const productData of products) {
          // Check for duplicates
          const existing = await DatabaseService.query<Product[]>(
            `SELECT id FROM product 
           WHERE LOWER(name) = LOWER($1) 
           AND LOWER(category) = LOWER($2) 
           AND LOWER(brand) = LOWER($3) 
           AND LOWER(type) = LOWER($4)`,
            {
              params: [
                productData.name,
                productData.category,
                productData.brand,
                productData.type,
              ],
              transactionClient: client,
            }
          );

          if (existing.length === 0) {
            const newProduct = await DatabaseService.query(
              `INSERT INTO product (name, category, brand, type, price, description, status, adddate, adduser)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, 'DASHBOARD')
             RETURNING *`,
              {
                params: [
                  productData.name,
                  productData.category,
                  productData.brand,
                  productData.type,
                  productData.price,
                  productData.description || "",
                  productData.status,
                ],
                singleRow: true,
                transactionClient: client,
              }
            );
            results.push(newProduct);
          }
        }

        return results;
      }
    );

    return NextResponse.json(
      {
        message: `${createdProducts.length} products created successfully`,
        products: createdProducts,
        skipped: products.length - createdProducts.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk create error:", error);

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
