import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
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
    default: "bg-white/[0.06] text-zinc-200 border-white/10 shadow-sm",
    primary: "bg-amber-500/15 text-amber-300 border-amber-400/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    secondary: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    warning: "bg-amber-500/15 text-amber-300 border-amber-400/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    danger: "bg-rose-500/15 text-rose-300 border-rose-400/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    info: "bg-sky-500/15 text-sky-300 border-sky-400/30 shadow-[0_0_12px_rgba(56,189,248,0.15)]",
    outline: "border-white/10 text-zinc-400 bg-transparent",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-zinc-400",
    primary: "bg-amber-400 animate-pulse",
    secondary: "bg-emerald-400 animate-pulse",
    success: "bg-emerald-400 animate-pulse",
    warning: "bg-amber-400 animate-pulse",
    danger: "bg-rose-400 animate-pulse",
    info: "bg-sky-400 animate-pulse",
    outline: "bg-zinc-500",
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
