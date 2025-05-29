"use server";

import { DatabaseService } from "@/services/database";
import { Logger } from "@/lib/logger";

// Simple in-memory cache for dashboard (lightweight approach)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // Prevent memory issues

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key, data) {
  // Limit cache size to prevent memory issues
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }

  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

async function executeCachedQuery(sql, functionName) {
  // Check cache first
  const cachedData = getCachedData(functionName);
  if (cachedData) {
    Logger.debug(`Cache hit for ${functionName}`);
    return cachedData;
  }

  try {
    // Use DatabaseService for consistency but add caching layer
    const data = await DatabaseService.query(sql, { bypassCache: true });

    // Cache successful results
    setCachedData(functionName, data);

    Logger.debug(`Query executed and cached for ${functionName}`, {
      rowCount: data?.length || 0,
    });

    return data || [];
  } catch (error) {
    Logger.error(`Dashboard query error in ${functionName}`, {
      error: error.message,
      sql: sql.substring(0, 100) + "...",
    });
    return [];
  }
}

export const getDashboardGraph = async () => {
  const sql = `
    SELECT DATE_TRUNC('month', deliveryDate) AS month,
        TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
          SUM(totalCost) AS totalprofit
            FROM public.IssueHead
            WHERE DATE_TRUNC('month', deliveryDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
              AND DATE_TRUNC('month', deliveryDate) <= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY month
            ORDER BY month DESC;
  `;

  return executeCachedQuery(sql, "getDashboardGraph");
};

export const getSalesByUserChart = async () => {
  const sql = `
    SELECT ish.CustomerName AS name, 
           ish.CustomerContact AS phone, 
           ish.TotalCost AS totalprofit 
    FROM IssueHead AS ish 
    WHERE DATE_TRUNC('month', deliveryDate) = DATE_TRUNC('month', CURRENT_DATE) 
    ORDER BY ish.Id DESC 
    LIMIT 5;
  `;

  return executeCachedQuery(sql, "getSalesByUserChart");
};

export const getTopSalesByUserChart = async () => {
  const sql = `
    SELECT 
        ish.CustomerName AS name, 
        ish.CustomerContact AS phone, 
        SUM(ish.TotalCost) AS totalprofit 
    FROM 
        IssueHead AS ish
    WHERE 
        DATE_TRUNC('month', deliveryDate) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY 
        ish.CustomerContact, ish.CustomerName
    ORDER BY 
        totalprofit DESC
    LIMIT 5;
  `;

  return executeCachedQuery(sql, "getTopSalesByUserChart");
};

export const getCurrentMonthTotalSales = async () => {
  const sql = `
    SELECT TO_CHAR(DeliveryDate, 'Mon YYYY') AS MonthYear, 
           COUNT(id) AS Count
    FROM IssueHead
    GROUP BY TO_CHAR(DeliveryDate, 'Mon YYYY'), 
             EXTRACT(YEAR FROM DeliveryDate), 
             EXTRACT(MONTH FROM DeliveryDate)
    ORDER BY EXTRACT(YEAR FROM DeliveryDate) DESC, 
             EXTRACT(MONTH FROM DeliveryDate) DESC 
    LIMIT 1;
  `;

  return executeCachedQuery(sql, "getCurrentMonthTotalSales");
};

export const getYearlyProfit = async () => {
  const sql = `
    SELECT EXTRACT(YEAR from deliveryDate) AS year,
      SUM(totalCost) AS totalProfit
      FROM public.IssueHead
      GROUP BY year
      ORDER BY year DESC;
  `;

  return executeCachedQuery(sql, "getYearlyProfit");
};

export const getMonthlyProfit = async () => {
  const sql = `
    SELECT DATE_TRUNC('month', deliveryDate) AS month,
        TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
          SUM(totalCost) AS totalprofit
            FROM public.IssueHead
            WHERE DATE_TRUNC('month', deliveryDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
              AND DATE_TRUNC('month', deliveryDate) <= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY month
            ORDER BY month DESC;
  `;

  return executeCachedQuery(sql, "getMonthlyProfit");
};

