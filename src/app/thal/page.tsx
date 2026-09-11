"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  UtensilsCrossed,
  Calendar as CalendarIcon,
  CalendarDays,
  Home,
  ArrowLeftRight,
  Award,
  ChefHat,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Search,
  Phone,
  Filter,
  Grid,
  List as ListIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function ThalPage() {
  const { role, user, language } = useApp();
  const isAdmin = role === "super_admin" || role === "mandir_admin" || role === "dept_head";

  const [schedules, setSchedules] = useState<any[]>([]);
  const [fairnessRanking, setFairnessRanking] = useState<any[]>([]);
  const [swapRequests, setSwapRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("2026-09"); // September 2026

  const [activeTab, setActiveTab] = useState<"monthly_plan" | "my_turns" | "swap_requests" | "fairness">(
    isAdmin ? "monthly_plan" : "my_turns"
  );

  // View Mode: Grid (Calendar) or List
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [searchQuery, setSearchQuery] = useState("");
  const [mealFilter, setMealFilter] = useState<"all" | "morning" | "evening">("all");

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [dateDetailModalOpen, setDateDetailModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Assignment Form State
  const [assignDate, setAssignDate] = useState("2026-09-10");
  const [assignMeal, setAssignMeal] = useState("Breakfast (Morning Thal)");
  const [assignedFamilyName, setAssignedFamilyName] = useState("Patel Household (Rameshbhai)");

  // Swap Request Form State
  const [swapType, setSwapType] = useState<"family_to_family" | "admin_open_swap">("admin_open_swap");
  const [targetFamilyName, setTargetFamilyName] = useState("");
  const [swapReason, setSwapReason] = useState("");

  const fetchData = () => {
    setLoading(true);
    // Fetch Schedules
    fetch(`/api/thal?month=${selectedMonth}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchedules(data.schedules || []);
          setFairnessRanking(data.fairnessRanking || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch Swaps
    fetch("/api/thal/swap")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSwapRequests(data.swapRequests || []);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  useEffect(() => {
    if (isAdmin && activeTab === "my_turns") {
      setActiveTab("monthly_plan");
    }
  }, [isAdmin, activeTab]);

  // Auto Generate September / Monthly Plan
  const handleAutoGenerateMonthlyPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/thal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto_generate", month: selectedMonth }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Generated ${data.createdCount || 60} Thal Turns for ${selectedMonth}!`, {
          description: "Breakfast and Dinner turns distributed fairly across 30 active families.",
        });
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (e: any) {
      toast.error("Auto generation failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Assign Single Thal Turn
  const handleAssignThal = async () => {
    if (!assignDate || !assignedFamilyName) return;
    try {
      const res = await fetch("/api/thal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: assignDate,
          mealType: assignMeal,
          assignedFamilyName,
          assignedPhone: "9825056789",
        }),
      });
      const data = await res.json();
      if (data.conflict || !data.success) {
        toast.error(data.error || "Assignment conflict");
        return;
      }
      toast.success("Thal turn assigned successfully");
      setAssignModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error("Assignment failed: " + e.message);
    }
  };

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Confirm Turn & Persist to Database
  const handleConfirmTurn = async (id: string) => {
    setConfirmingId(id);
    try {
      const res = await fetch("/api/thal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Confirmed" }),
      });
      const data = await res.json();
      setConfirmingId(null);
      if (res.ok && data.success) {
        toast.success("Thal turn confirmed & saved!", {
          description: "Persisted to MongoDB Atlas. Kitchen team notified.",
        });
        fetchData();
      } else {
        toast.error(data.error || "Failed to confirm turn");
      }
    } catch (e: any) {
      setConfirmingId(null);
      toast.error("Action failed: " + e.message);
    }
  };

  // Submit Swap Request
  const handleRequestSwap = async () => {
    if (!selectedSchedule || !swapReason) {
      toast.error("Please provide a reason for the swap request.");
      return;
    }
    try {
      const res = await fetch("/api/thal/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thalScheduleId: selectedSchedule._id,
          originalDate: selectedSchedule.date,
          mealType: selectedSchedule.mealType,
          requestingFamilyName: selectedSchedule.assignedFamilyName,
          swapType,
          targetFamilyName: swapType === "family_to_family" ? targetFamilyName : undefined,
          reason: swapReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Swap request submitted");
        setSwapModalOpen(false);
        setSwapReason("");
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (e: any) {
      toast.error("Swap request failed: " + e.message);
    }
  };

  // Handle Admin Swap Approval / Rejection
  const handleSwapAction = async (swapId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/thal/swap", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swapId,
          action,
          coordinatorNotes: action === "approve" ? "Approved by Mandir Admin" : "Declined by Mandir Admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Swap request ${action === "approve" ? "Approved" : "Rejected"}`);
        fetchData();
      }
    } catch (e: any) {
      toast.error("Action failed: " + e.message);
    }
  };

  // User Family turns
  const myFamilyName = user.familyName || "Patel Household (Rameshbhai)";
  const myFamilyTurns = schedules.filter(
    (s) => s.assignedFamilyName.toLowerCase() === myFamilyName.toLowerCase()
  );

  // Today's Date Calculation (September 6, 2026)
  const todayDateStr = "2026-09-06";
  const todayMorningTurn = schedules.find(
    (s) => s.date === todayDateStr && (s.mealType?.includes("Breakfast") || s.mealType?.includes("Morning"))
  ) || schedules.find((s) => s.mealType?.includes("Breakfast") || s.mealType?.includes("Morning"));

  const todayEveningTurn = schedules.find(
    (s) => s.date === todayDateStr && (s.mealType?.includes("Dinner") || s.mealType?.includes("Evening"))
  ) || schedules.find((s) => s.mealType?.includes("Dinner") || s.mealType?.includes("Evening"));

  // Calendar Days Grid Construction for September 2026 (Starts on Tuesday, Sept 1 = 30 Days)
  // Day of week index for Sept 1, 2026 is Tuesday (index 2: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  const daysInSeptember = 30;
  const startDayOffset = 2; // September 1, 2026 is Tuesday

  // Filtered schedules for search
  const filteredSchedules = schedules.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.assignedFamilyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date?.includes(searchQuery);
    const matchesMeal =
      mealFilter === "all" ||
      (mealFilter === "morning" && item.mealType?.includes("Breakfast")) ||
      (mealFilter === "evening" && item.mealType?.includes("Dinner"));
    return matchesSearch && matchesMeal;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 🌟 TODAY'S WHOSE TURN FEATURED BANNER */}
      <SpotlightCard
        spotlightColor="rgba(245, 158, 11, 0.08)"
        className="p-6 space-y-4 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border-amber-300/80 shadow-md backdrop-blur-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="font-display text-lg font-black text-stone-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-amber-600" />
              Today's Thal Seva Turn &mdash; Sunday, September 6, 2026
            </h2>
          </div>
          <Badge variant="primary" size="md">
            30 Active Parivars Assigned
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today's Morning Thal Card */}
          <SpotlightCard
            spotlightColor="rgba(245, 158, 11, 0.1)"
            className="p-4 rounded-2xl border border-amber-300/80 bg-white/95 shadow-sm space-y-3 relative overflow-hidden backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-[#FF7A00] to-[#EA580C] text-white text-[10px] font-black rounded-bl-xl uppercase tracking-wider shadow-sm">
              Morning Thal
            </div>
            <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs">
              <Sun className="h-4 w-4 text-amber-600" /> Breakfast (Morning Thal) &bull; 07:30 AM
            </div>
            {todayMorningTurn ? (
              <div className="space-y-2">
                <div>
                  <h3 className="font-display text-lg font-black text-stone-900">
                    {todayMorningTurn.assignedFamilyName}
                  </h3>
                  <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                    Captain: <strong className="text-stone-900">{todayMorningTurn.captainName || "Rameshbhai Patel"}</strong>
                    &bull; <Phone className="h-3 w-3 text-amber-600" /> +91 {todayMorningTurn.assignedPhone}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-stone-600 font-medium">
                    Headcount: <strong className="text-stone-900 font-mono font-bold">{todayMorningTurn.headcount || 45} Devotees</strong>
                  </span>
                  <Badge variant={todayMorningTurn.status === "Confirmed" ? "success" : "warning"} size="sm">
                    {todayMorningTurn.status}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-stone-800 leading-snug flex items-start gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900">Menu:</strong> {todayMorningTurn.specialInstructions || "Puri, Shrikhand, Bataka nu Shaak, Dal Bhat"}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">No Morning Thal turn scheduled for today.</p>
            )}
          </SpotlightCard>

          {/* Today's Evening Thal Card */}
          <SpotlightCard
            spotlightColor="rgba(249, 115, 22, 0.1)"
            className="p-4 rounded-2xl border border-orange-200 bg-white/95 shadow-sm space-y-3 relative overflow-hidden backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black rounded-bl-xl uppercase tracking-wider shadow-sm">
              Evening Thal
            </div>
            <div className="flex items-center gap-2 text-orange-700 font-extrabold text-xs">
              <Moon className="h-4 w-4 text-orange-600" /> Dinner (Evening Thal) &bull; 07:30 PM
            </div>
            {todayEveningTurn ? (
              <div className="space-y-2">
                <div>
                  <h3 className="font-display text-lg font-black text-stone-900">
                    {todayEveningTurn.assignedFamilyName}
                  </h3>
                  <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-orange-600" />
                    Captain: <strong className="text-stone-900">{todayEveningTurn.captainName || "Mukeshbhai Shah"}</strong>
                    &bull; <Phone className="h-3 w-3 text-orange-600" /> +91 {todayEveningTurn.assignedPhone}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-stone-600 font-medium">
                    Headcount: <strong className="text-stone-900 font-mono font-bold">{todayEveningTurn.headcount || 50} Devotees</strong>
                  </span>
                  <Badge variant={todayEveningTurn.status === "Confirmed" ? "success" : "warning"} size="sm">
                    {todayEveningTurn.status}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[11px] text-stone-800 leading-snug flex items-start gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-orange-900">Menu:</strong> {todayEveningTurn.specialInstructions || "Khichdi, Kadhi, Ringan Bharta, Sukhdi"}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">No Evening Thal turn scheduled for today.</p>
            )}
          </SpotlightCard>
        </div>
      </SpotlightCard>

      {/* Main Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-amber-600" />
            <h1 className="font-heading text-2xl font-black text-stone-900">
              {language === "gu" ? "થાળ પરિભ્રમણ અને સેવા (સવાર અને સાંજ)" : "Thal Rotation - September 2026"}
            </h1>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Interactive monthly calendar plan across 30 Nadiad families, RSVPs, 1-day alerts &amp; swap queue
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <Button
              size="md"
              variant="outline"
              onClick={handleAutoGenerateMonthlyPlan}
              isLoading={loading}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Auto-Generate September Plan
            </Button>
            <Button
              size="md"
              onClick={() => setAssignModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Assign Turn
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Tabs (iOS SF-Segmented Pill Bar) */}
      <div className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-stone-100 border border-stone-200 shadow-inner">
        {isAdmin && (
          <button
            onClick={() => setActiveTab("monthly_plan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === "monthly_plan"
                ? "bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white shadow-md font-bold"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
            }`}
          >
            <CalendarDays className="h-4 w-4 stroke-[2]" />
            <span>September Calendar ({schedules.length} Slots)</span>
          </button>
        )}

        {!isAdmin && (
          <button
            onClick={() => setActiveTab("my_turns")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === "my_turns"
                ? "bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white shadow-md font-bold"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
            }`}
          >
            <Home className="h-4 w-4 stroke-[2]" />
            <span>My Family Turns ({myFamilyTurns.length})</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveTab("swap_requests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === "swap_requests"
                ? "bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white shadow-md font-bold"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4 stroke-[2]" />
            <span>Swap Requests ({swapRequests.filter((s) => s.status === "Pending Coordinator").length} Pending)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("fairness")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeTab === "fairness"
              ? "bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white shadow-md font-bold"
              : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
          }`}
        >
          <Award className="h-4 w-4 stroke-[2]" />
          <span>Family Rotation Fairness (30 Parivars)</span>
        </button>
      </div>

      {/* TAB 1: Monthly Calendar Plan (Interactive Calendar View) */}
      {activeTab === "monthly_plan" && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search family name (e.g. Patel, Shah, Trivedi)..."
                className="w-full h-9 rounded-xl border border-stone-200 pl-9 pr-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-stone-50 placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filters & View Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={mealFilter}
                onChange={(e: any) => setMealFilter(e.target.value)}
                className="h-9 rounded-xl border border-stone-200 px-3 text-xs font-semibold text-stone-800 bg-stone-50 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Meals (Morning &amp; Evening)</option>
                <option value="morning">Morning Thal Only</option>
                <option value="evening">Evening Thal Only</option>
              </select>

              <div className="flex items-center rounded-xl border border-stone-200 p-0.5 bg-stone-100">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === "calendar"
                      ? "bg-white text-stone-900 shadow-sm font-bold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" /> Calendar View
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-stone-900 shadow-sm font-bold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <ListIcon className="h-3.5 w-3.5" /> List View
                </button>
              </div>
            </div>
          </div>

          {/* INTERACTIVE CALENDAR MONTH GRID VIEW */}
          {viewMode === "calendar" ? (
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-4 md:p-6 space-y-4 overflow-x-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-xl font-black text-stone-900">September 2026</h3>
                  <Badge variant="primary" size="sm">
                    30 Days &bull; 60 Thal Turns
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" /> Confirmed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm" /> Assigned
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm" /> Declined / Swap
                  </span>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-500 tracking-wider uppercase border-b border-stone-100 pb-2 min-w-[700px]">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* 30-Day Grid */}
              <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                {/* Blank cells before Sept 1 */}
                {Array.from({ length: startDayOffset }).map((_, idx) => (
                  <div key={`blank-${idx}`} className="h-28 rounded-2xl bg-stone-50/50 border border-dashed border-stone-200 opacity-60" />
                ))}

                {/* September 1 to 30 Cells */}
                {Array.from({ length: daysInSeptember }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                  const dateStr = `2026-09-${dayStr}`;
                  const isToday = dayNum === 6;

                  const morningTurn = schedules.find(
                    (s) => s.date === dateStr && (s.mealType?.includes("Breakfast") || s.mealType?.includes("Morning"))
                  );
                  const eveningTurn = schedules.find(
                    (s) => s.date === dateStr && (s.mealType?.includes("Dinner") || s.mealType?.includes("Evening"))
                  );

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        setSelectedCalendarDate(dateStr);
                        setDateDetailModalOpen(true);
                      }}
                      className={`group relative min-h-[115px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md hover:scale-[1.02] ${
                        isToday
                          ? "border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/40 shadow-sm"
                          : "border-stone-200/90 bg-white hover:bg-amber-50/30 hover:border-amber-300"
                      }`}
                    >
                      {/* Top Day Bar */}
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-xs font-black ${isToday ? "text-amber-800" : "text-stone-800"}`}>
                          {dayStr}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#EA580C] text-white shadow-sm">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Morning & Evening Meal Badges */}
                      <div className="space-y-1.5 my-1">
                        {/* Morning Slot */}
                        {mealFilter !== "evening" && (
                          <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-200/90 text-[10px] leading-tight font-semibold flex items-center justify-between text-amber-900 group-hover:bg-amber-100/70 transition-colors">
                            <div className="truncate flex items-center gap-1">
                              <Sun className="h-3 w-3 text-amber-600 shrink-0" />
                              <span className="truncate">{morningTurn ? morningTurn.assignedFamilyName.split(" ")[0] : "Unassigned"}</span>
                            </div>
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                morningTurn?.status === "Confirmed"
                                  ? "bg-emerald-500 shadow-sm"
                                  : morningTurn?.status === "Declined"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                              }`}
                            />
                          </div>
                        )}

                        {/* Evening Slot */}
                        {mealFilter !== "morning" && (
                          <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-200/90 text-[10px] leading-tight font-semibold flex items-center justify-between text-orange-900 group-hover:bg-orange-100/70 transition-colors">
                            <div className="truncate flex items-center gap-1">
                              <Moon className="h-3 w-3 text-orange-600 shrink-0" />
                              <span className="truncate">{eveningTurn ? eveningTurn.assignedFamilyName.split(" ")[0] : "Unassigned"}</span>
                            </div>
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                eveningTurn?.status === "Confirmed"
                                  ? "bg-emerald-500 shadow-sm"
                                  : eveningTurn?.status === "Declined"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      <div className="text-[9px] text-stone-500 font-mono text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details &rarr;
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* LIST VIEW MODE */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedules.map((item) => {
                const isBreakfast = item.mealType?.includes("Breakfast") || item.mealType?.includes("Morning");
                const isConfirmed = item.status === "Confirmed";
                const isDeclined = item.status === "Declined";

                return (
                  <GlassCard key={item._id} hoverEffect className="p-5 space-y-3 flex flex-col justify-between bg-white border-stone-200/90 shadow-sm">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-xs font-bold text-stone-500">{item.scheduleCode}</span>
                        <Badge
                          variant={
                            isConfirmed ? "success" : isDeclined ? "danger" : "warning"
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {isBreakfast ? (
                          <Sun className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Moon className="h-4 w-4 text-orange-600" />
                        )}
                        <span className="text-xs font-bold text-amber-800">
                          {item.mealType}
                        </span>
                      </div>

                      <h3 className="font-heading text-base font-black text-stone-900 leading-tight">
                        {item.assignedFamilyName}
                      </h3>

                      <p className="text-xs text-stone-600 flex items-center gap-1 font-medium">
                        <CalendarIcon className="h-3.5 w-3.5 text-amber-600" /> Date: {item.date}
                      </p>

                      <div className="space-y-1 text-xs text-stone-600 pt-1">
                        <p><strong>Captain Phone:</strong> +91 {item.assignedPhone}</p>
                        <p><strong>Headcount:</strong> {item.headcount} Devotees</p>
                        {item.specialInstructions && (
                          <p className="text-[11px] bg-stone-50 p-2 rounded-xl border border-stone-200 mt-1 text-stone-700">
                            {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      {!isConfirmed && (
                        <Button size="sm" variant="secondary" onClick={() => handleConfirmTurn(item._id)}>
                          Confirm
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSchedule(item);
                          setSwapModalOpen(true);
                        }}
                      >
                        Swap Turn
                      </Button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Family Turns (User View - Non-Admin Only) */}
      {!isAdmin && activeTab === "my_turns" && (
        <div className="space-y-4">
          <GlassCard className="p-6 space-y-4 bg-white border-stone-200/90 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-heading text-lg font-black text-stone-900">{myFamilyName} - Thal Seva Turns</h3>
                <p className="text-xs text-stone-600">
                  Assigned Breakfast &amp; Dinner rotation dates for your household
                </p>
              </div>
              <Badge variant="info" size="md">
                {myFamilyTurns.length} Upcoming Turns
              </Badge>
            </div>

            {myFamilyTurns.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-500">
                No turns currently assigned to {myFamilyName} for {selectedMonth}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myFamilyTurns.map((turn) => (
                  <div key={turn._id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700">{turn.mealType}</span>
                      <Badge variant={turn.status === "Confirmed" ? "success" : "warning"} size="sm">
                        {turn.status}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-heading text-base font-black text-stone-900">{turn.date}</h4>
                      <p className="text-xs text-stone-600 mt-0.5">Mandir Kitchen Mahaprasad Seva</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                      {turn.status !== "Confirmed" && (
                        <Button size="sm" variant="secondary" onClick={() => handleConfirmTurn(turn._id)}>
                          Confirm Turn
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSchedule(turn);
                          setSwapModalOpen(true);
                        }}
                      >
                        Request Swap
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* TAB 3: Swap Requests Queue (Admin View) */}
      {activeTab === "swap_requests" && (
        <div className="space-y-4">
          <GlassCard className="p-6 space-y-4 bg-white border-stone-200/90 shadow-sm">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-heading text-lg font-black text-stone-900">Pending Thal Swap Requests</h3>
              <p className="text-xs text-stone-600">Review family swap requests and reassign dates</p>
            </div>

            {swapRequests.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-500">No pending swap requests.</div>
            ) : (
              <div className="space-y-3">
                {swapRequests.map((req) => (
                  <div key={req._id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-stone-900">{req.requestingFamilyName}</span>
                        <p className="text-[11px] text-stone-600">
                          Original Date: <strong className="text-stone-900">{req.originalDate}</strong> ({req.mealType})
                        </p>
                      </div>
                      <Badge variant={req.status === "Approved" ? "success" : req.status === "Rejected" ? "danger" : "warning"} size="sm">
                        {req.status}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-700">
                      <p><strong>Reason:</strong> {req.reason}</p>
                      {req.targetFamilyName && (
                        <p className="mt-1 text-amber-700 font-semibold">
                          <strong>Proposed Target Swap Family:</strong> {req.targetFamilyName}
                        </p>
                      )}
                    </div>

                    {req.status === "Pending Coordinator" && (
                      <div className="flex justify-end gap-2 pt-1">
                        <Button size="sm" variant="destructive" onClick={() => handleSwapAction(req._id, "reject")}>
                          Decline Request
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleSwapAction(req._id, "approve")}>
                          Approve &amp; Reassign
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* TAB 4: Fairness Ranking (30 Families) */}
      {activeTab === "fairness" && (
        <GlassCard className="p-6 space-y-4 bg-white border-stone-200/90 shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="font-heading text-base font-black text-stone-900">
                Fairness-Ranked Household Rotation (30 Nadiad Parivars)
              </h3>
              <p className="text-xs text-stone-600">
                Families ranked by total turns to ensure equitable Thal seva opportunities
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {fairnessRanking.map((fam, index) => (
              <div key={fam.familyId || fam.familyName} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-800 border border-amber-300">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-black text-stone-900">{fam.familyName}</p>
                    <p className="text-stone-600">Captain: {fam.captainName} &bull; {fam.area || "Nadiad"}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="font-black text-stone-900">{fam.turnsThisYear} Turns</span>
                    <p className="text-[10px] text-stone-500">This Month</p>
                  </div>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAssignedFamilyName(fam.familyName);
                        setAssignModalOpen(true);
                      }}
                    >
                      Assign Next Turn
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* CALENDAR DATE DETAIL MODAL */}
      <Modal
        isOpen={dateDetailModalOpen}
        onClose={() => setDateDetailModalOpen(false)}
        title={`Thal Seva Schedule — ${selectedCalendarDate}`}
        maxWidth="lg"
      >
        {selectedCalendarDate && (
          <div className="space-y-5">
            {/* Morning Thal Breakdown */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
                  <Sun className="h-4 w-4 text-amber-600" /> Morning Thal (Breakfast)
                </div>
                {schedules.find((s) => s.date === selectedCalendarDate && (s.mealType?.includes("Breakfast") || s.mealType?.includes("Morning"))) && (
                  <Badge
                    variant={
                      schedules.find((s) => s.date === selectedCalendarDate && (s.mealType?.includes("Breakfast") || s.mealType?.includes("Morning")))?.status === "Confirmed"
                        ? "success"
                        : "warning"
                    }
                    size="sm"
                  >
                    {schedules.find((s) => s.date === selectedCalendarDate && (s.mealType?.includes("Breakfast") || s.mealType?.includes("Morning")))?.status}
                  </Badge>
                )}
              </div>

              {(() => {
                const turn = schedules.find((s) => s.date === selectedCalendarDate && (s.mealType?.includes("Breakfast") || s.mealType?.includes("Morning")));
                if (!turn) return <p className="text-xs text-stone-500">No Morning Thal turn assigned for this date.</p>;

                return (
                  <div className="space-y-2 text-xs">
                    <h4 className="font-heading text-base font-black text-stone-900">{turn.assignedFamilyName}</h4>
                    <p className="text-stone-600">
                      Captain: <strong className="text-stone-900">{turn.captainName || "Rameshbhai Patel"}</strong> &bull; Phone: +91 {turn.assignedPhone}
                    </p>
                    <p className="text-stone-600">Headcount: <strong className="text-stone-900">{turn.headcount} Devotees</strong></p>
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-[11px] text-stone-800 flex items-start gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-800">Menu:</strong> {turn.specialInstructions}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {turn.status !== "Confirmed" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          isLoading={confirmingId === turn._id}
                          onClick={() => handleConfirmTurn(turn._id)}
                        >
                          Confirm Turn
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSchedule(turn);
                          setDateDetailModalOpen(false);
                          setSwapModalOpen(true);
                        }}
                      >
                        Swap Turn
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Evening Thal Breakdown */}
            <div className="p-4 rounded-2xl border border-orange-200 bg-orange-50/60 space-y-3">
              <div className="flex items-center justify-between border-b border-orange-200/80 pb-2">
                <div className="flex items-center gap-2 text-orange-800 font-extrabold text-xs">
                  <Moon className="h-4 w-4 text-orange-600" /> Evening Thal (Dinner)
                </div>
                {schedules.find((s) => s.date === selectedCalendarDate && (s.mealType?.includes("Dinner") || s.mealType?.includes("Evening"))) && (
                  <Badge
                    variant={
                      schedules.find((s) => s.date === selectedCalendarDate && (s.mealType?.includes("Dinner") || s.mealType?.includes("Evening")))?.status === "Confirmed"
                        ? "success"
                        : "warning"
                    }
                    size="sm"
                  >
                    {schedules.find((s) => s.date === selectedCalendarDate && (s.mealType?.includes("Dinner") || s.mealType?.includes("Evening")))?.status}
                  </Badge>
                )}
              </div>

              {(() => {
                const turn = schedules.find((s) => s.date === selectedCalendarDate && (s.mealType?.includes("Dinner") || s.mealType?.includes("Evening")));
                if (!turn) return <p className="text-xs text-stone-500">No Evening Thal turn assigned for this date.</p>;

                return (
                  <div className="space-y-2 text-xs">
                    <h4 className="font-heading text-base font-black text-stone-900">{turn.assignedFamilyName}</h4>
                    <p className="text-stone-600">
                      Captain: <strong className="text-stone-900">{turn.captainName || "Mukeshbhai Shah"}</strong> &bull; Phone: +91 {turn.assignedPhone}
                    </p>
                    <p className="text-stone-600">Headcount: <strong className="text-stone-900">{turn.headcount} Devotees</strong></p>
                    <div className="p-2.5 rounded-xl bg-white border border-orange-200 text-[11px] text-stone-800 flex items-start gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-orange-800">Menu:</strong> {turn.specialInstructions}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {turn.status !== "Confirmed" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          isLoading={confirmingId === turn._id}
                          onClick={() => handleConfirmTurn(turn._id)}
                        >
                          Confirm Turn
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSchedule(turn);
                          setDateDetailModalOpen(false);
                          setSwapModalOpen(true);
                        }}
                      >
                        Swap Turn
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Thal Turn Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Household Thal Turn"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-800">Select Household *</label>
            <select
              value={assignedFamilyName}
              onChange={(e) => setAssignedFamilyName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-stone-50"
            >
              {fairnessRanking.map((f) => (
                <option key={f.familyId || f.familyName} value={f.familyName} className="bg-white text-stone-900">
                  {f.familyName} ({f.turnsThisYear} turns assigned)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800">Thal Date *</label>
              <input
                type="date"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-stone-50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-800">Meal Type *</label>
              <select
                value={assignMeal}
                onChange={(e) => setAssignMeal(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-stone-50"
              >
                <option value="Breakfast (Morning Thal)" className="bg-white text-stone-900">Breakfast (Morning Thal)</option>
                <option value="Dinner (Evening Thal)" className="bg-white text-stone-900">Dinner (Evening Thal)</option>
                <option value="Special Thal" className="bg-white text-stone-900">Special Thal</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleAssignThal}>
              Confirm Rotation Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Swap Modal */}
      <Modal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        title="Request Thal Seva Swap"
        subtitle={selectedSchedule?.assignedFamilyName}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-800">Swap Destination</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setSwapType("admin_open_swap")}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-colors ${
                  swapType === "admin_open_swap"
                    ? "border-amber-400 bg-amber-50 text-amber-900 font-bold"
                    : "border-stone-200 hover:bg-stone-50 text-stone-600"
                }`}
              >
                Request Admin / Coordinator to Swap
              </button>
              <button
                type="button"
                onClick={() => setSwapType("family_to_family")}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-colors ${
                  swapType === "family_to_family"
                    ? "border-amber-400 bg-amber-50 text-amber-900 font-bold"
                    : "border-stone-200 hover:bg-stone-50 text-stone-600"
                }`}
              >
                Swap with Specific Family
              </button>
            </div>
          </div>

          {swapType === "family_to_family" && (
            <div>
              <label className="text-xs font-bold text-stone-800">Select Target Family *</label>
              <select
                value={targetFamilyName}
                onChange={(e) => setTargetFamilyName(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-stone-50"
              >
                <option value="" className="bg-white text-stone-900">-- Choose Family to Swap With --</option>
                {fairnessRanking.map((f) => (
                  <option key={f.familyId || f.familyName} value={f.familyName} className="bg-white text-stone-900">
                    {f.familyName} ({f.captainName})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-stone-800">Reason for Swap Request *</label>
            <textarea
              rows={3}
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              placeholder="e.g. Out of town travel / family commitment on scheduled date..."
              className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-stone-50 placeholder:text-stone-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setSwapModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleRequestSwap}>
              Submit Swap Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
