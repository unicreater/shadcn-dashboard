// components/CreateAgentDialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Agent } from "@/components/model/model";
import { toast } from "sonner";
import { useAgentOptions } from "@/hooks/useAgentOptions";
import { Loader2 } from "lucide-react";

interface CreateAgentDialogProps {
  onAgentCreated: (agent: Agent) => void;
  onClose: () => void;
}

export default function CreateAgentDialog({
  onAgentCreated,
  onClose,
}: CreateAgentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    policyid: "",
    type: "STANDARD",
    enabledagentpolicymanualpricing: false,
    enabledbasemanualpricing: false,
  });

  const {
    options,
    loading: optionsLoading,
    error: optionsError,
    refreshOptions,
  } = useAgentOptions();

  const handleInputChange = (
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.code.trim()) errors.push("Agent code is required");
    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (!formData.policyid) errors.push("Agent policy is required");

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast.error("Validation Error", {
        description: errors.join(", "),
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          policyid: Number(formData.policyid),
          type: formData.type,
          enabledagentpolicymanualpricing:
            formData.enabledagentpolicymanualpricing,
          enabledbasemanualpricing: formData.enabledbasemanualpricing,
          status: "10", // Active by default
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create agent");
      }

      const newAgent = await response.json();

      // Refresh options to include any new values
      await refreshOptions();

      onAgentCreated(newAgent);
    } catch (error) {
      console.error("Create agent error:", error);
      toast.error("Creation Failed", {
        description:
          error instanceof Error ? error.message : "Failed to create agent",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (optionsError) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-red-500 mb-4">Failed to load agent options</p>
        <Button onClick={refreshOptions}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Agent</DialogTitle>
        <DialogDescription>
          Add a new agent to your system. All fields marked with * are required.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Agent Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                handleInputChange("code", e.target.value.toUpperCase())
              }
              placeholder="Enter agent code (e.g., AG001)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Agent Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter agent name"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter agent description"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Agent Policy *</Label>
            <Select
              onValueChange={(value) => handleInputChange("policyid", value)}
              disabled={optionsLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    optionsLoading ? "Loading..." : "Select agent policy"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.agentPolicies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{policy.code}</span>
                      <span className="text-sm text-muted-foreground">
                        {policy.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Agent Type</Label>
            <Select
              onValueChange={(value) => handleInputChange("type", value)}
              defaultValue="STANDARD"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select agent type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                {options.types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 col-span-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Agent Policy Manual Pricing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow this agent to override pricing based on agent policy
                </p>
              </div>
              <Switch
                checked={formData.enabledagentpolicymanualpricing}
                onCheckedChange={(checked) =>
                  handleInputChange("enabledagentpolicymanualpricing", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Base Manual Pricing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow this agent to override base product pricing
                </p>
              </div>
              <Switch
                checked={formData.enabledbasemanualpricing}
                onCheckedChange={(checked) =>
                  handleInputChange("enabledbasemanualpricing", checked)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || optionsLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Agent"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
