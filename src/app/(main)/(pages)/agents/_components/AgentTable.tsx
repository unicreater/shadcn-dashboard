// components/AgentTable.tsx
"use client";

import { useState } from "react";
import { Agent } from "@/components/model/model";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { createAgentColumns } from "../columns";
import CreateAgentDialog from "./CreateAgentDialog";
import UploadAgentDialog from "./UploadAgentDialog";
import { toast } from "sonner";

interface AgentTableProps {
  data: Agent[];
}

export default function AgentTable({ data }: AgentTableProps) {
  const [agents, setAgents] = useState<Agent[]>(sortAgents(data));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Default sorting: Active first, then by agent code
  function sortAgents(agentData: Agent[]): Agent[] {
    return [...agentData].sort((a, b) => {
      // Status priority: "10" (Active) first
      if (a.status !== b.status) {
        if (a.status === "10") return -1;
        if (b.status === "10") return 1;
        return 0;
      }
      // Then sort by agent code alphabetically
      return a.code.localeCompare(b.code);
    });
  }

  const handleAgentCreated = (newAgent: Agent) => {
    const updatedAgents = [...agents, newAgent];
    setAgents(sortAgents(updatedAgents));
    setIsCreateOpen(false);
    toast.success("Agent Created", {
      description: `Agent ${newAgent.code} has been created successfully.`,
    });
  };

  const handleAgentsUploaded = (uploadedAgents: Agent[]) => {
    const updatedAgents = [...agents, ...uploadedAgents];
    setAgents(sortAgents(updatedAgents));
    setIsUploadOpen(false);
    toast.success("Agents Uploaded", {
      description: `${uploadedAgents.length} agents have been uploaded successfully.`,
    });
  };

  const handleAgentDeleted = (agentId: string) => {
    const updatedAgents = agents.filter((a) => a.id !== agentId);
    setAgents(updatedAgents);
    toast.success("Agent Deleted", {
      description: "Agent has been deleted successfully.",
    });
  };

  const handleAgentStatusChanged = (agentId: string, newStatus: string) => {
    const updatedAgents = agents.map((a) =>
      a.id === agentId ? { ...a, status: newStatus } : a
    );
    setAgents(sortAgents(updatedAgents));
    toast.success("Agent Status Updated", {
      description: `Agent status changed to ${
        newStatus === "10" ? "Active" : "Inactive"
      }.`,
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      // Header
      "Code,Name,Description,PolicyCode,Type,Status,ManualPricingPolicy,ManualPricingBase",
      // Data rows
      ...agents.map(
        (a) =>
          `"${a.code}","${a.name}","${a.description}","${a.policycode}","${
            a.type || ""
          }","${a.status}",${a.enabledagentpolicymanualpricing},${
            a.enabledbasemanualpricing
          }`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agents-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Export Complete", {
      description: "Agents have been exported to CSV successfully.",
    });
  };

  // Create columns with action handlers
  const columns = createAgentColumns({
    onAgentDeleted: handleAgentDeleted,
    onAgentStatusChanged: handleAgentStatusChanged,
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agents</h2>
          <p className="text-muted-foreground">
            Manage your agent network and permissions
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <UploadAgentDialog
                onAgentsUploaded={handleAgentsUploaded}
                onClose={() => setIsUploadOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CreateAgentDialog
                onAgentCreated={handleAgentCreated}
                onClose={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Agents Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{agents.length}</div>
          <p className="text-xs text-muted-foreground">Total Agents</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {agents.filter((a) => a.status === "10").length}
          </div>
          <p className="text-xs text-muted-foreground">Active Agents</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">
            {agents.filter((a) => a.status === "20").length}
          </div>
          <p className="text-xs text-muted-foreground">Inactive Agents</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {new Set(agents.map((a) => a.policycode)).size}
          </div>
          <p className="text-xs text-muted-foreground">Unique Policies</p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={agents}
        searchKey="code"
        searchPlaceholder="Filter agents by code..."
        showSelection={true}
      />
    </div>
  );
}
