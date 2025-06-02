import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { authenticateRequest } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use the new authentication function
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await authenticateRequest(authHeader);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    const apiParams = await params;
    const orderId = apiParams.id;

    // Validate status value
    const validStatuses = ["10", "30", "50", "75", "90"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update order status
    const result = await DatabaseService.query(
      `UPDATE issuehead 
       SET orderstatus = $1, editdate = NOW(), edituser = $2 
       WHERE id = $3 
       RETURNING *`,
      {
        params: [status, user.telegramId || user.userId || "system", orderId],
        singleRow: true,
      }
    );

    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
