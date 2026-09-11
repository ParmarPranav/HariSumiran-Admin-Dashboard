import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "neutral"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  children,
  className,
  variant = "default",
  size = "md",
  dot = false,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-stone-100 text-stone-700 border-stone-200 shadow-sm",
    neutral: "bg-stone-100 text-stone-700 border-stone-200 shadow-sm",
    primary: "bg-amber-50 text-amber-800 border-amber-300 shadow-sm font-semibold",
    secondary: "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm font-semibold",
    success: "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm font-semibold",
    warning: "bg-orange-50 text-orange-800 border-orange-300 shadow-sm font-semibold",
    danger: "bg-rose-50 text-rose-800 border-rose-300 shadow-sm font-semibold",
    info: "bg-sky-50 text-sky-800 border-sky-300 shadow-sm font-semibold",
    outline: "border-stone-300 text-stone-600 bg-white shadow-sm",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-stone-400",
    neutral: "bg-stone-400",
    primary: "bg-amber-500 animate-pulse",
    secondary: "bg-emerald-500 animate-pulse",
    success: "bg-emerald-500 animate-pulse",
    warning: "bg-amber-500 animate-pulse",
    danger: "bg-rose-500 animate-pulse",
    info: "bg-sky-500 animate-pulse",
    outline: "bg-stone-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
}
