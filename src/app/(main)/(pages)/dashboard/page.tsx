import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Existing imports for Accounting tab
import {
  getDashboardGraph,
  getMonthlyProfit,
  getCurrentMonthTotalSales,
  getYearlyProfit,
  getSalesByUserChart,
  getTopSalesByUserChart,
  getMonthlyTotalSales,
  getWeeklyTotalSales,
  getDailyTotalSales,
  // New warehouse imports
  getFastestMovingStock,
  getSlowestMovingStock,
  getInventoryMovementFrequency,
  getWarehouseKPIs,
  getInventoryHistory,
  getInventoryMovementSummary,
  getDispatchSummaryChart,
  getDispatchKPIs,
  getDispatchOrdersToday,
  getDispatchOrdersTomorrow,
  getDispatchByRouteChart,
} from "@/services/dashboardService";

import { RevenueChart } from "./_components/accounting/RevenueChart";
import { MonthlyProfitChart } from "./_components/accounting/MonthlyProfitChart";
import { SalesChart } from "./_components/accounting/SalesChart";
import { TopCustomersChart } from "./_components/accounting/TopCustomersChart";
import { DashboardCard } from "./_components/accounting/DashboardCard";
import RecentSalesByUserCard from "./_components/accounting/RecentSalesByUserCard";
import TopSalesByUserCard from "./_components/accounting/TopSalesByUserCard";
import ProductBrandTrendCard from "./_components/accounting/ProductBrandTrendCard";
import ProductTypeTrendCard from "./_components/accounting/ProductTypeTrendCard";
import ProductBrandCategoryTrendCard from "./_components/accounting/ProductBrandCategoryTrendCard";
import TopFlavorsCard from "./_components/accounting/TopFlavorsCard";

// Warehouse components
import WarehouseKPICard from "./_components/warehouse/WarehouseKPICard";
import StockMovementCard from "./_components/warehouse/StockMovementCard";
import { InventoryMovementChart } from "./_components/warehouse/InventoryMovementChart";

