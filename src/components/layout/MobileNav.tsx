"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  UserCheck,
  Users,
  Sliders,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { role } = useApp();

  const mobileTabs = [
    { label: "Thal Rotation", href: "/thal", icon: <UtensilsCrossed className="h-5 w-5" /> },
    { label: "My Profile", href: "/profile", icon: <UserCheck className="h-5 w-5" /> },
    { label: "Login", href: "/auth", icon: <Sliders className="h-5 w-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-4 z-40">
      <div className="flex items-center justify-around rounded-3xl border border-hairline/80 bg-white/90 p-2 shadow-float backdrop-blur-lg">
        {mobileTabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[10px] font-semibold transition-all duration-150 active:scale-95",
                isActive
                  ? "text-primary-container bg-saffron-50/80"
                  : "text-charcoal-subtle hover:text-charcoal"
              )}
            >
              {tab.icon}
              <span className="mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
