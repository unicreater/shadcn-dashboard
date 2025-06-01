import { format } from "date-fns";
import {
  fetchAllAgentsByPolicyFromDb,
  fetchAllPolicyItemByPolicyFromDb,
  fetchOrderItems,
} from "./databaseUtils";

export async function mapToOrderModel(orderData: any): Promise<any> {
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
    order: orderData.orderno,
    // orderDate: orderData.orderdate,
    deliveryDate: formattedDate,
    status: orderData.orderstatus,
    customerName: orderData.customername,
    customerAddress: orderData.customeraddress,
    customerContact: orderData.customercontact,
    customerEmail: orderData.customercontact, // To be deleted
    type: "Shop", // To be deleted
    totalCost: parseFloat(orderData.totalcost) || 0,
    orderItems: mappedOrderItems,
    subTotal: parseFloat(orderData.totalcost) || 0, // To be deleted
    shipping: parseFloat(orderData.deliverycost) || 0,
    tax: parseFloat(orderData.surchargecost) || 0,
    total: parseFloat(orderData.totalcost) || 0, // To be deleted
    shippingInfo: {
      address1: orderData.customeraddress,
      address2: orderData.customeraddress, // To be deleted
    },
    billingInfo: orderData.customeraddress, // To be deleted
    customerInfo: {
      customerName: orderData.customername,
      customerEmail: orderData.customercontact, // To be deleted
      customerNumber: orderData.customercontact,
    },
    paymentInfo: {
      paymentType: "Cash",
      cardNumber: "Cash",
    },
    // Map other properties as needed
  };

  return mappedData;
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