import {
  DollarSign,
  Package,
  TrendingUp,
  Users,
  ShoppingCart,
  Calendar,
  Warehouse,
  Activity,
  AlertTriangle,
  CheckCircle,
  Truck,
} from "lucide-react";
import { InventoryHistory } from "./_components/warehouse/InventoryHistory";
import { DispatchSummaryChart } from "./_components/warehouse/DispatchSummaryChart";
import { DispatchOrdersTable } from "./_components/warehouse/DispatchOrdersTable";
import { RouteDispatchChart } from "./_components/warehouse/RouteDispatchChart";

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Accounting Tab Content (your existing dashboard content)
async function AccountingContent() {
  // Parallel data fetching with caching - EXACTLY as your current code
  const [
    dashboardData,
    monthlyProfit,
    currentMonthSales,
    yearlyProfit,
    recentCustomers,
    topCustomers,
    monthlySales,
    weeklySales,
    dailySales,
  ] = await Promise.all([
    getDashboardGraph(),
    getMonthlyProfit(),
    getCurrentMonthTotalSales(),
    getYearlyProfit(),
    getSalesByUserChart(),
    getTopSalesByUserChart(),
    getMonthlyTotalSales(),
    getWeeklyTotalSales(),
    getDailyTotalSales(),
  ]);

  // Calculate some summary stats - EXACTLY as your current code
  const currentMonthCount = currentMonthSales?.[0]?.count || 0;
  const currentMonthRevenue = monthlyProfit?.[0]?.totalprofit || 0;
  const currentYearRevenue = yearlyProfit?.[0]?.totalprofit || 0;
  const currentYear = yearlyProfit?.[0]?.year || new Date().getFullYear();

  // Calculate trends - EXACTLY as your current code
  const previousMonthRevenue = monthlyProfit?.[1]?.totalprofit || 0;
  const revenueGrowth =
    previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100
      : 0;

  const previousYearRevenue = yearlyProfit?.[1]?.totalprofit || 0;
  const yearlyGrowth =
    previousYearRevenue > 0
      ? ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100
      : 0;

  return (
    <div className="space-y-8">
      {/* Summary Cards - EXACTLY as your current code */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Current Month Orders"
          value={currentMonthCount}
          description={currentMonthSales?.[0]?.monthyear || "Current Month"}
          icon={Package}
          indicator={currentMonthCount > 0}
          trend={currentMonthCount > 0 ? 5.2 : -2.1}
          trendLabel="vs. last month"
        />

        <DashboardCard
          title="Monthly Revenue"
          value={`$${currentMonthRevenue.toLocaleString()}`}
          description="This month"
          icon={DollarSign}
          indicator={currentMonthRevenue > 0}
          trend={Math.round(revenueGrowth * 100) / 100}
          trendLabel="vs. last month"
        />

        <DashboardCard
          title="Yearly Revenue"
          value={`$${currentYearRevenue.toLocaleString()}`}
          description={`Year ${currentYear}`}
          icon={TrendingUp}
          indicator={currentYearRevenue > 0}
          trend={Math.round(yearlyGrowth * 100) / 100}
          trendLabel="vs. last year"
        />

        <DashboardCard
          title="Top Customer Value"
          value={`$${topCustomers?.[0]?.totalprofit?.toLocaleString() || 0}`}
          description={topCustomers?.[0]?.name || "No data"}
          icon={Users}
          indicator={topCustomers?.[0]?.totalprofit > 0}
          trend={topCustomers?.[0]?.totalprofit > 0 ? 8.7 : 0}
          trendLabel="this month"
        />
      </div>

      {/* Main Charts - EXACTLY as your current code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={dashboardData} />
        <MonthlyProfitChart data={monthlyProfit} />
      </div>

      {/* Sales and Product Cards - EXACTLY as your current code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentSalesByUserCard />
        <TopSalesByUserCard />
        <TopFlavorsCard />
      </div>

      {/* Product Analysis Cards - EXACTLY as your current code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProductBrandTrendCard />
        <ProductTypeTrendCard />
        <ProductBrandCategoryTrendCard />
      </div>

      {/* Sales Charts - EXACTLY as your current code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart
          data={monthlySales}
          title="Monthly Sales"
          type="monthly"
          height={250}
        />
        <SalesChart
          data={weeklySales}
          title="Weekly Sales"
          type="weekly"
          height={250}
        />
        <SalesChart
          data={dailySales}
          title="Daily Sales (Last Month)"
          type="daily"
          height={250}
        />
      </div>
    </div>
  );
}

// Warehouse Tab Content (NEW)
async function WarehouseContent() {
  const [
    warehouseKPIs,
    movementData,
    fastestStock,
    slowestStock,
    inventoryHistory,
    inventorySummary,
    // dispatchSummary,
    dispatchKPIs,
    todayOrders,
    tomorrowOrders,
    // routeData,
  ] = await Promise.all([
    getWarehouseKPIs(),
    getInventoryMovementFrequency(),
    getFastestMovingStock(),
    getSlowestMovingStock(),
    getInventoryHistory(),
    getInventoryMovementSummary(),
    // getDispatchSummaryChart(),
    getDispatchKPIs(),
    getDispatchOrdersToday(),
    getDispatchOrdersTomorrow(),
    // getDispatchByRouteChart(),
  ]);

  const kpis = warehouseKPIs?.[0] || {};
  const dispatchStats = dispatchKPIs?.[0] || {};

  return (
    <div className="space-y-8">
      {/* Warehouse KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Available Stock"
          value={Number(kpis.available_stock || 0).toLocaleString()}
          description="Units ready to ship"
          icon={Package}
          indicator={Number(kpis.availability_percentage || 0) > 80}
          trend={Number(kpis.availability_percentage || 0)}
          trendLabel="availability rate"
        />

        <DashboardCard
          title="Total On Hand"
          value={Number(kpis.total_onhand || 0).toLocaleString()}
          description="Units in warehouse"
          icon={CheckCircle}
          indicator={Number(kpis.total_onhand || 0) > 0}
        />

        <DashboardCard
          title="Active Products (30d)"
          value={Number(kpis.active_products_30d || 0).toLocaleString()}
          description={`of ${kpis.total_products || 0} total products`}
          icon={Activity}
          indicator={Number(kpis.active_products_30d || 0) > 0}
        />

        <DashboardCard
          title="Movements (30d)"
          value={Number(kpis.total_movements_30d || 0).toLocaleString()}
          description="Inventory transactions"
          icon={TrendingUp}
          indicator={Number(kpis.total_movements_30d || 0) > 0}
        />

        {/* New Dispatch KPIs */}
        <DashboardCard
          title="Today's Orders"
          value={Number(dispatchStats.today_total_orders || 0).toLocaleString()}
          description="Orders to dispatch today"
          icon={Truck}
          indicator={
            Number(dispatchStats.today_ready_orders || 0) ===
            Number(dispatchStats.today_total_orders || 0)
          }
          trend={Number(dispatchStats.today_ready_orders || 0)}
          trendLabel="ready to dispatch"
        />

        <DashboardCard
          title="Tomorrow's Orders"
          value={Number(
            dispatchStats.tomorrow_total_orders || 0
          ).toLocaleString()}
          description="Orders scheduled tomorrow"
          icon={Calendar}
          indicator={Number(dispatchStats.tomorrow_total_orders || 0) > 0}
        />

        <DashboardCard
          title="Today's Value"
          value={`$${Number(
            dispatchStats.today_total_value || 0
          ).toLocaleString()}`}
          description="Revenue to dispatch"
          icon={DollarSign}
          indicator={Number(dispatchStats.today_total_value || 0) > 0}
        />

        <DashboardCard
          title="Readiness Rate"
          value={`${Number(dispatchStats.overall_readiness_percentage || 0)}%`}
          description="Orders ready to ship"
          icon={CheckCircle}
          indicator={
            Number(dispatchStats.overall_readiness_percentage || 0) > 75
          }
          trend={Number(dispatchStats.overall_readiness_percentage || 0)}
          trendLabel="completion rate"
        />
      </div>

      {/* Dspatch Summary Chart */}
      {/* <DispatchSummaryChart data={dispatchSummary || []} /> */}

      {/* Dispatch Orders Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DispatchOrdersTable
          orders={todayOrders || []}
          title="Today's Dispatch Orders"
          day="today"
        />
        <DispatchOrdersTable
          orders={tomorrowOrders || []}
          title="Tomorrow's Dispatch Orders"
          day="tomorrow"
        />
      </div>

      {/* Route Analysis */}
      {/* <RouteDispatchChart data={routeData || []} /> */}

      {/* Add inventory history */}
      <InventoryHistory
        initialData={{
          movements: inventoryHistory || [],
          summary: inventorySummary || [],
        }}
        showFilters={true}
      />

      {/* Movement Chart */}
      <InventoryMovementChart data={movementData || []} />

      {/* Stock Movement Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockMovementCard data={fastestStock || []} type="fastest" />
        <StockMovementCard data={slowestStock || []} type="slowest" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  try {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <Tabs defaultValue="accounting" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="accounting" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Accounting
            </TabsTrigger>
            <TabsTrigger value="warehouse" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Warehouse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounting">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  Loading accounting data...
                </div>
              }
            >
              <AccountingContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="warehouse">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  Loading warehouse data...
                </div>
              }
            >
              <WarehouseContent />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/10 border-destructive/20 border p-4 rounded-md">
          <h2 className="text-destructive font-semibold">
            Error Loading Dashboard
          </h2>
          <p className="text-destructive/80">
            Failed to load dashboard data. Please try again later.
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-destructive/90">
              Error Details
            </summary>
            <pre className="text-xs mt-2 text-destructive/70">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
