// app/api/products/options/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { Product } from "@/components/model/model";

export async function GET(request: NextRequest) {
  try {
    // Get distinct brands
    const brands = await DatabaseService.query<Product[]>(
      `SELECT DISTINCT brand 
       FROM product 
       WHERE brand IS NOT NULL AND brand != '' 
       ORDER BY brand ASC`
    );

    // Get distinct categories
    const categories = await DatabaseService.query<Product[]>(
      `SELECT DISTINCT category 
       FROM product 
       WHERE category IS NOT NULL AND category != '' 
       ORDER BY category ASC`
    );

    // Get distinct types
    const types = await DatabaseService.query<Product[]>(
      `SELECT DISTINCT type 
       FROM product 
       WHERE type IS NOT NULL AND type != '' 
       ORDER BY type ASC`
    );

    // Get categories by brand for hierarchical selection
    const categoriesByBrand = await DatabaseService.query<Product[]>(
      `SELECT DISTINCT brand, category 
       FROM product 
       WHERE brand IS NOT NULL AND brand != '' 
         AND category IS NOT NULL AND category != ''
       ORDER BY brand ASC, category ASC`
    );

    // Group categories by brand
    const brandCategoryMap = categoriesByBrand.reduce((acc, row) => {
      if (!acc[row.brand]) {
        acc[row.brand] = [];
      }
      if (!acc[row.brand].includes(row.category)) {
        acc[row.brand].push(row.category);
      }
      return acc;
    }, {} as Record<string, string[]>);

    return NextResponse.json({
      brands: brands.map((row) => row.brand),
      categories: categories.map((row) => row.category),
      types: types.map((row) => row.type),
      categoriesByBrand: brandCategoryMap,
    });
  } catch (error) {
    console.error("Error fetching product options:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
