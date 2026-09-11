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
      "bg-[#111420]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]",
    elevated:
      "bg-[#161B2A]/90 backdrop-blur-2xl border border-amber-500/20 shadow-[0_16px_48px_rgba(0,0,0,0.7),0_0_24px_rgba(245,158,11,0.05),inset_0_1px_0_rgba(255,255,255,0.12)]",
    accent:
      "bg-gradient-to-br from-amber-500/10 via-[#161B2A]/90 to-[#111420]/90 backdrop-blur-2xl border border-amber-400/25 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(245,158,11,0.2)]",
    gold:
      "bg-gradient-to-br from-amber-500/15 via-[#1A1F30]/95 to-amber-600/10 backdrop-blur-2xl border border-amber-300/30 shadow-[0_14px_44px_rgba(245,158,11,0.1),inset_0_1px_0_rgba(255,255,255,0.15)]",
    bordered:
      "bg-[#0E111A]/90 backdrop-blur-lg border border-white/10 shadow-soft",
    subtle:
      "bg-[#0B0D14]/70 backdrop-blur-md border border-white/[0.05] shadow-subtle",
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } } : undefined}
      whileTap={hoverEffect ? { scale: 0.99, transition: { duration: 0.1 } } : undefined}
      className={cn(
        "relative rounded-3xl p-5 sm:p-6 transition-colors duration-200 overflow-hidden text-zinc-100",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Delicate top-edge ambient highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </motion.div>
  );
}
