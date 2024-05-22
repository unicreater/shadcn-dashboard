// columns.tsx

"use client";

import { User } from "@/components/model/model";
import { ColumnDef } from "@tanstack/react-table";

export const userColumns: ColumnDef<User>[] = [
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
  //   {
  //     accessorKey: "email",
  //     header: "Email",
  //   },
  //   {
  //     accessorKey: "lastOrder",
  //     header: "Last Order",
  //   },
  //   {
  //     accessorKey: "method",
  //     header: "Method",
  //   },
  {
    accessorKey: "contactname",
    header: "Contact Name",
  },
  {
    accessorKey: "contactphone",
    header: "Contact Phone",
  },
  {
    accessorKey: "agentkey",
    header: "Agent Key",
  },
];
