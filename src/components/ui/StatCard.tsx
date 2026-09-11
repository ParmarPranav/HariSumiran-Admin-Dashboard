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
    gold: "bg-gradient-to-br from-amber-400/20 to-yellow-600/10 text-amber-300 border-amber-400/30 shadow-[0_0_15px_rgba(232,176,56,0.2)]",
    saffron: "bg-gradient-to-br from-amber-400/20 to-yellow-600/10 text-amber-300 border-amber-400/30 shadow-[0_0_15px_rgba(232,176,56,0.2)]",
    green: "bg-gradient-to-br from-emerald-400/20 to-teal-600/10 text-emerald-300 border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    blue: "bg-gradient-to-br from-sky-400/20 to-indigo-600/10 text-sky-300 border-sky-400/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]",
    neutral: "bg-white/5 text-zinc-300 border-white/10",
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
