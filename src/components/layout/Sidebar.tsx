"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  UtensilsCrossed,
  UserCheck,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  gujaratiLabel: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  badge?: string | number;
}

export function Sidebar() {
  const pathname = usePathname();
  const { role, t, language } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = role === "super_admin" || role === "mandir_admin" || role === "dept_head";

  const allNavItems: NavItem[] = [
    {
      label: "Thal Rotation",
      gujaratiLabel: "થાળ પરિભ્રમણ",
      href: "/thal",
      icon: <UtensilsCrossed className="h-5 w-5" />,
      roles: ["super_admin", "mandir_admin", "dept_head", "karyakarta", "family_captain", "family_member"],
      badge: "MODULE 1",
    },
    {
      label: "My Profile & Family",
      gujaratiLabel: "પ્રોફાઇલ અને પરિવાર",
      href: "/profile",
      icon: <UserCheck className="h-5 w-5" />,
      // Show ONLY for devotee/user/karyakarta roles, NOT for admin
      roles: ["karyakarta", "family_captain", "family_member"],
    },
  ];

  const allowedItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-saffron-100/80 bg-white/95 backdrop-blur-xl transition-all duration-300 relative z-30 shadow-subtle",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-saffron-100/60">
        <Link href="/thal" className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-saffron-50 p-1 border border-saffron-200 shrink-0 flex items-center justify-center">
            <img src="/logo.png" alt="HariSumiran Logo" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-base font-bold tracking-tight text-charcoal">
                HariSumiran
              </span>
              <span className="text-[10px] font-mono tracking-wider font-semibold text-primary-container uppercase">
                HariPrabodham, Nadiad
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-charcoal-subtle hover:bg-saffron-50 hover:text-charcoal transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {allowedItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all duration-200 relative",
                isActive
                  ? "bg-gradient-to-r from-saffron-500 to-saffron-600 text-white shadow-md shadow-saffron-500/20 font-bold"
                  : "text-charcoal-subtle hover:bg-saffron-50/60 hover:text-charcoal"
              )}
            >
              <span className={cn("shrink-0", isActive ? "text-white" : "text-charcoal-subtle group-hover:text-primary-container")}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="flex-1 truncate">
                  {language === "gu" ? item.gujaratiLabel : item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-saffron-100 text-saffron-800"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Minimal Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-saffron-100/60 bg-saffron-50/30 m-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-bold text-charcoal">MongoDB Atlas Active</p>
          </div>
          <p className="mt-0.5 text-[10px] text-charcoal-subtle">
            Temple Seva &amp; Operations Suite
          </p>
        </div>
      )}
    </aside>
  );
}
