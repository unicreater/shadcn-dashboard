import { pool } from "@/utils/postgres";
import { mapToOrderModel, mapToOrderProfitModel } from "./orderFunctionUtils";

export async function fetchDataFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    const result = await client.query(
      "SELECT * FROM public.users ORDER BY id ASC LIMIT 5"
    );

    const data = result.rows;

    client.release();
    return data;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}

export async function fetchAllUsersFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    const result = await client.query(
      "SELECT * FROM public.users ORDER BY id DESC"
    );

    const data = result.rows;
    // console.log("Fetched data: ", data);

    client.release();
    return data;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}

export async function fetchAllOrdersFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    // Option 1 - Nested Details Query
    // const result = await client.query(
    //   `SELECT
    //     ish.orderno,
    //     json_agg(
    //         json_build_object(
    //         'item', p.name,
    //         'quantity', isd.expectedqty,
    //         'amount', isd.salesprice
    //         )
    //     ) AS order_items
    //     FROM
    //     public.IssueHead AS ish
    //     INNER JOIN public.IssueDetail AS isd ON isd.IssueId = ish.Id
    //     INNER JOIN public.Product AS p ON p.Id = isd.ProductId
    //     GROUP BY
    //     ish.orderno
    //     ORDER BY
    //     ish.orderno DESC
    //     LIMIT 200;
    //     `
    // );

    const result = await client.query(
      `SELECT * 
        FROM public.IssueHead AS ish 
                ORDER BY ish.id DESC LIMIT 10`
    );

    const data = result.rows;

    client.release();
    if (!data) {
      throw new Error("Undefined Data");
    }
    const mappedData = await Promise.all(
      data.map((orderData: any) => mapToOrderModel(orderData))
    );

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}
export async function fetchOrderItems(orderId: string): Promise<any[]> {
  try {
    const client = await pool.connect();
    const query = {
      // Mapped the order items to the order in the database
      //   text: `SELECT
      //             json_agg(
      //                 json_build_object(
      //                 'itemType', p.type,
      //                 'itemBrand', p.brand,
      //                 'itemCategory', p.category,
      //                 'item', p.name,
      //                 'quantity', isd.expectedqty,
      //                 'amount', isd.salesprice
      //                 )
      //             ) AS orderItems
      //             FROM
      //             public.IssueDetail AS isd
      //             INNER JOIN public.Product AS p ON p.Id = isd.ProductId
      //                 WHERE isd.IssueId=$1
      //             GROUP BY
      //             isd.IssueId
      //             ORDER BY
      //             isd.IssueId DESC`,
      text: `SELECT
                  p.type, p.brand, p.category, p.name, isd.expectedqty, isd.salesprice
                  FROM
                  public.IssueDetail AS isd
                  INNER JOIN public.Product AS p ON p.Id = isd.ProductId
                      WHERE isd.IssueId=$1
                  ORDER BY
                  p.Name ASC`,
      values: [orderId],
    };

    const result = await client.query(query);
    const data = result.rows;

    client.release();

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchAllOrdersProfitFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    const result = await client.query(
      "SELECT id, orderdate, totalcost FROM public.IssueHead ORDER BY id DESC LIMIT 100"
    );

    const data = result.rows;
    client.release();

    if (!data) {
      throw new Error("Undefined Data");
    }
    const mappedData = await Promise.all(
      data.map((orderData: any) => mapToOrderProfitModel(orderData))
    );

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}

export async function fetchTotalProfitByYearFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    // This is for two years only
    // const result = await client.query(
    //   `SELECT DATE_TRUNC('year', orderDate) AS year,
    //     SUM(totalCost) AS totalProfit
    //     FROM public.IssueHead
    //     WHERE DATE_TRUNC('year', orderDate) >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year'
    //       AND DATE_TRUNC('year', orderDate) <= DATE_TRUNC('year', CURRENT_DATE)
    //     GROUP BY year
    //     ORDER BY year DESC;`
    // );
    const result = await client.query(
      `SELECT DATE_TRUNC('year', orderDate) AS year,
        SUM(totalCost) AS totalProfit
        FROM public.IssueHead
        GROUP BY year
        ORDER BY year DESC;`
    );

    const data = result.rows;
    client.release();

    if (!data) {
      throw new Error("Undefined Data");
    }

    // console.log(`185 mappedData: ${JSON.stringify(data)}`);

    return data;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}

// This function will return the current and previous month's sales
export async function fetchTotalProfitByMonthFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    // This is for two months only
    // const result = await client.query(
    //   `SELECT DATE_TRUNC('month', orderDate) AS month,
    //       SUM(totalCost) AS totalProfit
    //         FROM public.IssueHead
    //         WHERE DATE_TRUNC('month', orderDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    //           AND DATE_TRUNC('month', orderDate) <= DATE_TRUNC('month', CURRENT_DATE)
    //         GROUP BY month
    //         ORDER BY month DESC;
    //   `
    // );

    const result = await client.query(
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
    client.release();

    if (!data) {
      throw new Error("Undefined Data");
    }

    // console.log(`185 mappedData: ${JSON.stringify(data)}`);

    return data;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}
export async function fetchTotalProfitByWeekFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    // This is for two months only
    // const result = await client.query(
    //   `SELECT DATE_TRUNC('month', orderDate) AS month,
    //       SUM(totalCost) AS totalProfit
    //         FROM public.IssueHead
    //         WHERE DATE_TRUNC('month', orderDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    //           AND DATE_TRUNC('month', orderDate) <= DATE_TRUNC('month', CURRENT_DATE)
    //         GROUP BY month
    //         ORDER BY month DESC;
    //   `
    // );

    const result = await client.query(
      `SELECT weeks.week AS week,
          COALESCE(ih.name, weeks.name) AS name,
          COALESCE(ih.totalprofit, 0) AS totalprofit
        FROM (
          SELECT week::date AS week, TO_CHAR(week::date, 'DD Mon YY') AS name
          FROM generate_series(
            DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '24 weeks',
            DATE_TRUNC('week', CURRENT_DATE),
            '1 week'
          ) AS week
        ) AS weeks
        LEFT JOIN (
          SELECT DATE_TRUNC('week', orderDate) AS week,
            TO_CHAR(DATE_TRUNC('week', orderDate), 'DD Mon YY') AS name,
            SUM(totalCost) AS totalprofit
          FROM public.IssueHead
          GROUP BY week, name
        ) AS ih
        ON weeks.week = ih.week
        ORDER BY weeks.week ASC;
      `
    );

    const data = result.rows;
    client.release();

    if (!data) {
      throw new Error("Undefined Data");
    }

    // console.log(`185 mappedData: ${JSON.stringify(data)}`);

    return data;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}
export async function generateTotalRevenueWeekByPolicy(): Promise<any[]> {
  try {
    const client = await pool.connect();

    const result = await client.query(
      `SELECT weeks.week AS week,
          COALESCE(ih.name, weeks.name) AS name,
          COALESCE(ih.totalprofit, 0) AS totalprofit,
        COALESCE(ih.agentcode, 'No Agent') AS agentcode
        FROM (
          SELECT week::date AS week, TO_CHAR(week::date, 'DD Mon YY') AS name
          FROM generate_series(
            DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '24 weeks',
            DATE_TRUNC('week', CURRENT_DATE),
            '1 week'
          ) AS week
        ) AS weeks
        LEFT JOIN (
          SELECT DATE_TRUNC('week', orderDate) AS week,
            TO_CHAR(DATE_TRUNC('week', orderDate), 'DD Mon YY') AS name,
            SUM(totalCost) AS totalprofit,
          ap.Code AS AgentCode
          FROM public.IssueHead AS ish
          INNER JOIN Agent AS ag ON ag.Id=ish.AgentId
            INNER JOIN AgentPolicy AS ap ON ap.Id = ag.PolicyId
          GROUP BY week, name, ap.Id
        ) AS ih
        ON weeks.week = ih.week
        ORDER BY weeks.week DESC;
      `
    );

    const data = result.rows;
    client.release();

    if (!data) {
      throw new Error("Undefined Data");
    }

    // console.log(`185 mappedData: ${JSON.stringify(data)}`);

    return data;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}

export async function fetchAgentPoliciesFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    const result = await client.query(
      `SELECT id, code FROM AgentPolicy AS ap WHERE ap.Status='10';
      `
    );

    const data = result.rows;
    client.release();

    if (!data) {
      throw new Error("Undefined Data");
    }

    // console.log(`185 mappedData: ${JSON.stringify(data)}`);

    return data;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}

export async function fetchTotalProfitByMonthByAgentFromDb(
  agentId: number
): Promise<any[]> {
  try {
    const client = await pool.connect();

    const query = {
      text: `SELECT DATE_TRUNC('month', ish.orderDate) AS month,
          TO_CHAR(DATE_TRUNC('month', ish.orderDate), 'Mon YY') AS name,
            SUM(ish.totalCost) AS totalprofit
              FROM public.IssueHead AS ish
			  	INNER JOIN public.Agent AS ag ON ag.Id=ish.AgentId
				INNER JOIN public.AgentPolicy AS ap ON ap.Id=ag.PolicyId
              WHERE DATE_TRUNC('month', ish.orderDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
                AND DATE_TRUNC('month', ish.orderDate) <= DATE_TRUNC('month', CURRENT_DATE)
				AND ap.Id=$1
              GROUP BY month
              ORDER BY month DESC;`,
      values: [agentId],
    };

    const result = await client.query(query);

    const data = result.rows;
    client.release();

    if (!data) {
      throw new Error("Undefined Data");
    }

    // console.log(`185 mappedData: ${JSON.stringify(data)}`);

    return data;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}
