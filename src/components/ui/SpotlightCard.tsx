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
  spotlightColor = "rgba(245, 158, 11, 0.08)",
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
      "bg-white/95 backdrop-blur-2xl border border-stone-200/90 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.04)] text-stone-900",
    gold:
      "bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 backdrop-blur-2xl border border-amber-300/60 shadow-[0_12px_35px_-5px_rgba(245,158,11,0.1),0_1px_2px_rgba(0,0,0,0.04)] text-stone-900",
    elevated:
      "bg-white backdrop-blur-2xl border border-stone-200 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] text-stone-900",
    subtle:
      "bg-stone-50/80 backdrop-blur-xl border border-stone-200/60 shadow-sm text-stone-900",
    active:
      "bg-gradient-to-br from-amber-50 via-white to-amber-100/60 backdrop-blur-2xl border border-amber-400 shadow-[0_12px_35px_-5px_rgba(245,158,11,0.15)] text-stone-900",
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
        "group relative rounded-3xl p-6 overflow-hidden text-stone-900 transition-colors duration-200",
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
