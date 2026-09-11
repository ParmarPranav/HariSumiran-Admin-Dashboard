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
        className="relative z-10 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white p-6 md:p-8 text-stone-900 border border-amber-300/80 shadow-[0_12px_40px_-10px_rgba(245,158,11,0.12)] backdrop-blur-xl"
      >
        {/* Subtle decorative warm saffron ambient glows */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-gradient-to-tr from-yellow-400/15 to-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100/80 border border-amber-300 text-amber-900 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                {t("HariPrabodham Mandir • Nadiad", "હરિપ્રબોધમ મંદિર • નડિયાદ")}
              </span>
              <span className="text-xs text-stone-500 font-mono">
                {todayFormatted}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-stone-900 drop-shadow-sm">
              {t("Jai Swaminarayan", "જય સ્વામિનારાયણ")},{" "}
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent font-black">
                {user.name}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl font-normal leading-relaxed">
              {language === "gu"
                ? "એક મંદિર, એક એપ, એક ખાતું — તમારી બધી સેવા જવાબદારીઓ એક જ જગ્યાએ ઉપલબ્ધ છે."
                : "One Mandir. One App. One Account. All your seva responsibilities unified in one place."}
            </p>

            {/* Active Responsibilities Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {(user?.responsibilities || []).map((resp, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white/90 backdrop-blur-md border border-amber-300/80 text-amber-900 shadow-sm hover:border-amber-400 transition-colors cursor-default"
                >
                  <Sparkles className="h-3 w-3 text-amber-600" />
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white font-extrabold text-xs shadow-md shadow-orange-500/25 border border-amber-300/60 hover:brightness-105 transition-all"
            >
              <QrCode className="h-4 w-4 text-white" />
              <span>{t("Scan QR", "ક્યુઆર સ્કેન")}</span>
            </motion.button>

            {isKaryakarta && (
              <Link href="/sabha">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-800 font-bold text-xs shadow-sm hover:bg-amber-50 hover:border-amber-300 transition-colors"
                >
                  <CalendarDays className="h-4 w-4 text-amber-600" />
                  <span>{t("Take Attendance", "હાજરી લો")}</span>
                </motion.button>
              </Link>
            )}

            {isMainCook && (
              <Link href="/kitchen">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-800 font-bold text-xs shadow-sm hover:bg-amber-50 hover:border-amber-300 transition-colors"
                >
                  <ChefHat className="h-4 w-4 text-amber-600" />
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
        <SpotlightCard variant="gold" className="p-5 flex flex-col justify-between h-full bg-white/95 border-amber-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
              {t("Thal Turn", "થાળ પરિભ્રમણ")}
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center font-bold shadow-sm">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="font-display text-lg sm:text-xl font-extrabold text-stone-900 truncate">
              {user.familyName || t("Household Turn", "પરિવાર થાળ")}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold font-mono">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>{t("Next: Saturday Morning", "આગામી: શનિવાર સવાર")}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
            <Link href="/thal" className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
              <span>{t("Schedule", "યાદી જુઓ")}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Badge variant="primary" size="sm">55 pax</Badge>
          </div>
        </SpotlightCard>

        {/* Metric 2: Attendance Streak Meter */}
        <SpotlightCard variant="default" className="p-5 flex flex-col justify-between h-full bg-white/95 border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
              {t("Sabha Streak", "સભા નિયમિતતા")}
            </span>
            <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center font-bold shadow-sm">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-black text-stone-900 font-mono">19</span>
              <span className="text-xs font-bold text-stone-500">{t("Weeks", "અઠવાડિયા")}</span>
            </div>
            <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-emerald-600" /> {t("100% Attendance", "સતત હાજરી રેકોર્ડ")}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
            <Link href="/sabha" className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
              <span>{t("History", "ઇતિહાસ")}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
        </SpotlightCard>

        {/* Metric 3: Carpool & Travel */}
        <SpotlightCard variant="default" className="p-5 flex flex-col justify-between h-full bg-white/95 border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
              {t("Transport Rides", "વાહન સુવિધા")}
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center font-bold shadow-sm">
              <Car className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="font-display text-lg sm:text-xl font-extrabold text-stone-900 font-mono">
              4 {t("Seats Open", "સીટો ખાલી")}
            </p>
            <p className="text-xs text-stone-500 font-mono">
              Station Road &bull; 17:15 Dep.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
            <Link href="/travel" className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
              <span>{t("Book Seat", "સીટ મેળવો")}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Badge variant="info" size="sm">Maruti Ertiga</Badge>
          </div>
        </SpotlightCard>

        {/* Metric 4: Open Seva Board */}
        <SpotlightCard variant="default" className="p-5 flex flex-col justify-between h-full bg-white/95 border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
              {t("Seva Opportunities", "સેવા તકો")}
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center font-bold shadow-sm">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="font-display text-lg sm:text-xl font-extrabold text-stone-900 font-mono">
              {(dashboardData?.whereCanIHelp || []).length} {t("Slots Active", "જગ્યા ઉપલબ્ધ")}
            </p>
            <p className="text-xs text-stone-500">
              Kitchen &bull; Parking &bull; Audio
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
            <Link href="/seva" className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
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
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
            <h2 className="font-display text-lg sm:text-xl font-black text-stone-900">
              {t("What do I need to do?", "મારે શું કરવાનું છે?")}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shadow-sm">
            {(dashboardData?.whatDoINeedToDo || []).length} {t("Actions Pending", "કાર્યો બાકી")}
          </span>
        </div>

        {(dashboardData?.whatDoINeedToDo || []).length === 0 ? (
          <SpotlightCard variant="gold" className="p-8 text-center border-dashed border-emerald-300 bg-white/95">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-base font-bold text-stone-900">
              {t("All caught up! No pending urgent duties.", "બધાં કાર્યો પૂર્ણ છે! કોઈ પેન્ડિંગ કાર્ય નથી.")}
            </p>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              {t("Your current duties are fulfilled. Check open seva opportunities below to contribute.", "તમારી બધી જવાબદારીઓ અપ-ટૂ-ડેટ છે. યોગદાન આપવા નીચે ખુલ્લી સેવા જુઓ.")}
            </p>
          </SpotlightCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.whatDoINeedToDo.map((item: any) => (
              <SpotlightCard
                key={item.id}
                variant="default"
                className="border-l-4 border-l-amber-500 p-5 space-y-3 flex flex-col justify-between bg-white/95 border-stone-200/90 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-stone-900 line-clamp-1">
                      {language === "gu" && item.gujaratiTitle ? item.gujaratiTitle : item.title}
                    </span>
                    <Badge variant={item.urgency === "Critical" ? "danger" : "warning"} size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 hover:text-amber-800"
                  >
                    <span>{t("Take Action", "કાર્યવાહી કરો")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">
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
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
            <h2 className="font-display text-lg sm:text-xl font-black text-stone-900">
              {t("What is happening?", "મંદિરમાં શું ચાલી રહ્યું છે?")}
            </h2>
          </div>
          <Link href="/calendar" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
            <span>{t("View Full Calendar", "આખું કેલેન્ડર જુઓ")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upcoming Sabha Spotlight */}
          <SpotlightCard variant="default" className="p-5 space-y-4 border-l-4 border-l-sky-500 bg-white/95 border-stone-200/90 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-sky-600" /> {t("Upcoming Sabha", "આગામી સભા")}
              </span>
              <Badge variant="info" size="sm">Scheduled</Badge>
            </div>

            {dashboardData?.whatIsHappening?.upcomingSabhas?.[0] ? (
              <div className="space-y-2">
                <h4 className="font-display text-base font-bold text-stone-900">
                  {language === "gu" && dashboardData.whatIsHappening.upcomingSabhas[0].gujaratiTitle
                    ? dashboardData.whatIsHappening.upcomingSabhas[0].gujaratiTitle
                    : dashboardData.whatIsHappening.upcomingSabhas[0].title}
                </h4>
                <div className="space-y-1 text-xs text-stone-600">
                  <p className="flex items-center gap-1.5 font-mono">
                    <Clock className="h-3.5 w-3.5 text-sky-600" />
                    <span>{dashboardData.whatIsHappening.upcomingSabhas[0].date} &bull; {dashboardData.whatIsHappening.upcomingSabhas[0].startTime} - {dashboardData.whatIsHappening.upcomingSabhas[0].endTime}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-sky-600" />
                    <span>{dashboardData.whatIsHappening.upcomingSabhas[0].location}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">No upcoming sabha scheduled.</p>
            )}

            <div className="pt-2.5 border-t border-stone-100">
              <Link href="/sabha" className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800">
                <span>{t("Sabha Details & Attendance", "સભા વિગત અને હાજરી")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </SpotlightCard>

          {/* Transportation / Car Pooling Rides */}
          <SpotlightCard variant="default" className="p-5 space-y-4 border-l-4 border-l-emerald-500 bg-white/95 border-stone-200/90 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Car className="h-4 w-4 text-emerald-600" /> {t("Travel & Rides Available", "મુસાફરી અને રાઈડ")}
              </span>
              <Badge variant="success" size="sm">{t("Available Seats", "ઉપલબ્ધ સીટો")}</Badge>
            </div>

            {dashboardData?.whatIsHappening?.activeRides?.[0] ? (
              <div className="space-y-2">
                <h4 className="font-display text-base font-bold text-stone-900">
                  {dashboardData.whatIsHappening.activeRides[0].title}
                </h4>
                <div className="space-y-1 text-xs text-stone-600">
                  <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-emerald-600" />
                    {dashboardData.whatIsHappening.activeRides[0].driverName} &bull; {dashboardData.whatIsHappening.activeRides[0].vehicleModel}
                  </p>
                  <p className="flex items-center gap-1.5 font-mono">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t("Departs:", "પ્રસ્થાન:")} {dashboardData.whatIsHappening.activeRides[0].departureTime}</span>
                  </p>
                  <p className="text-emerald-700 font-bold font-mono">
                    {dashboardData.whatIsHappening.activeRides[0].availableSeats} {t("seats open for devotees", "સીટો ભક્તો માટે ઉપલબ્ધ")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">No active carpool rides listed.</p>
            )}

            <div className="pt-2.5 border-t border-stone-100">
              <Link href="/travel" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                <span>{t("Request / Offer Ride", "રાઈડ મેળવો / ઓફર કરો")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </SpotlightCard>

          {/* Mandir Announcement */}
          <SpotlightCard variant="default" className="p-5 space-y-4 border-l-4 border-l-amber-500 bg-white/95 border-stone-200/90 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-amber-600" /> {t("Mandir Notice", "મંદિર જાહેરાત")}
              </span>
              <Badge variant="warning" size="sm">Official</Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-display text-base font-bold text-stone-900">
                {language === "gu" ? "આગામી વિશેષ ઉત્સવ દર્શન સમય" : "Special Mahotsav Darshan Timings"}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === "gu"
                  ? "વિશેષ જન્માષ્ટમી મહોત્સવ સભા માટે સર્વે ભક્તોએ સાંજે ૬:૦૦ કલાકે સમયસર પધારવું. પલના ઉત્સવ અને મહાપ્રસાદ રહેશે."
                  : "All devotees are warmly welcomed for the Janmashtami Mahotsav at 6:00 PM. Includes Palna darshan & Mahaprasad."}
              </p>
            </div>

            <div className="pt-2.5 border-t border-stone-100">
              <Link href="/announcements" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800">
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
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
            <h2 className="font-display text-lg sm:text-xl font-black text-stone-900">
              {t("Where can I help?", "હું ક્યાં મદદ કરી શકું?")}
            </h2>
          </div>
          <Link href="/seva" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
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
                className="p-5 space-y-4 flex flex-col justify-between bg-white/95 border-stone-200/90 shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-stone-900 line-clamp-1">
                      {language === "gu" && seva.gujaratiTitle ? seva.gujaratiTitle : seva.title}
                    </span>
                    <Badge variant="primary" size="sm">
                      {seva.category || "Seva"}
                    </Badge>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                    {seva.description}
                  </p>

                  {/* Progress Capacity Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
                      <span>{t("Volunteers needed:", "જરૂરી સ્વયંસેવકો:")}</span>
                      <span className="font-mono font-bold text-amber-700">
                        {accepted} / {required}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-100 border border-stone-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] transition-all duration-500 shadow-sm"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span>{seva.startTime} - {seva.endTime}</span>
                    <span>&bull;</span>
                    <MapPin className="h-3 w-3 text-amber-600" />
                    <span>{seva.location || "Mandir"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  {isClaimed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl">
                      <Check className="h-4 w-4 text-emerald-600" /> {t("Registered for Seva", "સેવા માટે નોંધાયા")}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleClaimSeva(seva.title)}
                      leftIcon={<Sparkles className="h-3.5 w-3.5 text-white" />}
                    >
                      {t("I Can Help", "હું સેવા કરીશ")}
                    </Button>
                  )}
                  <Link href="/seva" className="text-xs font-bold text-stone-500 hover:text-stone-900">
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

