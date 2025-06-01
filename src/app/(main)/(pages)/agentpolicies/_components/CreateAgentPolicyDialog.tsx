// components/CreateAgentPolicyDialog.tsx
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
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AgentPolicy } from "@/components/model/model";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateAgentPolicyDialogProps {
  onPolicyCreated: (policy: AgentPolicy) => void;
  onClose: () => void;
}

export default function CreateAgentPolicyDialog({
  onPolicyCreated,
  onClose,
}: CreateAgentPolicyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "STANDARD",
    matrixid: "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.code.trim()) errors.push("Policy code is required");
    if (!formData.description.trim()) errors.push("Description is required");

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
      const response = await fetch("/api/agent-policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim(),
          type: formData.type,
          matrixid: formData.matrixid ? Number(formData.matrixid) : null,
          status: "10", // Active by default
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create agent policy");
      }

      const newPolicy = await response.json();
      onPolicyCreated(newPolicy);
    } catch (error) {
      console.error("Create agent policy error:", error);
      toast.error("Creation Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create agent policy",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Agent Policy</DialogTitle>
        <DialogDescription>
          Add a new agent policy to your system. All fields marked with * are
          required.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Policy Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                handleInputChange("code", e.target.value.toUpperCase())
              }
              placeholder="Enter policy code (e.g., POL001)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Policy Type</Label>
            <Select onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select policy type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                <SelectItem value="RETAIL">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter policy description"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="matrixid">Profit Matrix ID (Optional)</Label>
            <Input
              id="matrixid"
              type="number"
              value={formData.matrixid}
              onChange={(e) => handleInputChange("matrixid", e.target.value)}
              placeholder="Enter profit matrix ID (optional)"
            />
            <p className="text-sm text-muted-foreground">
              Link this policy to a specific profit calculation matrix
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Policy"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
