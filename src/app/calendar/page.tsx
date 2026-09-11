"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import {
  Calendar as CalendarIcon,
  UtensilsCrossed,
  CalendarDays,
  HeartHandshake,
  Car,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";

interface CalendarEventItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  gujaratiTitle?: string;
  category: "Thal" | "Sabha" | "Seva" | "Travel" | "Event";
  location: string;
  badge: string;
  description: string;
}

export default function UnifiedCalendarPage() {
  const { user, t, language } = useApp();

  const [selectedDate, setSelectedDate] = useState("2026-09-13");

  const events: CalendarEventItem[] = [
    {
      id: "ev-1",
      date: "2026-09-12",
      time: "07:30 AM",
      title: "Patel Household Morning Thal Seva",
      gujaratiTitle: "પટેલ પરિવાર સવાર થાળ સેવા",
      category: "Thal",
      location: "Mandir Thal Room",
      badge: "Assigned",
      description: "Puri, Batata Shaak, and Kesar Shrikhand (55 Headcount)",
    },
    {
      id: "ev-2",
      date: "2026-09-13",
      time: "04:00 PM",
      title: "Sunday Mahaprasad Kitchen Seva Shift",
      gujaratiTitle: "રવિવાર મહાપ્રસાદ રસોઈ સેવા",
      category: "Seva",
      location: "Bhojanshala Kitchen",
      badge: "Confirmed",
      description: "Vegetable preparation and Khichdi steam cooking for 200 devotees.",
    },
    {
      id: "ev-3",
      date: "2026-09-13",
      time: "05:15 PM",
      title: "Carpool Departure: Station Road to Mandir",
      gujaratiTitle: "કારપૂલ પ્રસ્થાન: સ્ટેશન રોડ થી મંદિર",
      category: "Travel",
      location: "Station Road Gate",
      badge: "4 Seats Open",
      description: "Maruti Ertiga driven by Rameshbhai Patel.",
    },
    {
      id: "ev-4",
      date: "2026-09-13",
      time: "06:00 PM",
      title: "Sunday Evening Satsang Sabha",
      gujaratiTitle: "રવિવાર સાંજ સત્સંગ સભા",
      category: "Sabha",
      location: "Main Satsang Hall, Nadiad",
      badge: "Live Sabha",
      description: "Vachanamrut discourse and Kirtan bhakti.",
    },
    {
      id: "ev-5",
      date: "2026-09-13",
      time: "07:00 PM",
      title: "Youth Male Sabha (Yuvak Mandal)",
      gujaratiTitle: "યુવક સભા (ઉત્તર નડિયાદ)",
      category: "Sabha",
      location: "Youth Sabha Hall",
      badge: "Youth",
      description: "Discussion on Satsang in Modern Professional Life.",
    },
  ];

  const selectedDateEvents = events.filter((e) => e.date === selectedDate);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "Thal":
        return "warning";
      case "Sabha":
        return "info";
      case "Seva":
        return "primary";
      case "Travel":
        return "success";
      default:
        return "neutral";
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Thal":
        return <UtensilsCrossed className="h-4 w-4 text-amber-600" />;
      case "Sabha":
        return <CalendarDays className="h-4 w-4 text-sky-600" />;
      case "Seva":
        return <HeartHandshake className="h-4 w-4 text-amber-400" />;
      case "Travel":
        return <Car className="h-4 w-4 text-emerald-400" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-amber-400" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-white">
              {t("Unified Mandir Calendar", "સંકલિત મંદિર કેલેન્ડર")}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-charcoal-subtle mt-0.5">
            {t("Single chronological timeline combining Thal, Sabhas, Seva, Events, and Travel", "થાળ, સભા, સેવા, ઉત્સવ અને મુસાફરીનો સંકલિત સમયપત્રક")}
          </p>
        </div>
      </div>

      {/* Main Grid: Date Selector & Events Feed */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Date Days Strip */}
        <div className="lg:col-span-4 space-y-3">
          <GlassCard className="p-4 space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("September 2026 Schedule", "સપ્ટેમ્બર ૨૦૨૬ સમયપત્રક")}
            </h3>

            <div className="space-y-2">
              {[
                { date: "2026-09-12", day: "Saturday", guDay: "શનિવાર", count: 1 },
                { date: "2026-09-13", day: "Sunday", guDay: "રવિવાર", count: 4 },
                { date: "2026-09-14", day: "Monday", guDay: "સોમવાર", count: 0 },
                { date: "2026-09-15", day: "Tuesday", guDay: "મંગળવાર", count: 0 },
                { date: "2026-09-20", day: "Sunday", guDay: "રવિવાર", count: 3 },
              ].map((d) => {
                const isSelected = selectedDate === d.date;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-xs font-semibold ${
                      isSelected
                        ? "bg-amber-500/20 text-white border-amber-400/50 shadow-md ring-1 ring-amber-400/30 font-bold"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-slate-300"
                    }`}
                  >
                    <div>
                      <p className="text-xs">{d.date}</p>
                      <p className={`text-[11px] ${isSelected ? "text-amber-300" : "text-slate-400"}`}>
                        {language === "gu" ? d.guDay : d.day}
                      </p>
                    </div>
                    {d.count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected ? "bg-amber-500 text-slate-950" : "bg-white/10 text-amber-300 border border-white/10"
                        }`}
                      >
                        {d.count} {t("events", "કાર્યક્રમ")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Events Timeline */}
        <div className="lg:col-span-8 space-y-4">
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading text-sm font-bold text-white">
                {t("Activities for", "તારીખનું સમયપત્રક:")} {selectedDate}
              </h3>
              <span className="text-xs font-mono font-bold text-amber-400">
                {selectedDateEvents.length} {t("Items", "કાર્યક્રમો")}
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <p>{t("No activities scheduled for this date.", "આ તારીખે કોઈ કાર્યક્રમ નિર્ધારિત નથી.")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(ev.category)}
                        <span className="font-heading text-sm font-bold text-white">
                          {language === "gu" && ev.gujaratiTitle ? ev.gujaratiTitle : ev.title}
                        </span>
                      </div>
                      <Badge variant={getCategoryBadge(ev.category) as any} size="sm">
                        {ev.category}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{ev.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-amber-400" /> {ev.time}
                      </span>
                      <span>&bull;</span>
                      <span>📍 {ev.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
