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
import { Order, OrderReport, Product } from "@/components/model/model";
import {
  fetchAllOrdersFromDb,
  fetchAllOrdersProfitFromDb,
  fetchAllProductsFromDb,
} from "@/utils/databaseUtils";
import OrderTable from "@/components/OrderTable";
import {
  generateLastAndCurrentMonth,
  generateLastAndCurrentWeek,
  generateMonthlyReport,
  generateWeeklyReport,
} from "@/utils/functionUtils";
import ProductTable from "@/components/ProductTable";

type Props = {};

export default async function OrdersWithDetailsPage({}: Props) {
  const data: Product[] = await fetchAllProductsFromDb();

  // const dataOrderProfit: OrderReport[] = await fetchAllOrdersProfitFromDb();

  // const {
  //   previousWeekStart,
  //   previousWeekEnd,
  //   currentWeekStart,
  //   currentWeekEnd,
  // } = generateLastAndCurrentWeek();

  // const { currentWeekTotalCost, weekPercentageChange } = generateWeeklyReport(
  //   dataOrderProfit,
  //   previousWeekStart,
  //   previousWeekEnd,
  //   currentWeekStart,
  //   currentWeekEnd
  // );

  // const {
  //   previousMonthStart,
  //   previousMonthEnd,
  //   currentMonthStart,
  //   currentMonthEnd,
  // } = generateLastAndCurrentMonth();

  // const { currentMonthTotalCost, monthPercentageChange } =
  //   generateMonthlyReport(
  //     dataOrderProfit,
  //     previousMonthStart,
  //     previousMonthEnd,
  //     currentMonthStart,
  //     currentMonthEnd
  //   );

  // const weeklyProfit = {
  //   currentWeekTotalCost,
  //   weekPercentageChange,
  // };

  // const monthlyProfit = {
  //   currentMonthTotalCost,
  //   monthPercentageChange,
  // };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:px-14">
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
                    <Link href="/products">Products</Link>
                  </BreadcrumbLink>
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
                    // src="/placeholder-user.jpg"
                    src=""
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
          <ProductTable
            data={data}
            // weeklyProfit={weeklyProfit}
            // monthlyProfit={monthlyProfit}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
