import SalesCard from "@/components/sales-card";
import Card, { CardContent } from "@/components/simple-card";
import React from "react";
import {
  getMonthHighestProductBrandSales,
  getMonthTotalProductSales,
} from "../_actions/dashboard-connections";
import { Carrot } from "lucide-react";

type Props = {};

const ProductBrandTrendCard = async (props: Props) => {
  const latestSales = await getMonthHighestProductBrandSales();
  const totalProductSales = await getMonthTotalProductSales();

  return (
    <>
      {latestSales?.length ? (
        <CardContent className="flex justify-between gap-4">
          <section>
            <p>Top Brands</p>
            <p className="text-sm text-gray-400">
              You sold
              {totalProductSales?.length
                ? ` ${totalProductSales[0].totalsales} `
                : " 0 "}
              products this month.
            </p>
          </section>
          {latestSales.map((d: any, i: any) => (
            <SalesCard
              key={i}
              name={d.brand}
              email={`TOP #${i + 1}`}
              saleAmount={`${d.totalsales}`}
            />
          ))}
        </CardContent>
      ) : (
        <div className="mt-28 flex text-muted-foreground items-center justify-center">
          No Data this month.
        </div>
      )}
    </>
  );
};

export default ProductBrandTrendCard;
