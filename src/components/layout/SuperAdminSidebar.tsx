"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  History,
  Database,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Cpu,
} from "lucide-react";

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, language, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const currentTab = searchParams?.get("tab") || "users";

  const navItems = [
    {
      id: "users",
      label: "Users & Role Manager",
      gujaratiLabel: "વપરાશકર્તા અને ભૂમિકા વહીવટ",
      href: "/super-admin",
      icon: Users,
      badge: "Root",
    },
    {
      id: "permissions",
      label: "Role-Permission Matrix",
      gujaratiLabel: "ભૂમિકા અને પરવાનગી મેટ્રિક્સ",
      href: "/super-admin?tab=permissions",
      icon: ShieldAlert,
    },
    {
      id: "audit",
      label: "System Audit Trail",
      gujaratiLabel: "સિસ્ટમ ઓડિટ લોગ",
      href: "/super-admin?tab=audit",
      icon: History,
    },
    {
      id: "system",
      label: "Database & Health",
      gujaratiLabel: "ડેટાબેઝ અને હેલ્થ",
      href: "/super-admin?tab=system",
      icon: Database,
    },
  ];

  const handleSignOut = () => {
    logout();
    router.push("/super-admin/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col border-r border-stone-200/90 bg-white/95 backdrop-blur-2xl relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.03)] h-screen overflow-hidden select-none shrink-0"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-stone-200/90 shrink-0">
        <Link href="/super-admin" className="flex items-center gap-3 overflow-hidden group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-2 shrink-0 flex items-center justify-center text-white shadow-md shadow-amber-500/25 border border-amber-400/40"
          >
            <ShieldCheck className="h-full w-full object-contain" />
          </motion.div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col min-w-0"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm font-black tracking-tight text-stone-900 truncate">
                  Super Admin
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100/90 border border-amber-300 text-amber-900 text-[9px] font-mono font-black uppercase tracking-wider">
                  Root
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-wider font-bold text-amber-700 uppercase truncate">
                HariPrabodham, Nadiad
              </span>
            </motion.div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-xl p-1.5 text-stone-400 hover:bg-amber-50 hover:text-amber-800 transition-colors active:scale-95 border border-transparent hover:border-amber-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Root Access Security Banner */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3.5 pt-3.5 shrink-0"
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-[11px] text-amber-950 space-y-1.5 shadow-2xs hover:border-amber-500/35 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span>Isolated Governance</span>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/90 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-[10px] text-stone-600 leading-relaxed font-normal">
              Institutional security, user role scopes &amp; immutable audit controls.
            </p>
          </div>
        </motion.div>
      )}

      {/* Navigation List - Super Admin & Governance */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 no-scrollbar">
        <div className="px-2 pb-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            {!collapsed ? "Root Governance Tools" : "Root"}
          </span>
        </div>

        {navItems.map((item) => {
          const isActive =
            pathname === "/super-admin" &&
            (item.id === "users" ? currentTab === "users" : currentTab === item.id);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "text-white font-bold"
                  : "text-stone-600 hover:bg-amber-50/70 hover:text-amber-950"
              )}
              title={collapsed ? (language === "gu" ? item.gujaratiLabel : item.label) : undefined}
            >
              {/* Animated Floating Pill on Active Tab */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 shadow-sm shadow-amber-600/25 border border-amber-500/50"
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                />
              )}

              <span
                className={cn(
                  "relative z-10 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-stone-500 group-hover:text-amber-700"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>

              {!collapsed && (
                <span className="relative z-10 truncate flex-1 tracking-tight">
                  {language === "gu" ? item.gujaratiLabel : item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "relative z-10 text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold uppercase",
                    isActive ? "bg-amber-700 text-amber-100" : "bg-amber-100 text-amber-800"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer: Super Admin Profile & Status */}
      <div className="border-t border-stone-200/90 p-3 bg-stone-50/60 space-y-2 shrink-0">
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <UserAvatar
            name={user?.name || "HP Super Admin"}
            avatarUrl={user?.avatar}
            role={user?.role || "super_admin"}
            size="sm"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-stone-900 truncate">
                {user?.name || "HP Super Admin"}
              </span>
              <span className="text-[10px] text-amber-800 font-mono truncate font-medium">
                {user?.email || "hpsuperadmin@gmail.com"}
              </span>
            </div>
          )}
        </div>

        {!collapsed ? (
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Level 0 Terminal</span>
            </span>
            <span className="text-amber-800 font-semibold font-mono">v1.2.0</span>
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
}
