"use client";

import { DataTable } from "@/components/DataTable";
import PageTitle from "@/components/PageTitle";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

type Props = {};

export default function OrdersPage({}: Props) {
  return (
    <div className="flex flex-col gap-5 w-full">
      <PageTitle title="Orders" />
      <DataTable columns={columns} data={data} />
    </div>
  );
}

export type Payment = {
  id: string;
  order: string;
  status: string;
  lastOrder: string;
  method: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "order",
    header: "Order",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div
          className={cn("font-medium w-fit px-4 py-2 rounded-lg", {
            "bg-red-200": row.getValue("status") === "Pending",
            "bg-orange-200": row.getValue("status") === "Processing",
            "bg-green-200": row.getValue("status") === "Completed",
          })}
        >
          {row.getValue("status")}
        </div>
      );
    },
  },
  {
    accessorKey: "lastOrder",
    header: "Last Order",
  },
  {
    accessorKey: "method",
    header: "Method",
  },
];

export const data: Payment[] = [
  {
    id: "728ed52f",
    order: "ORD001",
    status: "Pending",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "628ed52f",
    order: "ORD002",
    status: "Processing",
    lastOrder: "2023-02-15",
    method: "Paypal",
  },
  {
    id: "528ed52f",
    order: "ORD003",
    status: "Completed",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "428ed52f",
    order: "ORD004",
    status: "Processing",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "728ed52f",
    order: "ORD005",
    status: "Completed",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "628ed52f",
    order: "ORD006",
    status: "Completed",
    lastOrder: "2023-02-15",
    method: "Paypal",
  },

  // ...
];
