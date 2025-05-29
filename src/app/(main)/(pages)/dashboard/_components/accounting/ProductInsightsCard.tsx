"use client";

import React, { useState } from "react";
import { CardContent } from "./CardContent";
import SalesCard from "./SalesCard";

interface ProductInsightsData {
  brands: any[];
  types: any[];
  categories: any[];
  flavors: any[];
  totalSales: number;
}

interface ProductInsightsCardProps {
  data: ProductInsightsData;
}

const ProductInsightsCard = ({ data }: ProductInsightsCardProps) => {
  const [activeTab, setActiveTab] = useState<
    "brands" | "types" | "categories" | "flavors"
  >("brands");

  const tabs = [
    { key: "brands", label: "Top Brands", data: data.brands },
    { key: "types", label: "Top Types", data: data.types },
    { key: "categories", label: "Categories", data: data.categories },
    { key: "flavors", label: "Top Flavors", data: data.flavors },
  ];

  const currentData = tabs.find((tab) => tab.key === activeTab)?.data || [];

  const getItemMapper = (key: string) => {
    switch (key) {
      case "brands":
        return (item: any, index: number) => ({
          name: item.brand,
          email: `TOP #${index + 1}`,
          saleAmount: `${Number(item.totalsales).toLocaleString()}`,
        });
      case "types":
        return (item: any, index: number) => ({
          name: item.type,
          email: `TOP #${index + 1}`,
          saleAmount: `${Number(item.totalsales).toLocaleString()}`,
        });
      case "categories":
        return (item: any, index: number) => ({
          name: `${item.brand} | ${item.category}`,
          email: `TOP #${index + 1}`,
          saleAmount: `${Number(item.totalsales).toLocaleString()}`,
        });
      case "flavors":
        return (item: any, index: number) => ({
          name: item.flavor,
          email: `TOP #${index + 1}`,
          saleAmount: `${Number(item.totalsales).toLocaleString()}`,
        });
      default:
        return () => ({ name: "", email: "", saleAmount: "" });
    }
  };

  return (
    <CardContent className="flex flex-col gap-4">
      {/* Tab Headers */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <section>
        <p className="text-foreground font-medium">
          {tabs.find((tab) => tab.key === activeTab)?.label}
        </p>
        <p className="text-sm text-muted-foreground">
          You sold {data.totalSales.toLocaleString()} products this month.
        </p>
      </section>

      {/* Data */}
      {currentData?.length ? (
        <div className="space-y-3">
          {currentData.map((item, index) => {
            const mapper = getItemMapper(activeTab);
            const salesCardProps = mapper(item, index);
            return (
              <SalesCard
                key={index}
                name={salesCardProps.name}
                email={salesCardProps.email}
                saleAmount={salesCardProps.saleAmount}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-28 flex text-muted-foreground items-center justify-center">
          No Data this month.
        </div>
      )}
    </CardContent>
  );
};

export default ProductInsightsCard;
