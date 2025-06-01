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
// components/model/model.ts (add these interfaces)
export interface AgentPolicy {
  id: string;
  code: string;
  description: string;
  type?: string;
  status: string;
  matrixid?: number;
  adddate?: string;
  adduser?: string;
}

export interface AgentPolicyItem {
  id: string;
  policyid: number;
  code: string;
  description: string;
  productbrand?: string;
  productcategory?: string;
  productcode?: string;
  producttype?: string;
  type?: string;
  calculationtype: string;
  calculationamount: number;
  status: string;
  adddate?: string;
  adduser?: string;
}

// components/model/model.ts (add inventory interfaces)
export interface Inventory {
  id: string;
  productid: number;
  lotid: number;
  onhandqty: number;
  allocatedqty: number;
  pickedqty: number;
  availableqty: number;
  productname: string;
  brand: string;
  category: string;
  type: string;
  accountcode: string;
  created_date?: string;
}

export interface InventoryMovement {
  id: string;
  inventoryid: number;
  productid: number;
  lotid: number;
  movetype: string;
  quantity: number;
  movedate: string;
  issueid?: number;
  issuedetailid?: number;
  adddate: string;
  adduser: string;
  productname?: string;
  brand?: string;
  category?: string;
}
