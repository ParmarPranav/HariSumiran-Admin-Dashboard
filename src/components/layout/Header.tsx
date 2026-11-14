"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import {
  Search,
  Languages,
  Bell,
  Sparkles,
  Check,
  LogOut,
  KeyRound,
  Users,
  ChevronDown,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Flame,
  Sun,
  Sunrise,
  Moon,
  Clock,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initialUsers } from "@/lib/seedData";
import { Modal } from "@/components/ui/Modal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const {
    user,
    language,
    setLanguage,
    logout,
    lockApp,
    switchPersona,
    notifications,
    dismissNotification,
    markNotificationActionTaken,
    setCommandPaletteOpen,
    t,
  } = useApp();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [aartiMenuOpen, setAartiMenuOpen] = useState(false);

  const aartiSchedule = [
    {
      id: "mangala",
      nameEn: "Mangala Aarti",
      nameGu: "મંગળા આરતી",
      time: "06:00 AM",
      descriptionEn: "Early morning awakening darshan",
      descriptionGu: "પ્રભાત મંગલ દર્શન",
      icon: Sunrise,
      active: false,
    },
    {
      id: "shangar",
      nameEn: "Shangar Aarti",
      nameGu: "શણગાર આરતી",
      time: "07:30 AM",
      descriptionEn: "Divine adornment darshan",
      descriptionGu: "દિવ્ય શણગાર દર્શન",
      icon: Sparkles,
      active: false,
    },
    {
      id: "rajbhog",
      nameEn: "Rajbhog Aarti",
      nameGu: "રાજભોગ આરતી",
      time: "11:30 AM",
      descriptionEn: "Midday royal feast offering",
      descriptionGu: "મધ્યાહ્ન રાજભોગ થાળ",
      icon: Sun,
      active: false,
    },
    {
      id: "sandhya",
      nameEn: "Sandhya Aarti",
      nameGu: "સંધ્યા આરતી",
      time: "07:00 PM",
      descriptionEn: "Evening twilight devotional aarti",
      descriptionGu: "સાયંકાળ સંધ્યા આરતી",
      icon: Flame,
      active: true,
    },
    {
      id: "shayan",
      nameEn: "Shayan Aarti",
      nameGu: "શયન આરતી",
      time: "08:30 PM",
      descriptionEn: "Night rest prayer & darshan",
      descriptionGu: "રાત્રિ શયન પ્રાર્થના દર્શન",
      icon: Moon,
      active: false,
    },
  ];

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleNotificationAction = (notifId: string, action: string) => {
    markNotificationActionTaken(notifId, action);
    toast.success(
      language === "gu" ? `કાર્યવાહી પૂર્ણ: ${action}` : `Action confirmed: ${action}`,
      { description: "System records updated automatically." }
    );
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 md:px-6 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      {/* Left Search Command Trigger & Mandir Live Status */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 pr-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="group flex h-10 w-full max-w-[240px] sm:max-w-[280px] lg:max-w-xs items-center gap-2.5 rounded-2xl border border-stone-200/90 bg-stone-50/80 px-3.5 text-xs text-stone-600 hover:border-amber-400/80 hover:bg-white hover:text-stone-900 transition-all shadow-sm shrink-0"
        >
          <Search className="h-3.5 w-3.5 text-stone-400 group-hover:text-amber-600 transition-colors shrink-0" />
          <span className="flex-1 text-left truncate font-normal">
            {t("Search (Members, Thal, Sabha, Seva)...", "શોધો (સભ્યો, થાળ, સભા, સેવા)...")}
          </span>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded-lg border border-stone-200 bg-white px-1.5 font-mono text-[10px] text-stone-500 shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Live Mandir Prayer Capsule (Zero wrapping: shrink-0 whitespace-nowrap) */}
        <div className="relative shrink-0">
          <button
            onClick={() => setAartiMenuOpen(!aartiMenuOpen)}
            className={cn(
              "group hidden md:inline-flex items-center gap-2.5 h-10 px-3.5 rounded-2xl border text-xs font-medium transition-all duration-200 shrink-0 whitespace-nowrap select-none",
              aartiMenuOpen
                ? "bg-amber-100/90 border-amber-400 text-stone-900 shadow-sm ring-2 ring-amber-300/40"
                : "bg-gradient-to-r from-amber-50/95 via-orange-50/70 to-amber-50/95 border-amber-200/90 text-stone-800 hover:border-amber-400 hover:bg-amber-100/80 hover:shadow-2xs"
            )}
            title={t("View Nadiad Mandir Daily Aarti Schedule", "નડિયાદ મંદિર દૈનિક આરતી સમય જુઓ")}
          >
            {/* Live Pulsing Beacon */}
            <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            </span>

            {/* Sacred Flame Icon & Mandir Tag */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Flame className="h-3.5 w-3.5 text-amber-600 shrink-0 group-hover:scale-110 group-hover:text-amber-700 transition-all duration-200" />
              <span className="font-semibold text-stone-600 text-[11px] tracking-tight">
                {language === "gu" ? "નડિયાદ" : "Nadiad"}
              </span>
            </div>

            <span className="h-3 w-px bg-amber-300/80 shrink-0" />

            {/* Current Aarti Title */}
            <span className="font-bold text-stone-900 group-hover:text-amber-950 transition-colors shrink-0">
              {t("Sandhya Aarti", "સંધ્યા આરતી")}
            </span>

            {/* Luxury Monospace Time Badge */}
            <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-200/70 border border-amber-300/80 px-2 py-0.5 rounded-lg shadow-2xs group-hover:bg-amber-200 transition-colors shrink-0">
              07:00 PM
            </span>

            {/* Dropdown Chevron */}
            <ChevronDown
              className={cn(
                "h-3 w-3 text-amber-700/70 transition-transform duration-200 shrink-0",
                aartiMenuOpen ? "rotate-180 text-amber-900" : "group-hover:translate-y-0.5"
              )}
            />
          </button>

          {/* Interactive Daily Aarti Schedule Popover */}
          {aartiMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setAartiMenuOpen(false)} />
              <div className="absolute left-0 top-12 z-40 w-88 sm:w-96 rounded-3xl border border-amber-200/90 bg-white/95 p-4 shadow-[0_20px_50px_rgba(217,119,6,0.15)] backdrop-blur-2xl animate-in fade-in zoom-in-95 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-100 pb-2.5 px-0.5">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 border border-amber-200 shadow-2xs">
                      <Flame className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 font-display">
                        {t("Daily Aarti Timings", "દૈનિક આરતી સમય")}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-medium">
                        {t("HariPrabodham Mandir • Nadiad", "હરિપ્રબોધમ મંદિર • નડિયાદ")}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("Live Today", "આજનું દર્શન")}
                  </span>
                </div>

                {/* Schedule List */}
                <div className="space-y-1.5">
                  {aartiSchedule.map((aarti) => {
                    const Icon = aarti.icon;
                    return (
                      <div
                        key={aarti.id}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-2xl transition-all border",
                          aarti.active
                            ? "bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border-amber-300/90 shadow-2xs"
                            : "bg-stone-50/50 hover:bg-stone-50 border-stone-100 text-stone-600"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border",
                              aarti.active
                                ? "bg-amber-500 text-white border-amber-400 shadow-sm"
                                : "bg-white text-stone-500 border-stone-200"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={cn("text-xs font-bold", aarti.active ? "text-stone-900" : "text-stone-700")}>
                                {language === "gu" ? aarti.nameGu : aarti.nameEn}
                              </span>
                              {aarti.active && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-500 text-white tracking-wider">
                                  {t("NEXT", "આગામી")}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500">
                              {language === "gu" ? aarti.descriptionGu : aarti.descriptionEn}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={cn(
                              "font-mono text-xs font-extrabold px-2 py-0.5 rounded-lg border",
                              aarti.active
                                ? "bg-white text-amber-950 border-amber-300 shadow-2xs"
                                : "bg-stone-100 text-stone-700 border-stone-200"
                            )}
                          >
                            {aarti.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer info banner */}
                <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[10px] text-stone-500 px-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>{t("Darshan: 6 AM – 12 PM • 4 PM – 8:45 PM", "દર્શન સમય: સવારે ૬-૧૨ • સાંજે ૪-૮:૪૫")}</span>
                  </span>
                  <span className="font-semibold text-amber-800">
                    {language === "gu" ? "જય સ્વામિનારાયણ" : "Jai Swaminarayan"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Persona Switcher Pill (One Account, Multi-Responsibilities) */}
        <button
          onClick={() => setPersonaModalOpen(true)}
          className="group flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50/90 px-3 py-1.5 text-xs font-bold text-amber-900 hover:border-amber-400 hover:bg-amber-100 transition-all shadow-sm"
          title={t("Switch Persona for testing", "પરીક્ષણ માટે વ્યક્તિ બદલો")}
        >
          <Users className="h-3.5 w-3.5 text-amber-600" />
          <span className="hidden sm:inline truncate max-w-[130px] font-semibold">{user?.name}</span>
          <ChevronDown className="h-3 w-3 opacity-70 group-hover:translate-y-0.5 transition-transform" />
        </button>

        {/* Actionable Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-all shadow-sm"
            title={t("Actionable Notifications", "કાર્યવાહી સૂચનાઓ")}
          >
            <Bell className="h-4 w-4 text-stone-600" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-black text-white shadow-md animate-pulse">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 top-11 z-40 w-84 sm:w-96 rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_16px_48px_rgba(0,0,0,0.12)] backdrop-blur-2xl animate-in fade-in zoom-in-95 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 px-1">
                  <span className="text-xs font-bold text-stone-900 font-display">
                    {t("Actionable Notifications", "સૂચનાઓ અને કાર્યો")}
                  </span>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
                    {unreadNotifications.length} {t("Pending", "બાકી")}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-3 rounded-2xl border text-xs space-y-2 transition-all",
                        notif.actionTaken
                          ? "bg-emerald-50 border-emerald-200 text-stone-700"
                          : "bg-amber-50 border-amber-200 text-stone-900"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-stone-900 text-xs">
                          {language === "gu" && notif.gujaratiTitle ? notif.gujaratiTitle : notif.title}
                        </p>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="text-stone-400 hover:text-stone-600 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-[11px] text-stone-600 leading-snug">
                        {language === "gu" && notif.gujaratiMessage ? notif.gujaratiMessage : notif.message}
                      </p>

                      {/* Direct In-Notification Action Buttons */}
                      {notif.actionType === "SWAP_ACCEPT_REJECT" && !notif.actionTaken && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleNotificationAction(notif.id, "Accepted Thal Swap")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{t("Accept Swap", "સ્વીકારો")}</span>
                          </button>
                          <button
                            onClick={() => handleNotificationAction(notif.id, "Declined Thal Swap")}
                            className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 font-semibold text-[10px] text-stone-700 transition-colors"
                          >
                            <span>{t("Decline", "ના પાડો")}</span>
                          </button>
                        </div>
                      )}

                      {notif.actionType === "SEVA_CLAIM" && !notif.actionTaken && (
                        <div className="pt-1">
                          <button
                            onClick={() => handleNotificationAction(notif.id, "Claimed Seva Slot")}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-white font-extrabold text-[10px] shadow-sm flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>{t("I Can Help", "હું સેવા કરીશ")}</span>
                          </button>
                        </div>
                      )}

                      {notif.actionTaken && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                          <Check className="h-3 w-3" /> {notif.actionTakenLabel || "Completed"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Language Toggle Capsule (EN / GU) */}
        <div className="flex items-center p-0.5 rounded-2xl bg-stone-100 border border-stone-200/80 shadow-inner">
          <button
            onClick={() => setLanguage("en")}
            className={cn(
              "px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all duration-200",
              language === "en"
                ? "bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white font-extrabold shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("gu")}
            className={cn(
              "px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all duration-200",
              language === "gu"
                ? "bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white font-extrabold shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            ગુજરાતી
          </button>
        </div>

        {/* User Profile & Lock Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-1.5 pl-1 hover:opacity-95 transition-opacity focus:outline-none group"
            title="User Profile Menu"
          >
            <UserAvatar
              name={user.name}
              avatarUrl={user.avatar}
              role={user.role}
              size="sm"
              showBadge={user.role === "super_admin"}
            />
            <ChevronDown className="h-3 w-3 text-stone-400 hidden sm:inline opacity-70 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {profileMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-40 w-72 rounded-3xl border border-stone-200 bg-white p-3 shadow-[0_16px_48px_rgba(0,0,0,0.12)] backdrop-blur-2xl animate-in fade-in zoom-in-95 space-y-2">
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs space-y-1">
                  <p className="font-bold text-stone-900 text-sm font-display">{user.name}</p>
                  <p className="text-[11px] text-stone-500">{user.email || user.phone}</p>
                  <p className="text-[10px] text-amber-800 font-mono font-semibold">{user.mandir}</p>
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {(user.responsibilities || []).map((r, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white text-amber-800 border border-amber-300">
                        {language === "gu" && r.gujaratiTitle ? r.gujaratiTitle : r.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      lockApp();
                      router.push("/auth");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    <KeyRound className="h-4 w-4 text-amber-600" />
                    <span>{t("Lock Application (PIN)", "ઍપ લૉક કરો (પિન)")}</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setPersonaModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    <Users className="h-4 w-4 text-amber-600" />
                    <span>{t("Switch Persona (Demo)", "વ્યક્તિ બદલો (ડેમો)")}</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                      router.push("/auth");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-rose-600" />
                    <span>{t("Sign Out", "બહાર નીકળો")}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Persona Switcher Modal */}
      <Modal
        isOpen={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
        title={t("Switch Persona for Scenario Testing", "પરીક્ષણ માટે વ્યક્તિ બદલો")}
        subtitle={t("Demonstrates 'One Account, Many Responsibilities'", "'એક ખાતું, અનેક સેવા જવાબદારીઓ' દર્શાવે છે")}
        maxWidth="md"
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {initialUsers.map((u, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                switchPersona(u.name);
                setPersonaModalOpen(false);
              }}
              className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200/90 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/60 transition-all text-left group"
            >
              <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-xl object-cover shrink-0 mt-0.5 border border-stone-200" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                  {u.name}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {u.responsibilities.map((r, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white border border-stone-200 text-stone-700"
                    >
                      {language === "gu" && r.gujaratiTitle ? r.gujaratiTitle : r.title}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </header>
  );
}
