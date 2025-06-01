// app/api/agent-policies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { z } from "zod";

const createAgentPolicySchema = z.object({
  code: z.string().min(1, "Policy code is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().optional(),
  matrixid: z.number().optional(),
  status: z.string().default("10"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAgentPolicySchema.parse(body);

    const existingPolicy = await DatabaseService.query(
      `SELECT id FROM agentpolicy WHERE LOWER(code) = LOWER($1)`,
      { params: [validatedData.code] }
    );

    if (existingPolicy.length > 0) {
      return NextResponse.json(
        { message: "Agent policy code already exists" },
        { status: 409 }
      );
    }

    const newPolicy = await DatabaseService.query(
      `INSERT INTO agentpolicy (code, description, type, status, matrixid, adddate, adduser)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 'DASHBOARD')
       RETURNING *`,
      {
        params: [
          validatedData.code.toUpperCase(),
          validatedData.description,
          validatedData.type || "STANDARD",
          validatedData.status,
          validatedData.matrixid,
        ],
        singleRow: true,
      }
    );

    return NextResponse.json(newPolicy, { status: 201 });
  } catch (error) {
    console.error("Create agent policy error:", error);

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
