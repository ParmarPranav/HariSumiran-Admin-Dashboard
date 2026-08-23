import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "accent" | "bordered";
  hoverEffect?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-hairline bg-white/95 p-5 shadow-soft backdrop-blur-sm transition-all duration-200",
        variant === "elevated" && "shadow-float border-hairline/80 bg-white",
        variant === "accent" && "border-saffron-300/40 bg-saffron-50/40",
        variant === "bordered" && "border-2 border-hairline",
        hoverEffect && "hover:-translate-y-0.5 hover:shadow-float active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