export const getMonthlyTotalSales = async () => {
  const sql = `
    SELECT DATE_TRUNC('month', deliveryDate) AS month,
        TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
          COUNT(id) AS totalsales
            FROM public.IssueHead
            WHERE DATE_TRUNC('month', deliveryDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
              AND DATE_TRUNC('month', deliveryDate) <= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY month
            ORDER BY month DESC;
  `;

  return executeCachedQuery(sql, "getMonthlyTotalSales");
};

export const getWeeklyTotalSales = async () => {
  const sql = `
    SELECT DATE_TRUNC('week', deliveryDate) AS week,
          COUNT(id) AS totalsales
            FROM public.IssueHead
            WHERE DATE_TRUNC('week', deliveryDate) >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '12 months'
              AND DATE_TRUNC('week', deliveryDate) <= DATE_TRUNC('week', CURRENT_DATE)
            GROUP BY week
            ORDER BY week DESC;
  `;

  return executeCachedQuery(sql, "getWeeklyTotalSales");
};

export const getDailyTotalSales = async () => {
  const sql = `
    SELECT
        d.day,
        COUNT(ih.id) AS totalsales
      FROM (
        SELECT generate_series(
                DATE_TRUNC('day', CURRENT_DATE) - INTERVAL '1 month',
                DATE_TRUNC('day', CURRENT_DATE),
                '1 day'
              ) AS day
      ) AS d
      LEFT JOIN public.IssueHead ih
        ON DATE_TRUNC('day', ih.deliveryDate) = d.day
      GROUP BY d.day
      ORDER BY d.day DESC;
  `;

  return executeCachedQuery(sql, "getDailyTotalSales");
};

export const getMonthlyAverageSales = async () => {
  const sql = `
    SELECT
      month,
      name,
      CASE 
        WHEN totalorders > 0 THEN (totalprofit / totalorders) 
        ELSE 0 
      END AS averageprofitbymonth,
      totalprofit,
      totalorders
      FROM (
      SELECT
          DATE_TRUNC('month', deliveryDate) AS month,
          TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
          SUM(totalCost) AS totalprofit,
          COUNT(*) AS totalorders
      FROM
          public.IssueHead
      WHERE
          DATE_TRUNC('month', deliveryDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
          AND DATE_TRUNC('month', deliveryDate) <= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY
          month
      ) AS monthly_totals
      ORDER BY
      month DESC;
  `;

  return executeCachedQuery(sql, "getMonthlyAverageSales");
};

export const getMonthTotalProductSales = async () => {
  const sql = `
    SELECT DATE_TRUNC('month', deliveryDate) AS month,
        TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
          SUM(isd.expectedqty) AS totalsales
            FROM public.IssueHead AS ish
            INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
            WHERE DATE_TRUNC('month', deliveryDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
              AND DATE_TRUNC('month', deliveryDate) <= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY month
            ORDER BY month DESC;
  `;

  return executeCachedQuery(sql, "getMonthTotalProductSales");
};

export const getMonthHighestProductBrandSales = async () => {
  const sql = `
    SELECT DATE_TRUNC('month', deliveryDate) AS month,
      p.brand AS brand,
        TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
          SUM(isd.expectedqty) AS totalsales
            FROM public.IssueHead AS ish
            INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
      INNER JOIN public.Product AS p ON p.Id=isd.ProductId
            WHERE DATE_TRUNC('month', deliveryDate) = DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY month, p.brand
            ORDER BY month DESC, totalsales DESC 
      LIMIT 5;
  `;

  return executeCachedQuery(sql, "getMonthHighestProductBrandSales");
};

