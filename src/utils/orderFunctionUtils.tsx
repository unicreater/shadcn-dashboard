import { format } from "date-fns";
import {
  fetchAllAgentsByPolicyFromDb,
  fetchAllPolicyItemByPolicyFromDb,
  fetchOrderItems,
} from "./databaseUtils";
import { Order, OrderItem } from "@/components/model/model";

// Clean mapping function that follows the new Order interface
export function mapToOrderModel(orderData: any): Order {
  // Safe date formatting
  const formatSafeDate = (dateValue: any): string => {
    if (!dateValue) return "";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "";
      return date.toISOString();
    } catch (error) {
      console.warn("Invalid date format:", dateValue);
      return "";
    }
  };

  return {
    id: orderData.id?.toString() || "",
    orderno: orderData.orderno || "",
    orderstatus: orderData.orderstatus || "10",
    customername: orderData.customername || "",
    customercontact: orderData.customercontact || "",
    customeraddress: orderData.customeraddress || "",
    deliverydate: orderData.deliverydate,
    routeid: orderData.routeid || null,
    agentid: orderData.agentid || null,
    totalcost: parseFloat(orderData.totalcost) || 0,
    deliverycost: parseFloat(orderData.deliverycost) || 0,
    surchargecost: parseFloat(orderData.surchargecost) || 0,
    discountamount: parseFloat(orderData.discountamount) || 0,
    adddate: orderData.adddate,
    adduser: orderData.adduser || "",
    editdate: orderData.editdate,
    edituser: orderData.edituser || "",
  };
}

// Enhanced function that includes order items (for detailed views)
export async function mapToOrderModelWithItems(
  orderData: any
): Promise<Order & { orderItems: any[] }> {
  try {
    const baseOrder = mapToOrderModel(orderData);

    // Fetch order items only when specifically needed
    const orderItems = await fetchOrderItems(orderData.id);

    const mappedOrderItems = orderItems.map((item: any) => ({
      id: item.id?.toString() || "",
      productId: item.productid?.toString() || "",
      productName: item.name || "",
      productDescription: `${item.type || ""} - ${item.brand || ""} - ${
        item.category || ""
      } - ${item.name || ""}`.replace(/^[\s-]+|[\s-]+$/g, ""),
      brand: item.brand || "",
      category: item.category || "",
      type: item.type || "",
      quantity: parseInt(item.expectedqty) || 0,
      unitPrice: parseFloat(item.salesprice) || 0,
      totalAmount:
        (parseFloat(item.salesprice) || 0) * (parseInt(item.expectedqty) || 0),
      expectedqty: parseInt(item.expectedqty) || 0,
      salesprice: parseFloat(item.salesprice) || 0,
    }));

    return {
      ...baseOrder,
      orderItems: mappedOrderItems,
    };
  } catch (error) {
    console.error("Error mapping order with items:", error);
    // Return base order without items if item fetching fails
    return {
      ...mapToOrderModel(orderData),
      orderItems: [],
    };
  }
}

export async function mapToOrderProfitModel(orderData: any): Promise<any> {
  const orderItems = await fetchOrderItems(orderData.id);

  const mappedOrderItems = orderItems.map((item: any) => ({
    item:
      item.type +
      " - " +
      item.brand +
      " - " +
      item.category +
      " - " +
      item.name,
    quantity: parseInt(item.expectedqty) || 0,
    amount: parseFloat(item.salesprice) * parseInt(item.expectedqty) || 0,
  }));

  const date = new Date(orderData.deliverydate);
  const formattedDate = format(date, "yyyy-MM-dd");

  const mappedData = {
    id: orderData.id,
    deliveryDate: formattedDate,
    totalCost: parseFloat(orderData.totalcost) || 0,
  };

  return mappedData;
}

export async function mapToProductModel(data: any): Promise<any> {
  const date = new Date(data.created_date);
  const formattedDate = format(date, "yyyy-MM-dd");

  const mappedData = {
    id: data.id,
    code: data.code,
    name: data.name,
    price: parseFloat(data.price) || 0,
    image: data.imageurl,
    description: data.description,
    category: data.category,
    brand: data.brand,
    type: data.type,
    status: data.status,
    created_date: formattedDate,
    // Map other properties as needed
  };

  return mappedData;
}

export async function mapToAgentModel(data: any): Promise<any> {
  const date = new Date(data.created_date);
  const formattedDate = format(date, "yyyy-MM-dd");

  const mappedData = {
    id: data.id,
    policyid: data.policyid,
    policycode: data.policycode,
    code: data.code,
    name: data.name,
    description: data.description,
    status: data.status,
    enabledagentpolicymanualpricing: data.enabledagentpolicymanualpricing,
    enabledbasemanualpricing: data.enabledbasemanualpricing,
    created_date: formattedDate,
    // Map other properties as needed
  };

  return mappedData;
}
export async function mapToAgentPolicyItemModel(data: any): Promise<any> {
  const date = new Date(data.adddate);
  const formattedDate = format(date, "yyyy-MM-dd");

  const mappedData = {
    id: data.id,
    policyid: data.policyid,
    code: data.code,
    description: data.description,
    product_type: data.producttype,
    product_brand: data.productbrand,
    product_category: data.productcategory,
    product_code: data.productcode,
    type: data.type,
    calculation_type: data.calculationtype,
    calculation_amount: data.calculationamount,
    status: data.status,
    created_date: formattedDate,
    // Map other properties as needed
  };

  return mappedData;
}
export async function mapToAgentPolicyModel(data: any): Promise<any> {
  const agentpolicyitems = await fetchAllPolicyItemByPolicyFromDb(data.id);
  const date = new Date(data.adddate);
  const formattedDate = format(date, "yyyy-MM-dd");

  const mappedData = {
    id: data.id,
    code: data.code,
    description: data.description,
    type: data.type,
    status: data.status,
    created_date: formattedDate,
    agent_policy_items: agentpolicyitems,
    // Map other properties as needed
  };

  return mappedData;
}
/**
 * Maps raw database order item data to OrderItem interface
 * Handles data type conversion and validation
 */
export function mapToOrderItem(itemData: any): OrderItem {
  // Safe parsing functions
  const safeParseFloat = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeParseInt = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeParseIntNullable = (value: any): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  };

  const formatSafeDate = (dateValue: any): string => {
    if (!dateValue) return "";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "";
      return date.toISOString();
    } catch (error) {
      console.warn("Invalid date format:", dateValue);
      return "";
    }
  };

  // Calculate derived values
  const quantity = safeParseInt(itemData.expectedqty);
  const unitPrice = safeParseFloat(itemData.salesprice);
  const totalAmount = quantity * unitPrice;

  return {
    id: itemData.id?.toString() || "",
    issueid: itemData.issueid?.toString() || "",
    productid: itemData.productid?.toString() || "",
    productname: itemData.productname || itemData.name || "",
    brand: itemData.brand || "",
    category: itemData.category || "",
    type: itemData.type || "",
    lotid: safeParseIntNullable(itemData.lotid),
    expectedqty: quantity,
    pickedqty: safeParseInt(itemData.pickedqty),
    shippedqty: safeParseInt(itemData.shippedqty),
    salesprice: unitPrice,
    totalamount: totalAmount,
    status: itemData.status || "10",
    adddate: formatSafeDate(itemData.adddate),
    editdate: formatSafeDate(itemData.editdate),
    adduser: itemData.adduser || "",
    edituser: itemData.edituser || "",
  };
}
