"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Languages,
  LogOut,
  Sparkles,
} from "lucide-react";

export function SuperAdminHeader() {
  const router = useRouter();
  const { user, language, setLanguage, logout } = useApp();

  const handleSignOut = () => {
    logout();
    router.push("/super-admin/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-stone-200/90 bg-white/95 px-4 md:px-6 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Left: Root Portal Identification & Cluster Telemetry */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Root Level 0 Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 text-xs font-bold text-amber-950 shadow-2xs">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
          <span className="hidden sm:inline tracking-wide">ROOT ACCESS • LEVEL 0</span>
          <span className="sm:hidden">ROOT</span>
        </div>

        {/* Live Atlas Cluster Connection Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50/80 border border-stone-200 text-[11px] text-stone-600 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-stone-400">Cluster:</span>
          <span className="font-bold text-stone-800">cluster0.icxn6gj.mongodb.net</span>
          <span className="text-emerald-700 font-semibold px-1 rounded bg-emerald-50 border border-emerald-200/60 text-[10px]">
            Synced
          </span>
        </div>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === "en" ? "gu" : "en")}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-amber-300 transition-all shadow-2xs active:scale-95"
          title="Toggle Language"
        >
          <Languages className="h-3.5 w-3.5 text-stone-500" />
          <span className="text-[11px] font-bold">{language === "en" ? "ગુજરાતી" : "English"}</span>
        </button>

        {/* User Status Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-stone-50/90 border border-stone-200 shadow-2xs">
          <div className="relative">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={user?.name || "Super Admin"}
              className="h-7 w-7 rounded-xl object-cover ring-2 ring-amber-400 ring-offset-1"
            />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-stone-900 leading-tight">
              {user?.name || "HP Super Admin"}
            </span>
            <span className="text-[9px] text-amber-800 font-mono font-semibold tracking-wider uppercase">
              Root Authority
            </span>
          </div>
        </div>

        {/* Dedicated Header Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex h-9 items-center gap-1.5 px-3.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs transition-all shadow-2xs active:scale-95"
          title="Sign out of Super Admin Console"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-600" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
