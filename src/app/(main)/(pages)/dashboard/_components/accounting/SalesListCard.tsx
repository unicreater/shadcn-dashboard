import React from "react";
import SalesCard from "./SalesCard";
import { CardContent } from "./CardContent";

interface SalesItem {
  name?: string;
  phone?: string;
  totalprofit?: number;
  totalsales?: number;
  brand?: string;
  [key: string]: any; // Allow additional properties
}

interface SalesListCardProps {
  title: string;
  description: string;
  data: SalesItem[];
  emptyMessage?: string;
  mapToSalesCard: (
    item: SalesItem,
    index: number
  ) => {
    name?: string;
    email?: string;
    saleAmount?: string;
  };
}

const SalesListCard = ({
  title,
  description,
  data,
  emptyMessage = "No Data",
  mapToSalesCard,
}: SalesListCardProps) => {
  return (
    <>
      {data?.length ? (
        <CardContent className="flex flex-col gap-4">
          <section>
            <p className="text-foreground font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </section>
          <div className="space-y-3">
            {data.map((item, index) => {
              const salesCardProps = mapToSalesCard(item, index);
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
        </CardContent>
      ) : (
        <CardContent>
          <div className="mt-28 flex text-muted-foreground items-center justify-center">
            {emptyMessage}
          </div>
        </CardContent>
      )}
    </>
  );
};

export default SalesListCard;
