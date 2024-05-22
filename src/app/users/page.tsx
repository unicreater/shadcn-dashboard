import { DataTable } from "@/components/DataTable";
import PageTitle from "@/components/page-title";
import { fetchAllUsersFromDb, fetchDataFromDb } from "@/utils/databaseUtils";
import React from "react";
import { userColumns } from "./columns";
import { User } from "@/components/model/model";

type Props = {};

const data: User[] = [
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

export default async function UsersPage({}: Props) {
  const [dbData] = await Promise.all([fetchAllUsersFromDb()]);
  return (
    <div className="flex flex-col gap-5 w-full">
      <PageTitle title="Users" />
      <DataTable columns={userColumns} data={dbData} />
    </div>
  );
}
