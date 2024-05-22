"use server";

import dbConnect, { pool } from "@/utils/postgres";

export const getDashboardGraph = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', orderDate) AS month,
          TO_CHAR(DATE_TRUNC('month', orderDate), 'Mon YY') AS name,
            SUM(totalCost) AS totalprofit
              FROM public.IssueHead
              WHERE DATE_TRUNC('month', orderDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
                AND DATE_TRUNC('month', orderDate) <= DATE_TRUNC('month', CURRENT_DATE)
              GROUP BY month
              ORDER BY month DESC;
      `
    );

    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};

export const getSalesByUserChart = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT ish.CustomerName AS name, ish.CustomerContact AS phone, ish.TotalCost AS totalprofit FROM IssueHead AS ish ORDER BY ish.Id DESC LIMIT 5;
      `
    );

    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};

export const getCurrentMonthTotalSales = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT TO_CHAR(DeliveryDate, 'Mon YYYY') AS MonthYear, COUNT(id) AS Count
      FROM IssueHead
      GROUP BY TO_CHAR(DeliveryDate, 'Mon YYYY'), EXTRACT(YEAR FROM DeliveryDate), EXTRACT(MONTH FROM DeliveryDate)
      ORDER BY EXTRACT(YEAR FROM DeliveryDate) DESC, EXTRACT(MONTH FROM DeliveryDate) DESC LIMIT 1;
      `
    );

    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};

export const getYearlyProfit = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('year', orderDate) AS year,
        SUM(totalCost) AS totalProfit
        FROM public.IssueHead
        GROUP BY year
        ORDER BY year DESC;`
    );

    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};
export const getMonthlyProfit = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', orderDate) AS month,
          TO_CHAR(DATE_TRUNC('month', orderDate), 'Mon YY') AS name,
            SUM(totalCost) AS totalprofit
              FROM public.IssueHead
              WHERE DATE_TRUNC('month', orderDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
                AND DATE_TRUNC('month', orderDate) <= DATE_TRUNC('month', CURRENT_DATE)
              GROUP BY month
              ORDER BY month DESC;
      `
    );
    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};
export const getMonthlyTotalSales = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', orderDate) AS month,
          TO_CHAR(DATE_TRUNC('month', orderDate), 'Mon YY') AS name,
            COUNT(id) AS totalsales
              FROM public.IssueHead
              WHERE DATE_TRUNC('month', orderDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
                AND DATE_TRUNC('month', orderDate) <= DATE_TRUNC('month', CURRENT_DATE)
              GROUP BY month
              ORDER BY month DESC;
      `
    );
    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};
export const getWeeklyTotalSales = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('week', orderDate) AS week,
            COUNT(id) AS totalsales
              FROM public.IssueHead
              WHERE DATE_TRUNC('week', orderDate) >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '12 months'
                AND DATE_TRUNC('week', orderDate) <= DATE_TRUNC('week', CURRENT_DATE)
              GROUP BY week
              ORDER BY week DESC;
      `
    );
    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};
export const getDailyTotalSales = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT
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
          ON DATE_TRUNC('day', ih.orderDate) = d.day
        GROUP BY d.day
        ORDER BY d.day DESC;
      `
    );
    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};

export const getMonthlyAverageSales = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT
        month,
        name,
		(totalprofit / totalorders) AS averageprofitbymonth,
        totalprofit,
        totalorders
        FROM (
        SELECT
            DATE_TRUNC('month', orderDate) AS month,
            TO_CHAR(DATE_TRUNC('month', orderDate), 'Mon YY') AS name,
            SUM(totalCost) AS totalprofit,
            COUNT(*) AS totalorders
        FROM
            public.IssueHead
        WHERE
            DATE_TRUNC('month', orderDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
            AND DATE_TRUNC('month', orderDate) <= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY
            month
        ) AS monthly_totals
        ORDER BY
        month DESC;
      `
    );
    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};
export const getMonthTotalProductSales = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', orderDate) AS month,
          TO_CHAR(DATE_TRUNC('month', orderDate), 'Mon YY') AS name,
            SUM(isd.expectedqty) AS totalsales
              FROM public.IssueHead AS ish
			  	INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
              WHERE DATE_TRUNC('month', orderDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
                AND DATE_TRUNC('month', orderDate) <= DATE_TRUNC('month', CURRENT_DATE)
              GROUP BY month
              ORDER BY month DESC;
      `
    );
    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};

export const getMonthHighestProductBrandSales = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', orderDate) AS month,
p.brand AS brand,
          TO_CHAR(DATE_TRUNC('month', orderDate), 'Mon YY') AS name,
            SUM(isd.expectedqty) AS totalsales
              FROM public.IssueHead AS ish
			  	INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
				INNER JOIN public.Product AS p ON p.Id=isd.ProductId
              WHERE DATE_TRUNC('month', orderDate) = DATE_TRUNC('month', CURRENT_DATE)
              GROUP BY month, p.brand
              ORDER BY month DESC, totalsales DESC LIMIT 5;
      `
    );

    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};
export const getMonthHighestProductTypeSales = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', orderDate) AS month,
p.type AS type,
          TO_CHAR(DATE_TRUNC('month', orderDate), 'Mon YY') AS name,
            SUM(isd.expectedqty) AS totalsales
              FROM public.IssueHead AS ish
			  	INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
				INNER JOIN public.Product AS p ON p.Id=isd.ProductId
              WHERE DATE_TRUNC('month', orderDate) = DATE_TRUNC('month', CURRENT_DATE)
              GROUP BY month, p.type
              ORDER BY month DESC, totalsales DESC LIMIT 5;
      `
    );

    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};

export const getMonthHighestProductBrandCategorySales = async () => {
  dbConnect();

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', orderDate) AS month,
        p.brand AS brand,
        p.category AS category,
          TO_CHAR(DATE_TRUNC('month', orderDate), 'Mon YY') AS name,
            SUM(isd.expectedqty) AS totalsales
              FROM public.IssueHead AS ish
			  	INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
				INNER JOIN public.Product AS p ON p.Id=isd.ProductId
              WHERE DATE_TRUNC('month', orderDate) = DATE_TRUNC('month', CURRENT_DATE)
              GROUP BY month, p.brand, p.category
              ORDER BY month DESC, totalsales DESC LIMIT 5;
      `
    );

    const data = result.rows;

    if (data) return data;
  } catch (err) {
    console.error(err);
  }
};
