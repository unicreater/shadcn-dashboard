import { NextRequest, NextResponse } from "next/server";
import {
  clearDashboardCache,
  getCacheStats,
  getFreshDashboardData,
} from "@/services/dashboardService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats":
        const stats = await getCacheStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString(),
        });

      case "clear":
        const clearResult = await clearDashboardCache();
        return NextResponse.json({
          success: true,
          data: clearResult,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Use ?action=stats or ?action=clear",
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to manage cache",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { functionName } = await request.json();

    if (!functionName) {
      return NextResponse.json(
        {
          success: false,
          error: "functionName is required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const freshData = await getFreshDashboardData(functionName);

    return NextResponse.json({
      success: true,
      data: freshData,
      functionName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get fresh data",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
