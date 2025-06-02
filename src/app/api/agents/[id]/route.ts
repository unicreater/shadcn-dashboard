// app/api/agents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { Order, OrderReport } from "@/components/model/model";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the agent ID
    const apiParams = await params;
    const agentId = apiParams.id;

    // Check if agent exists
    const agent = await DatabaseService.query(
      `SELECT id FROM agent WHERE id = $1`,
      { params: [agentId], singleRow: true }
    );

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    // Check if agent has any orders
    const orders = await DatabaseService.query<OrderReport>(
      `SELECT COUNT(*) as order_count FROM issuehead WHERE agentid = $1`,
      { params: [agentId], singleRow: true }
    );

    if (orders.orderCount! > 0) {
      return NextResponse.json(
        {
          message: "Cannot delete agent with existing orders",
          orderCount: orders.orderCount,
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
