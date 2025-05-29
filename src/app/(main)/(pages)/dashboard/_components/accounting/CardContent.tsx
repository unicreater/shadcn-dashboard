import { cn } from "@/lib/utils";
import React from "react";

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border bg-card text-card-foreground p-5 shadow-sm",
        props.className
      )}
    />
  );
}
