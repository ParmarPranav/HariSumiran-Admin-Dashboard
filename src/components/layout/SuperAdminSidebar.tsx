"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
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
      icon: <Users className="h-4 w-4" />,
      badge: "Root",
    },
    {
      id: "permissions",
      label: "Role-Permission Matrix",
      gujaratiLabel: "ભૂમિકા અને પરવાનગી મેટ્રિક્સ",
      href: "/super-admin?tab=permissions",
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
      id: "audit",
      label: "System Audit Trail",
      gujaratiLabel: "સિસ્ટમ ઓડિટ લોગ",
      href: "/super-admin?tab=audit",
      icon: <History className="h-4 w-4" />,
    },
    {
      id: "system",
      label: "Database & Health",
      gujaratiLabel: "ડેટાબેઝ અને હેલ્થ",
      href: "/super-admin?tab=system",
      icon: <Database className="h-4 w-4" />,
    },
  ];

  const handleSignOut = () => {
    logout();
    router.push("/super-admin/login");
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-stone-200/90 bg-white/95 backdrop-blur-2xl transition-all duration-300 relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.03)]",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-stone-200/90">
        <Link href="/super-admin" className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-2 shrink-0 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <ShieldCheck className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm font-extrabold tracking-tight text-stone-900 truncate">
                  Super Admin
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[9px] font-mono font-bold uppercase">
                  Root
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-wider font-semibold text-amber-700 uppercase truncate">
                HariPrabodham, Nadiad
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Root Access Security Banner */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50/90 to-amber-100/40 border border-amber-200/80 text-[11px] text-amber-950 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Isolated Governance Terminal</span>
            </div>
            <p className="text-[10px] text-stone-600 leading-relaxed">
              Institutional security, user role scopes &amp; immutable audit controls.
            </p>
          </div>
        </div>
      )}

      {/* Navigation List - ONLY Super Admin & Governance */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-2 pb-1.5">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            {!collapsed ? "Root Governance Tools" : "Root"}
          </span>
        </div>

        {navItems.map((item) => {
          const isActive =
            pathname === "/super-admin" &&
            (item.id === "users" ? currentTab === "users" : currentTab === item.id);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-98",
                isActive
                  ? "bg-amber-600 text-white shadow-sm font-bold"
                  : "text-stone-600 hover:bg-amber-50/80 hover:text-amber-950"
              )}
              title={collapsed ? (language === "gu" ? item.gujaratiLabel : item.label) : undefined}
            >
              <span className={cn(isActive ? "text-white" : "text-stone-500 group-hover:text-amber-700")}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate flex-1">
                  {language === "gu" ? item.gujaratiLabel : item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold uppercase",
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

      {/* Bottom Footer: Super Admin Profile & Sign Out */}
      <div className="border-t border-stone-200/90 p-3 bg-stone-50/50 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="relative">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={user?.name || "Super Admin"}
              className="h-8 w-8 rounded-xl object-cover ring-2 ring-amber-400 ring-offset-1 shrink-0"
            />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-stone-900 truncate">
                {user?.name || "HP Super Admin"}
              </span>
              <span className="text-[10px] text-amber-800 font-mono truncate">
                {user?.email || "hpsuperadmin@gmail.com"}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 shadow-2xs transition-all active:scale-95",
            collapsed && "justify-center"
          )}
          title="Sign out of Super Admin"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-600" />
          {!collapsed && <span>Sign Out of Console</span>}
        </button>
      </div>
    </aside>
  );
}
