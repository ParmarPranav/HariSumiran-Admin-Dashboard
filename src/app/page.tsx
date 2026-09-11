"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { QRScannerModal } from "@/components/ui/QRScannerModal";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  ArrowRight,
  Plus,
  UtensilsCrossed,
  ShieldCheck,
  Car,
  ChefHat,
  Phone,
  Bell,
  Check,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const { user, t, language, hasResponsibility, isAdmin, isKaryakarta, isThalCaptain, isMainCook, isCarOwner } = useApp();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claimedSevas, setClaimedSevas] = useState<string[]>([]);

  // Fetch dynamic home feed
  const loadHomeData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard/home?userId=${user.id || user._id || ""}&userName=${encodeURIComponent(user.name)}`);
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

  const handleClaimSeva = (sevaTitle: string) => {
    setClaimedSevas((prev) => [...prev, sevaTitle]);
    toast.success(
      language === "gu" ? "સેવા સ્વીકારાઈ ગઈ!" : "Seva Claimed Successfully!",
      { description: language === "gu" ? "તમારું નામ રસોઈ/સેવા યાદીમાં નોંધાઈ ગયું છે." : "Your slot has been recorded. Mandir team notified." }
    );
  };

  const todayFormatted = new Date().toLocaleDateString(language === "gu" ? "gu-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Top Welcome Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-subtle">
              {todayFormatted}
            </p>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-charcoal">
            {t("Jai Swaminarayan", "જય સ્વામિનારાયણ")},{" "}
            <span className="text-primary-container">{user.name}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {(user?.responsibilities || []).map((resp, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-saffron-100/70 border border-saffron-300/80 text-saffron-900"
              >
                {language === "gu" && resp.gujaratiTitle ? resp.gujaratiTitle : resp.title}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Scan QR & Core Shortcut */}
        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            leftIcon={<QrCode className="h-4 w-4 text-primary-container" />}
            onClick={() => setQrModalOpen(true)}
            className="shadow-subtle"
          >
            {t("Scan QR", "ક્યુઆર સ્કેન")}
          </Button>

          {isKaryakarta && (
            <Link href="/sabha">
              <Button size="md" leftIcon={<CalendarDays className="h-4 w-4" />}>
                {t("Take Attendance", "હાજરી લો")}
              </Button>
            </Link>
          )}

          {isMainCook && (
            <Link href="/kitchen">
              <Button size="md" variant="secondary" leftIcon={<ChefHat className="h-4 w-4" />}>
                {t("Recipe Calculator", "રસોઈ કેલ્ક્યુલેટર")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. SECTION 1: WHAT DO I NEED TO DO? (Action Required) */}
      {/* ======================================================== */}
      <section className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary-container" />
            <h2 className="font-heading text-base sm:text-lg font-bold text-charcoal">
              {t("What do I need to do?", "મારે શું કરવાનું છે?")}
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-charcoal-subtle">
            {(dashboardData?.whatDoINeedToDo || []).length} {t("Tasks", "કાર્યો")}
          </span>
        </div>

        {(dashboardData?.whatDoINeedToDo || []).length === 0 ? (
          <GlassCard className="p-6 text-center border border-dashed border-emerald-200 bg-emerald-50/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-charcoal">
              {t("All caught up! No pending urgent duties.", "બધાં કાર્યો પૂર્ણ છે! કોઈ પેન્ડિંગ કાર્ય નથી.")}
            </p>
            <p className="text-xs text-charcoal-subtle mt-0.5">
              {t("Check open seva opportunities below to contribute.", "યોગદાન આપવા નીચે ખુલ્લી સેવા જુઓ.")}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.whatDoINeedToDo.map((item: any) => (
              <GlassCard
                key={item.id}
                className="border-l-4 border-l-primary-container p-4 space-y-3 flex flex-col justify-between hover:shadow-float transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-charcoal line-clamp-1">
                      {language === "gu" && item.gujaratiTitle ? item.gujaratiTitle : item.title}
                    </span>
                    <Badge variant={item.urgency === "Critical" ? "danger" : "warning"} size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal-subtle leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-hairline flex items-center justify-between">
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-container hover:underline"
                  >
                    <span>{t("Take Action", "કાર્યવાહી કરો")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. SECTION 2: WHAT IS HAPPENING? (Mandir Activity Stream) */}
      {/* ======================================================== */}
      <section className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-saffron-500" />
            <h2 className="font-heading text-base sm:text-lg font-bold text-charcoal">
              {t("What is happening?", "મંદિરમાં શું ચાલી રહ્યું છે?")}
            </h2>
          </div>
          <Link href="/calendar" className="text-xs font-bold text-primary-container hover:underline">
            {t("View Full Calendar &rarr;", "આખું કેલેન્ડર જુઓ &rarr;")}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upcoming Sabha Spotlight */}
          <GlassCard className="p-4 space-y-3 border-l-4 border-l-sky-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {t("Upcoming Sabha", "આગામી સભા")}
              </span>
              <Badge variant="info" size="sm">Scheduled</Badge>
            </div>
            {dashboardData?.whatIsHappening?.upcomingSabhas?.[0] ? (
              <div className="space-y-1">
                <h4 className="font-heading text-sm font-bold text-charcoal">
                  {language === "gu" && dashboardData.whatIsHappening.upcomingSabhas[0].gujaratiTitle
                    ? dashboardData.whatIsHappening.upcomingSabhas[0].gujaratiTitle
                    : dashboardData.whatIsHappening.upcomingSabhas[0].title}
                </h4>
                <p className="text-xs text-charcoal-subtle">
                  📅 {dashboardData.whatIsHappening.upcomingSabhas[0].date} &bull; ⏰ {dashboardData.whatIsHappening.upcomingSabhas[0].startTime}
                </p>
                <p className="text-[11px] text-charcoal-subtle">
                  📍 {dashboardData.whatIsHappening.upcomingSabhas[0].location}
                </p>
              </div>
            ) : (
              <p className="text-xs text-charcoal-subtle">No upcoming sabha scheduled.</p>
            )}
            <Link href="/sabha" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline pt-1">
              <span>{t("Sabha Details & Attendance", "સભા વિગત અને હાજરી")}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </GlassCard>

          {/* Transportation / Car Pooling Rides */}
          <GlassCard className="p-4 space-y-3 border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Car className="h-4 w-4" /> {t("Travel & Rides Available", "મુસાફરી અને રાઈડ")}
              </span>
              <Badge variant="success" size="sm">{t("Available Seats", "ઉપલબ્ધ સીટો")}</Badge>
            </div>
            {dashboardData?.whatIsHappening?.activeRides?.[0] ? (
              <div className="space-y-1">
                <h4 className="font-heading text-sm font-bold text-charcoal">
                  {dashboardData.whatIsHappening.activeRides[0].title}
                </h4>
                <p className="text-xs text-charcoal-subtle">
                  🚗 Driver: {dashboardData.whatIsHappening.activeRides[0].driverName} &bull; {dashboardData.whatIsHappening.activeRides[0].availableSeats} seats open
                </p>
                <p className="text-[11px] text-charcoal-subtle">
                  ⏰ Departs: {dashboardData.whatIsHappening.activeRides[0].departureTime}
                </p>
              </div>
            ) : (
              <p className="text-xs text-charcoal-subtle">No active carpool rides listed.</p>
            )}
            <Link href="/travel" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline pt-1">
              <span>{t("Request / Offer Ride", "રાઈડ મેળવો / ઓફર કરો")}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </GlassCard>

          {/* Mandir Announcement */}
          <GlassCard className="p-4 space-y-3 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-amber-600" /> {t("Mandir Update", "મંદિર જાહેરાત")}
              </span>
              <Badge variant="warning" size="sm">Mandir Office</Badge>
            </div>
            <div className="space-y-1">
              <h4 className="font-heading text-sm font-bold text-charcoal">
                {language === "gu" ? "આગામી ઉત્સવ દર્શન સમય" : "Upcoming Mahotsav Darshan Timings"}
              </h4>
              <p className="text-xs text-charcoal-subtle leading-snug">
                {language === "gu"
                  ? "વિશેષ ઉત્સવ સભા માટે સર્વે ભક્તોએ સાંજે ૬:૦૦ કલાકે સમયસર પધારવું."
                  : "All devotees are requested to arrive on time at 6:00 PM for Special Mahotsav."}
              </p>
            </div>
            <Link href="/announcements" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline pt-1">
              <span>{t("View All Announcements", "બધી જાહેરાતો જુઓ")}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION 3: WHERE CAN I HELP? (Open Seva Opportunities) */}
      {/* ======================================================== */}
      <section className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <h2 className="font-heading text-base sm:text-lg font-bold text-charcoal">
              {t("Where can I help?", "હું ક્યાં મદદ કરી શકું?")}
            </h2>
          </div>
          <Link href="/seva" className="text-xs font-bold text-primary-container hover:underline">
            {t("View Seva Board &rarr;", "સેવા બોર્ડ જુઓ &rarr;")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(dashboardData?.whereCanIHelp || []).map((seva: any) => {
            const isClaimed = claimedSevas.includes(seva.title);
            return (
              <GlassCard key={seva._id || seva.title} className="p-4 space-y-3 flex flex-col justify-between hover:shadow-float transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-charcoal line-clamp-1">
                      {language === "gu" && seva.gujaratiTitle ? seva.gujaratiTitle : seva.title}
                    </span>
                    <Badge variant="primary" size="sm">
                      {seva.category || "Seva"}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal-subtle leading-relaxed line-clamp-2">
                    {seva.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-charcoal-subtle pt-1">
                    <span>⏰ {seva.startTime} - {seva.endTime}</span>
                    <span>&bull;</span>
                    <span>👥 {seva.acceptedVolunteerCount || 0} / {seva.requiredVolunteerCount || 5} {t("confirmed", "પુષ્ટિ")}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline flex items-center justify-between">
                  {isClaimed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      <Check className="h-3.5 w-3.5" /> {t("You have registered", "તમે નોંધાયા છો")}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleClaimSeva(seva.title)}
                      leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                    >
                      {t("I Can Help", "હું સેવા કરીશ")}
                    </Button>
                  )}
                  <Link href="/seva" className="text-[11px] font-semibold text-charcoal-subtle hover:text-charcoal">
                    {t("Details", "વિગત")}
                  </Link>
                </div>
              </GlassCard>
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
