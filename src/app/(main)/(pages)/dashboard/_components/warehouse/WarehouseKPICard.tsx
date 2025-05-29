import React from "react";
import { DashboardCard } from "./DashboardCard";
import { getWarehouseKPIs } from "@/services/dashboardService";
import { Package, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const WarehouseKPICard = async () => {
  const kpis = await getWarehouseKPIs();
  const data = kpis?.[0] || {};

  return (
    <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        title="Available Stock"
        value={Number(data.available_stock || 0).toLocaleString()}
        description="Units ready to ship"
        icon={Package}
        indicator={Number(data.availability_percentage || 0) > 80}
        trend={Number(data.availability_percentage || 0)}
        trendLabel="availability rate"
      />

      <DashboardCard
        title="Total On Hand"
        value={Number(data.total_onhand || 0).toLocaleString()}
        description="Units in warehouse"
        icon={CheckCircle}
        indicator={Number(data.total_onhand || 0) > 0}
      />

      <DashboardCard
        title="Active Products (30d)"
        value={Number(data.active_products_30d || 0).toLocaleString()}
        description={`of ${data.total_products || 0} total products`}
        icon={TrendingUp}
        indicator={Number(data.active_products_30d || 0) > 0}
      />

      <DashboardCard
        title="Movements (30d)"
        value={Number(data.total_movements_30d || 0).toLocaleString()}
        description="Inventory transactions"
        icon={AlertTriangle}
        indicator={Number(data.total_movements_30d || 0) > 0}
      />
    </section>
  );
};

export default WarehouseKPICard;
