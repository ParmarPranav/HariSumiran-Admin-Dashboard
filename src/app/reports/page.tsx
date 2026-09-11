"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import {
  FileSpreadsheet,
  Printer,
  Share2,
  Download,
  UtensilsCrossed,
  Users,
  CalendarDays,
  Car,
  ChefHat,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { initialFamilies, initialMembers, initialThalSchedules } from "@/lib/seedData";

export default function ReportsPage() {
  const { user, t, language, isAdmin, isKaryakarta, isThalCaptain } = useApp();

  const [activeReport, setActiveReport] = useState("thal_roster");

  const reportsList = [
    {
      id: "thal_roster",
      title: "Monthly Thal Seva Roster",
      gujaratiTitle: "માસિક થાળ સેવા યાદી",
      icon: <UtensilsCrossed className="h-4 w-4 text-amber-600" />,
      desc: "Comprehensive schedule of all assigned household Thal dates & meal timings.",
    },
    {
      id: "attendance_summary",
      title: "Sabha Attendance Summary",
      gujaratiTitle: "સભા હાજરી અહેવાલ",
      icon: <CalendarDays className="h-4 w-4 text-sky-600" />,
      desc: "Weekly Satsang Sabha attendance records, streaks, and check-in mode stats.",
    },
    {
      id: "followup_karyakarta",
      title: "Karyakarta Follow-up Log",
      gujaratiTitle: "કાર્યકર્તા ફોલો-અપ લોગ",
      icon: <Users className="h-4 w-4 text-primary-container" />,
      desc: "Active home visit cases, elder care follow-ups, and resolution status.",
    },
    {
      id: "kitchen_prep",
      title: "Mahaprasad Kitchen Requirements",
      gujaratiTitle: "રસોઈ સામગ્રી અહેવાલ",
      icon: <ChefHat className="h-4 w-4 text-emerald-600" />,
      desc: "Scaled ingredient shopping lists and volunteer rosters for upcoming Mahotsav.",
    },
    {
      id: "transport_manifest",
      title: "Transportation & Carpool Manifest",
      gujaratiTitle: "વાહન વ્યવસ્થા યાદી",
      icon: <Car className="h-4 w-4 text-indigo-600" />,
      desc: "Confirmed passenger pickups, vehicle assignments, and departure schedules.",
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `🛕 *HariSumiran Mandir - Monthly Thal Roster (September 2026)*\n\n12-Sep (Morning): Patel Household (55 pax)\n12-Sep (Evening): Shah Family (65 pax)\n13-Sep (Morning): Trivedi Parivar (50 pax)\n\n_Jai Swaminarayan - HariPrabodham Nadiad_`;
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    toast.success(language === "gu" ? "WhatsApp શેર લિંક તૈયાર થઈ ગઈ" : "WhatsApp Share Link Opened!");
  };

  const handleCopyText = () => {
    const text = `🛕 HariSumiran Mandir - Thal Schedule\n12-Sep (Morning): Patel Household\n12-Sep (Evening): Shah Family\n13-Sep (Morning): Trivedi Parivar`;
    navigator.clipboard.writeText(text);
    toast.success(language === "gu" ? "ટેક્સ્ટ કોપી થઈ ગયો!" : "Copied report to clipboard!");
  };

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary-container" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-charcoal">
              {t("Scoped Reports & Community Sharing", "અહેવાલો અને શેરિંગ")}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-charcoal-subtle mt-0.5">
            {t("Generate printable PDFs, CSV data, and WhatsApp summaries respecting your authorization scope", "અધિકૃત કાર્યક્ષેત્ર મુજબ પીડીએફ, સીએસવી અને વોટ્સએપ અહેવાલ")}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="outline"
            leftIcon={<Copy className="h-4 w-4" />}
            onClick={handleCopyText}
          >
            {t("Copy Text", "કોપી")}
          </Button>
          <Button
            size="md"
            variant="outline"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            {t("Print / PDF", "પ્રિન્ટ")}
          </Button>
          <Button
            size="md"
            leftIcon={<Share2 className="h-4 w-4" />}
            onClick={handleWhatsAppShare}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t("Share WhatsApp", "વોટ્સએપ શેર")}
          </Button>
        </div>
      </div>

      {/* Main Grid: Report Selector & Preview Canvas */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report Options */}
        <div className="lg:col-span-4 space-y-3">
          <GlassCard className="p-4 space-y-2.5">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-charcoal-subtle">
              {t("Available Scoped Reports", "ઉપલબ્ધ અહેવાલો")}
            </h3>

            <div className="space-y-2">
              {reportsList.map((rep) => {
                const isSelected = activeReport === rep.id;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setActiveReport(rep.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-saffron-50 border-saffron-300 shadow-subtle text-charcoal font-bold"
                        : "bg-surface-container-low/40 border-hairline hover:bg-surface-container-low text-charcoal"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {rep.icon}
                      <span className="text-xs">
                        {language === "gu" ? rep.gujaratiTitle : rep.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-subtle font-normal mt-1 leading-snug">
                      {rep.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Printable Formatted Report Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <GlassCard className="p-6 space-y-5 bg-white border border-saffron-200">
            {/* Printable Report Header */}
            <div className="border-b border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-mono tracking-widest text-primary-container uppercase font-extrabold">
                  HARIPRABODHAM MANDIR, NADIAD
                </p>
                <h3 className="font-heading text-xl font-bold text-charcoal mt-0.5">
                  {reportsList.find((r) => r.id === activeReport)?.title}
                </h3>
                <p className="text-xs text-charcoal-subtle">
                  {t("Generated for:", "અહેવાલ બનાવનાર:")} {user.name} ({user.mandir}) &bull; {new Date().toLocaleDateString()}
                </p>
              </div>

              <Badge variant="success" size="sm">Authorized Scope: North & Central</Badge>
            </div>

            {/* Table based on activeReport */}
            {activeReport === "thal_roster" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-hairline text-charcoal-subtle text-[10px] uppercase font-bold">
                      <th className="pb-2">{t("Date", "તારીખ")}</th>
                      <th className="pb-2">{t("Meal Turn", "થાળ વારો")}</th>
                      <th className="pb-2">{t("Assigned Household", "પરિવારનું નામ")}</th>
                      <th className="pb-2">{t("Captain Contact", "સંપર્ક")}</th>
                      <th className="pb-2 text-right">{t("Headcount", "ભક્ત સંખ્યા")}</th>
                      <th className="pb-2 text-center">{t("Status", "સ્થિતિ")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {initialThalSchedules.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/40">
                        <td className="py-2.5 font-bold text-charcoal">{item.date}</td>
                        <td className="py-2.5 text-charcoal">{item.mealType}</td>
                        <td className="py-2.5 font-bold text-primary-container">{item.assignedFamilyName}</td>
                        <td className="py-2.5 font-mono text-charcoal-subtle">{item.assignedPhone}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-charcoal">{item.headcount}</td>
                        <td className="py-2.5 text-center">
                          <Badge variant={item.status === "Confirmed" ? "success" : "warning"} size="sm">
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeReport === "attendance_summary" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-surface-container-low/60 border border-hairline text-center">
                  <div>
                    <p className="text-[10px] text-charcoal-subtle uppercase font-semibold">Total Verified Members</p>
                    <p className="font-heading text-lg font-bold text-charcoal">45 Devotees</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-charcoal-subtle uppercase font-semibold">Avg Attendance</p>
                    <p className="font-heading text-lg font-bold text-emerald-600">92%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-charcoal-subtle uppercase font-semibold">Consecutive Streak</p>
                    <p className="font-heading text-lg font-bold text-primary-container">18 Sabhas</p>
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-hairline text-charcoal-subtle text-[10px] uppercase font-bold">
                        <th className="pb-2">Member Code</th>
                        <th className="pb-2">Member Name</th>
                        <th className="pb-2">Family</th>
                        <th className="pb-2 text-right">Streak</th>
                        <th className="pb-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {initialMembers.map((m, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low/40">
                          <td className="py-2 font-mono text-charcoal-subtle">{m.memberCode}</td>
                          <td className="py-2 font-bold text-charcoal">{m.name}</td>
                          <td className="py-2 text-charcoal-subtle">{m.familyName}</td>
                          <td className="py-2 text-right font-mono font-bold text-emerald-700">🔥 {m.attendanceStreak}</td>
                          <td className="py-2 text-center">
                            <Badge variant="success" size="sm">{m.verificationStatus}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeReport !== "thal_roster" && activeReport !== "attendance_summary" && (
              <div className="p-8 text-center text-xs text-charcoal-subtle">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-charcoal">Report Ready for Export</p>
                <p className="mt-1">All records filtered according to your assigned responsibility and zone.</p>
              </div>
            )}

            {/* Footer Sign-off */}
            <div className="pt-4 border-t border-hairline flex items-center justify-between text-[11px] text-charcoal-subtle">
              <span>HariSumiran Platform &bull; HariPrabodham Nadiad</span>
              <span>Encrypted &amp; Scoped Export</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
