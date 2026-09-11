"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] border border-amber-400/40 hover:brightness-110",
      secondary:
        "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:brightness-110 border border-emerald-400/30",
      outline:
        "border border-white/10 bg-[#161B28]/80 text-zinc-100 hover:bg-[#1E2538] hover:border-amber-400/30 backdrop-blur-md shadow-sm",
      ghost:
        "text-zinc-300 hover:bg-white/[0.08] hover:text-amber-300",
      destructive:
        "bg-rose-600/90 text-white hover:bg-rose-600 border border-rose-400/40 shadow-[0_0_16px_rgba(244,63,94,0.3)]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-2xl gap-2.5",
      icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
