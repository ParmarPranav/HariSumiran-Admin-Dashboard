"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  Home,
  UtensilsCrossed,
  CalendarDays,
  HeartHandshake,
  UserCheck,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { language } = useApp();

  const mobileTabs = [
    { label: "Home", gujaratiLabel: "હોમ", href: "/", icon: <Home className="h-5 w-5" /> },
    { label: "Thal", gujaratiLabel: "થાળ", href: "/thal", icon: <UtensilsCrossed className="h-5 w-5" /> },
    { label: "Sabha", gujaratiLabel: "સભા", href: "/sabha", icon: <CalendarDays className="h-5 w-5" /> },
    { label: "Seva", gujaratiLabel: "સેવા", href: "/seva", icon: <HeartHandshake className="h-5 w-5" /> },
    { label: "Profile", gujaratiLabel: "પ્રોફાઇલ", href: "/profile", icon: <UserCheck className="h-5 w-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-4 z-40">
      <div className="flex items-center justify-around rounded-3xl border border-stone-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur-2xl">
        {mobileTabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-medium transition-all duration-200 active:scale-95",
                isActive
                  ? "text-amber-900 bg-amber-100 border border-amber-300 font-bold shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              )}
            >
              {tab.icon}
              <span className="mt-0.5">{language === "gu" ? tab.gujaratiLabel : tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
