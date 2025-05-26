import { pool } from "@/utils/postgres";
import {
  mapToAgentModel,
  mapToAgentPolicyItemModel,
  mapToAgentPolicyModel,
  mapToOrderModel,
  mapToOrderProfitModel,
  mapToProductModel,
} from "./orderFunctionUtils";

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

    const ORDERS_UP_TILL = process.env.ORDERS_UP_TILL || "2 months"; // Default to "2 months"

    // Build the query
    const result = await client.query(
      `SELECT * 
   FROM public.IssueHead AS ish 
   WHERE ish.adddate >= CURRENT_DATE - INTERVAL '${ORDERS_UP_TILL}'
   ORDER BY ish.id DESC`
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
      "SELECT id, deliverydate, totalcost FROM public.IssueHead ORDER BY id DESC"
    );

    const data = result.rows;

    // console.log(`data: ${JSON.stringify(data)}`);
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

    const result = await client.query(
      `SELECT EXTRACT(YEAR from deliveryDate) AS year,
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

    const result = await client.query(
      `SELECT DATE_TRUNC('month', deliveryDate) AS month,
          TO_CHAR(DATE_TRUNC('month', deliveryDate), 'Mon YY') AS name,
            SUM(totalCost) AS totalprofit
              FROM public.IssueHead
              WHERE DATE_TRUNC('month', deliveryDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
                AND DATE_TRUNC('month', deliveryDate) <= DATE_TRUNC('month', CURRENT_DATE)
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
          SELECT DATE_TRUNC('week', deliveryDate) AS week,
            TO_CHAR(DATE_TRUNC('week', deliveryDate), 'DD Mon YY') AS name,
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
          SELECT DATE_TRUNC('week', deliveryDate) AS week,
            TO_CHAR(DATE_TRUNC('week', deliveryDate), 'DD Mon YY') AS name,
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
      text: `SELECT DATE_TRUNC('month', ish.deliveryDate) AS month,
          TO_CHAR(DATE_TRUNC('month', ish.deliveryDate), 'Mon YY') AS name,
            SUM(ish.totalCost) AS totalprofit
              FROM public.IssueHead AS ish
			  	INNER JOIN public.Agent AS ag ON ag.Id=ish.AgentId
				INNER JOIN public.AgentPolicy AS ap ON ap.Id=ag.PolicyId
              WHERE DATE_TRUNC('month', ish.deliveryDate) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
                AND DATE_TRUNC('month', ish.deliveryDate) <= DATE_TRUNC('month', CURRENT_DATE)
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

export async function fetchAllProductsFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    // Build the query
    const result = await client.query(
      `SELECT * 
   FROM public.Product as pd 
   ORDER BY pd.type ASC, pd.brand ASC, pd.category ASC, pd.name ASC, pd.status ASC`
    );

    const data = result.rows;

    client.release();
    if (!data) {
      throw new Error("Undefined Data");
    }
    const mappedData = await Promise.all(
      data.map((productData: any) => mapToProductModel(productData))
    );

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}
export async function fetchAllAgentsFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    // Build the query
    const result = await client.query(
      `SELECT ag.id, ag.policyid, agp.code AS policycode, ag.code, ag.name, ag.description, ag.status, ag.enabledbasemanualpricing, ag.enabledagentpolicymanualpricing, ag.adddate
   FROM public.Agent as ag 
      INNER JOIN public.AgentPolicy as agp ON agp.id = ag.policyid
   ORDER BY ag.Code ASC`
    );

    const data = result.rows;

    client.release();
    if (!data) {
      throw new Error("Undefined Data");
    }
    const mappedData = await Promise.all(
      data.map((agentData: any) => mapToAgentModel(agentData))
    );

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}
export async function fetchAllAgentsByPolicyFromDb(
  policyId: number
): Promise<any[]> {
  try {
    const client = await pool.connect();

    // Build the query
    const result = await client.query(
      `SELECT ag.id, ag.code, ag.name, ag.description, ag.status, ag.enabledbasemanualpricing, ag.enabledagentpolicymanualpricing, ag.adddate
   FROM public.Agent as ag 
      WHERE ag.policyid = $1
   ORDER BY ag.Code ASC`,
      [policyId]
    );

    const data = result.rows;

    client.release();
    if (!data) {
      throw new Error("Undefined Data");
    }
    const mappedData = await Promise.all(
      data.map((agentData: any) => mapToAgentModel(agentData))
    );

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}
export async function fetchAllPolicyItemByPolicyFromDb(
  policyId: number
): Promise<any[]> {
  try {
    const client = await pool.connect();

    // Build the query
    const result = await client.query(
      `SELECT
        API.ID,
        API.POLICYID,
        API.CODE,
        API.DESCRIPTION,
        API.PRODUCTTYPE,
        API.PRODUCTBRAND,
        API.PRODUCTCATEGORY,
        API.PRODUCTCODE,
        API.TYPE,
        API.CALCULATIONTYPE,
        API.CALCULATIONAMOUNT,
        API.STATUS,
        API.ADDDATE
      FROM
        PUBLIC.AGENTPOLICYITEM AS API
      WHERE
        API.POLICYID = $1
      ORDER BY
        API.CODE ASC`,
      [policyId]
    );

    const data = result.rows;

    client.release();
    if (!data) {
      throw new Error("Undefined Data");
    }
    const mappedData = await Promise.all(
      data.map((agentPolicyItemData: any) =>
        mapToAgentPolicyItemModel(agentPolicyItemData)
      )
    );

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}
export async function fetchAllAgentPolicyFromDb(): Promise<any[]> {
  try {
    const client = await pool.connect();

    // Build the query
    const result = await client.query(
      `SELECT agp.id, agp.code, agp.description, agp.type, agp.status, agp.adddate
   FROM public.AgentPolicy as agp 
   ORDER BY agp.Code ASC`
    );

    const data = result.rows;

    client.release();
    if (!data) {
      throw new Error("Undefined Data");
    }
    const mappedData = await Promise.all(
      data.map((agentPolicyData: any) => mapToAgentPolicyModel(agentPolicyData))
    );

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error so it can be handled at the calling location
  }
}
