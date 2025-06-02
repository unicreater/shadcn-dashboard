import Image from "next/image";
import React from "react";

export type SalesProps = {
  name: string;
  email: string;
  saleAmount: string;
};

const userSalesData = [
  "Olivia Martin",
  "Jackson Lee",
  "Isabella Nguyen",
  "William Kim",
  "Olivia Martin",
  "Snickers",
  "Lucky",
  "Oreo",
  "Missy",
];

export default function SalesCard(props: SalesProps) {
  const randomizedName =
    userSalesData[Math.floor(Math.random() * userSalesData.length)];
  return (
    <div className="flex flex-wrap justify-between gap-3">
      <section className="flex justify-between gap-3">
        <div className="h-12 w-12 rounded-full bg-gray-100 p-1">
          <Image width={200} height={200} src="/fuzzieLogo.png" alt="avatar" />
        </div>
        <div className="text-sm">
          <p>{props.name}</p>
          <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[120px] sm:w-auto text-gray-400">
            {props.email}
          </div>
        </div>
      </section>
      <p>{props.saleAmount}</p>
    </div>
  );
}