export const getMonthHighestProductTypeSales = async () => {
  const sql = `
    SELECT DATE_TRUNC('month', deliveryDate) AS month,
      p.type AS type,
        TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
          SUM(isd.expectedqty) AS totalsales
            FROM public.IssueHead AS ish
            INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
      INNER JOIN public.Product AS p ON p.Id=isd.ProductId
            WHERE DATE_TRUNC('month', deliveryDate) = DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY month, p.type
            ORDER BY month DESC, totalsales DESC 
      LIMIT 5;
  `;

  return executeCachedQuery(sql, "getMonthHighestProductTypeSales");
};

export const getMonthHighestProductBrandCategorySales = async () => {
  const sql = `
    SELECT DATE_TRUNC('month', deliveryDate) AS month,
      p.brand AS brand,
      p.category AS category,
        TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
          SUM(isd.expectedqty) AS totalsales
            FROM public.IssueHead AS ish
            INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
      INNER JOIN public.Product AS p ON p.Id=isd.ProductId
            WHERE DATE_TRUNC('month', deliveryDate) = DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY month, p.brand, p.category
            ORDER BY month DESC, totalsales DESC 
      LIMIT 5;
  `;

  return executeCachedQuery(sql, "getMonthHighestProductBrandCategorySales");
};

export const getMonthlyTotalSalesByPolicy = async () => {
  const sql = `
    SELECT 
          ap.code AS name,
        SUM(ish.totalcost) AS value
      FROM 
          public.IssueHead ish
      INNER JOIN 
          public.Agent ag ON ish.agentid = ag.id
      INNER JOIN 
          public.AgentPolicy ap ON ap.id = ag.policyid
      WHERE 
          DATE_TRUNC('month', ish.deliveryDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
          AND DATE_TRUNC('month', ish.deliveryDate) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY 
          ap.id, ap.code
      ORDER BY 
          value DESC;
  `;

  return executeCachedQuery(sql, "getMonthlyTotalSalesByPolicy");
};

export const getMonthHighestProductFlavors = async () => {
  const sql = `
    SELECT DATE_TRUNC('month', deliveryDate) AS month,
      p.name AS flavor,
        TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
          SUM(isd.expectedqty) AS totalsales
            FROM public.IssueHead AS ish
            INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
      INNER JOIN public.Product AS p ON p.Id=isd.ProductId
            WHERE DATE_TRUNC('month', deliveryDate) = DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY month, p.name
            ORDER BY month DESC, totalsales DESC 
      LIMIT 5;
  `;

  return executeCachedQuery(sql, "getMonthHighestProductFlavors");
};

export const getFastestMovingStock = async () => {
  const sql = `
    SELECT 
      p.name AS product_name,
      p.brand,
      p.category,
      SUM(im.quantity) AS total_moved,
      COUNT(im.id) AS move_frequency,
      AVG(im.quantity) AS avg_move_quantity,
      TO_CHAR(MAX(im.movedate), 'Mon DD') AS last_moved
    FROM InventoryMove im
    INNER JOIN Product p ON p.id = im.productid
    WHERE im.movedate >= CURRENT_DATE - INTERVAL '30 days'
      AND im.movetype IN ('OrderPicked', 'OrderReverted')
    GROUP BY p.id, p.name, p.brand, p.category
    ORDER BY total_moved DESC, move_frequency DESC
    LIMIT 10;
  `;

  return executeCachedQuery(sql, "getFastestMovingStock");
};

