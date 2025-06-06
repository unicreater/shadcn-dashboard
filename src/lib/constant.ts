import AgentPolicy from "@/components/icons/agent_policy";
import Agents from "@/components/icons/agents";
import Category from "@/components/icons/category";
import Logs from "@/components/icons/clipboard";
import Templates from "@/components/icons/cloud_download";
import Home from "@/components/icons/home";
import Inventory from "@/components/icons/inventory";
import Payment from "@/components/icons/payment";
import Products from "@/components/icons/products";
import Settings from "@/components/icons/settings";
import Workflows from "@/components/icons/workflows";

export const clients = [...new Array(10)].map((client, index) => ({
  href: `/${index + 1}.png`,
}));

export const products = [
  {
    title: "Moonbeam",
    link: "https://gomoonbeam.com",
    thumbnail: "/p1.png",
  },
  {
    title: "Cursor",
    link: "https://cursor.so",
    thumbnail: "/p2.png",
  },
  {
    title: "Rogue",
    link: "https://userogue.com",
    thumbnail: "/p3.png",
  },

  {
    title: "Editorially",
    link: "https://editorially.org",
    thumbnail: "/p4.png",
  },
  {
    title: "Editrix AI",
    link: "https://editrix.ai",
    thumbnail: "/p5.png",
  },
  {
    title: "Pixel Perfect",
    link: "https://app.pixelperfect.quest",
    thumbnail: "/p6.png",
  },

  {
    title: "Algochurn",
    link: "https://algochurn.com",
    thumbnail: "/p1.png",
  },
  {
    title: "Aceternity UI",
    link: "https://ui.aceternity.com",
    thumbnail: "/p2.png",
  },
  {
    title: "Tailwind Master Kit",
    link: "https://tailwindmasterkit.com",
    thumbnail: "/p3.png",
  },
  {
    title: "SmartBridge",
    link: "https://smartbridgetech.com",
    thumbnail: "/p4.png",
  },
  {
    title: "Renderwork Studio",
    link: "https://renderwork.studio",
    thumbnail: "/p5.png",
  },

  {
    title: "Creme Digital",
    link: "https://cremedigital.com",
    thumbnail: "/p6.png",
  },
  {
    title: "Golden Bells Academy",
    link: "https://goldenbellsacademy.com",
    thumbnail: "/p1.png",
  },
  {
    title: "Invoker Labs",
    link: "https://invoker.lol",
    thumbnail: "/p2.png",
  },
  {
    title: "E Free Invoice",
    link: "https://efreeinvoice.com",
    thumbnail: "/p3.png",
  },
];

export const menuOptions = [
  { name: "Dashboard", Component: Home, href: "/dashboard" },
  { name: "Orders", Component: Templates, href: "/orders" },
  { name: "Products", Component: Products, href: "/products" },
  { name: "Inventory", Component: Inventory, href: "/inventory" },
  { name: "Agent Policies", Component: AgentPolicy, href: "/agentpolicies" },
  { name: "Agents", Component: Agents, href: "/agents" },
  // { name: "Promotions", Component: Category, href: "/promotions" },
  // { name: "Reports", Component: Logs, href: "/reports" },
  { name: "Settings", Component: Settings, href: "/settings" },
  // { name: "Connections", Component: Category, href: "/connections" },
  // { name: "Billing", Component: Payment, href: "/billing" },
  // { name: "Templates", Component: Templates, href: "/templates" },
  // { name: "Logs", Component: Logs, href: "/logs" },
];

export const EditorCanvasDefaultCardTypes = {
  Email: { description: "Send and email to a user", type: "Action" },
  Condition: {
    description: "Boolean operator that creates different conditions lanes.",
    type: "Action",
  },
  AI: {
    description:
      "Use the power of AI to summarize, respond, create and much more.",
    type: "Action",
  },
  Slack: { description: "Send a notification to slack", type: "Action" },
  "Google Drive": {
    description:
      "Connect with Google drive to trigger actions or to create files and folders.",
    type: "Trigger",
  },
  Notion: { description: "Create entries directly in notion.", type: "Action" },
  "Custom Webhook": {
    description:
      "Connect any app that has an API key and send data to your applicaiton.",
    type: "Action",
  },
  Discord: {
    description: "Post messages to your discord server",
    type: "Action",
  },
  "Google Calendar": {
    description: "Create a calendar invite.",
    type: "Action",
  },
  Trigger: {
    description: "An event that starts the workflow.",
    type: "Trigger",
  },
  Action: {
    description: "An event that happens after the workflow begins",
    type: "Action",
  },
  Wait: {
    description: "Delay the next action step by using the wait timer.",
    type: "Action",
  },
};

