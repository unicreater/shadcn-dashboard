// app/api/inventory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { Logger } from "@/lib/logger.js";
import { z } from "zod";

const createInventorySchema = z.object({
  productid: z.number().positive("Product ID is required"),
  lotid: z.number().positive("Lot ID is required"),
  onhandqty: z.number().min(0, "On hand quantity cannot be negative"),
  allocatedqty: z
    .number()
    .min(0, "Allocated quantity cannot be negative")
    .default(0),
  pickedqty: z.number().min(0, "Picked quantity cannot be negative").default(0),
});

const inventoryQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0)),
  productId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  status: z.enum(["active", "low", "out"]).optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    const validatedQuery = inventoryQuerySchema.parse(queryParams);

    Logger.info("Fetching inventory data", { params: validatedQuery });

    // Build dynamic query based on filters
    let baseQuery = `
      SELECT 
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
      WHERE p.status = '10'
    `;

    const queryConditions = [];
    const sqlParams = [];
    let paramIndex = 1;

    // Add filters
    if (validatedQuery.productId) {
      queryConditions.push(`i.productid = $${paramIndex}`);
      sqlParams.push(validatedQuery.productId);
      paramIndex++;
    }

    if (validatedQuery.search) {
      queryConditions.push(`(
        LOWER(p.name) LIKE LOWER($${paramIndex}) OR 
        LOWER(p.brand) LIKE LOWER($${paramIndex}) OR 
        LOWER(p.category) LIKE LOWER($${paramIndex})
      )`);
      sqlParams.push(`%${validatedQuery.search}%`);
      paramIndex++;
    }

    if (validatedQuery.status) {
      switch (validatedQuery.status) {
        case "active":
          queryConditions.push(
            `(i.onhandqty - i.allocatedqty - i.pickedqty) > 0`
          );
          break;
        case "low":
          queryConditions.push(
            `(i.onhandqty - i.allocatedqty - i.pickedqty) <= 10 AND (i.onhandqty - i.allocatedqty - i.pickedqty) > 0`
          );
          break;
        case "out":
          queryConditions.push(
            `(i.onhandqty - i.allocatedqty - i.pickedqty) <= 0`
          );
          break;
      }
    }

    // Combine conditions
    if (queryConditions.length > 0) {
      baseQuery += " AND " + queryConditions.join(" AND ");
    }

    // Add ordering and pagination
    baseQuery += ` 
      ORDER BY p.name ASC, p.brand ASC, p.category ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    sqlParams.push(validatedQuery.limit, validatedQuery.offset);

    // Execute main query
    const inventoryData = await DatabaseService.query(baseQuery, {
      params: sqlParams,
    });

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM inventory i
      INNER JOIN product p ON i.productid = p.id
      INNER JOIN productlot pl ON i.lotid = pl.id
      WHERE p.status = '10'
    `;

    if (queryConditions.length > 0) {
      countQuery += " AND " + queryConditions.slice(0, -2).join(" AND ");
    }

    const countResult = await DatabaseService.query(countQuery, {
      params: sqlParams.slice(0, -2), // Remove limit and offset
      singleRow: true,
    });

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalProducts,
        SUM(i.onhandqty) as totalOnHand,
        SUM(i.allocatedqty) as totalAllocated,
        SUM(i.pickedqty) as totalPicked,
        SUM(i.onhandqty - i.allocatedqty - i.pickedqty) as totalAvailable,
        COUNT(CASE WHEN (i.onhandqty - i.allocatedqty - i.pickedqty) <= 0 THEN 1 END) as outOfStock,
        COUNT(CASE WHEN (i.onhandqty - i.allocatedqty - i.pickedqty) <= 10 AND (i.onhandqty - i.allocatedqty - i.pickedqty) > 0 THEN 1 END) as lowStock
      FROM inventory i
      INNER JOIN product p ON i.productid = p.id
      WHERE p.status = '10'
    `;

    const summary = await DatabaseService.query(summaryQuery, {
      singleRow: true,
    });

    const response = {
      inventory: inventoryData,
      pagination: {
        total: parseInt(countResult.total, 10),
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore:
          validatedQuery.offset + validatedQuery.limit <
          parseInt(countResult.total, 10),
      },
      summary: {
        totalProducts: parseInt(summary.totalProducts, 10) || 0,
        totalOnHand: parseInt(summary.totalOnHand, 10) || 0,
        totalAllocated: parseInt(summary.totalAllocated, 10) || 0,
        totalPicked: parseInt(summary.totalPicked, 10) || 0,
        totalAvailable: parseInt(summary.totalAvailable, 10) || 0,
        outOfStock: parseInt(summary.outOfStock, 10) || 0,
        lowStock: parseInt(summary.lowStock, 10) || 0,
      },
      filters: validatedQuery,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    Logger.error("Error fetching inventory", { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid query parameters", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createInventorySchema.parse(body);

    Logger.info("Creating new inventory record", { data: validatedData });

    // Check if inventory record already exists for this product/lot combination
    const existingInventory = await DatabaseService.query(
      `SELECT id FROM inventory WHERE productid = $1 AND lotid = $2`,
      { params: [validatedData.productid, validatedData.lotid] }
    );

    if (existingInventory.length > 0) {
      return NextResponse.json(
        {
          message:
            "Inventory record already exists for this product/lot combination",
        },
        { status: 409 }
      );
    }

    // Verify product exists and is active
    const product = await DatabaseService.query(
      `SELECT id, name FROM product WHERE id = $1 AND status = '10'`,
      { params: [validatedData.productid], singleRow: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: "Product not found or inactive" },
        { status: 404 }
      );
    }

    // Verify lot exists
    const lot = await DatabaseService.query(
      `SELECT id FROM productlot WHERE id = $1`,
      { params: [validatedData.lotid], singleRow: true }
    );

    if (!lot) {
      return NextResponse.json(
        { message: "Product lot not found" },
        { status: 404 }
      );
    }

    // Create inventory record
    const newInventory = await DatabaseService.query(
      `INSERT INTO inventory (
        productid, lotid, onhandqty, allocatedqty, pickedqty,
        adddate, adduser, editdate, edituser
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 'DASHBOARD', CURRENT_TIMESTAMP, 'DASHBOARD')
      RETURNING *`,
      {
        params: [
          validatedData.productid,
          validatedData.lotid,
          validatedData.onhandqty,
          validatedData.allocatedqty,
          validatedData.pickedqty,
        ],
        singleRow: true,
      }
    );

    // Log the inventory creation
    await DatabaseService.query(
      `INSERT INTO inventorymove (
        inventoryid, lotid, productid, movetype, quantity, 
        movedate, adddate, adduser, editdate, edituser
      )
      VALUES ($1, $2, $3, 'MANUAL_CREATE', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'DASHBOARD', CURRENT_TIMESTAMP, 'DASHBOARD')`,
      {
        params: [
          newInventory.id,
          validatedData.lotid,
          validatedData.productid,
          validatedData.onhandqty,
        ],
      }
    );

    // Calculate available quantity for response
    const availableqty =
      newInventory.onhandqty -
      newInventory.allocatedqty -
      newInventory.pickedqty;

    const response = {
      ...newInventory,
      availableqty,
      productname: product.name,
    };

    Logger.info("Inventory record created successfully", {
      inventoryId: newInventory.id,
      productId: validatedData.productid,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    Logger.error("Create inventory error", { error });

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
