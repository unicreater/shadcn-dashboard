// app/api/agent-policies/[id]/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { z } from "zod";

const createPolicyItemSchema = z.object({
  code: z.string().min(1, "Item code is required"),
  description: z.string().min(1, "Description is required"),
  productbrand: z.string().optional(),
  productcategory: z.string().optional(),
  productcode: z.string().optional(),
  producttype: z.string().optional(),
  type: z.string().optional(),
  calculationtype: z.string().min(1, "Calculation type is required"),
  calculationamount: z.number(),
  status: z.string().default("10"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const policyId = params.id;

    const items = await DatabaseService.query(
      `SELECT * FROM agentpolicyitem 
       WHERE policyid = $1 
       ORDER BY code ASC`,
      { params: [policyId] }
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error("Fetch policy items error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const policyId = params.id;
    const body = await request.json();
    const validatedData = createPolicyItemSchema.parse(body);

    const newItem = await DatabaseService.query(
      `INSERT INTO agentpolicyitem (
        policyid, code, description, productbrand, productcategory, 
        productcode, producttype, type, calculationtype, calculationamount, 
        status, adddate, adduser
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, 'DASHBOARD')
      RETURNING *`,
      {
        params: [
          policyId,
          validatedData.code,
          validatedData.description,
          validatedData.productbrand,
          validatedData.productcategory,
          validatedData.productcode,
          validatedData.producttype,
          validatedData.type,
          validatedData.calculationtype,
          validatedData.calculationamount,
          validatedData.status,
        ],
        singleRow: true,
      }
    );

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Create policy item error:", error);

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
