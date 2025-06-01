// components/UploadProductDialog.tsx
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
import { Product } from "@/components/model/model";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadProductDialogProps {
  onProductsUploaded: (products: Product[]) => void;
  onClose: () => void;
}

export default function UploadProductDialog({
  onProductsUploaded,
  onClose,
}: UploadProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = [
      "name,category,brand,type,price,description",
      "Sample Product,L2,LENE,Premium,25.99,Sample description",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-upload-template.csv";
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
    const requiredHeaders = ["name", "category", "brand", "type", "price"];
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
      row.rowNumber = index + 2; // +2 because we skip header and 0-index
      return row;
    });

    // Validate data
    const validationErrors: string[] = [];
    data.forEach((row, index) => {
      if (!row.name)
        validationErrors.push(`Row ${row.rowNumber}: Name is required`);
      if (!row.category)
        validationErrors.push(`Row ${row.rowNumber}: Category is required`);
      if (!row.brand)
        validationErrors.push(`Row ${row.rowNumber}: Brand is required`);
      if (!row.type)
        validationErrors.push(`Row ${row.rowNumber}: Type is required`);
      if (!row.price || isNaN(Number(row.price))) {
        validationErrors.push(
          `Row ${row.rowNumber}: Price must be a valid number`
        );
      }
    });

    setErrors(validationErrors);
    setPreviewData(data);

    if (validationErrors.length === 0) {
      toast.success("File Validated", {
        description: `${data.length} products ready for upload.`,
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
      const products = previewData.map((row) => ({
        name: row.name,
        category: row.category,
        brand: row.brand,
        type: row.type,
        price: Number(row.price),
        description: row.description || "",
        status: "10", // Active by default
      }));

      const response = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload products");
      }

      const result = await response.json();
      onProductsUploaded(result.products);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload Failed", {
        description:
          error instanceof Error ? error.message : "Failed to upload products",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload Products from CSV</DialogTitle>
        <DialogDescription>
          Upload multiple products at once using a CSV file. Download the
          template for the correct format.
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
            <Label>Preview ({previewData.length} products)</Label>
            <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
              {previewData.slice(0, 3).map((row, index) => (
                <div key={index} className="mb-1">
                  {row.name} - {row.brand} {row.category} - ${row.price}
                </div>
              ))}
              {previewData.length > 3 && (
                <div className="text-muted-foreground">
                  ... and {previewData.length - 3} more products
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
            {isLoading
              ? "Uploading..."
              : `Upload ${previewData.length} Products`}
          </Button>
        </div>
      </div>
    </>
  );
}
