import { format } from "date-fns";
import { fetchOrderItems } from "./databaseUtils";

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

  const date = new Date(orderData.orderdate);
  const formattedDate = format(date, "yyyy-MM-dd");

  const mappedData = {
    id: orderData.id,
    order: orderData.orderno,
    // orderDate: orderData.orderdate,
    orderDate: formattedDate,
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

  const date = new Date(orderData.orderdate);
  const formattedDate = format(date, "yyyy-MM-dd");

  const mappedData = {
    id: orderData.id,
    orderDate: formattedDate,
    totalCost: parseFloat(orderData.totalcost) || 0,
  };

  return mappedData;
}
