// components/ProductTable.tsx (updated usage)
"use client";

import { useState } from "react";
import { Product } from "@/components/model/model";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable"; // Updated import path
import { createColumns } from "../columns";
import CreateProductDialog from "./CreateProductDialog";
import UploadProductDialog from "./UploadProductDialog";
import { toast } from "sonner";

interface ProductTableProps {
  data: Product[];
}

export default function ProductTable({ data }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>(sortProducts(data));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Default sorting: Active first, then by brand
  function sortProducts(productData: Product[]): Product[] {
    return [...productData].sort((a, b) => {
      // Status priority: "10" (Active) first
      if (a.status !== b.status) {
        if (a.status === "10") return -1;
        if (b.status === "10") return 1;
        return 0;
      }
      // Then sort by brand alphabetically
      return a.brand.localeCompare(b.brand);
    });
  }

  const handleProductCreated = (newProduct: Product) => {
    const updatedProducts = [...products, newProduct];
    setProducts(sortProducts(updatedProducts));
    setIsCreateOpen(false);
    toast.success("Product Created", {
      description: `${newProduct.name} has been created successfully.`,
    });
  };

  const handleProductsUploaded = (uploadedProducts: Product[]) => {
    const updatedProducts = [...products, ...uploadedProducts];
    setProducts(sortProducts(updatedProducts));
    setIsUploadOpen(false);
    toast.success("Products Uploaded", {
      description: `${uploadedProducts.length} products have been uploaded successfully.`,
    });
  };

  const handleProductDeleted = (productId: string) => {
    const updatedProducts = products.filter((p) => p.id !== productId);
    setProducts(updatedProducts);
    toast.success("Product Deleted", {
      description: "Product has been deleted successfully.",
    });
  };

  const handleProductStatusChanged = (productId: string, newStatus: string) => {
    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, status: newStatus } : p
    );
    setProducts(sortProducts(updatedProducts));
    toast.success("Product Status Updated", {
      description: `Product status changed to ${
        newStatus === "10" ? "Active" : "Inactive"
      }.`,
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      // Header
      "Name,Category,Brand,Type,Price,Description,Status",
      // Data rows
      ...products.map(
        (p) =>
          `"${p.name}","${p.category}","${p.brand}","${p.type}",${p.price},"${
            p.description || ""
          }","${p.status}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Export Complete", {
      description: "Products have been exported to CSV successfully.",
    });
  };

  // Create columns with action handlers
  const columns = createColumns({
    onProductDeleted: handleProductDeleted,
    onProductStatusChanged: handleProductStatusChanged,
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
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
              <UploadProductDialog
                onProductsUploaded={handleProductsUploaded}
                onClose={() => setIsUploadOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CreateProductDialog
                onProductCreated={handleProductCreated}
                onClose={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{products.length}</div>
          <p className="text-xs text-muted-foreground">Total Products</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {products.filter((p) => p.status === "10").length}
          </div>
          <p className="text-xs text-muted-foreground">Active Products</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">
            {products.filter((p) => p.status === "20").length}
          </div>
          <p className="text-xs text-muted-foreground">Inactive Products</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {new Set(products.map((p) => p.brand)).size}
          </div>
          <p className="text-xs text-muted-foreground">Unique Brands</p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Filter products by name..."
        showSelection={true}
      />
    </div>
  );
}
