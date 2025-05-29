import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon; // Changed from string to LucideIcon
  indicator?: boolean;
  trend?: number;
  trendLabel?: string;
}

export function DashboardCard(props: DashboardCardProps) {
  // Get the icon component
  const IconComponent = props.icon;

  return (
    <CardContent>
      <section className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {props.title}
          </p>
          <p className="text-2xl font-bold text-foreground">{props.value}</p>
          {props.description && (
            <p className="text-xs text-gray-500 mt-1">{props.description}</p>
          )}
        </div>
        {/* icon - render the component */}
        {/* Render Lucide icon component */}
        {IconComponent && (
          <div className="h-8 w-8 text-muted-foreground">
            <IconComponent className="h-full w-full" />
          </div>
        )}{" "}
      </section>
      {props.trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={`mr-1 ${
              props.trend >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {props.trend >= 0 ? "↑" : "↓"} {Math.abs(props.trend)}%
          </span>
          <span className="text-gray-500">{props.trendLabel}</span>
        </div>
      )}
    </CardContent>
  );
}

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
