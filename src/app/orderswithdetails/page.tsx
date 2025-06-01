import Image from "next/image";
import Link from "next/link";
import { PanelLeft, Search } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Order, OrderReport } from "@/components/model/model";
import {
  fetchAllOrdersFromDb,
  fetchAllOrdersProfitFromDb,
} from "@/utils/databaseUtils";
import OrderTable from "@/components/OrderTable";
import {
  generateLastAndCurrentMonth,
  generateLastAndCurrentWeek,
  generateMonthlyReport,
  generateWeeklyReport,
} from "@/utils/functionUtils";

type Props = {};

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

export default async function OrdersWithDetailsPage({}: Props) {
  const data: Order[] = await fetchAllOrdersFromDb();

  const dataOrderProfit: OrderReport[] = await fetchAllOrdersProfitFromDb();

  const {
    previousWeekStart,
    previousWeekEnd,
    currentWeekStart,
    currentWeekEnd,
  } = generateLastAndCurrentWeek();

  const { currentWeekTotalCost, weekPercentageChange } = generateWeeklyReport(
    dataOrderProfit,
    previousWeekStart,
    previousWeekEnd,
    currentWeekStart,
    currentWeekEnd
  );

  const {
    previousMonthStart,
    previousMonthEnd,
    currentMonthStart,
    currentMonthEnd,
  } = generateLastAndCurrentMonth();

  const { currentMonthTotalCost, monthPercentageChange } =
    generateMonthlyReport(
      dataOrderProfit,
      previousMonthStart,
      previousMonthEnd,
      currentMonthStart,
      currentMonthEnd
    );

  const weeklyProfit = {
    currentWeekTotalCost,
    weekPercentageChange,
  };

  const monthlyProfit = {
    currentMonthTotalCost,
    monthPercentageChange,
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
            </Sheet>
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/orders">Orders</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Recent Orders</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <Image
                    src="/fuzzieLogo.png"
                    width={36}
                    height={36}
                    alt="Avatar"
                    className="overflow-hidden rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <OrderTable
            data={data}
            weeklyProfit={weeklyProfit}
            monthlyProfit={monthlyProfit}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
