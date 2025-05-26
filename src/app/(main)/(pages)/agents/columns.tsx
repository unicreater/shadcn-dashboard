// columns.tsx

"use client";

import { Agent } from "@/components/model/model";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export const columns: ColumnDef<Agent>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Agent Code
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "policycode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Policy Code
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("policycode")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "enabledagentpolicymanualpricing",
    header: "Manual Price (Agent Policy)",
    cell: ({ row }) => (
      <div
        className={`capitalize ${
          row.getValue("enabledagentpolicymanualpricing")
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {String(row.getValue("enabledagentpolicymanualpricing"))}
      </div>
    ),
  },
  {
    accessorKey: "enabledbasemanualpricing",
    header: "Manual Price (Base)",
    cell: ({ row }) => (
      <div
        className={`capitalize ${
          row.getValue("enabledbasemanualpricing")
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {String(row.getValue("enabledbasemanualpricing"))}
      </div>
    ),
  },

  // {
  //   accessorKey: "created_date",
  //   header: "Created Date",
  //   cell: ({ row }) => (
  //     <div className="capitalize">{row.getValue("created_date")}</div>
  //   ),
  // },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy Agent ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Agent</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              Delete Agent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
