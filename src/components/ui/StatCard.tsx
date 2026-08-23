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
  iconBg?: "saffron" | "green" | "blue" | "neutral";
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBg = "saffron",
  className,
  onClick,
}: StatCardProps) {
  const iconBgStyles = {
    saffron: "bg-saffron-50 text-primary-container border-saffron-200/50",
    green: "bg-emerald-50 text-secondary border-emerald-200/50",
    blue: "bg-sky-50 text-tertiary border-sky-200/50",
    neutral: "bg-surface-container text-charcoal border-hairline",
  };

  return (
    <GlassCard
      onClick={onClick}
      hoverEffect={!!onClick}
      className={cn("relative overflow-hidden p-5", onClick && "cursor-pointer", className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-charcoal-subtle">{title}</p>
          <h4 className="mt-1 font-heading text-2xl font-bold tracking-tight text-charcoal">{value}</h4>
          {subtitle && <p className="mt-1 text-xs text-charcoal-subtle">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {trend.value}
              </span>
              <span className="text-charcoal-subtle">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
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
