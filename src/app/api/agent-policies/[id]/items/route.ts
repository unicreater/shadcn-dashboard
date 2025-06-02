import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { authenticateRequest } from "@/lib/auth";
import { z } from "zod";
import { AgentPolicyItem } from "@/components/model/model";

// Complete Zod schema for policy item validation
const createPolicyItemSchema = z.object({
  code: z.string().min(1, "Item code is required").max(50, "Code too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description too long"),
  productbrand: z.string().optional().nullable(),
  productcategory: z.string().optional().nullable(),
  productcode: z.string().optional().nullable(),
  producttype: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  calculationtype: z.enum(
    ["PERCENTAGE", "FIXED_AMOUNT", "MARKUP", "DISCOUNT"],
    {
      errorMap: () => ({ message: "Invalid calculation type" }),
    }
  ),
  calculationamount: z.number().min(0, "Amount must be positive"),
  status: z.string().default("10"),
});

const updatePolicyItemSchema = createPolicyItemSchema
  .partial()
  .omit({ code: true });

// Type for route parameters - this fixes the TypeScript error
interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Authentication check
    const authHeader = request.headers.get("authorization"); // or "Authorization"

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await authenticateRequest(authHeader);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // if (!isAdmin(user)) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }
    const params = await context.params;
    const policyId = params.id;

    // Validate policy ID is numeric
    if (!/^\d+$/.test(policyId)) {
      return NextResponse.json(
        { error: "Invalid policy ID format" },
        { status: 400 }
      );
    }

    // Check if policy exists
    const policyExists = await DatabaseService.query(
      "SELECT id FROM agentpolicy WHERE id = $1",
      { params: [policyId], singleRow: true }
    );

    if (!policyExists) {
      return NextResponse.json(
        { error: "Agent policy not found" },
        { status: 404 }
      );
    }

    const items = await DatabaseService.query<AgentPolicyItem[]>(
      `SELECT 
        id,
        policyid,
        code,
        description,
        productbrand,
        productcategory,
        productcode,
        producttype,
        type,
        calculationtype,
        calculationamount,
        status,
        adddate,
        adduser,
        editdate,
        edituser
       FROM agentpolicyitem 
       WHERE policyid = $1 AND status = '10'
       ORDER BY code ASC`,
      { params: [policyId] }
    );

    return NextResponse.json({
      success: true,
      policyId: policyId,
      items: items,
      total: items.length,
    });
  } catch (error) {
    console.error("Fetch policy items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    // Authentication check
    const authHeader = request.headers.get("authorization"); // or "Authorization"

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await authenticateRequest(authHeader);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // if (!isAdmin(user)) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const params = await context.params;
    const policyId = params.id;

    // Validate policy ID
    if (!/^\d+$/.test(policyId)) {
      return NextResponse.json(
        { error: "Invalid policy ID format" },
        { status: 400 }
      );
    }

    // Check if policy exists
    const policyExists = await DatabaseService.query(
      "SELECT id FROM agentpolicy WHERE id = $1",
      { params: [policyId], singleRow: true }
    );

    if (!policyExists) {
      return NextResponse.json(
        { error: "Agent policy not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createPolicyItemSchema.parse(body);

    // Check for duplicate code within the same policy
    const existingItem = await DatabaseService.query(
      "SELECT id FROM agentpolicyitem WHERE policyid = $1 AND code = $2",
      { params: [policyId, validatedData.code], singleRow: true }
    );

    if (existingItem) {
      return NextResponse.json(
        { error: "Policy item with this code already exists" },
        { status: 409 }
      );
    }

    const newItem = await DatabaseService.query(
      `INSERT INTO agentpolicyitem (
        policyid, code, description, productbrand, productcategory, 
        productcode, producttype, type, calculationtype, calculationamount, 
        status, adddate, adduser
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, $12)
      RETURNING *`,
      {
        params: [
          parseInt(policyId),
          validatedData.code,
          validatedData.description,
          validatedData.productbrand || null,
          validatedData.productcategory || null,
          validatedData.productcode || null,
          validatedData.producttype || null,
          validatedData.type || null,
          validatedData.calculationtype,
          validatedData.calculationamount,
          validatedData.status,
          user.telegramId,
        ],
        singleRow: true,
      }
    );

    console.log(
      `[API] Policy item created: ${validatedData.code} by ${user.username}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Policy item created successfully",
        item: newItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create policy item error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
