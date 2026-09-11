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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initialUsers } from "@/lib/seedData";
import { Modal } from "@/components/ui/Modal";
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

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleNotificationAction = (notifId: string, action: string) => {
    markNotificationActionTaken(notifId, action);
    toast.success(
      language === "gu" ? `કાર્યવાહી પૂર્ણ: ${action}` : `Action confirmed: ${action}`,
      { description: "System records updated automatically." }
    );
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-saffron-100/80 bg-white/85 px-4 md:px-6 backdrop-blur-xl shadow-subtle">
      {/* Left Search Command Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-10 w-full items-center gap-2.5 rounded-2xl border border-hairline bg-surface-container-low/70 px-3.5 text-xs text-charcoal-subtle hover:border-saffron-300 hover:bg-white transition-all shadow-subtle"
        >
          <Search className="h-4 w-4 text-charcoal-subtle" />
          <span className="flex-1 text-left truncate">
            {t("Quick Search (Members, Thal, Sabha, Seva)...", "શોધો (સભ્યો, થાળ, સભા, સેવા)...")}
          </span>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-hairline bg-white px-1.5 font-mono text-[10px] text-charcoal-subtle">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Persona Switcher Pill (One Account, Multi-Responsibilities) */}
        <button
          onClick={() => setPersonaModalOpen(true)}
          className="flex items-center gap-1.5 rounded-2xl border border-saffron-300/80 bg-saffron-50/80 px-2.5 py-1.5 text-xs font-bold text-primary-container hover:bg-saffron-100/80 transition-colors shadow-subtle"
          title={t("Switch Persona for testing", "પરીક્ષણ માટે વ્યક્તિ બદલો")}
        >
          <Users className="h-3.5 w-3.5" />
          <span className="hidden sm:inline truncate max-w-[140px]">{user?.name}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>

        {/* Actionable Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-white text-charcoal hover:bg-surface-container-low transition-colors shadow-subtle"
            title={t("Actionable Notifications", "કાર્યવાહી સૂચનાઓ")}
          >
            <Bell className="h-4 w-4 text-charcoal-subtle" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-saffron-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 top-11 z-40 w-84 sm:w-96 rounded-2xl border border-hairline bg-white p-3 shadow-float animate-in fade-in zoom-in-95 space-y-2">
                <div className="flex items-center justify-between border-b border-hairline pb-2 px-1">
                  <span className="text-xs font-bold text-charcoal">
                    {t("Actionable Notifications", "સૂચનાઓ અને કાર્યો")}
                  </span>
                  <span className="text-[10px] text-primary-container font-semibold">
                    {unreadNotifications.length} {t("Pending", "બાકી")}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-3 rounded-xl border text-xs space-y-2 transition-all",
                        notif.actionTaken
                          ? "bg-emerald-50/40 border-emerald-200 text-charcoal"
                          : "bg-amber-50/60 border-amber-200 text-charcoal"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-charcoal text-xs">
                          {language === "gu" && notif.gujaratiTitle ? notif.gujaratiTitle : notif.title}
                        </p>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="text-charcoal-subtle hover:text-charcoal text-[10px]"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-[11px] text-charcoal-subtle leading-snug">
                        {language === "gu" && notif.gujaratiMessage ? notif.gujaratiMessage : notif.message}
                      </p>

                      {/* Direct In-Notification Action Buttons */}
                      {notif.actionType === "SWAP_ACCEPT_REJECT" && !notif.actionTaken && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleNotificationAction(notif.id, "Accepted Thal Swap")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{t("Accept Swap", "સ્વીકારો")}</span>
                          </button>
                          <button
                            onClick={() => handleNotificationAction(notif.id, "Declined Thal Swap")}
                            className="px-2.5 py-1 rounded-lg bg-white border border-hairline hover:bg-surface-container-low font-semibold text-[10px] text-charcoal"
                          >
                            <span>{t("Decline", "ના પાડો")}</span>
                          </button>
                        </div>
                      )}

                      {notif.actionType === "SEVA_CLAIM" && !notif.actionTaken && (
                        <div className="pt-1">
                          <button
                            onClick={() => handleNotificationAction(notif.id, "Claimed Seva Slot")}
                            className="px-3 py-1 rounded-lg bg-primary-container hover:bg-saffron-600 text-white font-bold text-[10px] shadow-sm flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>{t("I Can Help", "હું સેવા કરીશ")}</span>
                          </button>
                        </div>
                      )}

                      {notif.actionTaken && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
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

        {/* Language Toggle (EN / GU) */}
        <button
          onClick={() => setLanguage(language === "en" ? "gu" : "en")}
          className="flex h-9 items-center gap-1 rounded-xl border border-hairline bg-white px-2.5 text-xs font-semibold text-charcoal hover:bg-surface-container-low transition-colors shadow-subtle"
          title={t("Switch Gujarati / English", "ગુજરાતી / અંગ્રેજી")}
        >
          <Languages className="h-3.5 w-3.5 text-charcoal-subtle" />
          <span>{language === "en" ? "ગુજરાતી" : "EN"}</span>
        </button>

        {/* User Profile & Lock Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 pl-1 hover:opacity-90 transition-opacity focus:outline-none"
            title="User Profile Menu"
          >
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
              alt={user.name}
              className="h-8 w-8 rounded-full border-2 border-saffron-300 object-cover shadow-subtle"
            />
            <ChevronDown className="h-3 w-3 text-charcoal-subtle hidden sm:inline opacity-70" />
          </button>

          {profileMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-40 w-72 rounded-2xl border border-saffron-200 bg-white p-3 shadow-float animate-in fade-in zoom-in-95 space-y-2">
                <div className="p-3 rounded-xl bg-saffron-50/60 border border-saffron-200/60 text-xs space-y-1">
                  <p className="font-bold text-charcoal text-sm">{user.name}</p>
                  <p className="text-[11px] text-charcoal-subtle">{user.email || user.phone}</p>
                  <p className="text-[10px] text-primary-container font-mono font-semibold">{user.mandir}</p>
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {(user.responsibilities || []).map((r, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white text-saffron-900 border border-saffron-200">
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
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-charcoal hover:bg-surface-container-low transition-colors"
                  >
                    <KeyRound className="h-4 w-4 text-primary-container" />
                    <span>{t("Lock Application (PIN)", "ઍપ લૉક કરો (પિન)")}</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setPersonaModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-charcoal hover:bg-surface-container-low transition-colors"
                  >
                    <Users className="h-4 w-4 text-primary-container" />
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
              className="w-full flex items-start gap-3 p-3 rounded-2xl border border-hairline hover:border-saffron-400 bg-surface-container-low/40 hover:bg-saffron-50/50 transition-all text-left group"
            >
              <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-xl object-cover shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-charcoal group-hover:text-primary-container truncate">
                  {u.name}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {u.responsibilities.map((r, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white border border-hairline text-charcoal-subtle"
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
