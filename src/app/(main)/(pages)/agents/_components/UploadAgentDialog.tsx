// components/UploadAgentDialog.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileText, AlertTriangle } from "lucide-react";
import { Agent } from "@/components/model/model";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAgentOptions } from "@/hooks/useAgentOptions";

interface UploadAgentDialogProps {
  onAgentsUploaded: (agents: Agent[]) => void;
  onClose: () => void;
}

export default function UploadAgentDialog({
  onAgentsUploaded,
  onClose,
}: UploadAgentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { options } = useAgentOptions();

  const downloadTemplate = () => {
    const csvContent = [
      "code,name,description,policycode,type,enabledagentpolicymanualpricing,enabledbasemanualpricing",
      "AG001,Sample Agent,Sample Description,POL001,STANDARD,false,false",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-upload-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Template Downloaded", {
      description: "CSV template has been downloaded to your device.",
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Invalid File Type", {
        description: "Please upload a CSV file only.",
      });
      return;
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      toast.error("Invalid CSV", {
        description:
          "CSV file must have a header row and at least one data row.",
      });
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["code", "name", "description", "policycode"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      setErrors([`Missing required columns: ${missingHeaders.join(", ")}`]);
      return;
    }

    const data = lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: any = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || "";
      });
      row.rowNumber = index + 2;
      return row;
    });

    // Validate data
    const validationErrors: string[] = [];
    const validPolicyCodes = options.agentPolicies.map((p) => p.code);

    data.forEach((row, index) => {
      if (!row.code)
        validationErrors.push(`Row ${row.rowNumber}: Code is required`);
      if (!row.name)
        validationErrors.push(`Row ${row.rowNumber}: Name is required`);
      if (!row.description)
        validationErrors.push(`Row ${row.rowNumber}: Description is required`);
      if (!row.policycode)
        validationErrors.push(`Row ${row.rowNumber}: Policy code is required`);

      if (row.policycode && !validPolicyCodes.includes(row.policycode)) {
        validationErrors.push(
          `Row ${row.rowNumber}: Invalid policy code "${
            row.policycode
          }". Available: ${validPolicyCodes.join(", ")}`
        );
      }

      // Validate boolean fields
      if (
        row.enabledagentpolicymanualpricing &&
        !["true", "false", ""].includes(
          row.enabledagentpolicymanualpricing.toLowerCase()
        )
      ) {
        validationErrors.push(
          `Row ${row.rowNumber}: enabledagentpolicymanualpricing must be true or false`
        );
      }
      if (
        row.enabledbasemanualpricing &&
        !["true", "false", ""].includes(
          row.enabledbasemanualpricing.toLowerCase()
        )
      ) {
        validationErrors.push(
          `Row ${row.rowNumber}: enabledbasemanualpricing must be true or false`
        );
      }
    });

    setErrors(validationErrors);
    setPreviewData(data);

    if (validationErrors.length === 0) {
      toast.success("File Validated", {
        description: `${data.length} agents ready for upload.`,
      });
    }
  };

  const handleUpload = async () => {
    if (errors.length > 0) {
      toast.error("Validation Errors", {
        description: "Please fix all validation errors before uploading.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const agents = previewData.map((row) => ({
        code: row.code.toUpperCase(),
        name: row.name,
        description: row.description,
        policycode: row.policycode,
        type: row.type || "STANDARD",
        enabledagentpolicymanualpricing:
          row.enabledagentpolicymanualpricing?.toLowerCase() === "true",
        enabledbasemanualpricing:
          row.enabledbasemanualpricing?.toLowerCase() === "true",
        status: "10", // Active by default
      }));

      const response = await fetch("/api/agents/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agents }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload agents");
      }

      const result = await response.json();
      onAgentsUploaded(result.agents);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload Failed", {
        description:
          error instanceof Error ? error.message : "Failed to upload agents",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload Agents from CSV</DialogTitle>
        <DialogDescription>
          Upload multiple agents at once using a CSV file. Download the template
          for the correct format.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={downloadTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csvFile">Select CSV File</Label>
          <Input
            id="csvFile"
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.slice(0, 5).map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
                {errors.length > 5 && (
                  <div>... and {errors.length - 5} more errors</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {previewData.length > 0 && errors.length === 0 && (
          <div className="space-y-2">
            <Label>Preview ({previewData.length} agents)</Label>
            <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
              {previewData.slice(0, 3).map((row, index) => (
                <div key={index} className="mb-1">
                  {row.code} - {row.name} ({row.policycode})
                </div>
              ))}
              {previewData.length > 3 && (
                <div className="text-muted-foreground">
                  ... and {previewData.length - 3} more agents
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              isLoading || previewData.length === 0 || errors.length > 0
            }
          >
            {isLoading ? "Uploading..." : `Upload ${previewData.length} Agents`}
          </Button>
        </div>
      </div>
    </>
  );
}
