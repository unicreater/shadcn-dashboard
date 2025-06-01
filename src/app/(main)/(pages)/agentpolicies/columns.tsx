// components/agent-policy-columns.tsx
"use client";

import { AgentPolicy } from "@/components/model/model";
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
import {
  ArrowUpDown,
  MoreHorizontal,
  Settings,
  Edit,
  Trash2,
  Power,
} from "lucide-react";

interface ColumnActions {
  onPolicyDeleted: (policyId: string) => void;
  onPolicyStatusChanged: (policyId: string, newStatus: string) => void;
  onManageItems: (policy: AgentPolicy) => void;
}

export const createAgentPolicyColumns = (
  actions: ColumnActions
): ColumnDef<AgentPolicy>[] => [
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
          className="pl-0 justify-start"
        >
          Policy Code
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("type") || "Standard"}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0 justify-start"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <div
          className={`px-3 py-1 rounded-full text-white text-sm font-medium w-fit inline-block ${
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
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const policy = row.original;

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
              onClick={() => navigator.clipboard.writeText(policy.id)}
            >
              Copy Policy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.onManageItems(policy)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Items
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Policy
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                actions.onPolicyStatusChanged(
                  policy.id,
                  policy.status === "10" ? "20" : "10"
                )
              }
            >
              <Power className="h-4 w-4 mr-2" />
              {policy.status === "10" ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => actions.onPolicyDeleted(policy.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Policy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
