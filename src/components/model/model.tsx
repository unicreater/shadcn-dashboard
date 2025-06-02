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

// id: orderData.id?.toString() || "",
//     orderno: orderData.orderno || "",
//     orderstatus: orderData.orderstatus || "10",
//     customername: orderData.customername || "",
//     customercontact: orderData.customercontact || "",
//     customeraddress: orderData.customeraddress || "",
//     deliverydate: formatSafeDate(orderData.deliverydate),
//     routeid: orderData.routeid || null,
//     agentid: orderData.agentid || null,
//     totalcost: parseFloat(orderData.totalcost) || 0,
//     deliverycost: parseFloat(orderData.deliverycost) || 0,
//     surchargecost: parseFloat(orderData.surchargecost) || 0,
//     discountamount: parseFloat(orderData.discountamount) || 0,
//     adddate: formatSafeDate(orderData.adddate),
//     adduser: orderData.adduser || "",
//     editdate: formatSafeDate(orderData.editdate),
//     edituser: orderData.edituser || "",
export interface Order {
  // Primary identification
  id: string;
  orderno: string;
  orderstatus: string;
  // Customer information
  customername: string;
  customercontact: string;
  customeraddress: string;
  customeremail?: string; // Optional - not always present
  // Delivery information
  deliverydate?: Date | null;
  // Agent and route information
  agentid?: number | null;
  routeid?: number | null;
  // Financial information
  totalcost: number;
  deliverycost: number;
  surchargecost: number;
  discountamount: number;

  // Order flags
  newcustomer?: boolean;
  manualpricing?: boolean;
  hasdelivery?: boolean;
  hassurcharge?: boolean;
  hasdiscount?: boolean;

  // Time slot information
  timeslotid?: number | null;
  timeslotdate?: Date | null;

  // Additional information
  remark1?: string;
  remark2?: string;
  username?: string;

  // System metadata
  adddate: Date;
  adduser: string;
  editdate?: Date | null;
  edituser?: string | null;
}

// Extended order interface for detailed views
export interface OrderWithItems extends Order {
  orderItems: OrderItem[];
}

// Order item interface
export interface OrderItem {
  id: string;
  issueid: string;
  productid: string;
  productname: string;
  brand: string;
  category: string;
  type: string;
  lotid?: number | null;
  expectedqty: number;
  pickedqty?: number;
  shippedqty?: number;
  salesprice: number;
  totalamount: number;
  status?: string;
  adddate?: string;
  editdate?: string;
  adduser?: string;
  edituser?: string;
}

// Order charge information
export interface OrderCharge {
  id: string;
  issueid: string;
  chargedetailid: number;
  chargeamount: number;
  chargetype: string;
  chargedescription: string;
  adddate: string;
  adduser: string;
}

// Pick detail interface
export interface PickDetail {
  id: string;
  issueid: string;
  issuedetailid: string;
  productid: string;
  lotid: number;
  quantity: number;
  status: string;
  adddate: string;
  adduser: string;
  editdate?: string;
  edituser?: string;
}

// Ship detail interface
export interface ShipDetail {
  id: string;
  shipid: string;
  issueid: string;
  packid?: number;
  shipdate?: string;
  deliverydate?: string;
  routedetailid?: number;
  type?: string;
  status: string;
  adddate: string;
  adduser: string;
  editdate?: string;
  edituser?: string;
}

// Order summary for reporting
export interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: {
    [status: string]: number;
  };
  recentGrowth: {
    ordersThisMonth: number;
    revenueThisMonth: number;
    growthPercentage: number;
  };
}

// Order filters for API queries
export interface OrderFilters {
  status?: string | string[];
  agentId?: string;
  customerId?: string;
  routeId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// Order creation request
export interface CreateOrderRequest {
  customername: string;
  customercontact: string;
  customeraddress: string;
  customerid?: string;
  agentid: number;
  routeid: number;
  deliverydate?: string;
  timeslotid?: number;
  orderItems: Array<{
    productid: string;
    quantity: number;
    unitprice: number;
  }>;
  charges?: Array<{
    chargedetailid: number;
    amount: number;
  }>;
  remark1?: string;
  remark2?: string;
  manualpricing?: boolean;
}

// Order update request
export interface UpdateOrderRequest {
  orderstatus?: string;
  deliverydate?: string;
  customername?: string;
  customercontact?: string;
  customeraddress?: string;
  remark1?: string;
  remark2?: string;
  manualpricing?: boolean;
}

// Legacy order interface for backward compatibility
export interface LegacyOrder {
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
  orderItems: Array<{
    item: string;
    quantity: number;
    amount: number;
  }>;
  subTotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingInfo: {
    address1: string;
    address2: string;
  };
  billingInfo: string;
  customerInfo: {
    customerName: string;
    customerEmail: string;
    customerNumber: string;
  };
  paymentInfo: {
    paymentType: string;
    cardNumber: string;
  };
}

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
  orderCount?: number;
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

export type ProductLot = {
  id: string;
  productid: number;
  inventoryid: number;
  productname: string;
  accountcode: string;
};

export type Agent = {
  id: string;
  policyid: string;
  policycode: string;
  code: string;
  name: string;
  description: string;
  type: string;
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

export interface InventoryReport {
  total_onhand: number;
  total_allocated: number;
  total_picked: number;
  inventory_records: number;
}

export interface InventorySummary {
  total_products: number;
  total_onhand: number;
  total_allocated: number;
  total_picked: number;
  total_available: number;
  out_of_stock: number;
  low_stock: number;
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
// Add these interfaces to your existing model file

export interface OrderItem {
  id: string;
  productid: string;
  productname: string;
  brand: string;
  category: string;
  expectedqty: number;
  salesprice: number;
  // lotid?: number;
}

export interface BulkOrderOperation {
  orderIds: string[];
  action: "updateStatus" | "delete";
  status?: string;
}

// Add or update the UserPayload interface
export interface UserPayload {
  telegramId: number;
  role: string;
  userId?: string;
  username?: string;
  agentId?: string;
  agentCode?: string;
  iat?: number;
  exp?: number;
}

// Authentication context type
export interface AuthContext {
  user: UserPayload;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export interface Account {
  id: string;
  code: string;
  description: string;
}
