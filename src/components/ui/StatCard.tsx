import React from "react";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  iconBg?: "gold" | "saffron" | "green" | "blue" | "neutral";
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBg = "gold",
  className,
  onClick,
}: StatCardProps) {
  const iconBgStyles = {
    gold: "bg-amber-100 text-amber-800 border-amber-300 shadow-xs",
    saffron: "bg-gradient-to-r from-[#FF7A00] to-[#EA580C] text-white shadow-xs",
    green: "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs",
    blue: "bg-sky-100 text-sky-800 border-sky-300 shadow-xs",
    neutral: "bg-stone-100 text-stone-700 border-stone-200 shadow-xs",
  };

  return (
    <GlassCard
      onClick={onClick}
      hoverEffect={!!onClick}
      className={cn("relative overflow-hidden p-5 bg-white border-stone-200/90 shadow-sm", onClick && "cursor-pointer", className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</p>
          <h4 className="mt-1 font-heading text-2xl font-bold tracking-tight text-stone-900">{value}</h4>
          {subtitle && <p className="mt-1 text-xs text-stone-600 font-medium">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
              <span
                className={cn(
                  "font-bold",
                  trend.isPositive ? "text-emerald-700" : "text-amber-700"
                )}
              >
                {trend.value}
              </span>
              <span className="text-stone-500">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
              iconBgStyles[iconBg]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
