"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  HeartHandshake,
  Sparkles,
  Package,
  PartyPopper,
  UtensilsCrossed,
  Megaphone,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
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

  const navItems: NavItem[] = [
    {
      label: "Thal Rotation",
      gujaratiLabel: "થાળ પરિભ્રમણ",
      href: "/thal",
      icon: <UtensilsCrossed className="h-5 w-5" />,
      roles: ["super_admin", "mandir_admin", "dept_head", "karyakarta", "family_captain", "family_member"],
      badge: "Module 1",
    },
    {
      label: "My Profile & Family",
      gujaratiLabel: "પ્રોફાઇલ અને પરિવાર",
      href: "/profile",
      icon: <UserCheck className="h-5 w-5" />,
      roles: ["super_admin", "mandir_admin", "dept_head", "karyakarta", "family_captain", "family_member"],
    },
    {
      label: "Login / Switch Account",
      gujaratiLabel: "લોગિન / એકાઉન્ટ",
      href: "/auth",
      icon: <Sliders className="h-5 w-5" />,
      roles: ["super_admin", "mandir_admin", "dept_head", "karyakarta", "family_captain", "family_member"],
    },
  ];

  const allowedItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-hairline bg-white/95 backdrop-blur-md transition-all duration-300 relative z-30",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-hairline/80">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <img src="/logo.png" alt="HariSumiran Logo" className="h-9 w-9 shrink-0 object-contain" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-base font-bold tracking-tight text-charcoal">
                HariSumiran
              </span>
              <span className="text-[10px] font-medium text-charcoal-subtle truncate">
                HariPrabodham, Nadiad
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-charcoal-subtle hover:bg-surface-container hover:text-charcoal"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {allowedItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 relative",
                isActive
                  ? "bg-saffron-50/80 text-primary-container font-semibold shadow-subtle border border-saffron-200/40"
                  : "text-charcoal-subtle hover:bg-surface-container-low hover:text-charcoal"
              )}
            >
              <span className={cn("shrink-0", isActive ? "text-primary-container" : "text-charcoal-subtle group-hover:text-charcoal")}>
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
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                    item.badge === "Live"
                      ? "bg-rose-100 text-rose-700 animate-pulse"
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

      {/* Mandir Trust Footer */}
      {!collapsed && (
        <div className="p-3.5 border-t border-hairline/80 bg-surface-container-low/50 m-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-medium text-charcoal">MongoDB Atlas Active</p>
          </div>
          <p className="mt-0.5 text-[10px] text-charcoal-subtle">
            Temple Seva & Operations Suite
          </p>
        </div>
      )}
    </aside>
  );
}