export const getSlowestMovingStock = async () => {
  const sql = `
    SELECT 
      p.name AS product_name,
      p.brand,
      p.category,
      i.onhandqty,
      COALESCE(SUM(im.quantity), 0) AS total_moved,
      COALESCE(COUNT(im.id), 0) AS move_frequency,
      COALESCE(TO_CHAR(MAX(im.movedate), 'Mon DD'), 'No Movement') AS last_moved,
      CASE 
        WHEN MAX(im.movedate) IS NULL THEN 999
        ELSE EXTRACT(DAYS FROM CURRENT_DATE - MAX(im.movedate))
      END AS days_since_moved
    FROM Product p
    INNER JOIN ProductLot pl ON pl.productid = p.id
    INNER JOIN Inventory i ON i.lotid = pl.id
    LEFT JOIN InventoryMove im ON im.productid = p.id 
      AND im.movedate >= CURRENT_DATE - INTERVAL '30 days'
      AND im.movetype = 'OrderPicked'
    WHERE i.onhandqty > 0
    GROUP BY p.id, p.name, p.brand, p.category, i.onhandqty
    ORDER BY days_since_moved DESC, total_moved ASC
    LIMIT 10;
  `;

  return executeCachedQuery(sql, "getSlowestMovingStock");
};

export const getInventoryMovementFrequency = async () => {
  const sql = `
    SELECT 
      DATE_TRUNC('day', im.movedate) AS movement_date,
      TO_CHAR(DATE_TRUNC('day', im.movedate), 'Mon DD') AS date_label,
      COUNT(DISTINCT im.id) AS total_movements,
      COUNT(DISTINCT im.productid) AS unique_products,
      SUM(CASE WHEN im.movetype = 'OrderPicked' THEN im.quantity ELSE 0 END) AS picked_quantity,
      SUM(CASE WHEN im.movetype = 'OrderReverted' THEN im.quantity ELSE 0 END) AS reverted_quantity
    FROM InventoryMove im
    WHERE im.movedate >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', im.movedate)
    ORDER BY movement_date DESC
    LIMIT 30;
  `;

  return executeCachedQuery(sql, "getInventoryMovementFrequency");
};

export const getWarehouseKPIs = async () => {
  const sql = `
    SELECT 
      -- Current Inventory Levels
      SUM(i.onhandqty) AS total_onhand,
      SUM(i.allocatedqty) AS total_allocated,
      SUM(i.pickedqty) AS total_picked,
      SUM(i.onhandqty - i.allocatedqty) AS available_stock,
      
      -- Movement Stats (Last 30 days)
      (SELECT COUNT(*) FROM InventoryMove WHERE movedate >= CURRENT_DATE - INTERVAL '30 days') AS total_movements_30d,
      (SELECT COUNT(DISTINCT productid) FROM InventoryMove WHERE movedate >= CURRENT_DATE - INTERVAL '30 days') AS active_products_30d,
      
      -- Efficiency Metrics
      ROUND(
        (SUM(i.onhandqty - i.allocatedqty)::DECIMAL / NULLIF(SUM(i.onhandqty), 0)) * 100, 
        2
      ) AS availability_percentage,
      
      COUNT(DISTINCT p.id) AS total_products
    FROM Inventory i
    INNER JOIN ProductLot pl ON pl.id = i.lotid
    INNER JOIN Product p ON p.id = pl.productid;
  `;

  return executeCachedQuery(sql, "getWarehouseKPIs");
};

// Add these functions to your existing dashboardService.js

export const getInventoryHistory = async (productId = null, days = 30) => {
  const whereClause = productId
    ? `WHERE im.productid = ${productId} AND im.movedate >= CURRENT_DATE - INTERVAL '${days} days'`
    : `WHERE im.movedate >= CURRENT_DATE - INTERVAL '${days} days'`;

  const sql = `
    SELECT 
      im.id,
      im.movetype,
      im.quantity,
      im.movedate,
      p.name AS product_name,
      im.adduser,
      pl.id AS lot_code,
      i.onhandqty AS current_stock,
      p.brand,
      p.category
    FROM InventoryMove im
    INNER JOIN Product p ON p.id = im.productid
    LEFT JOIN ProductLot pl ON pl.id = im.lotid
    LEFT JOIN Inventory i ON i.lotid = pl.id
    ${whereClause}
    ORDER BY im.movedate DESC
    LIMIT 500;
  `;

  const cacheKey = `getInventoryHistory_${productId || "all"}_${days}`;
  return executeCachedQuery(sql, cacheKey);
};

