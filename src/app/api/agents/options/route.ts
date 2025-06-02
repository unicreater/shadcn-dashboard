// app/api/agents/options/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { AgentPolicy } from "@/components/model/model";

type ProductTypes = {
  type: string;
};

export async function GET(request: NextRequest) {
  try {
    // Get all active agent policies
    const agentPolicies = await DatabaseService.query<AgentPolicy[]>(
      `SELECT id, code, description 
       FROM agentpolicy 
       WHERE status = '10' 
       ORDER BY code ASC`
    );

    // Get distinct types
    const types = await DatabaseService.query<ProductTypes[]>(
      `SELECT DISTINCT type 
       FROM agent 
       WHERE type IS NOT NULL AND type != '' 
       ORDER BY type ASC`
    );

    return NextResponse.json({
      agentPolicies: agentPolicies.map((row) => ({
        id: row.id,
        code: row.code,
        description: row.description,
      })),
      types: types.map((row) => row.type),
    });
  } catch (error) {
    console.error("Error fetching agent options:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
