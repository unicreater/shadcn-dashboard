import Image from "next/image";
import React from "react";

export interface SalesProps {
  name: string;
  email: string;
  saleAmount: string;
}

export default function SalesCard({ name, email, saleAmount }: SalesProps) {
  return (
    <div className="flex flex-wrap justify-between gap-3">
      <section className="flex justify-between gap-3">
        <div className="h-12 w-12 rounded-full bg-gray-100 p-1">
          <Image
            width={200}
            height={200}
            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${name}`}
            alt="avatar"
            className="rounded-full"
          />
        </div>
        <div className="text-sm">
          <p className="text-foreground font-medium">{name}</p>
          <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[120px] sm:w-auto text-muted-foreground">
            {email}
          </div>
        </div>
      </section>
      <p className="text-foreground font-semibold">{saleAmount}</p>
    </div>
  );
}
