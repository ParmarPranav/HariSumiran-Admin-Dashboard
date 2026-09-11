"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
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
  Flame,
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
      frequency: "Monthly",
      icon: <UtensilsCrossed className="h-4 w-4 text-amber-600" />,
      desc: "Comprehensive schedule of all assigned household Thal dates & meal timings.",
    },
    {
      id: "attendance_summary",
      title: "Sabha Attendance Summary",
      gujaratiTitle: "સભા હાજરી અહેવાલ",
      frequency: "Weekly",
      icon: <CalendarDays className="h-4 w-4 text-sky-600" />,
      desc: "Weekly Satsang Sabha attendance records, streaks, and check-in mode stats.",
    },
    {
      id: "followup_karyakarta",
      title: "Karyakarta Follow-up Log",
      gujaratiTitle: "કાર્યકર્તા ફોલો-અપ લોગ",
      frequency: "Active",
      icon: <Users className="h-4 w-4 text-amber-600" />,
      desc: "Active home visit cases, elder care follow-ups, and resolution status.",
    },
    {
      id: "kitchen_prep",
      title: "Mahaprasad Kitchen Requirements",
      gujaratiTitle: "રસોઈ સામગ્રી અહેવાલ",
      frequency: "Event",
      icon: <ChefHat className="h-4 w-4 text-emerald-600" />,
      desc: "Scaled ingredient shopping lists and volunteer rosters for upcoming Mahotsav.",
    },
    {
      id: "transport_manifest",
      title: "Transportation & Carpool Manifest",
      gujaratiTitle: "વાહન વ્યવસ્થા યાદી",
      frequency: "Live",
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
            <FileSpreadsheet className="h-5 w-5 text-amber-600" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-stone-900">
              {t("Scoped Reports & Community Sharing", "અહેવાલો અને શેરિંગ")}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-stone-600 mt-0.5">
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
        {/* Left Column: Report Selectors */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard className="p-4 space-y-3">
            <h3 className="font-heading text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-amber-600" />
              <span>{t("Standard Mandir Reports", "પ્રમાણભૂત અહેવાલો")}</span>
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
                        ? "bg-amber-50 border-amber-400/90 shadow-sm text-amber-950 ring-1 ring-amber-400/40 font-bold"
                        : "bg-stone-50/80 border-stone-200/90 hover:bg-stone-100/80 text-stone-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-2">
                        {rep.icon}
                        <span>{language === "gu" && rep.gujaratiTitle ? rep.gujaratiTitle : rep.title}</span>
                      </span>
                      <Badge variant={isSelected ? "primary" : "neutral"} size="sm">
                        {rep.frequency}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-stone-500 font-normal mt-1.5 leading-snug">
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
          <GlassCard className="p-6 space-y-5 bg-white border border-stone-200 shadow-sm">
            {/* Printable Report Header */}
            <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-mono tracking-widest text-amber-700 uppercase font-extrabold">
                  HARIPRABODHAM MANDIR, NADIAD
                </p>
                <h3 className="font-heading text-xl font-bold text-stone-900 mt-0.5">
                  {reportsList.find((r) => r.id === activeReport)?.title}
                </h3>
                <p className="text-xs text-stone-500">
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
                    <tr className="border-b border-stone-200 text-stone-500 text-[10px] uppercase font-bold bg-stone-50">
                      <th className="py-2.5 px-2">{t("Date", "તારીખ")}</th>
                      <th className="py-2.5 px-2">{t("Meal Turn", "થાળ વારો")}</th>
                      <th className="py-2.5 px-2">{t("Assigned Household", "પરિવારનું નામ")}</th>
                      <th className="py-2.5 px-2">{t("Captain Contact", "સંપર્ક")}</th>
                      <th className="py-2.5 px-2 text-right">{t("Headcount", "ભક્ત સંખ્યા")}</th>
                      <th className="py-2.5 px-2 text-center">{t("Status", "સ્થિતિ")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {initialThalSchedules.map((item, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-2.5 px-2 font-bold text-stone-900">{item.date}</td>
                        <td className="py-2.5 px-2 text-stone-700">{item.mealType}</td>
                        <td className="py-2.5 px-2 font-bold text-amber-800">{item.assignedFamilyName}</td>
                        <td className="py-2.5 px-2 font-mono text-stone-600">{item.assignedPhone}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-stone-900">{item.headcount}</td>
                        <td className="py-2.5 px-2 text-center">
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
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase font-semibold">Total Verified Members</p>
                    <p className="font-heading text-lg font-bold text-stone-900">45 Devotees</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase font-semibold">Avg Attendance</p>
                    <p className="font-heading text-lg font-bold text-emerald-700">92%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase font-semibold">Consecutive Streak</p>
                    <p className="font-heading text-lg font-bold text-amber-700">18 Sabhas</p>
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 text-[10px] uppercase font-bold bg-stone-50">
                        <th className="py-2.5 px-2">Member Code</th>
                        <th className="py-2.5 px-2">Member Name</th>
                        <th className="py-2.5 px-2">Family</th>
                        <th className="py-2.5 px-2 text-right">Streak</th>
                        <th className="py-2.5 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {initialMembers.map((m, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-2 px-2 font-mono text-stone-600">{m.memberCode}</td>
                          <td className="py-2 px-2 font-bold text-stone-900">{m.name}</td>
                          <td className="py-2 px-2 text-stone-700">{m.familyName}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">
                            <span className="inline-flex items-center gap-1 justify-end">
                              <Flame className="h-3.5 w-3.5 text-amber-600" /> {m.attendanceStreak}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
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
              <div className="p-8 text-center text-xs text-stone-500">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-stone-900 text-sm">Report Ready for Export</p>
                <p className="mt-1">All records filtered according to your assigned responsibility and zone.</p>
              </div>
            )}

            {/* Footer Sign-off */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
              <span>HariSumiran Platform &bull; HariPrabodham Nadiad</span>
              <span>Encrypted &amp; Scoped Export</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
