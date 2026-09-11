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
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white font-extrabold shadow-[0_4px_16px_rgba(245,158,11,0.32),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-amber-300/50 hover:brightness-105 active:scale-[0.98]",
      secondary:
        "bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold shadow-md hover:brightness-105 border border-emerald-400/40",
      outline:
        "border border-stone-200/90 bg-white text-stone-800 hover:bg-amber-50/80 hover:border-amber-300 hover:text-amber-900 shadow-sm transition-all",
      ghost:
        "text-stone-700 hover:bg-amber-50/80 hover:text-amber-900 transition-colors",
      destructive:
        "bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold hover:brightness-105 shadow-md border border-rose-400/40",
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
