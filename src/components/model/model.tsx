export type User = {
  id: number;
  name: string;
  email: string;
  lastOrder: string;
  method: string;
  contactname: string;
  contactphone: string;
  agentkey: string;
};

export type Order = {
  id: string;
  order: string;
  orderDate: string;
  status: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerEmail: string;
  type: string;
  totalCost: number;
  // Items
  orderItems: { item: string; quantity: number; amount: number }[];
  subTotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingInfo: { address1: string; address2: string };
  billingInfo: string | { address1: string; address2: string };
  customerInfo: {
    customerName: string;
    customerEmail: string;
    customerNumber: string;
  };
  paymentInfo: { paymentType: string; cardNumber: string };
};

export type OrderDetails = {
  id: string;
  order: string;
  orderDate: string;
  orderItems: { item: string; quantity: number; amount: number }[];
  subTotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingInfo: { address1: string; address2: string };
  billingInfo: string | { address1: string; address2: string };
  customerInfo: {
    customerName: string;
    customerEmail: string;
    customerNumber: string;
  };
  paymentInfo: { paymentType: string; cardNumber: string };
};

export type OrderReport = {
  id: string;
  orderDate: string;
  totalCost: number;
};
