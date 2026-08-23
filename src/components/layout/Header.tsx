"use client";

import React, { useState } from "react";
import { useApp, RoleType, getRoleLabel } from "@/context/AppContext";
import {
  Search,
  Languages,
  RefreshCw,
  Bell,
  Shield,
  User,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const {
    role,
    user,
    setRole,
    language,
    setLanguage,
    syncStatus,
    triggerSync,
    setCommandPaletteOpen,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const rolesList: { role: RoleType; label: string; desc: string }[] = [
    {
      role: "mandir_admin",
      label: "Mandir Administrator",
      desc: "Full Mandir operations, alerts & risk oversight",
    },
    {
      role: "karyakarta",
      label: "Karyakarta (Field Volunteer)",
      desc: "Daily tasks, live QR attendance, follow-ups",
    },
    {
      role: "dept_head",
      label: "Department Head",
      desc: "Kitchen, sound & seva roster management",
    },
    {
      role: "family_captain",
      label: "Family Captain",
      desc: "Household Thal turn, RSVPs, updates",
    },
    {
      role: "super_admin",
      label: "Super Administrator",
      desc: "System configuration, security & full audit",
    },
    {
      role: "family_member",
      label: "Family Member",
      desc: "Personal seva duties, event passes",
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-hairline bg-white/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left Search Command Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-10 w-full items-center gap-2.5 rounded-2xl border border-hairline bg-surface-container-low/70 px-3.5 text-xs text-charcoal-subtle hover:border-saffron-300 hover:bg-white transition-all shadow-subtle"
        >
          <Search className="h-4 w-4 text-charcoal-subtle" />
          <span className="flex-1 text-left">Quick Search (Families, Sabha, Seva, Assets)...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-hairline bg-white px-1.5 font-mono text-[10px] text-charcoal-subtle">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 rounded-2xl border border-saffron-300/60 bg-saffron-50/70 px-3 py-1.5 text-xs font-semibold text-primary-container hover:bg-saffron-100/70 transition-colors shadow-subtle"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{getRoleLabel(role)}</span>
            <span className="sm:hidden uppercase">{role.replace("_", " ")}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {roleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setRoleMenuOpen(false)}
              />
              <div className="absolute right-0 top-11 z-40 w-72 rounded-2xl border border-hairline bg-white p-2 shadow-float animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-hairline/60">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-subtle">
                    Switch Active Persona & Rights
                  </p>
                </div>
                <div className="py-1 space-y-0.5">
                  {rolesList.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        setRole(item.role);
                        setRoleMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors",
                        role === item.role
                          ? "bg-saffron-50 font-semibold text-primary-container"
                          : "text-charcoal hover:bg-surface-container-low"
                      )}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-[10px] text-charcoal-subtle">{item.desc}</p>
                      </div>
                      {role === item.role && (
                        <Check className="h-4 w-4 shrink-0 text-primary-container" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Language Toggle (EN / GU) */}
        <button
          onClick={() => setLanguage(language === "en" ? "gu" : "en")}
          className="flex h-9 items-center gap-1 rounded-xl border border-hairline bg-white px-2.5 text-xs font-semibold text-charcoal hover:bg-surface-container-low transition-colors shadow-subtle"
          title="Switch Gujarati / English"
        >
          <Languages className="h-3.5 w-3.5 text-charcoal-subtle" />
          <span>{language === "en" ? "ગુજરાતી" : "EN"}</span>
        </button>

        {/* Live Sync Trigger */}
        <button
          onClick={triggerSync}
          disabled={syncStatus === "syncing"}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-white text-charcoal hover:bg-surface-container-low transition-colors shadow-subtle"
          title="Sync with MongoDB Atlas"
        >
          <RefreshCw
            className={cn(
              "h-3.5 w-3.5 text-charcoal-subtle",
              syncStatus === "syncing" && "animate-spin text-primary-container"
            )}
          />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-1">
          <img
            src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            alt={user.name}
            className="h-8 w-8 rounded-full border border-hairline object-cover"
          />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-charcoal leading-none truncate max-w-[120px]">
              {user.name}
            </span>
            <span className="text-[10px] text-charcoal-subtle leading-tight truncate max-w-[120px]">
              {user.mandir}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
