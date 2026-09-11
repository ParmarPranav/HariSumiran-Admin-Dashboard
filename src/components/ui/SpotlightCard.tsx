"use client";

import React from "react";
import { motion, useMotionValue, useMotionTemplate, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  hoverEffect?: boolean;
  variant?: "default" | "gold" | "elevated" | "subtle" | "active";
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(232, 176, 56, 0.12)",
  hoverEffect = true,
  variant = "default",
  ...props
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const variantStyles = {
    default:
      "bg-[#0D101A]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]",
    gold:
      "bg-gradient-to-br from-amber-500/[0.08] via-[#111524]/90 to-[#0C0F1A]/95 backdrop-blur-2xl border border-amber-400/25 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_24px_rgba(232,176,56,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]",
    elevated:
      "bg-[#131726]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)]",
    subtle:
      "bg-[#090B12]/60 backdrop-blur-xl border border-white/[0.05] shadow-sm",
    active:
      "bg-gradient-to-br from-amber-500/15 via-[#161B2E] to-[#0E1220] backdrop-blur-2xl border border-amber-400/40 shadow-[0_20px_50px_rgba(232,176,56,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]",
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
        "group relative rounded-3xl p-6 overflow-hidden text-zinc-100 transition-colors duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />

      {/* Top Hairline Refraction Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
