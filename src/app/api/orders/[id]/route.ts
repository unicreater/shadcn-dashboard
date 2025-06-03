import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/services/database";
import { authenticateRequest, verifyToken } from "@/lib/auth";

type OrderStatus = {
  orderstatus: string;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const authHeader = request.headers.get("authorization");

    // if (!authHeader) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const user = await authenticateRequest(authHeader);

    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify the current token
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const apiParams = await params;
    const orderId = apiParams.id;

    // Check if order can be deleted (only pending orders)
    const order = await DatabaseService.query<OrderStatus>(
      "SELECT orderstatus FROM issuehead WHERE id = $1",
      { params: [orderId], singleRow: true }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.orderstatus !== "10") {
      return NextResponse.json(
        { error: "Only pending orders can be deleted" },
        { status: 400 }
      );
    }

    // Delete in transaction
    await DatabaseService.transaction(async (client) => {
      // Delete order details first
      await DatabaseService.query(
        "DELETE FROM issuedetail WHERE issueid = $1",
        { params: [orderId], transactionClient: client }
      );

      // Delete order charges
      await DatabaseService.query(
        "DELETE FROM orderxchargedetail WHERE issueid = $1",
        { params: [orderId], transactionClient: client }
      );

      // Delete pick details if any
      await DatabaseService.query("DELETE FROM pickdetail WHERE issueid = $1", {
        params: [orderId],
        transactionClient: client,
      });

      // Delete order header
      await DatabaseService.query("DELETE FROM issuehead WHERE id = $1", {
        params: [orderId],
        transactionClient: client,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const authHeader = request.headers.get("authorization");

    // if (!authHeader) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const user = await authenticateRequest(authHeader);

    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify the current token
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const apiParams = await params;
    const orderId = apiParams.id;

    // Get order with details
    const order = await DatabaseService.query(
      `SELECT 
        ih.*,
        ag.code as agentcode,
        ag.accesskey as agentkey,
        rh.description as routedescription
       FROM issuehead ih
       LEFT JOIN agent ag ON ih.agentid = ag.id
       LEFT JOIN routehead rh ON ih.routeid = rh.id
       WHERE ih.id = $1`,
      { params: [orderId], singleRow: true }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get order items
    const items = await DatabaseService.query(
      `SELECT 
        id.*,
        p.name as productname,
        p.brand,
        p.category,
        p.type
       FROM issuedetail id
       JOIN product p ON id.productid = p.id
       WHERE id.issueid = $1`,
      { params: [orderId] }
    );

    return NextResponse.json({ ...order, items });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
