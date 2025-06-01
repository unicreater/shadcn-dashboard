// components/CreateProductDialog.tsx (updated)
"use client";

import { useState, useEffect } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Product } from "@/components/model/model";
import { toast } from "sonner";
import { useProductOptions } from "@/hooks/useProductOptions";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateProductDialogProps {
  onProductCreated: (product: Product) => void;
  onClose: () => void;
}

export default function CreateProductDialog({
  onProductCreated,
  onClose,
}: CreateProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    type: "",
    price: "",
    description: "",
  });

  // Popover states for comboboxes
  const [brandOpen, setBrandOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const {
    options,
    loading: optionsLoading,
    error: optionsError,
    refreshOptions,
  } = useProductOptions();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };

      // If brand changes, reset category to force re-selection
      if (field === "brand" && prev.brand !== value) {
        newFormData.category = "";
      }

      return newFormData;
    });
  };

  // Get available categories for selected brand
  const getAvailableCategories = () => {
    if (!formData.brand || !options.categoriesByBrand[formData.brand]) {
      return options.categories;
    }
    return options.categoriesByBrand[formData.brand];
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push("Product name is required");
    if (!formData.category.trim()) errors.push("Category is required");
    if (!formData.brand.trim()) errors.push("Brand is required");
    if (!formData.type.trim()) errors.push("Type is required");
    if (!formData.price.trim()) errors.push("Price is required");
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.push("Price must be a valid positive number");
    }

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
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category.trim(),
          brand: formData.brand.trim(),
          type: formData.type.trim(),
          price: Number(formData.price),
          description: formData.description.trim(),
          status: "10", // Active by default
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create product");
      }

      const newProduct = await response.json();

      // Refresh options to include any new values
      await refreshOptions();

      onProductCreated(newProduct);
    } catch (error) {
      console.error("Create product error:", error);
      toast.error("Creation Failed", {
        description:
          error instanceof Error ? error.message : "Failed to create product",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (optionsError) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-red-500 mb-4">Failed to load product options</p>
        <Button onClick={refreshOptions}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Product</DialogTitle>
        <DialogDescription>
          Add a new product to your inventory. All fields marked with * are
          required.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Brand *</Label>
            <Popover open={brandOpen} onOpenChange={setBrandOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={brandOpen}
                  className="w-full justify-between"
                  disabled={optionsLoading}
                >
                  {formData.brand || "Select brand..."}
                  {optionsLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search brands..." />
                  <CommandEmpty>No brands found.</CommandEmpty>
                  <CommandGroup>
                    {options.brands.map((brand) => (
                      <CommandItem
                        key={brand}
                        value={brand}
                        onSelect={() => {
                          handleInputChange("brand", brand);
                          setBrandOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.brand === brand
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {brand}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className="w-full justify-between"
                  disabled={optionsLoading || !formData.brand}
                >
                  {formData.category || "Select category..."}
                  {optionsLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search categories..." />
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {getAvailableCategories().map((category) => (
                      <CommandItem
                        key={category}
                        value={category}
                        onSelect={() => {
                          handleInputChange("category", category);
                          setCategoryOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.category === category
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {category}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {formData.brand && getAvailableCategories().length === 0 && (
              <p className="text-sm text-muted-foreground">
                No categories found for {formData.brand}. You can add a new one.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Popover open={typeOpen} onOpenChange={setTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={typeOpen}
                  className="w-full justify-between"
                  disabled={optionsLoading}
                >
                  {formData.type || "Select type..."}
                  {optionsLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search types..." />
                  <CommandEmpty>No types found.</CommandEmpty>
                  <CommandGroup>
                    {options.types.map((type) => (
                      <CommandItem
                        key={type}
                        value={type}
                        onSelect={() => {
                          handleInputChange("type", type);
                          setTypeOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.type === type ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {type}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="price">Price (SGD) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description (optional)"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || optionsLoading}>
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </>
  );
}
