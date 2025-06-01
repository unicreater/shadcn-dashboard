// components/AgentPolicyItemsDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { AgentPolicy, AgentPolicyItem } from "@/components/model/model";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { createPolicyItemColumns } from "../item-columns";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useProductOptions } from "@/hooks/useProductOptions";

interface AgentPolicyItemsDialogProps {
  policy: AgentPolicy;
  onClose: () => void;
}

export default function AgentPolicyItemsDialog({
  policy,
  onClose,
}: AgentPolicyItemsDialogProps) {
  const [items, setItems] = useState<AgentPolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    code: "",
    description: "",
    productbrand: "",
    productcategory: "",
    productcode: "",
    producttype: "",
    type: "PRODUCT",
    calculationtype: "PERCENTAGE",
    calculationamount: 0,
  });

  const { options: productOptions } = useProductOptions();

  useEffect(() => {
    fetchItems();
  }, [policy.id]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agent-policies/${policy.id}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load policy items");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.code || !newItem.description || !newItem.calculationtype) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch(`/api/agent-policies/${policy.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create item");
      }

      const createdItem = await response.json();
      setItems([...items, createdItem]);
      setNewItem({
        code: "",
        description: "",
        productbrand: "",
        productcategory: "",
        productcode: "",
        producttype: "",
        type: "PRODUCT",
        calculationtype: "PERCENTAGE",
        calculationamount: 0,
      });

      toast.success("Policy item created successfully");
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create item"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleItemDeleted = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
    toast.success("Policy item deleted successfully");
  };

  const columns = createPolicyItemColumns({
    onItemDeleted: handleItemDeleted,
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Manage Policy Items - {policy.code}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {policy.description}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="items" className="h-full">
          <TabsList>
            <TabsTrigger value="items">
              Policy Items ({items.length})
            </TabsTrigger>
            <TabsTrigger value="create">Add New Item</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="h-full overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={items}
                searchKey="code"
                searchPlaceholder="Filter items by code..."
                showSelection={false}
              />
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Code *</Label>
                <Input
                  value={newItem.code}
                  onChange={(e) =>
                    setNewItem({ ...newItem, code: e.target.value })
                  }
                  placeholder="Enter item code"
                />
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Input
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label>Product Brand</Label>
                <Select
                  onValueChange={(value) =>
                    setNewItem({
                      ...newItem,
                      productbrand: value === "ALL_BRANDS" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_BRANDS">All Brands</SelectItem>
                    {productOptions.brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product Category</Label>
                <Select
                  onValueChange={(value) =>
                    setNewItem({
                      ...newItem,
                      productcategory: value === "ALL_CATEGORIES" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_CATEGORIES">
                      All Categories
                    </SelectItem>
                    {productOptions.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select
                  onValueChange={(value) =>
                    setNewItem({
                      ...newItem,
                      producttype: value === "ALL_TYPES" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_TYPES">All Types</SelectItem>
                    {productOptions.types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Item Type</Label>
                <Select
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCT">Product</SelectItem>
                    <SelectItem value="BRAND">Brand</SelectItem>
                    <SelectItem value="CATEGORY">Category</SelectItem>
                    <SelectItem value="TYPE">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Calculation Type *</Label>
                <Select
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, calculationtype: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select calculation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                    <SelectItem value="MARKUP">Markup</SelectItem>
                    <SelectItem value="DISCOUNT">Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Calculation Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.calculationamount}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      calculationamount: Number(e.target.value),
                    })
                  }
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleCreateItem} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Item"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
