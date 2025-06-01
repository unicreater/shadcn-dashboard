// components/inventory/UploadInventoryDialog.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Replace,
  Info,
  BarChart3,
  X,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Inventory } from "@/components/model/model.js";

interface UploadInventoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  uploadType: "add" | "replace";
  onUploadComplete: (updatedInventory: Inventory[]) => void;
}

interface ParsedInventoryItem {
  type: string;
  brand: string;
  category: string;
  name: string;
  quantity: number;
  row: number;
}

interface ValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

interface ProcessedInventoryItem {
  id: number;
  productId: number;
  productName: string;
  lotId: number;
  action: string;
  oldQuantity: number;
  newQuantity: number;
  quantityChanged: number;
  type: string;
  brand: string;
  category: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  summary: {
    total: number;
    processed: number;
    failed: number;
    uploadType: string;
  };
  inventories?: ProcessedInventoryItem[];
  errors?: Array<{
    item: any;
    error: string;
  }>;
}

// Dialog states
type DialogState = "upload" | "success" | "error";

const REQUIRED_HEADERS = ["type", "brand", "category", "name", "quantity"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for CSV

export default function UploadInventoryDialog({
  isOpen,
  onClose,
  uploadType,
  onUploadComplete,
}: UploadInventoryDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedInventoryItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadTypeConfig = {
    add: {
      title: "Add Inventory Quantities",
      description: "Add quantities from CSV to existing inventory stock levels",
      icon: Plus,
      buttonText: "Upload & Add",
      explanation: "CSV Quantity + Current Stock = New Total",
      color: "blue",
      example: "Example: CSV shows 20, Current stock is 10 → Final: 30 units",
    },
    replace: {
      title: "Replace Inventory Quantities",
      description: "Replace current quantities with CSV values completely",
      icon: Replace,
      buttonText: "Upload & Replace",
      explanation: "CSV Quantity = New Total (overwrites current)",
      color: "orange",
      example: "Example: CSV shows 20, Current stock is 10 → Final: 20 units",
    },
  };

  const config = uploadTypeConfig[uploadType];
  const IconComponent = config.icon;

  // CSV parsing utility - handles quoted fields and commas within quotes
  const parseCSVLine = useCallback((line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }, []);

  const validateInventoryItem = useCallback(
    (item: any, rowIndex: number): ValidationError[] => {
      const errors: ValidationError[] = [];

      if (!item.type || typeof item.type !== "string" || !item.type.trim()) {
        errors.push({
          row: rowIndex,
          field: "Type",
          value: item.type,
          message: "Type is required and must be a non-empty string",
        });
      }

      if (!item.brand || typeof item.brand !== "string" || !item.brand.trim()) {
        errors.push({
          row: rowIndex,
          field: "Brand",
          value: item.brand,
          message: "Brand is required and must be a non-empty string",
        });
      }

      if (
        !item.category ||
        typeof item.category !== "string" ||
        !item.category.trim()
      ) {
        errors.push({
          row: rowIndex,
          field: "Category",
          value: item.category,
          message: "Category is required and must be a non-empty string",
        });
      }

      if (!item.name || typeof item.name !== "string" || !item.name.trim()) {
        errors.push({
          row: rowIndex,
          field: "Name",
          value: item.name,
          message: "Name is required and must be a non-empty string",
        });
      }

      const quantity = Number(item.quantity);
      if (isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
        errors.push({
          row: rowIndex,
          field: "Quantity",
          value: item.quantity,
          message: "Quantity must be a non-negative integer",
        });
      }

      return errors;
    },
    []
  );

  const parseCSVFile = useCallback(
    async (
      file: File
    ): Promise<{
      data: ParsedInventoryItem[];
      errors: ValidationError[];
    }> => {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error(
          "CSV file must contain at least a header row and one data row"
        );
      }

      const headerLine = lines[0];
      const headers = parseCSVLine(headerLine).map((h) =>
        h.toLowerCase().trim()
      );

      const missingHeaders = REQUIRED_HEADERS.filter(
        (required) => !headers.some((header) => header === required)
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required columns: ${missingHeaders.join(
            ", "
          )}. Found: ${headers.join(", ")}`
        );
      }

      const headerMap: Record<string, number> = {};
      REQUIRED_HEADERS.forEach((required) => {
        const index = headers.findIndex((h) => h === required);
        if (index >= 0) {
          headerMap[required] = index;
        }
      });

      const parsedItems: ParsedInventoryItem[] = [];
      const allErrors: ValidationError[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);

        const item = {
          type: (values[headerMap.type] || "").trim(),
          brand: (values[headerMap.brand] || "").trim(),
          category: (values[headerMap.category] || "").trim(),
          name: (values[headerMap.name] || "").trim(),
          quantity: Number(values[headerMap.quantity] || 0),
          row: i + 1,
        };

        const itemErrors = validateInventoryItem(item, i + 1);
        allErrors.push(...itemErrors);

        if (itemErrors.length === 0) {
          parsedItems.push(item);
        }
      }

      return { data: parsedItems, errors: allErrors };
    },
    [parseCSVLine, validateInventoryItem]
  );

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setParsedData([]);
    setValidationErrors([]);
    setUploadResult(null);
    setPreviewMode(false);
    setDialogState("upload");

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Invalid file type", {
        description: "Please select a CSV file (.csv)",
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: `Please select a file smaller than ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB`,
      });
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const { data, errors } = await parseCSVFile(selectedFile);

      setParsedData(data);
      setValidationErrors(errors);

      if (data.length > 0) {
        setPreviewMode(true);
        toast.success("File parsed successfully", {
          description: `Found ${data.length} valid inventory items${
            errors.length > 0 ? ` with ${errors.length} validation errors` : ""
          }`,
        });
      } else {
        toast.error("No valid data found", {
          description: "Please check your file format and try again",
        });
      }
    } catch (error) {
      toast.error("Parsing failed", {
        description:
          error instanceof Error ? error.message : "Failed to parse CSV file",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!file || parsedData.length === 0) {
      toast.error("No valid data to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const inventories = parsedData.map((item) => ({
        type: item.type,
        brand: item.brand,
        category: item.category,
        name: item.name,
        quantity: item.quantity,
      }));

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/inventory/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventories,
          uploadType,
        }),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        const uploadResult: UploadResult = {
          success: true,
          message: result.message,
          summary: result.summary || {
            total: inventories.length,
            processed: result.processed || 0,
            failed: result.failed || 0,
            uploadType,
          },
          inventories: result.inventories,
          errors: result.errors,
        };

        setUploadResult(uploadResult);
        setDialogState("success");

        // Refresh inventory data
        try {
          const inventoryResponse = await fetch("/api/inventory");
          if (inventoryResponse.ok) {
            const inventoryData = await inventoryResponse.json();
            onUploadComplete(inventoryData.inventory);
          }
        } catch (refreshError) {
          console.warn("Failed to refresh inventory data:", refreshError);
        }

        // toast.success("Upload completed", {
        //   description: `${
        //     result.summary?.processed || 0
        //   } items processed successfully`,
        // });
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      const uploadResult: UploadResult = {
        success: false,
        message: errorMessage,
        summary: {
          total: parsedData.length,
          processed: 0,
          failed: parsedData.length,
          uploadType,
        },
      };

      setUploadResult(uploadResult);
      setDialogState("error");

      toast.error("Upload failed", {
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      "Type,Brand,Category,Name,Quantity",
      "Premium,LENE,L2,Premium Lene Product L2,100",
      "Standard,RELAX,R5,Standard Relax Product R5,50",
      "Basic,SUPER,S8,Basic Super Product S8,25",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kilaueu-inventory-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Template downloaded", {
      description: "CSV template saved to your Downloads folder",
    });
  };

  const resetDialog = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setUploadResult(null);
    setPreviewMode(false);
    setUploadProgress(0);
    setDialogState("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    // Always allow explicit close via button click
    resetDialog();
    onClose();
  };

  const handleBackToUpload = () => {
    setDialogState("upload");
    setUploadResult(null);
  };

  // Success State Component
  const SuccessStateContent = () => {
    if (!uploadResult || !uploadResult.success || !uploadResult.inventories) {
      return null;
    }

    const { summary, inventories } = uploadResult;
    const createdItems = inventories.filter(
      (item) => item.action === "created"
    );
    const updatedItems = inventories.filter(
      (item) => item.action === "updated"
    );

    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              Upload Successful!
            </h3>
            <p className="text-sm text-muted-foreground">
              Your inventory has been{" "}
              {uploadType === "add" ? "added to" : "updated in"} the system
            </p>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {summary.total}
            </div>
            <div className="text-sm text-blue-800">Total Items</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {summary.processed}
            </div>
            <div className="text-sm text-green-800">Processed</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {summary.failed}
            </div>
            <div className="text-sm text-red-800">Failed</div>
          </div>
        </div>

        {/* Action Summary */}
        {(createdItems.length > 0 || updatedItems.length > 0) && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Actions Performed</Label>
            <div className="flex gap-4">
              {createdItems.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {createdItems.length} Created
                </Badge>
              )}
              {updatedItems.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  <Package className="h-3 w-3 mr-1" />
                  {updatedItems.length} Updated
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Detailed Results */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Inventory Changes</Label>
          <ScrollArea className="h-64 border rounded-lg">
            <div className="p-4 space-y-3">
              {inventories.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {item.productName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.type} • {item.brand} • {item.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge
                      variant={
                        item.action === "created" ? "default" : "secondary"
                      }
                    >
                      {item.action}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        {item.oldQuantity}
                      </span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium">{item.newQuantity}</span>
                      {item.quantityChanged !== 0 && (
                        <div
                          className={`flex items-center ml-1 ${
                            item.quantityChanged > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.quantityChanged > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span className="text-xs ml-1">
                            {Math.abs(item.quantityChanged)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Errors Section (if any) */}
        {uploadResult.errors && uploadResult.errors.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="text-orange-800">
                <div className="font-medium mb-2">Some items had issues:</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadResult.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-sm">
                      • {error.error}
                    </div>
                  ))}
                  {uploadResult.errors.length > 5 && (
                    <div className="text-sm">
                      ... and {uploadResult.errors.length - 5} more issues
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  // Error State Component
  const ErrorStateContent = () => {
    if (!uploadResult || uploadResult.success) {
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">
              Upload Failed
            </h3>
            <p className="text-sm text-muted-foreground">
              There was an error processing your inventory upload
            </p>
          </div>
        </div>

        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="text-red-800">
              <div className="font-medium">{uploadResult.message}</div>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium">Details:</div>
                  <div className="max-h-32 overflow-y-auto mt-1">
                    {uploadResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-sm">
                        • {error.error}
                      </div>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <div className="text-sm">
                        ... and {uploadResult.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only allow close when user explicitly clicks a button
        // Never auto-close the dialog
        if (!open) {
          // Don't call handleClose() here - only close via button clicks
          return;
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 text-${config.color}-600`} />
            {dialogState === "upload" && config.title}
            {dialogState === "success" && "Upload Successful"}
            {dialogState === "error" && "Upload Failed"}
          </DialogTitle>
          <DialogDescription>
            {dialogState === "upload" && config.description}
            {dialogState === "success" &&
              "Your inventory upload has been completed successfully"}
            {dialogState === "error" &&
              "There was an error processing your upload"}
          </DialogDescription>
        </DialogHeader>

        {/* Upload State */}
        {dialogState === "upload" && (
          <div className="space-y-6">
            {/* Upload Type Explanation */}
            <Alert
              className={`border-${config.color}-200 bg-${config.color}-50`}
            >
              <Info className={`h-4 w-4 text-${config.color}-600`} />
              <AlertDescription>
                <div className={`text-${config.color}-800`}>
                  <strong>How it works:</strong> {config.explanation}
                  <br />
                  <span className="text-sm opacity-80">{config.example}</span>
                </div>
              </AlertDescription>
            </Alert>

            {/* Template Download */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                1. Download Template
              </Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  Use this template to ensure correct data format
                </span>
              </div>
            </div>

            <Separator />

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                2. Upload Your CSV File
              </Label>
              <div className="space-y-3">
                <Input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isProcessing || isUploading}
                  className="file:mr-4 file:px-4 file:py-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />

                {file && (
                  <div className="flex items-center gap-2 p-3  rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    {isProcessing && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Upload Progress</Label>
                  <span className="text-sm text-muted-foreground">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Preview Data */}
            {previewMode && parsedData.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">3. Preview Data</Label>
                <div className="border rounded-lg p-4 ">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {parsedData.length} Valid Items
                      </Badge>
                      {validationErrors.length > 0 && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {validationErrors.length} Errors
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className=" sticky top-0">
                        <tr>
                          <th className="text-left p-2">Row</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Brand</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 10).map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{item.row}</td>
                            <td className="p-2">{item.type}</td>
                            <td className="p-2">{item.brand}</td>
                            <td className="p-2">{item.category}</td>
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 10 && (
                      <div className="p-2 text-center text-muted-foreground">
                        ... and {parsedData.length - 10} more items
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="text-red-800">
                    <div className="font-medium mb-2">
                      Validation Errors Found:
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {validationErrors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm">
                          Row {error.row}: {error.field} - {error.message}
                        </div>
                      ))}
                      {validationErrors.length > 10 && (
                        <div className="text-sm">
                          ... and {validationErrors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Required Format Info */}
            <div className="text-sm  p-4 rounded-lg">
              <div className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Required CSV Format
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium mb-1">Required Columns:</div>
                  <ul className="space-y-1 text-xs">
                    {REQUIRED_HEADERS.map((header) => (
                      <li key={header}>
                        <code className="bg-accent px-1 rounded">{header}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-1">CSV Guidelines:</div>
                  <ul className="text-xs space-y-1">
                    <li>• Use comma (,) as separator</li>
                    <li>• Wrap text with commas in quotes</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• UTF-8 encoding recommended</li>
                  </ul>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <strong>Note:</strong> Products are matched by Type + Brand +
                Category + Name. All must match existing products in your
                database.
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {dialogState === "success" && <SuccessStateContent />}

        {/* Error State */}
        {dialogState === "error" && <ErrorStateContent />}

        <DialogFooter className="gap-2">
          {dialogState === "upload" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={
                  !file ||
                  parsedData.length === 0 ||
                  isUploading ||
                  isProcessing
                }
                className={`${
                  uploadType === "add"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing {parsedData.length} items...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {config.buttonText} ({parsedData.length} items)
                  </>
                )}
              </Button>
            </>
          )}

          {(dialogState === "success" || dialogState === "error") && (
            <>
              {dialogState === "error" && (
                <Button variant="outline" onClick={handleBackToUpload}>
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Try Again
                </Button>
              )}
              <Button
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {dialogState === "success" ? "Complete" : "Close"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
