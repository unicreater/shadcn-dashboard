// columns.tsx

"use client";

import { Product } from "@/components/model/model";
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

export const columns: ColumnDef<Product>[] = [
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("category")}</div>
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("brand")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div className="capitalize">{row.getValue("type")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-fit"
        >
          Status
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status");

      return (
        <div
          className={`px-4 py-1 rounded-md text-white w-fit inline-block ${
            status === "10"
              ? "bg-green-500"
              : status === "20"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        >
          {status === "10"
            ? "Active"
            : status === "20"
            ? "Inactive"
            : "Unknown"}
        </div>
      );
    },
  },
  {
    accessorKey: "created_date",
    header: "Created Date",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("created_date")}</div>
    ),
  },
  {
    accessorKey: "price",
    // header: ({ column }) => {
    //   return (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Cost Price
    //       <ArrowUpDown />
    //     </Button>
    //   );
    // },
    header: () => <div className="text-right">Cost Price</div>,

    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));

      // Format the price as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "SGD",
      }).format(price);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
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
              Copy Product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Product</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
