import { pool } from "@/utils/postgres";
import {
  mapToAgentModel,
  mapToAgentPolicyItemModel,
  mapToAgentPolicyModel,
  mapToOrderItem,
  mapToOrderModel,
  mapToOrderProfitModel,
  mapToProductModel,
} from "./orderFunctionUtils";
import { DatabaseService } from "@/services/database";
import {
  Agent,
  Inventory,
  Order,
  OrderReport,
  OrderWithItems,
  Product,
} from "@/components/model/model";

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

export async function fetchAllOrdersFromDb(): Promise<Order[]> {
  try {
    const ORDERS_UP_TILL = process.env.ORDERS_UP_TILL || "2 months"; // Default to "2 months"

    // Validate the interval to prevent injection
    const validIntervals = [
      "1 month",
      "2 months",
      "3 months",
      "6 months",
      "1 year",
    ];
    const safeInterval = validIntervals.includes(ORDERS_UP_TILL)
      ? ORDERS_UP_TILL
      : "2 months";

    const orders = await DatabaseService.query<Order[]>(
      `SELECT 
        ish.id,
        ish.orderno,
        ish.orderdate,
        ish.orderstatus,
        ish.customername,
        ish.customercontact,
        ish.customeraddress,
        ish.deliverydate,
        ish.customerid,
        ish.routeid,
        ish.agentid,
        ish.totalcost,
        ish.deliverycost,
        ish.surchargecost,
        ish.discountamount,
        ish.adddate,
        ish.adduser,
        ish.editdate,
        ish.edituser,
        ag.code as agentcode,
        ag.accesskey as agentkey,
        rh.description as routedescription
       FROM issuehead ish
       LEFT JOIN agent ag ON ish.agentid = ag.id
       LEFT JOIN routehead rh ON ish.routeid = rh.id
       WHERE ish.adddate >= CURRENT_DATE - INTERVAL $1
       ORDER BY ish.id DESC`,
      { params: [safeInterval] }
    );

    return orders.map((orderData) => mapToOrderModel(orderData));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

// Optimized function that fetches orders with items in bulk
// export async function fetchAllOrdersWithItemsFromDb(): Promise<
//   OrderWithItems[]
// > {
//   try {
//     const ORDERS_UP_TILL = process.env.ORDERS_UP_TILL || "2 months";

//     // Validate and sanitize the interval to prevent injection
//     const validIntervals = [
//       "1 month",
//       "2 months",
//       "3 months",
//       "6 months",
//       "1 year",
//     ];
//     const safeInterval = validIntervals.includes(ORDERS_UP_TILL)
//       ? ORDERS_UP_TILL
//       : "2 months";

//     // Use template literal with validated input (safe because safeInterval is from whitelist)
//     const ordersWithItems = await DatabaseService.query<any[]>(
//       `SELECT
//         ish.id as order_id,
//         ish.orderno,
//         ish.orderdate,
//         ish.orderstatus,
//         ish.customername,
//         ish.customercontact,
//         ish.customeraddress,
//         ish.deliverydate,
//         ish.customerid,
//         ish.routeid,
//         ish.agentid,
//         ish.totalcost,
//         ish.deliverycost,
//         ish.surchargecost,
//         ish.discountamount,
//         ish.adddate,
//         ish.adduser,
//         ish.editdate,
//         ish.edituser,
//         ag.code as agentcode,
//         ag.accesskey as agentkey,
//         rh.description as routedescription,
//         -- Order items
//         id.id as item_id,
//         id.productid,
//         id.expectedqty,
//         id.salesprice,
//         p.name as product_name,
//         p.brand,
//         p.category,
//         p.type
//        FROM issuehead ish
//        LEFT JOIN agent ag ON ish.agentid = ag.id
//        LEFT JOIN routehead rh ON ish.routeid = rh.id
//        LEFT JOIN issuedetail id ON ish.id = id.issueid
//        LEFT JOIN product p ON id.productid = p.id
//        WHERE ish.adddate >= CURRENT_DATE - INTERVAL '${safeInterval}'
//        ORDER BY ish.id DESC, id.id ASC`,
//       { params: [] } // No parameters needed since we're using validated template
//     );

//     // Group results by order
//     const ordersMap = new Map<string, any>();

//     ordersWithItems.forEach((row) => {
//       const orderId = row.order_id.toString();

//       if (!ordersMap.has(orderId)) {
//         // Create order object
//         ordersMap.set(orderId, {
//           orderData: {
//             id: row.order_id,
//             orderno: row.orderno,
//             orderdate: row.orderdate,
//             orderstatus: row.orderstatus,
//             customername: row.customername,
//             customercontact: row.customercontact,
//             customeraddress: row.customeraddress,
//             deliverydate: row.deliverydate,
//             customerid: row.customerid,
//             routeid: row.routeid,
//             agentid: row.agentid,
//             totalcost: row.totalcost,
//             deliverycost: row.deliverycost,
//             surchargecost: row.surchargecost,
//             discountamount: row.discountamount,
//             adddate: row.adddate,
//             adduser: row.adduser,
//             editdate: row.editdate,
//             edituser: row.edituser,
//             agentcode: row.agentcode,
//             agentkey: row.agentkey,
//             routedescription: row.routedescription,
//           },
//           items: [],
//         });
//       }

//       // Add item if it exists
//       if (row.item_id) {
//         ordersMap.get(orderId)!.items.push({
//           id: row.item_id,
//           productid: row.productid,
//           expectedqty: row.expectedqty,
//           salesprice: row.salesprice,
//           name: row.product_name,
//           brand: row.brand,
//           category: row.category,
//           type: row.type,
//         });
//       }
//     });

//     // Convert map to array and apply mapping
//     return Array.from(ordersMap.values()).map(({ orderData, items }) => {
//       const baseOrder = mapToOrderModel(orderData);

//       const mappedOrderItems = items.map((item: any) =>
//         mapToOrderItem({
//           id: item.id,
//           issueid: orderData.id,
//           productid: item.productid,
//           productname: item.name,
//           brand: item.brand,
//           category: item.category,
//           type: item.type,
//           expectedqty: item.expectedqty,
//           salesprice: item.salesprice,
//         })
//       );

//       return {
//         ...baseOrder,
//         orderItems: mappedOrderItems,
//       };
//     });
//   } catch (error) {
//     console.error("Error fetching orders with items:", error);
//     return [];
//   }
// }

// More secure approach using date calculation instead of INTERVAL
export async function fetchAllOrdersWithItems(): Promise<OrderWithItems[]> {
  try {
    const ORDERS_UP_TILL = process.env.ORDERS_UP_TILL || "2 months";

    // Calculate the cutoff date based on the interval
    const getCutoffDate = (interval: string): string => {
      const now = new Date();

      switch (interval) {
        case "1 month":
          now.setMonth(now.getMonth() - 1);
          break;
        case "2 months":
          now.setMonth(now.getMonth() - 2);
          break;
        case "3 months":
          now.setMonth(now.getMonth() - 3);
          break;
        case "6 months":
          now.setMonth(now.getMonth() - 6);
          break;
        case "1 year":
          now.setFullYear(now.getFullYear() - 1);
          break;
        default:
          now.setMonth(now.getMonth() - 2); // Default to 2 months
      }

      return now.toISOString().split("T")[0]; // Return YYYY-MM-DD format
    };

    const validIntervals = [
      "1 month",
      "2 months",
      "3 months",
      "6 months",
      "1 year",
    ];
    const safeInterval = validIntervals.includes(ORDERS_UP_TILL)
      ? ORDERS_UP_TILL
      : "2 months";

    const cutoffDate = getCutoffDate(safeInterval);

    // Use parameterized query with calculated date
    const ordersWithItems = await DatabaseService.query<any[]>(
      `SELECT 
        ish.id as order_id,
        ish.orderno,
        ish.orderdate,
        ish.orderstatus,
        ish.customername,
        ish.customercontact,
        ish.customeraddress,
        ish.deliverydate,
        ish.customerid,
        ish.routeid,
        ish.agentid,
        ish.totalcost,
        ish.deliverycost,
        ish.surchargecost,
        ish.discountamount,
        ish.adddate,
        ish.adduser,
        ish.editdate,
        ish.edituser,
        ag.code as agentcode,
        ag.accesskey as agentkey,
        rh.description as routedescription,
        -- Order items
        id.id as item_id,
        id.productid,
        id.expectedqty,
        id.salesprice,
        p.name as product_name,
        p.brand,
        p.category,
        p.type
       FROM issuehead ish
       LEFT JOIN agent ag ON ish.agentid = ag.id
       LEFT JOIN routehead rh ON ish.routeid = rh.id
       LEFT JOIN issuedetail id ON ish.id = id.issueid
       LEFT JOIN product p ON id.productid = p.id
       WHERE ish.adddate >= $1
       ORDER BY ish.id DESC, id.id ASC`,
      { params: [cutoffDate] }
    );

    // Rest of the implementation remains the same...
    const ordersMap = new Map<string, any>();

    ordersWithItems.forEach((row) => {
      const orderId = row.order_id.toString();

      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          orderData: {
            id: row.order_id,
            orderno: row.orderno,
            orderdate: row.orderdate,
            orderstatus: row.orderstatus,
            customername: row.customername,
            customercontact: row.customercontact,
            customeraddress: row.customeraddress,
            deliverydate: row.deliverydate,
            customerid: row.customerid,
            routeid: row.routeid,
            agentid: row.agentid,
            totalcost: row.totalcost,
            deliverycost: row.deliverycost,
            surchargecost: row.surchargecost,
            discountamount: row.discountamount,
            adddate: row.adddate,
            adduser: row.adduser,
            editdate: row.editdate,
            edituser: row.edituser,
            agentcode: row.agentcode,
            agentkey: row.agentkey,
            routedescription: row.routedescription,
          },
          items: [],
        });
      }

      if (row.item_id) {
        ordersMap.get(orderId)!.items.push({
          id: row.item_id,
          productid: row.productid,
          expectedqty: row.expectedqty,
          salesprice: row.salesprice,
          name: row.product_name,
          brand: row.brand,
          category: row.category,
          type: row.type,
        });
      }
    });

    const mappedOrderData = Array.from(ordersMap.values()).map(
      ({ orderData, items }) => {
        const baseOrder = mapToOrderModel(orderData);
        const mappedOrderItems = items.map((item: any) =>
          mapToOrderItem({
            id: item.id,
            issueid: orderData.id,
            productid: item.productid,
            productname: item.name,
            brand: item.brand,
            category: item.category,
            type: item.type,
            expectedqty: item.expectedqty,
            salesprice: item.salesprice,
          })
        );

        return {
          ...baseOrder,
          orderItems: mappedOrderItems,
        };
      }
    );

    return mappedOrderData;
  } catch (error) {
    console.error("Error fetching orders with items:", error);
    return [];
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

export async function fetchAllOrdersProfitFromDb(): Promise<OrderReport[]> {
  try {
    const result = await DatabaseService.query<OrderReport[]>(
      `SELECT 
        id, deliverydate, totalcost
       FROM issuehead
       ORDER BY id DESC
      `
    );

    const mappedData = await Promise.all(
      result.map((orderData: any) => mapToOrderProfitModel(orderData))
    );

    return mappedData;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
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
    const result = await DatabaseService.query<Product[]>(
      `SELECT 
        id,
        name,
        category,
        brand,
        type,
        price,
        description,
        status,
        adddate as created_date
       FROM product 
       ORDER BY 
        CASE WHEN status = '10' THEN 0 ELSE 1 END,  -- Active products first
        brand ASC,                                   -- Then by brand
        name ASC                                     -- Then by name
      `
    );

    const data = result;

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
    const result = await DatabaseService.query<Agent[]>(
      `SELECT 
        a.id,
        a.code,
        a.name,
        a.description,
        a.policyid,
        ap.code as policycode,
        a.type,
        a.status,
        a.enabledagentpolicymanualpricing,
        a.enabledbasemanualpricing,
        a.adddate as created_date,
        a.versionno
       FROM agent a
       LEFT JOIN agentpolicy ap ON a.policyid = ap.id
       ORDER BY 
        CASE WHEN a.status = '10' THEN 0 ELSE 1 END,  -- Active agents first
        a.code ASC                                     -- Then by agent code
      `
    );

    const data = result;

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

// utils/databaseUtils.ts (add inventory functions)
export async function fetchAllInventoryFromDb(): Promise<Inventory[]> {
  try {
    const inventory = await DatabaseService.query<Inventory[]>(
      `SELECT 
        i.id,
        i.productid,
        i.lotid,
        i.onhandqty,
        i.allocatedqty,
        i.pickedqty,
        i.availableqty,
        p.name as productname,
        p.brand,
        p.category,
        p.type,
        a.code as accountcode,
        i.adddate as created_date
       FROM inventory i
       JOIN product p ON i.productid = p.id
       JOIN productlot pl ON i.lotid = pl.id
       JOIN account a ON pl.accountid = a.id
       ORDER BY 
        (i.onhandqty - i.allocatedqty - i.pickedqty) DESC,  -- High stock first
        p.name ASC
      `
    );

    return inventory;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
}
