"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Languages,
  LogOut,
  Database,
  Search,
} from "lucide-react";

export function SuperAdminHeader() {
  const router = useRouter();
  const { user, language, setLanguage, logout, t } = useApp();

  const handleSignOut = () => {
    logout();
    router.push("/super-admin/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-stone-200/90 bg-white/90 px-4 md:px-6 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Left: Root Portal Identification & Atlas Health Ticker */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-950 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-amber-600" />
          <span className="hidden sm:inline">ROOT ACCESS • LEVEL 0</span>
          <span className="sm:hidden">ROOT</span>
        </div>

        {/* Live Atlas Cluster Connection Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-700 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-stone-400">Cluster:</span>
          <span className="font-bold text-stone-800">cluster0.icxn6gj.mongodb.net</span>
          <span className="text-emerald-700 font-semibold">(Synced)</span>
        </div>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "gu" : "en")}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-amber-300 transition-all shadow-2xs"
          title="Toggle Language"
        >
          <Languages className="h-3.5 w-3.5 text-stone-500" />
          <span className="text-[11px] font-bold">{language === "en" ? "ગુજરાતી" : "English"}</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-50 border border-stone-200 shadow-2xs">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            alt={user?.name || "Super Admin"}
            className="h-6 w-6 rounded-lg object-cover border border-amber-300"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-stone-900 leading-none">
              {user?.name || "HP Super Admin"}
            </span>
            <span className="text-[9px] text-amber-800 font-mono font-semibold">
              Root Authority
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="flex h-9 items-center gap-1.5 px-3 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-all shadow-2xs"
          title="Sign out of Super Admin"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-600" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

