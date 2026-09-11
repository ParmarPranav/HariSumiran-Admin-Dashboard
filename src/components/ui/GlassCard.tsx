"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "accent" | "bordered" | "gold" | "subtle";
  hoverEffect?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default:
      "bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_1px_3px_rgb(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.95)]",
    elevated:
      "bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_16px_40px_-10px_rgba(184,77,23,0.08),0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)]",
    accent:
      "bg-gradient-to-br from-saffron-50/90 via-white/80 to-amber-50/70 backdrop-blur-xl border border-saffron-200/70 shadow-[0_10px_30px_-5px_rgba(184,77,23,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]",
    gold:
      "bg-gradient-to-br from-amber-50/95 via-white/90 to-amber-100/40 backdrop-blur-xl border border-amber-300/60 shadow-[0_12px_32px_-6px_rgba(217,119,6,0.12),inset_0_1px_0_rgba(255,255,255,1)]",
    bordered:
      "bg-white/90 backdrop-blur-lg border-2 border-hairline shadow-soft",
    subtle:
      "bg-surface-container-lowest/70 backdrop-blur-md border border-hairline/60 shadow-subtle",
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } } : undefined}
      whileTap={hoverEffect ? { scale: 0.99, transition: { duration: 0.1 } } : undefined}
      className={cn(
        "relative rounded-3xl p-5 sm:p-6 transition-colors duration-200 overflow-hidden",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Delicate top-edge ambient highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      {children}
    </motion.div>
  );
}
