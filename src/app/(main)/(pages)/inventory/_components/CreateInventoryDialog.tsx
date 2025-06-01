// components/CreateInventoryDialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Inventory } from "@/components/model/model";
import { toast } from "sonner";
import { useInventoryOptions } from "@/hooks/useInventoryOptions";
import { Loader2 } from "lucide-react";

interface CreateInventoryDialogProps {
  onInventoryCreated: (inventory: Inventory) => void;
  onClose: () => void;
}

export default function CreateInventoryDialog({
  onInventoryCreated,
  onClose,
}: CreateInventoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    productid: "",
    lotid: "",
    onhandqty: "",
    allocatedqty: "0",
    pickedqty: "0",
  });

  const {
    options,
    loading: optionsLoading,
    error: optionsError,
    refreshOptions,
  } = useInventoryOptions();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getLotsForProduct = () => {
    if (!formData.productid) return [];
    return options.lots.filter(
      (lot) => lot.productid === Number(formData.productid)
    );
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.productid) errors.push("Product is required");
    if (!formData.lotid) errors.push("Lot is required");
    if (!formData.onhandqty) errors.push("On hand quantity is required");
    if (Number(formData.onhandqty) < 0)
      errors.push("On hand quantity cannot be negative");

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
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productid: Number(formData.productid),
          lotid: Number(formData.lotid),
          onhandqty: Number(formData.onhandqty),
          allocatedqty: Number(formData.allocatedqty),
          pickedqty: Number(formData.pickedqty),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create inventory");
      }

      const newInventory = await response.json();

      await refreshOptions();
      onInventoryCreated(newInventory);
    } catch (error) {
      console.error("Create inventory error:", error);
      toast.error("Creation Failed", {
        description:
          error instanceof Error ? error.message : "Failed to create inventory",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (optionsError) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-red-500 mb-4">Failed to load inventory options</p>
        <Button onClick={refreshOptions}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Inventory Record</DialogTitle>
        <DialogDescription>
          Add inventory for an existing product lot. All fields marked with *
          are required.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Product *</Label>
            <Select
              onValueChange={(value) => {
                handleInputChange("productid", value);
                handleInputChange("lotid", ""); // Reset lot when product changes
              }}
              disabled={optionsLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={optionsLoading ? "Loading..." : "Select product"}
                />
              </SelectTrigger>
              <SelectContent>
                {options.products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.brand} • {product.category}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Lot *</Label>
            <Select
              onValueChange={(value) => handleInputChange("lotid", value)}
              disabled={optionsLoading || !formData.productid}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !formData.productid ? "Select product first" : "Select lot"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {getLotsForProduct().map((lot) => (
                  <SelectItem key={lot.id} value={lot.id.toString()}>
                    Lot {lot.id} - {lot.accountcode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="onhandqty">On Hand Quantity *</Label>
            <Input
              id="onhandqty"
              type="number"
              min="0"
              value={formData.onhandqty}
              onChange={(e) => handleInputChange("onhandqty", e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocatedqty">Allocated Quantity</Label>
            <Input
              id="allocatedqty"
              type="number"
              min="0"
              value={formData.allocatedqty}
              onChange={(e) =>
                handleInputChange("allocatedqty", e.target.value)
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="pickedqty">Picked Quantity</Label>
            <Input
              id="pickedqty"
              type="number"
              min="0"
              value={formData.pickedqty}
              onChange={(e) => handleInputChange("pickedqty", e.target.value)}
              placeholder="0"
            />
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
              "Create Inventory"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
