// app/api/agents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;

    // Check if agent exists
    const agent = await DatabaseService.query(
      `SELECT id FROM agent WHERE id = $1`,
      { params: [agentId], singleRow: true }
    );

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    // Check if agent has any orders
    const orders = await DatabaseService.query(
      `SELECT COUNT(*) as order_count FROM issuehead WHERE agentid = $1`,
      { params: [agentId], singleRow: true }
    );

    if (orders.order_count > 0) {
      return NextResponse.json(
        {
          message: "Cannot delete agent with existing orders",
          orderCount: orders.order_count,
        },
        { status: 409 }
      );
    }

    // Delete the agent
    await DatabaseService.query(`DELETE FROM agent WHERE id = $1`, {
      params: [agentId],
    });

    return NextResponse.json(
      { message: "Agent deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete agent error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
