import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { verifyToken } from "@/lib/auth";
import { Order } from "@/components/model/model";

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderIds, action, status } = await request.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "Invalid order IDs" }, { status: 400 });
    }

    let result: Order[] = [];

    switch (action) {
      case "updateStatus":
        if (!["10", "30", "50", "75", "90"].includes(status)) {
          return NextResponse.json(
            { error: "Invalid status value" },
            { status: 400 }
          );
        }

        result = await DatabaseService.query(
          `UPDATE issuehead 
           SET orderstatus = $1, editdate = NOW(), edituser = $2 
           WHERE id = ANY($3::int[]) 
           RETURNING id, orderno`,
          { params: [status, payload.userId, orderIds] }
        );
        break;

      case "delete":
        // Only allow deletion of pending orders
        await DatabaseService.transaction(async (client) => {
          // First check if all orders can be deleted
          const orders = await DatabaseService.query<Order[]>(
            "SELECT id, orderstatus FROM issuehead WHERE id = ANY($1::int[])",
            { params: [orderIds], transactionClient: client }
          );

          const undeletableOrders = orders.filter(
            (o) => o.orderstatus !== "10"
          );
          if (undeletableOrders.length > 0) {
            throw new Error("Only pending orders can be deleted");
          }

          // Delete order details
          await DatabaseService.query(
            "DELETE FROM issuedetail WHERE issueid = ANY($1::int[])",
            { params: [orderIds], transactionClient: client }
          );

          // Delete order charges
          await DatabaseService.query(
            "DELETE FROM orderxchargedetail WHERE issueid = ANY($1::int[])",
            { params: [orderIds], transactionClient: client }
          );

          // Delete pick details
          await DatabaseService.query(
            "DELETE FROM pickdetail WHERE issueid = ANY($1::int[])",
            { params: [orderIds], transactionClient: client }
          );

          // Delete order headers
          result = await DatabaseService.query(
            "DELETE FROM issuehead WHERE id = ANY($1::int[]) RETURNING id, orderno",
            { params: [orderIds], transactionClient: client }
          );
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      affectedOrders: result.length,
      orders: result,
    });
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : error || "Internal server error",
      },
      { status: 500 }
    );
  }
}
