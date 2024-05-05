"use client";

import { DataTable } from "@/components/DataTable";
import PageTitle from "@/components/PageTitle";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

type Props = {};

type Payment = {
  id: string;
  name: string;
  email: string;
  lastOrder: string;
  method: string;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <img
            className="h-10 w-10"
            src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${row.getValue(
              "name"
            )}`}
            alt="user-image"
          />
          <p>{row.getValue("name")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
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

const data: Payment[] = [
  {
    id: "728ed52f",
    name: "John Doe",
    email: "john@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "628ed52f",
    name: "Mary Jane",
    email: "mary@example.com",
    lastOrder: "2023-02-15",
    method: "Paypal",
  },
  {
    id: "528ed52f",
    name: "Alice Smith",
    email: "alice@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "428ed52f",
    name: "Bob Johnson",
    email: "bob@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "728ed52f",
    name: "John Doe",
    email: "john@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "628ed52f",
    name: "Mary Jane",
    email: "mary@example.com",
    lastOrder: "2023-02-15",
    method: "Paypal",
  },
  {
    id: "528ed52f",
    name: "Alice Smith",
    email: "alice@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "428ed52f",
    name: "Bob Johnson",
    email: "bob@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "728ed52f",
    name: "John Doe",
    email: "john@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "628ed52f",
    name: "Mary Jane",
    email: "mary@example.com",
    lastOrder: "2023-02-15",
    method: "Paypal",
  },
  {
    id: "528ed52f",
    name: "Alice Smith",
    email: "alice@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "428ed52f",
    name: "Bob Johnson",
    email: "bob@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "728ed52f",
    name: "John Doe",
    email: "john@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "628ed52f",
    name: "Mary Jane",
    email: "mary@example.com",
    lastOrder: "2023-02-15",
    method: "Paypal",
  },
  {
    id: "528ed52f",
    name: "Alice Smith",
    email: "alice@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "428ed52f",
    name: "Bob Johnson",
    email: "bob@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "728ed52f",
    name: "John Doe",
    email: "john@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "628ed52f",
    name: "Mary Jane",
    email: "mary@example.com",
    lastOrder: "2023-02-15",
    method: "Paypal",
  },
  {
    id: "528ed52f",
    name: "Alice Smith",
    email: "alice@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "428ed52f",
    name: "Bob Johnson",
    email: "bob@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "528ed52f",
    name: "Alice Smith",
    email: "alice@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  {
    id: "428ed52f",
    name: "Bob Johnson",
    email: "bob@example.com",
    lastOrder: "2023-01-01",
    method: "Credit Card",
  },
  // ...
];

export default function UsersPage({}: Props) {
  return (
    <div className="flex flex-col gap-5 w-full">
      <PageTitle title="Users" />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
