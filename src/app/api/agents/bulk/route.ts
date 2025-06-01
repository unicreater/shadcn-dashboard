// app/api/agents/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { z } from "zod";

const bulkAgentSchema = z.object({
  agents: z
    .array(
      z.object({
        code: z.string().min(1),
        name: z.string().min(1),
        description: z.string().min(1),
        policycode: z.string().min(1),
        type: z.string().optional(),
        enabledagentpolicymanualpricing: z.boolean().default(false),
        enabledbasemanualpricing: z.boolean().default(false),
        status: z.string().default("10"),
      })
    )
    .min(1, "At least one agent is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agents } = bulkAgentSchema.parse(body);

    // Get policy IDs for policy codes
    const policyCodes = [...new Set(agents.map((a) => a.policycode))];
    const policies = await DatabaseService.query(
      `SELECT id, code FROM agentpolicy WHERE code = ANY($1)`,
      { params: [policyCodes] }
    );

    const policyMap = policies.reduce((acc, policy) => {
      acc[policy.code] = policy.id;
      return acc;
    }, {} as Record<string, number>);

    const createdAgents = await DatabaseService.transaction(async (client) => {
      const results = [];

      for (const agentData of agents) {
        const policyId = policyMap[agentData.policycode];
        if (!policyId) {
          continue; // Skip agents with invalid policy codes
        }

        // Check for duplicates
        const existing = await DatabaseService.query(
          `SELECT id FROM agent WHERE LOWER(code) = LOWER($1)`,
          {
            params: [agentData.code],
            transactionClient: client,
          }
        );

        if (existing.length === 0) {
          const accessKey =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

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
                agentData.code,
                agentData.name,
                agentData.description,
                policyId,
                agentData.type || "STANDARD",
                agentData.enabledagentpolicymanualpricing,
                agentData.enabledbasemanualpricing,
                agentData.status,
                accessKey,
              ],
              singleRow: true,
              transactionClient: client,
            }
          );
          results.push(newAgent);
        }
      }

      return results;
    });

    return NextResponse.json(
      {
        message: `${createdAgents.length} agents created successfully`,
        agents: createdAgents,
        skipped: agents.length - createdAgents.length,
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
