import { DataTable } from "@/components/DataTable";
import PageTitle from "@/components/page-title";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import React from "react";

import { orderColumns } from "./columns";
import { Order } from "@/components/model/model";
import { fetchAllOrdersFromDb } from "@/utils/databaseUtils";

type Props = {};

// const data: Order[] = [
//   {
//     id: "1",
//     order: "KEVIN001",
//     // orderDate: orderData.orderdate,
//     orderDate: "2024-05-11",
//     status: "Open",
//     customerName: "Keith",
//     customerAddress: "Malaysia",
//     customerContact: "+62 5555 5555",
//     customerEmail: "Kevin@mail.com", // To be deleted
//     type: "Shop", // To be deleted
//     totalCost: parseFloat("500") || 0,
//     orderItems: [],
//     subTotal: parseFloat("500") || 0, // To be deleted
//     shipping: parseFloat("20") || 0,
//     tax: parseFloat("15") || 0,
//     total: parseFloat("535") || 0, // To be deleted
//     shippingInfo: {
//       address1: "Malaysia",
//       address2: "Malaysia", // To be deleted
//     },
//     billingInfo: "Malaysia", // To be deleted
//     customerInfo: {
//       customerName: "Keith",
//       customerEmail: "+62 5555 5555", // To be deleted
//       customerNumber: "+62 5555 5555",
//     },
//     paymentInfo: {
//       paymentType: "Cash",
//       cardNumber: "Cash",
//     },

//     // ...
//   },
// ];

export default async function OrdersOldPage({}: Props) {
  const data: Order[] = await fetchAllOrdersFromDb();

  return (
    <div className="flex flex-col gap-5 w-full">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
      </header>
      <PageTitle title="Orders" />
      <DataTable columns={orderColumns} data={data} />
    </div>
  );
}
