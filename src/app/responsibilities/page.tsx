"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import {
  Sparkles,
  UtensilsCrossed,
  CalendarDays,
  HeartHandshake,
  Car,
  ChefHat,
  CheckCircle2,
  Clock,
  Activity,
  Award,
  ShieldCheck,
} from "lucide-react";

export default function ResponsibilitiesPage() {
  const { user, t, language } = useApp();
  const [activeTab, setActiveTab] = useState("responsibilities");

  // Sample personal activity history
  const activityLogs = [
    {
      id: "act-1",
      date: "2026-09-06",
      title: "Sunday Evening Sabha Attended",
      gujaratiTitle: "રવિવાર સાંજ સભા હાજરી",
      category: "Sabha",
      detail: "Marked present via Fast QR Code scan (Streak: 18 Sabhas).",
      status: "Completed",
    },
    {
      id: "act-2",
      date: "2026-08-30",
      title: "Janmashtami Mahotsav Kitchen Seva",
      gujaratiTitle: "જન્માષ્ટમી મહોત્સવ રસોઈ સેવા",
      category: "Seva",
      detail: "3.5 Hours completed with Mahaprasad preparation team.",
      status: "Completed",
    },
    {
      id: "act-3",
      date: "2026-08-23",
      title: "Morning Thal Seva Served",
      gujaratiTitle: "સવાર થાળ સેવા અર્પણ",
      category: "Thal",
      detail: "Patel household served morning thal for 50 devotees.",
      status: "Completed",
    },
    {
      id: "act-4",
      date: "2026-08-23",
      title: "Carpool Ride Provided (3 Passengers)",
      gujaratiTitle: "કારપૂલ વાહન સેવા (૩ મુસાફરો)",
      category: "Travel",
      detail: "Transported Hareshbhai Trivedi and 2 others safely to Mandir.",
      status: "Completed",
    },
  ];

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-white">
              {t("My Responsibilities & Activity", "મારી જવાબદારીઓ અને પ્રવૃત્તિ")}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-charcoal-subtle mt-0.5">
            {t("Unified personal dashboard of your assigned Mandir duties and contribution history", "મંદિર સેવાની સોંપાયેલ જવાબદારીઓ અને ઇતિહાસ")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#121622]/80 backdrop-blur-md p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("responsibilities")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "responsibilities"
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/20 text-amber-300 border border-amber-400/40 shadow-glow-sm font-extrabold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t("Assigned Responsibilities", "સોંપાયેલ જવાબદારીઓ")}
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "activity"
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/20 text-amber-300 border border-amber-400/40 shadow-glow-sm font-extrabold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t("My Activity History", "મારો પ્રવૃત્તિ ઇતિહાસ")}
          </button>
        </div>
      </div>

      {/* TAB 1: MY RESPONSIBILITIES */}
      {activeTab === "responsibilities" && (
        <div className="relative z-10 space-y-6">
          {/* Identity Summary Card */}
          <GlassCard className="p-5 border-l-4 border-l-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                alt={user?.name}
                className="h-14 w-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow-glow-sm"
              />
              <div>
                <h3 className="font-heading text-base font-bold text-white flex items-center gap-1.5">
                  {user?.name}
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </h3>
                <p className="text-xs text-gray-400">{user?.mandir}</p>
                <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                  {user?.familyName || "Patel Household"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-xl font-mono font-black text-amber-400">
                  {(user?.responsibilities || []).length}
                </span>
                <span className="block text-[10px] uppercase font-bold text-gray-400">
                  {t("Active Duties", "સક્રિય જવાબદારી")}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Cards for each active responsibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(user?.responsibilities || []).map((resp, idx) => (
              <GlassCard key={idx} className="p-5 space-y-3 hover:shadow-float transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    {language === "gu" && resp.gujaratiTitle ? resp.gujaratiTitle : resp.title}
                  </span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>

                <div className="p-3 rounded-xl bg-[#161B28] border border-white/10 text-xs space-y-1">
                  <p className="text-gray-400 font-medium">
                    {t("Scope & Boundaries:", "કાર્યક્ષેત્ર:")}
                  </p>
                  <p className="font-bold text-gray-200">
                    {resp.scope?.sabhaType ? `Sabha: ${resp.scope.sabhaType}` : ""}
                    {resp.scope?.zone ? ` • Zone: ${resp.scope.zone}` : ""}
                    {resp.scope?.familyId ? ` • Family ID: ${resp.scope.familyId}` : ""}
                    {resp.scope?.department ? ` • Department: ${resp.scope.department}` : ""}
                    {!resp.scope?.sabhaType && !resp.scope?.zone && !resp.scope?.department && "Mandir Wide"}
                  </p>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {t("System automatically grants you scoped access for this duty without role switching.", "આ જવાબદારી માટે સિસ્ટમ આપમેળે અધિકૃત કાર્યો પ્રદાન કરે છે.")}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY ACTIVITY HISTORY */}
      {activeTab === "activity" && (
        <div className="relative z-10 space-y-4">
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-400" />
                <span>{t("Personal Contribution Log", "વ્યક્તિગત સેવા અને હાજરી ઇતિહાસ")}</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                🔥 18 {t("Sabha Streak", "સભા નિયમિતતા")}
              </span>
            </div>

            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl border border-white/10 bg-[#161B28]/60 hover:bg-[#161B28] transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">
                      {language === "gu" && log.gujaratiTitle ? log.gujaratiTitle : log.title}
                    </span>
                    <Badge variant="success" size="sm">{log.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-400">{log.detail}</p>
                  <p className="text-[10px] text-gray-500 font-mono pt-1">📅 {log.date}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
