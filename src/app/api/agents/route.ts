// app/api/agents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { z } from "zod";
import { Agent } from "@/components/model/model";

const createAgentSchema = z.object({
  code: z.string().min(1, "Agent code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  policyid: z.number().positive("Policy ID must be positive"),
  type: z.string().optional(),
  enabledagentpolicymanualpricing: z.boolean().default(false),
  enabledbasemanualpricing: z.boolean().default(false),
  status: z.string().default("10"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAgentSchema.parse(body);

    // Check for duplicate agent code
    const existingAgent = await DatabaseService.query<Agent[]>(
      `SELECT id FROM agent WHERE LOWER(code) = LOWER($1)`,
      { params: [validatedData.code] }
    );

    if (existingAgent.length > 0) {
      return NextResponse.json(
        { message: "Agent code already exists" },
        { status: 409 }
      );
    }

    // Generate access key
    const accessKey =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Create agent
    const newAgent = await DatabaseService.query(
      `INSERT INTO agent (
        code, name, description, policyid, type, 
        enabledagentpolicymanualpricing, enabledbasemanualpricing, 
        status, accesskey, adddate, adduser, versionno
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, 'DASHBOARD', 1)
      RETURNING *`,
      {
        params: [
          validatedData.code,
          validatedData.name,
          validatedData.description,
          validatedData.policyid,
          validatedData.type || "STANDARD",
          validatedData.enabledagentpolicymanualpricing,
          validatedData.enabledbasemanualpricing,
          validatedData.status,
          accessKey,
        ],
        singleRow: true,
      }
    );

    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error("Create agent error:", error);

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