// const dataDetails: OrderDetails[] = [
//   {
//     id: "728ed52f",
//     order: "ORD001",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 3, amount: 250 },
//       { item: "Aqua Filters", quantity: 1, amount: 49 },
//     ],
//     subTotal: 200,
//     shipping: 50,
//     tax: 25,
//     total: 275,
//     shippingInfo: { address1: "1234 Main St.", address2: "Anytown, CA 12345" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Liam Johnson",
//       customerEmail: "liam@example.com",
//       customerNumber: "12345",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "12345" },
//   },
//   {
//     id: "628ed52f",
//     order: "ORD002",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 6, amount: 500 },
//       { item: "Aqua Filters", quantity: 2, amount: 98 },
//     ],
//     subTotal: 200,
//     shipping: 50,
//     tax: 25,
//     total: 275,
//     shippingInfo: { address1: "Jurong West.", address2: "Anytown, Boonlay" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Olivia Smith",
//       customerEmail: "olivia@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
//   {
//     id: "528ed52f",
//     order: "ORD003",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 10, amount: 400 },
//       { item: "Aqua Filters", quantity: 5, amount: 100 },
//     ],
//     subTotal: 400,
//     shipping: 50,
//     tax: 25,
//     total: 475,
//     shippingInfo: { address1: "Jurong East.", address2: "Anytown, Clementi" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Noah Williams",
//       customerEmail: "noah@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
//   {
//     id: "428ed52f",
//     order: "ORD003",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 10, amount: 400 },
//       { item: "Aqua Filters", quantity: 5, amount: 100 },
//     ],
//     subTotal: 400,
//     shipping: 50,
//     tax: 25,
//     total: 475,
//     shippingInfo: { address1: "Jurong East.", address2: "Anytown, Clementi" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Noah Williams",
//       customerEmail: "noah@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
//   {
//     id: "328ed52f",
//     order: "ORD003",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 10, amount: 400 },
//       { item: "Aqua Filters", quantity: 5, amount: 100 },
//     ],
//     subTotal: 400,
//     shipping: 50,
//     tax: 25,
//     total: 475,
//     shippingInfo: { address1: "Jurong East.", address2: "Anytown, Clementi" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Noah Williams",
//       customerEmail: "noah@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
//   {
//     id: "228ed52f",
//     order: "ORD003",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 10, amount: 400 },
//       { item: "Aqua Filters", quantity: 5, amount: 100 },
//     ],
//     subTotal: 400,
//     shipping: 50,
//     tax: 25,
//     total: 475,
//     shippingInfo: { address1: "Jurong East.", address2: "Anytown, Clementi" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Noah Williams",
//       customerEmail: "noah@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
//   {
//     id: "128ed52f",
//     order: "ORD001",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 3, amount: 250 },
//       { item: "Aqua Filters", quantity: 1, amount: 49 },
//     ],
//     subTotal: 200,
//     shipping: 50,
//     tax: 25,
//     total: 275,
//     shippingInfo: { address1: "1234 Main St.", address2: "Anytown, CA 12345" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Liam Johnson",
//       customerEmail: "liam@example.com",
//       customerNumber: "12345",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "12345" },
//   },
//   {
//     id: "028ed52f",
//     order: "ORD002",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 6, amount: 500 },
//       { item: "Aqua Filters", quantity: 2, amount: 98 },
//     ],
//     subTotal: 200,
//     shipping: 50,
//     tax: 25,
//     total: 275,
//     shippingInfo: { address1: "Jurong West.", address2: "Anytown, Boonlay" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Olivia Smith",
//       customerEmail: "olivia@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
//   {
//     id: "918ed52f",
//     order: "ORD003",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 10, amount: 400 },
//       { item: "Aqua Filters", quantity: 5, amount: 100 },
//     ],
//     subTotal: 400,
//     shipping: 50,
//     tax: 25,
//     total: 475,
//     shippingInfo: { address1: "Jurong East.", address2: "Anytown, Clementi" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Noah Williams",
//       customerEmail: "noah@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
//   {
//     id: "818ed52f",
//     order: "ORD003",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 10, amount: 400 },
//       { item: "Aqua Filters", quantity: 5, amount: 100 },
//     ],
//     subTotal: 400,
//     shipping: 50,
//     tax: 25,
//     total: 475,
//     shippingInfo: { address1: "Jurong East.", address2: "Anytown, Clementi" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Noah Williams",
//       customerEmail: "noah@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
//   {
//     id: "718ed52f",
//     order: "ORD003",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 10, amount: 400 },
//       { item: "Aqua Filters", quantity: 5, amount: 100 },
//     ],
//     subTotal: 400,
//     shipping: 50,
//     tax: 25,
//     total: 475,
//     shippingInfo: { address1: "Jurong East.", address2: "Anytown, Clementi" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Noah Williams",
//       customerEmail: "noah@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
//   {
//     id: "618ed52f",
//     order: "ORD003",
//     orderDate: "2024-05-06",
//     orderItems: [
//       { item: "Glimmer Lamps", quantity: 10, amount: 400 },
//       { item: "Aqua Filters", quantity: 5, amount: 100 },
//     ],
//     subTotal: 400,
//     shipping: 50,
//     tax: 25,
//     total: 475,
//     shippingInfo: { address1: "Jurong East.", address2: "Anytown, Clementi" },
//     billingInfo: "Same as shipping address",
//     customerInfo: {
//       customerName: "Noah Williams",
//       customerEmail: "noah@example.com",
//       customerNumber: "+62 032183 39213",
//     },
//     paymentInfo: { paymentType: "Visa", cardNumber: "**** **** **** 1234" },
//   },
// ];
