"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function MandalaBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 overflow-hidden select-none z-0 bg-[#090A0F]",
        className
      )}
      aria-hidden="true"
    >
      {/* Deep Obsidian Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(234,179,8,0.08),rgba(0,0,0,0))]" />

      {/* Luminous Royal Gold & Celestial Midnight Aura Orbs */}
      <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-amber-300/10 via-yellow-500/5 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-indigo-500/10 via-purple-600/5 to-transparent blur-[180px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-500/8 via-teal-600/5 to-transparent blur-[160px] pointer-events-none" />

      {/* Subtle Sacred Mandala Center Motifs */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04]">
        <svg
          className="w-[900px] h-[900px] text-amber-400 animate-[spin_240s_linear_infinite]"
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


