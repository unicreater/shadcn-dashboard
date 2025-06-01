// app/api/agents/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["10", "20"], {
    message: "Status must be '10' (Active) or '20' (Inactive)",
  }),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    const body = await request.json();
    const { status } = statusSchema.parse(body);

    // Check if agent exists
    const agent = await DatabaseService.query(
      `SELECT id, status FROM agent WHERE id = $1`,
      { params: [agentId], singleRow: true }
    );

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    // Update agent status
    const updatedAgent = await DatabaseService.query(
      `UPDATE agent 
       SET status = $1, editdate = CURRENT_TIMESTAMP, edituser = 'DASHBOARD', versionno = versionno + 1
       WHERE id = $2
       RETURNING *`,
      { params: [status, agentId], singleRow: true }
    );

    return NextResponse.json({
      message: `Agent status updated to ${
        status === "10" ? "Active" : "Inactive"
      }`,
      agent: updatedAgent,
    });
  } catch (error) {
    console.error("Status update error:", error);

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
