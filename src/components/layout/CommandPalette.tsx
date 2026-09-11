"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Modal } from "../ui/Modal";
import {
  Search,
  Users,
  CalendarDays,
  Sparkles,
  HeartHandshake,
  Package,
  PartyPopper,
  UtensilsCrossed,
  Megaphone,
  Sliders,
  QrCode,
  ArrowRight,
} from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, setRole } = useApp();
  const [query, setQuery] = useState("");

  const navigationCommands = [
    { label: "Family Directory & 360° Profiles", href: "/families", icon: <Users className="h-4 w-4" /> },
    { label: "Sabha Schedule & Live QR Check-in", href: "/sabha", icon: <CalendarDays className="h-4 w-4" /> },
    { label: "Prioritized Follow-Up Cases & Notes", href: "/follow-up", icon: <HeartHandshake className="h-4 w-4" /> },
    { label: "Seva Opportunity Catalog & Rosters", href: "/seva", icon: <Sparkles className="h-4 w-4" /> },
    { label: "Thal Rotation Calendar & Swaps", href: "/thal", icon: <UtensilsCrossed className="h-4 w-4" /> },
    { label: "Asset Registry & Hall Bookings", href: "/assets", icon: <Package className="h-4 w-4" /> },
    { label: "Festivals, Events & QR Passes", href: "/events", icon: <PartyPopper className="h-4 w-4" /> },
    { label: "Broadcast Announcement Composer", href: "/announcements", icon: <Megaphone className="h-4 w-4" /> },
    { label: "System Administration & Permissions", href: "/admin", icon: <Sliders className="h-4 w-4" /> },
  ];

  const quickActions = [
    {
      label: "Switch to Mandir Administrator",
      action: () => setRole("mandir_admin"),
      badge: "Role",
    },
    {
      label: "Switch to Karyakarta (Fieldwork)",
      action: () => setRole("karyakarta"),
      badge: "Role",
    },
    {
      label: "Switch to Department Head",
      action: () => setRole("dept_head"),
      badge: "Role",
    },
    {
      label: "Switch to Family Captain",
      action: () => setRole("family_captain"),
      badge: "Role",
    },
  ];

  const filteredNav = navigationCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href?: string, action?: () => void) => {
    setCommandPaletteOpen(false);
    setQuery("");
    if (href) router.push(href);
    if (action) action();
  };

  return (
    <Modal
      isOpen={commandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
      maxWidth="lg"
      className="p-0 overflow-hidden"
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 bg-[#161B28]/60">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search screens, actions, or switch personas..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
          autoFocus
        />
        <kbd className="rounded border border-white/10 bg-[#1A1F2E] px-2 py-0.5 font-mono text-[10px] text-gray-400">
          ESC
        </kbd>
      </div>

      <div className="max-h-80 overflow-y-auto p-2 space-y-3">
        {filteredNav.length > 0 && (
          <div>
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Navigation Destinations
            </p>
            <div className="space-y-0.5">
              {filteredNav.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-gray-200 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-gray-400">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-500 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredActions.length > 0 && (
          <div className="border-t border-white/10 pt-2">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Quick Role Switches
            </p>
            <div className="space-y-0.5">
              {filteredActions.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSelect(undefined, item.action)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-gray-200 hover:bg-white/5 transition-colors"
                >
                  <span>{item.label}</span>
                  <span className="rounded-md bg-amber-500/15 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredNav.length === 0 && filteredActions.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-400">
            No matching destinations or commands found for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>
    </Modal>
  );
}
