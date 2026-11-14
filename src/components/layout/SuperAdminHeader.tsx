"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Languages,
  LogOut,
  Sparkles,
  Activity,
  Server,
  Zap,
} from "lucide-react";

export function SuperAdminHeader() {
  const router = useRouter();
  const { user, language, setLanguage, logout } = useApp();
  const [latency, setLatency] = useState(18);

  // Subtle real-time ping fluctuation simulating live telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(16 + Math.random() * 6));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    logout();
    router.push("/super-admin/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-stone-200/90 bg-white/95 px-4 md:px-6 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] select-none">
      {/* Left: Root Portal Identification & Live Cluster Telemetry */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Root Level 0 Badge */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border border-amber-400/60 text-xs font-black text-amber-950 shadow-2xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="hidden sm:inline tracking-wider font-mono uppercase text-[11px]">ROOT ACCESS • LEVEL 0</span>
          <span className="sm:hidden font-mono uppercase text-[11px]">ROOT</span>
        </motion.div>

        {/* Live Atlas Cluster Connection Indicator */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-stone-50/90 border border-stone-200/90 text-[11px] text-stone-600 font-mono shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
          </span>
          <span className="text-stone-400 flex items-center gap-1">
            <Server className="h-3 w-3 text-stone-400" />
            <span>Atlas:</span>
          </span>
          <span className="font-bold text-stone-800">cluster0.icxn6gj.mongodb.net</span>
          <span className="text-emerald-700 font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-emerald-600" />
            <span>{latency}ms • Synced</span>
          </span>
        </div>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLanguage(language === "en" ? "gu" : "en")}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 hover:bg-amber-50/70 hover:border-amber-300 transition-all shadow-2xs"
          title="Toggle Language"
        >
          <Languages className="h-3.5 w-3.5 text-stone-500" />
          <span className="text-[11px] font-bold">{language === "en" ? "ગુજરાતી" : "English"}</span>
        </motion.button>

        {/* User Status Pill */}
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl bg-stone-50/90 border border-stone-200/90 shadow-2xs">
          <UserAvatar
            name={user?.name || "HP Super Admin"}
            avatarUrl={user?.avatar}
            role={user?.role || "super_admin"}
            size="sm"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-stone-900 leading-tight">
              {user?.name || "HP Super Admin"}
            </span>
            <span className="text-[9px] text-amber-800 font-mono font-bold tracking-wider uppercase">
              Root Authority
            </span>
          </div>
        </div>

        {/* Dedicated Header Sign Out */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          className="flex h-9 items-center gap-1.5 px-3.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs transition-all shadow-2xs"
          title="Sign out of Super Admin Console"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-600" />
          <span className="hidden sm:inline">Sign Out</span>
        </motion.button>
      </div>
    </header>
  );
}
