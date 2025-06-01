// components/policy-item-columns.tsx
"use client";

import { AgentPolicyItem } from "@/components/model/model";
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
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";

interface ColumnActions {
  onItemDeleted: (itemId: string) => void;
}

export const createPolicyItemColumns = (
  actions: ColumnActions
): ColumnDef<AgentPolicyItem>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0 justify-start"
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.getValue("description")}>
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "productbrand",
    header: "Brand",
    cell: ({ row }) => <div>{row.getValue("productbrand") || "All"}</div>,
  },
  {
    accessorKey: "productcategory",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("productcategory") || "All"}</div>,
  },
  {
    accessorKey: "calculationtype",
    header: "Calc Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("calculationtype")}</div>
    ),
  },
  {
    accessorKey: "calculationamount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("calculationamount"));
      const type = row.original.calculationtype;

      return (
        <div className="font-medium">
          {type === "PERCENTAGE" ? `${amount}%` : `$${amount.toFixed(2)}`}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item.id)}
            >
              Copy Item ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Item
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => actions.onItemDeleted(item.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
