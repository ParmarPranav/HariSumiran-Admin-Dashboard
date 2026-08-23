import React from "react";
import { cn } from "@/lib/utils";

export function MandalaBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
    >
      <svg
        className="w-[650px] h-[650px] text-saffron-600 animate-[spin_120s_linear_infinite]"
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <path d="M100 0 C105 50 150 95 200 100 C150 105 105 150 100 200 C95 150 50 105 0 100 C50 95 95 50 100 0 Z" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
