// components/AgentPolicyTable.tsx
"use client";

import { useState } from "react";
import { AgentPolicy } from "@/components/model/model";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { createAgentPolicyColumns } from "../columns";
import CreateAgentPolicyDialog from "./CreateAgentPolicyDialog";
import AgentPolicyItemsDialog from "./AgentPolicyItemsDialog";
import { toast } from "sonner";

interface AgentPolicyTableProps {
  data: AgentPolicy[];
}

export default function AgentPolicyTable({ data }: AgentPolicyTableProps) {
  const [policies, setPolicies] = useState<AgentPolicy[]>(sortPolicies(data));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPolicyForItems, setSelectedPolicyForItems] =
    useState<AgentPolicy | null>(null);

  function sortPolicies(policyData: AgentPolicy[]): AgentPolicy[] {
    return [...policyData].sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === "10") return -1;
        if (b.status === "10") return 1;
        return 0;
      }
      return a.code.localeCompare(b.code);
    });
  }

  const handlePolicyCreated = (newPolicy: AgentPolicy) => {
    const updatedPolicies = [...policies, newPolicy];
    setPolicies(sortPolicies(updatedPolicies));
    setIsCreateOpen(false);
    toast.success("Agent Policy Created", {
      description: `Policy ${newPolicy.code} has been created successfully.`,
    });
  };

  const handlePolicyDeleted = (policyId: string) => {
    const updatedPolicies = policies.filter((p) => p.id !== policyId);
    setPolicies(updatedPolicies);
    toast.success("Agent Policy Deleted", {
      description: "Agent policy has been deleted successfully.",
    });
  };

  const handlePolicyStatusChanged = (policyId: string, newStatus: string) => {
    const updatedPolicies = policies.map((p) =>
      p.id === policyId ? { ...p, status: newStatus } : p
    );
    setPolicies(sortPolicies(updatedPolicies));
    toast.success("Policy Status Updated", {
      description: `Policy status changed to ${
        newStatus === "10" ? "Active" : "Inactive"
      }.`,
    });
  };

  const handleManageItems = (policy: AgentPolicy) => {
    setSelectedPolicyForItems(policy);
  };

  const exportToCSV = () => {
    const csvContent = [
      "Code,Description,Type,Status",
      ...policies.map(
        (p) => `"${p.code}","${p.description}","${p.type || ""}","${p.status}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-policies-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Export Complete", {
      description: "Agent policies have been exported to CSV successfully.",
    });
  };

  const columns = createAgentPolicyColumns({
    onPolicyDeleted: handlePolicyDeleted,
    onPolicyStatusChanged: handlePolicyStatusChanged,
    onManageItems: handleManageItems,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Policies</h2>
          <p className="text-muted-foreground">
            Manage agent policies and their pricing items
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CreateAgentPolicyDialog
                onPolicyCreated={handlePolicyCreated}
                onClose={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{policies.length}</div>
          <p className="text-xs text-muted-foreground">Total Policies</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {policies.filter((p) => p.status === "10").length}
          </div>
          <p className="text-xs text-muted-foreground">Active Policies</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">
            {policies.filter((p) => p.status === "20").length}
          </div>
          <p className="text-xs text-muted-foreground">Inactive Policies</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {new Set(policies.map((p) => p.type)).size}
          </div>
          <p className="text-xs text-muted-foreground">Policy Types</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={policies}
        searchKey="code"
        searchPlaceholder="Filter policies by code..."
        showSelection={true}
      />

      {selectedPolicyForItems && (
        <AgentPolicyItemsDialog
          policy={selectedPolicyForItems}
          onClose={() => setSelectedPolicyForItems(null)}
        />
      )}
    </div>
  );
}
