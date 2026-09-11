"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { QRScannerModal } from "@/components/ui/QRScannerModal";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  CalendarDays,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Clock,
  QrCode,
  ArrowRight,
  UtensilsCrossed,
  Car,
  ChefHat,
  Bell,
  Check,
  MapPin,
  Flame,
  ChevronRight,
  Award,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const { user, t, language, isKaryakarta, isMainCook } = useApp();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claimedSevas, setClaimedSevas] = useState<string[]>([]);

  // Fetch dynamic home feed
  const loadHomeData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/dashboard/home?userId=${user.id || user._id || ""}&userName=${encodeURIComponent(user.name)}`
      );
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (e) {
      console.error("Home feed fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, [user]);

  const handleClaimSeva = async (sevaTitle: string) => {
    setClaimedSevas((prev) => [...prev, sevaTitle]);
    try {
      await fetch("/api/seva/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityTitle: sevaTitle,
          memberName: user.name,
          phone: user.phone,
        }),
      });
      toast.success(
        language === "gu" ? "સેવા સ્વીકારાઈ ગઈ!" : "Seva Claimed Successfully!",
        {
          description:
            language === "gu"
              ? "તમારું નામ રસોઈ/સેવા યાદીમાં નોંધાઈ ગયું છે."
              : "Your volunteer slot has been recorded. Mandir team notified.",
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const todayFormatted = new Date().toLocaleDateString(language === "gu" ? "gu-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-16">
      <MandalaBackground />

      {/* ======================================================== */}
      {/* 🌟 HERO BANNER: Devotional Greeting & Live Status Header */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 100, damping: 20 }}
        className="relative z-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#131728] via-[#1A2035] to-[#0E111D] p-6 md:p-8 text-white border border-amber-400/25 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        {/* Subtle decorative background watermarks */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/15 to-yellow-500/5 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-500/15 to-purple-600/5 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 backdrop-blur-md border border-amber-400/30 text-amber-300 shadow-[0_0_12px_rgba(232,176,56,0.15)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                {t("HariPrabodham Mandir • Nadiad", "હરિપ્રબોધમ મંદિર • નડિયાદ")}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {todayFormatted}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              {t("Jai Swaminarayan", "જય સ્વામિનારાયણ")},{" "}
              <span className="bg-gradient-to-r from-[#FCE082] via-[#E8B038] to-[#FCE082] bg-clip-text text-transparent font-black">
                {user.name}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl font-normal leading-relaxed">
              {language === "gu"
                ? "એક મંદિર, એક એપ, એક ખાતું — તમારી બધી સેવા જવાબદારીઓ એક જ જગ્યાએ ઉપલબ્ધ છે."
                : "One Mandir. One App. One Account. All your seva responsibilities unified in one place."}
            </p>

            {/* Active Responsibilities Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {(user?.responsibilities || []).map((resp, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#181E30]/90 backdrop-blur-md border border-amber-400/25 text-amber-200 shadow-sm hover:border-amber-400/40 transition-colors cursor-default"
                >
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  {language === "gu" && resp.gujaratiTitle ? resp.gujaratiTitle : resp.title}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Action Dock */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setQrModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FCE082] via-[#E8B038] to-[#C98B1C] text-stone-950 font-black text-xs shadow-[0_0_24px_rgba(232,176,56,0.35)] border border-yellow-200/60 hover:brightness-110 transition-all"
            >
              <QrCode className="h-4 w-4 text-stone-950" />
              <span>{t("Scan QR", "ક્યુઆર સ્કેન")}</span>
            </motion.button>

            {isKaryakarta && (
              <Link href="/sabha">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 text-white font-bold text-xs shadow-sm hover:bg-white/[0.14] transition-colors"
                >
                  <CalendarDays className="h-4 w-4 text-amber-300" />
                  <span>{t("Take Attendance", "હાજરી લો")}</span>
                </motion.button>
              </Link>
            )}

            {isMainCook && (
              <Link href="/kitchen">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 text-white font-bold text-xs shadow-sm hover:bg-white/[0.14] transition-colors"
                >
                  <ChefHat className="h-4 w-4 text-amber-300" />
                  <span>{t("Bhojanshala", "રસોઈ ઘર")}</span>
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* 📊 LIVE METRICS BENTO BAR: 4 Pulse Spotlight Tiles */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Metric 1: Thal Turn Countdown */}
        <SpotlightCard variant="gold" className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              {t("Thal Turn", "થાળ પરિભ્રમણ")}
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(232,176,56,0.15)]">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="font-display text-lg sm:text-xl font-bold text-white truncate">
              {user.familyName || t("Household Turn", "પરિવાર થાળ")}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold font-mono">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>{t("Next: Saturday Morning", "આગામી: શનિવાર સવાર")}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
            <Link href="/thal" className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1">
              <span>{t("Schedule", "યાદી જુઓ")}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Badge variant="primary" size="sm">55 pax</Badge>
          </div>
        </SpotlightCard>

        {/* Metric 2: Attendance Streak Meter */}
        <SpotlightCard variant="default" className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              {t("Sabha Streak", "સભા નિયમિતતા")}
            </span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(244,63,94,0.15)]">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-black text-white font-mono">19</span>
              <span className="text-xs font-bold text-zinc-400">{t("Weeks", "અઠવાડિયા")}</span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> {t("100% Attendance", "સતત હાજરી રેકોર્ડ")}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
            <Link href="/sabha" className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1">
              <span>{t("History", "ઇતિહાસ")}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
        </SpotlightCard>

        {/* Metric 3: Carpool & Travel */}
        <SpotlightCard variant="default" className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              {t("Transport Rides", "વાહન સુવિધા")}
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <Car className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="font-display text-lg sm:text-xl font-bold text-white font-mono">
              4 {t("Seats Open", "સીટો ખાલી")}
            </p>
            <p className="text-xs text-zinc-400 font-mono">
              Station Road &bull; 17:15 Dep.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
            <Link href="/travel" className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1">
              <span>{t("Book Seat", "સીટ મેળવો")}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Badge variant="info" size="sm">Maruti Ertiga</Badge>
          </div>
        </SpotlightCard>

        {/* Metric 4: Open Seva Board */}
        <SpotlightCard variant="default" className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              {t("Seva Opportunities", "સેવા તકો")}
            </span>
            <div className="h-8 w-8 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(14,165,233,0.15)]">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="font-display text-lg sm:text-xl font-bold text-white font-mono">
              {(dashboardData?.whereCanIHelp || []).length} {t("Slots Active", "જગ્યા ઉપલબ્ધ")}
            </p>
            <p className="text-xs text-zinc-400">
              Kitchen &bull; Parking &bull; Audio
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
            <Link href="/seva" className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1">
              <span>{t("Volunteer", "યોગદાન આપો")}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Badge variant="warning" size="sm">Urgent</Badge>
          </div>
        </SpotlightCard>
      </div>

      {/* ======================================================== */}
      {/* 🎯 SECTION 1: WHAT DO I NEED TO DO? (Action Required) */}
      {/* ======================================================== */}
      <section className="relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(232,176,56,0.9)]" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              {t("What do I need to do?", "મારે શું કરવાનું છે?")}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-400/30 px-3 py-1 rounded-full shadow-sm">
            {(dashboardData?.whatDoINeedToDo || []).length} {t("Actions Pending", "કાર્યો બાકી")}
          </span>
        </div>

        {(dashboardData?.whatDoINeedToDo || []).length === 0 ? (
          <SpotlightCard variant="gold" className="p-8 text-center border-dashed border-emerald-400/30">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-base font-bold text-white">
              {t("All caught up! No pending urgent duties.", "બધાં કાર્યો પૂર્ણ છે! કોઈ પેન્ડિંગ કાર્ય નથી.")}
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              {t("Your current duties are fulfilled. Check open seva opportunities below to contribute.", "તમારી બધી જવાબદારીઓ અપ-ટૂ-ડેટ છે. યોગદાન આપવા નીચે ખુલ્લી સેવા જુઓ.")}
            </p>
          </SpotlightCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.whatDoINeedToDo.map((item: any) => (
              <SpotlightCard
                key={item.id}
                variant="default"
                className="border-l-4 border-l-amber-400 p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white line-clamp-1">
                      {language === "gu" && item.gujaratiTitle ? item.gujaratiTitle : item.title}
                    </span>
                    <Badge variant={item.urgency === "Critical" ? "danger" : "warning"} size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200"
                  >
                    <span>{t("Take Action", "કાર્યવાહી કરો")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                    {item.type}
                  </span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 📡 SECTION 2: WHAT IS HAPPENING? (Mandir Activity Stream) */}
      {/* ======================================================== */}
      <section className="relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              {t("What is happening?", "મંદિરમાં શું ચાલી રહ્યું છે?")}
            </h2>
          </div>
          <Link href="/calendar" className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1">
            <span>{t("View Full Calendar", "આખું કેલેન્ડર જુઓ")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upcoming Sabha Spotlight */}
          <SpotlightCard variant="default" className="p-5 space-y-4 border-l-4 border-l-sky-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {t("Upcoming Sabha", "આગામી સભા")}
              </span>
              <Badge variant="info" size="sm">Scheduled</Badge>
            </div>

            {dashboardData?.whatIsHappening?.upcomingSabhas?.[0] ? (
              <div className="space-y-2">
                <h4 className="font-display text-base font-bold text-white">
                  {language === "gu" && dashboardData.whatIsHappening.upcomingSabhas[0].gujaratiTitle
                    ? dashboardData.whatIsHappening.upcomingSabhas[0].gujaratiTitle
                    : dashboardData.whatIsHappening.upcomingSabhas[0].title}
                </h4>
                <div className="space-y-1 text-xs text-zinc-400">
                  <p className="flex items-center gap-1.5 font-mono">
                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                    <span>{dashboardData.whatIsHappening.upcomingSabhas[0].date} &bull; {dashboardData.whatIsHappening.upcomingSabhas[0].startTime} - {dashboardData.whatIsHappening.upcomingSabhas[0].endTime}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-sky-400" />
                    <span>{dashboardData.whatIsHappening.upcomingSabhas[0].location}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">No upcoming sabha scheduled.</p>
            )}

            <div className="pt-2.5 border-t border-white/[0.08]">
              <Link href="/sabha" className="inline-flex items-center gap-1 text-xs font-bold text-sky-300 hover:text-sky-200">
                <span>{t("Sabha Details & Attendance", "સભા વિગત અને હાજરી")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </SpotlightCard>

          {/* Transportation / Car Pooling Rides */}
          <SpotlightCard variant="default" className="p-5 space-y-4 border-l-4 border-l-emerald-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Car className="h-4 w-4" /> {t("Travel & Rides Available", "મુસાફરી અને રાઈડ")}
              </span>
              <Badge variant="success" size="sm">{t("Available Seats", "ઉપલબ્ધ સીટો")}</Badge>
            </div>

            {dashboardData?.whatIsHappening?.activeRides?.[0] ? (
              <div className="space-y-2">
                <h4 className="font-display text-base font-bold text-white">
                  {dashboardData.whatIsHappening.activeRides[0].title}
                </h4>
                <div className="space-y-1 text-xs text-zinc-400">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-emerald-400" />
                    {dashboardData.whatIsHappening.activeRides[0].driverName} &bull; {dashboardData.whatIsHappening.activeRides[0].vehicleModel}
                  </p>
                  <p className="flex items-center gap-1.5 font-mono">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{t("Departs:", "પ્રસ્થાન:")} {dashboardData.whatIsHappening.activeRides[0].departureTime}</span>
                  </p>
                  <p className="text-emerald-400 font-bold font-mono">
                    {dashboardData.whatIsHappening.activeRides[0].availableSeats} {t("seats open for devotees", "સીટો ભક્તો માટે ઉપલબ્ધ")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">No active carpool rides listed.</p>
            )}

            <div className="pt-2.5 border-t border-white/[0.08]">
              <Link href="/travel" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-emerald-200">
                <span>{t("Request / Offer Ride", "રાઈડ મેળવો / ઓફર કરો")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </SpotlightCard>

          {/* Mandir Announcement */}
          <SpotlightCard variant="default" className="p-5 space-y-4 border-l-4 border-l-amber-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-amber-400" /> {t("Mandir Notice", "મંદિર જાહેરાત")}
              </span>
              <Badge variant="warning" size="sm">Official</Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-display text-base font-bold text-white">
                {language === "gu" ? "આગામી વિશેષ ઉત્સવ દર્શન સમય" : "Special Mahotsav Darshan Timings"}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {language === "gu"
                  ? "વિશેષ જન્માષ્ટમી મહોત્સવ સભા માટે સર્વે ભક્તોએ સાંજે ૬:૦૦ કલાકે સમયસર પધારવું. પલના ઉત્સવ અને મહાપ્રસાદ રહેશે."
                  : "All devotees are warmly welcomed for the Janmashtami Mahotsav at 6:00 PM. Includes Palna darshan & Mahaprasad."}
              </p>
            </div>

            <div className="pt-2.5 border-t border-white/[0.08]">
              <Link href="/announcements" className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200">
                <span>{t("View All Announcements", "બધી જાહેરાતો જુઓ")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 🤝 SECTION 3: WHERE CAN I HELP? (Open Seva Board) */}
      {/* ======================================================== */}
      <section className="relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              {t("Where can I help?", "હું ક્યાં મદદ કરી શકું?")}
            </h2>
          </div>
          <Link href="/seva" className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1">
            <span>{t("View Seva Board", "સેવા બોર્ડ જુઓ")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(dashboardData?.whereCanIHelp || []).map((seva: any) => {
            const isClaimed = claimedSevas.includes(seva.title);
            const accepted = seva.acceptedVolunteerCount || 0;
            const required = seva.requiredVolunteerCount || 5;
            const pct = Math.min(100, Math.round((accepted / required) * 100));

            return (
              <SpotlightCard
                key={seva._id || seva.title}
                variant="default"
                className="p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white line-clamp-1">
                      {language === "gu" && seva.gujaratiTitle ? seva.gujaratiTitle : seva.title}
                    </span>
                    <Badge variant="primary" size="sm">
                      {seva.category || "Seva"}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {seva.description}
                  </p>

                  {/* Progress Capacity Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                      <span>{t("Volunteers needed:", "જરૂરી સ્વયંસેવકો:")}</span>
                      <span className="font-mono font-bold text-amber-300">
                        {accepted} / {required}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#121624] border border-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FCE082] via-[#E8B038] to-[#C98B1C] transition-all duration-500 shadow-[0_0_10px_rgba(232,176,56,0.5)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                    <Clock className="h-3 w-3 text-amber-400" />
                    <span>{seva.startTime} - {seva.endTime}</span>
                    <span>&bull;</span>
                    <MapPin className="h-3 w-3 text-amber-400" />
                    <span>{seva.location || "Mandir"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  {isClaimed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1.5 rounded-xl">
                      <Check className="h-4 w-4" /> {t("Registered for Seva", "સેવા માટે નોંધાયા")}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleClaimSeva(seva.title)}
                      leftIcon={<Sparkles className="h-3.5 w-3.5 text-stone-950" />}
                    >
                      {t("I Can Help", "હું સેવા કરીશ")}
                    </Button>
                  )}
                  <Link href="/seva" className="text-xs font-bold text-zinc-400 hover:text-white">
                    {t("Details", "વિગત")} &rarr;
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanSuccess={(code) => {
          toast.success(t("Identity Verified", "ઓળખ પ્રમાણિત થઈ"), {
            description: `${t("Scanned QR:", "સ્કેન કરેલ:")} ${code}`,
          });
        }}
      />
    </div>
  );
}

