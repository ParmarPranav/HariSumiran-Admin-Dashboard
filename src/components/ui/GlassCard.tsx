"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useMotionTemplate, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "accent" | "bordered" | "gold" | "subtle";
  hoverEffect?: boolean;
  spotlight?: boolean;
  spotlightColor?: string;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  hoverEffect = false,
  spotlight = true,
  spotlightColor = "rgba(232, 176, 56, 0.09)",
  ...props
}: GlassCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    if (!spotlight) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const variantStyles = {
    default:
      "bg-[#0D101A]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]",
    elevated:
      "bg-[#131726]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.14)]",
    accent:
      "bg-gradient-to-br from-amber-500/[0.08] via-[#131726]/95 to-[#0D101A]/95 backdrop-blur-2xl border border-amber-400/25 shadow-[0_16px_44px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(232,176,56,0.15)]",
    gold:
      "bg-gradient-to-br from-amber-500/15 via-[#161B2E]/95 to-amber-600/10 backdrop-blur-2xl border border-amber-300/35 shadow-[0_20px_50px_rgba(232,176,56,0.12),inset_0_1px_0_rgba(255,255,255,0.18)]",
    bordered:
      "bg-[#0A0C14]/90 backdrop-blur-xl border border-white/10 shadow-soft",
    subtle:
      "bg-[#090B12]/60 backdrop-blur-md border border-white/[0.05] shadow-sm",
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={
        hoverEffect
          ? {
              y: -3,
              transition: { type: "spring" as const, stiffness: 350, damping: 25 },
            }
          : undefined
      }
      whileTap={hoverEffect ? { scale: 0.99 } : undefined}
      className={cn(
        "group relative rounded-3xl p-5 sm:p-6 overflow-hidden text-zinc-100 transition-colors duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Specular Spotlight Layer */}
      {spotlight && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                360px circle at ${mouseX}px ${mouseY}px,
                ${spotlightColor},
                transparent 80%
              )
            `,
          }}
        />
      )}

      {/* Delicate top-edge ambient highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
