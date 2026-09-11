"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function MandalaBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 overflow-hidden select-none z-0",
        className
      )}
      aria-hidden="true"
    >
      {/* Ambient Saffron & Gold Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-saffron-200/25 via-amber-100/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-amber-200/20 via-orange-100/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-saffron-100/20 via-rose-50/10 to-transparent blur-[130px] pointer-events-none" />

      {/* Subtle Sacred Mandala Center Motifs */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.035]">
        <svg
          className="w-[800px] h-[800px] text-primary-container animate-[spin_180s_linear_infinite]"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M100 0 C105 50 150 95 200 100 C150 105 105 150 100 200 C95 150 50 105 0 100 C50 95 95 50 100 0 Z" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
        </svg>
      </div>
    </div>
  );
}

