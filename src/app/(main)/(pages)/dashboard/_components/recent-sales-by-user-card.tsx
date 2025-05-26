import SalesCard, { SalesProps } from "@/components/sales-card";
import { CardContent } from "@/components/simple-card";
import React from "react";
import {
  getCurrentMonthTotalSales,
  getSalesByUserChart,
} from "../_actions/dashboard-connections";

type Props = {};

const RecentSalesByUserCard = async (props: Props) => {
  const latestSales = await getSalesByUserChart();
  const totalSales = await getCurrentMonthTotalSales();

  return (
    <>
      {latestSales?.length ? (
        <CardContent className="flex justify-between gap-4">
          <section>
            <p>Recent Sales</p>
            <p className="text-sm text-gray-400">
              You made {totalSales?.length ? totalSales[0].count : "0"} sales
              this month.
            </p>
          </section>
          {latestSales.map((d: any, i: any) => (
            <SalesCard
              key={i}
              email={d.phone}
              name={d.name}
              saleAmount={`+$${d.totalprofit}`}
            />
          ))}
        </CardContent>
      ) : (
        <div className="mt-28 flex text-muted-foreground items-center justify-center">
          No Data
        </div>
      )}
    </>
  );
};

export default RecentSalesByUserCard;