export const getInventoryMovementSummary = async (
  productId = null,
  days = 30
) => {
  const whereClause = productId
    ? `WHERE im.productid = ${productId} AND im.movedate >= CURRENT_DATE - INTERVAL '${days} days'`
    : `WHERE im.movedate >= CURRENT_DATE - INTERVAL '${days} days'`;

  const sql = `
    SELECT 
      DATE_TRUNC('day', im.movedate) AS date,
      TO_CHAR(DATE_TRUNC('day', im.movedate), 'Mon DD') AS date_label,
      SUM(CASE WHEN im.movetype IN ('InventoryUpload', 'InventoryIncrease') THEN im.quantity ELSE 0 END) AS uploads,
      SUM(CASE WHEN im.movetype = 'OrderPicked' THEN im.quantity ELSE 0 END) AS picks,
      SUM(CASE WHEN im.movetype IN ('InventoryDecrease', 'OrderReverted') THEN im.quantity ELSE 0 END) AS adjustments,
      COUNT(im.id) AS total_movements
    FROM InventoryMove im
    ${whereClause}
    GROUP BY DATE_TRUNC('day', im.movedate)
    ORDER BY date DESC
    LIMIT ${days};
  `;

  const cacheKey = `getInventoryMovementSummary_${productId || "all"}_${days}`;
  return executeCachedQuery(sql, cacheKey);
};

export const getInventoryUploadHistory = async (days = 30) => {
  const sql = `
    SELECT 
      im.id,
      im.movetype,
      im.quantity,
      im.movedate,
      p.name AS product_name,
      p.brand,
      p.category,
      im.adduser,
      pl.id AS lot_code,
      i.onhandqty AS current_stock
    FROM InventoryMove im
    INNER JOIN Product p ON p.id = im.productid
    LEFT JOIN ProductLot pl ON pl.id = im.lotid
    LEFT JOIN Inventory i ON i.lotid = pl.id
    WHERE im.movetype IN ('InventoryUpload', 'InventoryIncrease', 'InventoryDecrease')
      AND im.movedate >= CURRENT_DATE - INTERVAL '${days} days'
    ORDER BY im.movedate DESC
    LIMIT 100;
  `;

  const cacheKey = `getInventoryUploadHistory_${days}`;
  return executeCachedQuery(sql, cacheKey);
};

export const getProductInventoryStats = async (productId) => {
  const sql = `
    SELECT 
      p.name AS product_name,
      p.brand,
      p.category,
      i.onhandqty,
      i.allocatedqty,
      i.pickedqty,
      (i.onhandqty - i.allocatedqty) AS available_qty,
      (
        SELECT COUNT(*) 
        FROM InventoryMove im 
        WHERE im.productid = p.id 
          AND im.movedate >= CURRENT_DATE - INTERVAL '30 days'
      ) AS movements_30d,
      (
        SELECT SUM(im.quantity) 
        FROM InventoryMove im 
        WHERE im.productid = p.id 
          AND im.movetype = 'OrderPicked'
          AND im.movedate >= CURRENT_DATE - INTERVAL '30 days'
      ) AS picked_30d,
      (
        SELECT MAX(im.movedate) 
        FROM InventoryMove im 
        WHERE im.productid = p.id
      ) AS last_movement
    FROM Product p
    INNER JOIN ProductLot pl ON pl.productid = p.id
    INNER JOIN Inventory i ON i.lotid = pl.id
    WHERE p.id = ${productId};
  `;

  const cacheKey = `getProductInventoryStats_${productId}`;
  return executeCachedQuery(sql, cacheKey);
};

