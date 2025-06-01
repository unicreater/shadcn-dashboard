// components/agent-columns.tsx
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Power,
  Key,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ColumnActions {
  onAgentDeleted: (agentId: string) => void;
  onAgentStatusChanged: (agentId: string, newStatus: string) => void;
}

function AgentActions({
  agent,
  onAgentDeleted,
  onAgentStatusChanged,
}: {
  agent: Agent;
  onAgentDeleted: (agentId: string) => void;
  onAgentStatusChanged: (agentId: string, newStatus: string) => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete agent");
      }

      onAgentDeleted(agent.id);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete agent. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleStatusChange = async () => {
    setIsLoading(true);
    try {
      const newStatus = agent.status === "10" ? "20" : "10";

      const response = await fetch(`/api/agents/${agent.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update agent status");
      }

      onAgentStatusChanged(agent.id, newStatus);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Status Update Failed", {
        description: "Failed to update agent status. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setShowStatusDialog(false);
    }
  };

  const regenerateAccessKey = async () => {
    try {
      const response = await fetch(`/api/agents/${agent.id}/regenerate-key`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate access key");
      }

      toast.success("Access Key Regenerated", {
        description: "New access key has been generated for the agent.",
      });
    } catch (error) {
      console.error("Regenerate key error:", error);
      toast.error("Key Generation Failed", {
        description: "Failed to regenerate access key. Please try again.",
      });
    }
  };

  return (
    <>
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
            onClick={() => navigator.clipboard.writeText(agent.id)}
          >
            Copy Agent ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(agent.code)}
          >
            Copy Agent Code
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2" />
            Edit Agent
          </DropdownMenuItem>
          <DropdownMenuItem onClick={regenerateAccessKey}>
            <Key className="h-4 w-4 mr-2" />
            Regenerate Access Key
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
            <Power className="h-4 w-4 mr-2" />
            {agent.status === "10" ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Agent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete agent "{agent.code}"? This action
              cannot be undone. We will check for existing orders before
              deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Checking..." : "Delete Agent"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {agent.status === "10" ? "Deactivate" : "Activate"} Agent
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {agent.status === "10" ? "deactivate" : "activate"} agent "
              {agent.code}"?
              {agent.status === "10"
                ? " This will prevent the agent from creating new orders."
                : " This will allow the agent to create new orders."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={isLoading}
            >
              {isLoading
                ? "Updating..."
                : agent.status === "10"
                ? "Deactivate"
                : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const createAgentColumns = (
  actions: ColumnActions
): ColumnDef<Agent>[] => [
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("code")}</div>
    ),
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("policycode")}</div>
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
      <div
        className="capitalize max-w-xs truncate"
        title={row.getValue("description")}
      >
        {row.getValue("description")}
      </div>
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
    accessorKey: "enabledagentpolicymanualpricing",
    header: "Manual Pricing (Policy)",
    cell: ({ row }) => (
      <div
        className={`px-2 py-1 rounded text-sm font-medium ${
          row.getValue("enabledagentpolicymanualpricing")
            ? " text-green-500"
            : " text-red-500"
        }`}
      >
        {row.getValue("enabledagentpolicymanualpricing")
          ? "Enabled"
          : "Disabled"}
      </div>
    ),
  },
  {
    accessorKey: "enabledbasemanualpricing",
    header: "Manual Pricing (Base)",
    cell: ({ row }) => (
      <div
        className={`px-2 py-1 rounded text-sm font-medium ${
          row.getValue("enabledbasemanualpricing")
            ? " text-green-500"
            : " text-red-500"
        }`}
      >
        {row.getValue("enabledbasemanualpricing") ? "Enabled" : "Disabled"}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const agent = row.original;
      return <AgentActions agent={agent} {...actions} />;
    },
  },
];

// Default columns export (for backward compatibility)
export const columns: ColumnDef<Agent>[] = [
  // ... include the basic columns without actions
];
