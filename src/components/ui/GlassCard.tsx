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
  spotlightColor = "rgba(245, 158, 11, 0.08)",
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
      "bg-white/95 backdrop-blur-2xl border border-stone-200/90 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.04)] text-stone-900",
    elevated:
      "bg-white backdrop-blur-2xl border border-stone-200 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] text-stone-900",
    accent:
      "bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 backdrop-blur-2xl border border-amber-300/60 shadow-[0_12px_32px_-4px_rgba(245,158,11,0.08)] text-stone-900",
    gold:
      "bg-gradient-to-br from-amber-50/90 via-white to-amber-100/50 backdrop-blur-2xl border border-amber-400/50 shadow-[0_12px_32px_-4px_rgba(245,158,11,0.12)] text-stone-900",
    bordered:
      "bg-white backdrop-blur-xl border border-stone-300 shadow-sm text-stone-900",
    subtle:
      "bg-stone-50/80 backdrop-blur-md border border-stone-200/60 shadow-sm text-stone-900",
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