export const getDispatchOrdersToday = async () => {
  const sql = `
    SELECT 
      ih.id,
      ih.orderno,
      ih.customername,
      ih.customeraddress,
      ih.totalcost,
      ih.orderstatus,
      ih.deliverydate,
      ih.adddate as order_date,
      rh.description as route_name,
      ag.name as agent_name,
      CASE 
        WHEN ih.orderstatus = '10' THEN 'Pending'
        WHEN ih.orderstatus = '30' THEN 'Ready'
        WHEN ih.orderstatus = '50' THEN 'Dispatched'
        WHEN ih.orderstatus = '75' THEN 'Picked'
        WHEN ih.orderstatus = '90' THEN 'Delivered'
        ELSE 'Unknown'
      END as status_name,
      COUNT(id.id) as total_items,
      SUM(CASE WHEN pd.status = '30' THEN id.expectedqty ELSE 0 END) as picked_items,
      CASE 
        WHEN COUNT(id.id) = SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) THEN 'Ready'
        WHEN SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) > 0 THEN 'Partial'
        ELSE 'Pending'
      END as pick_status
    FROM issuehead ih
    LEFT JOIN routehead rh ON rh.id = ih.routeid
    LEFT JOIN agent ag ON ag.id = ih.agentid
    LEFT JOIN issuedetail id ON id.issueid = ih.id
    LEFT JOIN pickdetail pd ON pd.issuedetailid = id.id
    WHERE DATE(ih.deliverydate) = CURRENT_DATE
      AND ih.orderstatus NOT IN ('90', '99') -- Exclude delivered and cancelled
    GROUP BY ih.id, ih.orderno, ih.customername, ih.customeraddress, 
             ih.totalcost, ih.orderstatus, ih.deliverydate, ih.adddate,
             rh.description, ag.name
    ORDER BY ih.deliverydate ASC, ih.orderno ASC;
  `;

  return executeCachedQuery(sql, "getDispatchOrdersToday");
};

export const getDispatchOrdersTomorrow = async () => {
  const sql = `
    SELECT 
      ih.id,
      ih.orderno,
      ih.customername,
      ih.customeraddress,
      ih.totalcost,
      ih.orderstatus,
      ih.deliverydate,
      ih.adddate as order_date,
      rh.description as route_name,
      ag.name as agent_name,
      CASE 
        WHEN ih.orderstatus = '10' THEN 'Pending'
        WHEN ih.orderstatus = '30' THEN 'Ready'
        WHEN ih.orderstatus = '50' THEN 'Dispatched'
        WHEN ih.orderstatus = '75' THEN 'Picked'
        WHEN ih.orderstatus = '90' THEN 'Delivered'
        ELSE 'Unknown'
      END as status_name,
      COUNT(id.id) as total_items,
      SUM(CASE WHEN pd.status = '30' THEN id.expectedqty ELSE 0 END) as picked_items,
      CASE 
        WHEN COUNT(id.id) = SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) THEN 'Ready'
        WHEN SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) > 0 THEN 'Partial'
        ELSE 'Pending'
      END as pick_status
    FROM issuehead ih
    LEFT JOIN routehead rh ON rh.id = ih.routeid
    LEFT JOIN agent ag ON ag.id = ih.agentid
    LEFT JOIN issuedetail id ON id.issueid = ih.id
    LEFT JOIN pickdetail pd ON pd.issuedetailid = id.id
    WHERE DATE(ih.deliverydate) = CURRENT_DATE + INTERVAL '1 day'
      AND ih.orderstatus NOT IN ('90', '99') -- Exclude delivered and cancelled
    GROUP BY ih.id, ih.orderno, ih.customername, ih.customeraddress, 
             ih.totalcost, ih.orderstatus, ih.deliverydate, ih.adddate,
             rh.description, ag.name
    ORDER BY ih.deliverydate ASC, ih.orderno ASC;
  `;

  return executeCachedQuery(sql, "getDispatchOrdersTomorrow");
};

