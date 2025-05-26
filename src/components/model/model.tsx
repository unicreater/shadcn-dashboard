export type User = {
  id: string;
  name: string;
  email: string;
  lastOrder: string;
  method: string;
  contactname?: string;
  contactphone?: string;
  agentkey?: string;
};

export type Order = {
  id: string;
  order: string;
  deliveryDate: string;
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
  deliveryDate: string;
  totalCost: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  brand: string;
  type: string;
  status: string;
  created_date: string;
};

export type Agent = {
  id: string;
  policyid: string;
  code: string;
  name: string;
  description: string;
  status: string;
  enabledagentpolicymanualpricing: boolean;
  enabledbasemanualpricing: boolean;
  created_date: string;
};
export type AgentPolicy = {
  id: string;
  code: string;
  description: string;
  type: string;
  status: string;
  created_date: string;
  agents: Agent[];
  agent_policy_items: AgentPolicyItem[];
};

/*
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
*/
export type AgentPolicyItem = {
  id: string;
  policyid: string;
  code: string;
  description: string;
  product_type: string;
  product_brand: string;
  product_category: string;
  product_code: string;
  type: string;
  calculation_type: string;
  calculation_amount: number;
  status: string;
  created_date: string;
};
