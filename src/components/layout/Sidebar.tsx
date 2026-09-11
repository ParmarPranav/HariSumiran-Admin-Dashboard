"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  Home,
  UtensilsCrossed,
  CalendarDays,
  HeartHandshake,
  Car,
  ChefHat,
  Users,
  Calendar,
  Sparkles,
  Megaphone,
  FileSpreadsheet,
  ShieldAlert,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  gujaratiLabel: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  condition?: (app: ReturnType<typeof useApp>) => boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const app = useApp();
  const { user, t, language, logout, lockApp } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const allNavItems: NavItem[] = [
    {
      label: "Home Dashboard",
      gujaratiLabel: "મુખ્ય ડેશબોર્ડ",
      href: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      label: "Thal Rotation",
      gujaratiLabel: "થાળ પરિભ્રમણ",
      href: "/thal",
      icon: <UtensilsCrossed className="h-4 w-4" />,
      badge: "V1",
    },
    {
      label: "Sabha & Events",
      gujaratiLabel: "સભા અને ઉત્સવ",
      href: "/sabha",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      label: "Common Seva",
      gujaratiLabel: "સેવા વ્યવસ્થા",
      href: "/seva",
      icon: <HeartHandshake className="h-4 w-4" />,
    },
    {
      label: "Kitchen (Bhojanshala)",
      gujaratiLabel: "રસોઈ ઘર",
      href: "/kitchen",
      icon: <ChefHat className="h-4 w-4" />,
      condition: (a) => a.isAdmin || a.isMainCook || a.hasResponsibility("sub_cook"),
    },
    {
      label: "Transportation & Rides",
      gujaratiLabel: "વાહન અને મુસાફરી",
      href: "/travel",
      icon: <Car className="h-4 w-4" />,
    },
    {
      label: "My Members & Follow-up",
      gujaratiLabel: "મારા સભ્યો અને ફોલો-અપ",
      href: "/follow-up",
      icon: <Users className="h-4 w-4" />,
      condition: (a) => a.isAdmin || a.isKaryakarta,
    },
    {
      label: "Unified Calendar",
      gujaratiLabel: "કેલેન્ડર",
      href: "/calendar",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: "My Responsibilities",
      gujaratiLabel: "મારી જવાબદારીઓ",
      href: "/responsibilities",
      icon: <Sparkles className="h-4 w-4 text-amber-400" />,
    },
    {
      label: "Announcements",
      gujaratiLabel: "જાહેરાતો",
      href: "/announcements",
      icon: <Megaphone className="h-4 w-4 text-sky-400" />,
    },
    {
      label: "Reports & Sharing",
      gujaratiLabel: "અહેવાલો અને શેરિંગ",
      href: "/reports",
      icon: <FileSpreadsheet className="h-4 w-4 text-emerald-400" />,
      condition: (a) => a.isAdmin || a.isKaryakarta || a.isThalCaptain,
    },
    {
      label: "Admin Console",
      gujaratiLabel: "એડમિન કન્સોલ",
      href: "/admin",
      icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
      condition: (a) => a.isAdmin,
    },
    {
      label: "My Profile & Family",
      gujaratiLabel: "પ્રોફાઇલ અને પરિવાર",
      href: "/profile",
      icon: <UserCheck className="h-4 w-4" />,
    },
  ];

  const visibleItems = allNavItems.filter((item) => (item.condition ? item.condition(app) : true));

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-white/[0.07] bg-[#0C0F17]/95 backdrop-blur-2xl transition-all duration-300 relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/[0.07]">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 p-1 border border-amber-400/30 shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <img src="/logo.png" alt="HariSumiran Logo" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-sm font-extrabold tracking-tight text-white truncate drop-shadow-sm">
                HariSumiran
              </span>
              <span className="text-[9px] font-mono tracking-wider font-semibold text-amber-400 uppercase truncate">
                HariPrabodham, Nadiad
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1 text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 relative",
                isActive
                  ? "bg-gradient-to-r from-[#FCE082] via-[#E8B038] to-[#C98B1C] text-stone-950 shadow-lg shadow-yellow-500/20 font-extrabold border border-yellow-200/60"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
              )}
            >
              <span className={cn("shrink-0", isActive ? "text-stone-950" : "text-zinc-400 group-hover:text-amber-300 transition-colors")}>
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
                    "rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase",
                    isActive ? "bg-stone-950/20 text-stone-950 font-black" : "bg-amber-500/15 text-amber-300 border border-amber-400/30"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Active User Strip & Lock */}
      {!collapsed ? (
        <div className="p-3 border border-white/[0.08] bg-[#141824]/90 m-2.5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2.5">
            <img src={user?.avatar} alt={user?.name} className="h-8 w-8 rounded-full object-cover border border-amber-400/40 shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-amber-300/80 font-medium truncate">
                {user?.responsibilities?.[0]?.title || "Mandir Member"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px]">
            <button
              type="button"
              onClick={lockApp}
              className="text-zinc-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <KeyRound className="h-3 w-3 text-amber-400" />
              <span>{t("Lock", "લૉક")}</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-zinc-400 hover:text-rose-400 flex items-center gap-1 font-semibold transition-colors"
            >
              <LogOut className="h-3 w-3 text-rose-400" />
              <span>{t("Sign Out", "બહાર નીકળો")}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-white/[0.07] flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={lockApp}
            className="p-2 text-zinc-400 hover:text-amber-300 rounded-xl hover:bg-white/[0.08]"
            title={t("Lock App", "ઍપ લૉક કરો")}
          >
            <KeyRound className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