export const getDispatchSummaryChart = async () => {
  const sql = `
    SELECT 
      dispatch_date,
      date_label,
      total_orders,
      ready_orders,
      pending_orders,
      partial_orders,
      total_value,
      ready_value
    FROM (
      SELECT 
        DATE(ih.deliverydate) as dispatch_date,
        CASE 
          WHEN DATE(ih.deliverydate) = CURRENT_DATE THEN 'Today'
          WHEN DATE(ih.deliverydate) = CURRENT_DATE + INTERVAL '1 day' THEN 'Tomorrow'
          ELSE TO_CHAR(ih.deliverydate, 'Mon DD')
        END as date_label,
        COUNT(ih.id) as total_orders,
        SUM(CASE 
          WHEN COUNT(id.id) = SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) THEN 1 
          ELSE 0 
        END) as ready_orders,
        SUM(CASE 
          WHEN SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) = 0 THEN 1 
          ELSE 0 
        END) as pending_orders,
        SUM(CASE 
          WHEN SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) > 0 
               AND COUNT(id.id) > SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) THEN 1 
          ELSE 0 
        END) as partial_orders,
        SUM(ih.totalcost) as total_value,
        SUM(CASE 
          WHEN COUNT(id.id) = SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) THEN ih.totalcost 
          ELSE 0 
        END) as ready_value
      FROM issuehead ih
      LEFT JOIN issuedetail id ON id.issueid = ih.id
      LEFT JOIN pickdetail pd ON pd.issuedetailid = id.id
      WHERE DATE(ih.deliverydate) BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day'
        AND ih.orderstatus NOT IN ('90', '99')
      GROUP BY ih.id, DATE(ih.deliverydate), ih.totalcost
    ) subquery
    GROUP BY dispatch_date, date_label
    ORDER BY dispatch_date ASC;
  `;

  return executeCachedQuery(sql, "getDispatchSummaryChart");
};

export const getDispatchByRouteChart = async () => {
  const sql = `
    SELECT 
      COALESCE(rh.description, 'No Route') as route_name,
      DATE(ih.deliverydate) as dispatch_date,
      CASE 
        WHEN DATE(ih.deliverydate) = CURRENT_DATE THEN 'Today'
        WHEN DATE(ih.deliverydate) = CURRENT_DATE + INTERVAL '1 day' THEN 'Tomorrow'
        ELSE TO_CHAR(ih.deliverydate, 'Mon DD')
      END as date_label,
      COUNT(ih.id) as total_orders,
      SUM(ih.totalcost) as total_value,
      AVG(ih.totalcost) as avg_order_value
    FROM issuehead ih
    LEFT JOIN routehead rh ON rh.id = ih.routeid
    WHERE DATE(ih.deliverydate) BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day'
      AND ih.orderstatus NOT IN ('90', '99')
    GROUP BY rh.description, DATE(ih.deliverydate)
    ORDER BY total_orders DESC, route_name ASC;
  `;

  return executeCachedQuery(sql, "getDispatchByRouteChart");
};

export const getDispatchKPIs = async () => {
  const sql = `
    WITH order_status AS (
      SELECT 
        ih.id,
        ih.deliverydate,
        ih.totalcost,
        COUNT(id.id) as total_items,
        SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) as picked_items,
        CASE 
          WHEN COUNT(id.id) = SUM(CASE WHEN pd.status = '30' THEN 1 ELSE 0 END) THEN 1
          ELSE 0
        END as is_ready
      FROM issuehead ih
      LEFT JOIN issuedetail id ON id.issueid = ih.id
      LEFT JOIN pickdetail pd ON pd.issuedetailid = id.id
      WHERE DATE(ih.deliverydate) BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day'
        AND ih.orderstatus NOT IN ('90', '99')
      GROUP BY ih.id, ih.deliverydate, ih.totalcost
    )
    SELECT 
      -- Today's metrics
      SUM(CASE WHEN DATE(deliverydate) = CURRENT_DATE THEN 1 ELSE 0 END) as today_total_orders,
      SUM(CASE WHEN DATE(deliverydate) = CURRENT_DATE THEN totalcost ELSE 0 END) as today_total_value,
      SUM(CASE WHEN DATE(deliverydate) = CURRENT_DATE AND is_ready = 1 THEN 1 ELSE 0 END) as today_ready_orders,
      
      -- Tomorrow's metrics
      SUM(CASE WHEN DATE(deliverydate) = CURRENT_DATE + INTERVAL '1 day' THEN 1 ELSE 0 END) as tomorrow_total_orders,
      SUM(CASE WHEN DATE(deliverydate) = CURRENT_DATE + INTERVAL '1 day' THEN totalcost ELSE 0 END) as tomorrow_total_value,
      SUM(CASE WHEN DATE(deliverydate) = CURRENT_DATE + INTERVAL '1 day' AND is_ready = 1 THEN 1 ELSE 0 END) as tomorrow_ready_orders,
      
      -- Overall readiness percentage
      ROUND(
        (SUM(is_ready)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
      ) as overall_readiness_percentage,
      
      -- Additional useful metrics
      COUNT(*) as total_orders,
      SUM(totalcost) as total_value,
      SUM(is_ready) as total_ready_orders
      
    FROM order_status;
  `;

  return executeCachedQuery(sql, "getDispatchKPIs");
};

// Utility functions for cache management
export const clearDashboardCache = () => {
  cache.clear();
  Logger.info("Dashboard cache cleared");
  return { success: true, message: "Cache cleared successfully" };
};

export const getCacheStats = () => {
  const stats = {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    ttl: CACHE_TTL,
    keys: Array.from(cache.keys()),
    entries: Array.from(cache.entries()).map(([key, value]) => ({
      key,
      timestamp: value.timestamp,
      age: Date.now() - value.timestamp,
      dataSize: JSON.stringify(value.data).length,
    })),
  };

  return stats;
};

// Function to get fresh data (bypass cache)
export const getFreshDashboardData = async (functionName) => {
  // Remove from cache to force fresh fetch
  cache.delete(functionName);

  // Re-execute the function (this will now fetch fresh data)
  const functions = {
    getDashboardGraph: getDashboardGraph,
    getSalesByUserChart: getSalesByUserChart,
    getTopSalesByUserChart: getTopSalesByUserChart,
    getCurrentMonthTotalSales: getCurrentMonthTotalSales,
    getYearlyProfit: getYearlyProfit,
    getMonthlyProfit: getMonthlyProfit,
    getMonthlyTotalSales: getMonthlyTotalSales,
    getWeeklyTotalSales: getWeeklyTotalSales,
    getDailyTotalSales: getDailyTotalSales,
    getMonthlyAverageSales: getMonthlyAverageSales,
    getMonthTotalProductSales: getMonthTotalProductSales,
    getMonthHighestProductBrandSales: getMonthHighestProductBrandSales,
    getMonthHighestProductTypeSales: getMonthHighestProductTypeSales,
    getMonthHighestProductBrandCategorySales:
      getMonthHighestProductBrandCategorySales,
    getMonthlyTotalSalesByPolicy: getMonthlyTotalSalesByPolicy,
    getMonthHighestProductFlavors: getMonthHighestProductFlavors,
    getSlowestMovingStock: getSlowestMovingStock,
    getInventoryMovementFrequency: getInventoryMovementFrequency,
    getWarehouseKPIs: getWarehouseKPIs,
    getFastestMovingStock: getFastestMovingStock,
    getInventoryHistory: getInventoryHistory,
    getInventoryMovementSummary: getInventoryMovementSummary,
    getDispatchOrdersToday: getDispatchOrdersToday,
    getDispatchOrdersTomorrow: getDispatchOrdersTomorrow,
    getDispatchSummaryChart: getDispatchSummaryChart,
    getDispatchByRouteChart: getDispatchByRouteChart,
    getDispatchKPIs: getDispatchKPIs,
  };

  const func = functions[functionName];
  if (func) {
    return await func();
  } else {
    throw new Error(`Function ${functionName} not found`);
  }
};
