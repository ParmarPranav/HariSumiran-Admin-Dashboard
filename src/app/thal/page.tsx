"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  UtensilsCrossed,
  Calendar as CalendarIcon,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Bell,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ShieldAlert,
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

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

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
        toast.success(`Generated ${data.createdCount} Thal Turns for ${selectedMonth}!`, {
          description: "Breakfast and Dinner turns distributed fairly across active families.",
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

  // Confirm Turn
  const handleConfirmTurn = async (id: string) => {
    try {
      const res = await fetch("/api/thal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Confirmed" }),
      });
      if (res.ok) {
        toast.success("Thal turn confirmed with Mandir kitchen");
        fetchData();
      }
    } catch (e: any) {
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

  // Filter user's family turns
  const myFamilyName = user.familyName || "Patel Household (Rameshbhai)";
  const myFamilyTurns = schedules.filter(
    (s) => s.assignedFamilyName.toLowerCase() === myFamilyName.toLowerCase()
  );

  // Check 1-day prior turn
  const tomorrowTurn = myFamilyTurns.find((s) => s.date === "2026-09-07" || s.date === "2026-08-27");

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Persona Mode Indicator */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-saffron-300/80 bg-saffron-50/60 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-saffron-500 text-white flex items-center justify-center font-bold">
            {isAdmin ? "👑" : "🏠"}
          </div>
          <div>
            <span className="text-xs font-bold text-charcoal">
              {isAdmin ? "Admin Rotation Management Mode" : "Devotee Family View Mode"}
            </span>
            <p className="text-[11px] text-charcoal-subtle">
              {isAdmin
                ? `Logged in as ${user.name} (${user.role}). Full authority over monthly plans & swap approvals.`
                : `Logged in as ${user.name} for ${myFamilyName}. View assigned turns & request swaps.`}
            </p>
          </div>
        </div>
        <Badge variant={isAdmin ? "warning" : "info"} size="md">
          {isAdmin ? "Admin Mode" : "User / Family Mode"}
        </Badge>
      </div>

      {/* 1-Day Prior Turn Notification Banner for Devotee */}
      {tomorrowTurn && (
        <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold">
                🔔 1-Day Prior Seva Reminder: {tomorrowTurn.mealType} Tomorrow!
              </p>
              <p className="text-xs text-amber-100 mt-0.5">
                {myFamilyName} is scheduled for {tomorrowTurn.mealType} on {tomorrowTurn.date}. Please confirm arrival with kitchen lead.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-white text-amber-900 hover:bg-amber-50 shrink-0"
            onClick={() => handleConfirmTurn(tomorrowTurn._id)}
          >
            Confirm Turn
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary-container" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">
              {language === "gu" ? "થાળ પરિભ્રમણ અને સેવા (સવાર અને સાંજ)" : "Thal Rotation - Breakfast & Dinner"}
            </h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            Monthly rotation calendar, family captain RSVPs, 1-day prior alerts &amp; swap management
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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-hairline pb-2">
        {isAdmin && (
          <button
            onClick={() => setActiveTab("monthly_plan")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "monthly_plan"
                ? "bg-primary-container text-white shadow-sm"
                : "text-charcoal-subtle hover:bg-surface-container"
            }`}
          >
            📅 Monthly Calendar Plan ({schedules.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab("my_turns")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "my_turns"
              ? "bg-primary-container text-white shadow-sm"
              : "text-charcoal-subtle hover:bg-surface-container"
          }`}
        >
          🏠 My Family Turns ({myFamilyTurns.length})
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab("swap_requests")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "swap_requests"
                ? "bg-primary-container text-white shadow-sm"
                : "text-charcoal-subtle hover:bg-surface-container"
            }`}
          >
            🔄 Swap Requests ({swapRequests.filter((s) => s.status === "Pending Coordinator").length} Pending)
          </button>
        )}

        <button
          onClick={() => setActiveTab("fairness")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "fairness"
              ? "bg-primary-container text-white shadow-sm"
              : "text-charcoal-subtle hover:bg-surface-container"
          }`}
        >
          ✨ Family Rotation Fairness
        </button>
      </div>

      {/* TAB 1: Monthly Calendar Plan (Admin View) */}
      {activeTab === "monthly_plan" && (
        <div className="space-y-4">
          {/* Month Selector Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-hairline shadow-subtle">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-charcoal">Selected Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 rounded-xl border border-hairline px-3 text-xs font-bold text-primary-container focus:outline-none"
              >
                <option value="2026-09">September 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-08">August 2026</option>
              </select>
            </div>
            <p className="text-xs text-charcoal-subtle hidden sm:block">
              Breakfast (Morning Thal) &amp; Dinner (Evening Thal) rotation slots
            </p>
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((item) => {
              const isBreakfast = item.mealType?.includes("Breakfast") || item.mealType?.includes("Morning");
              const isConfirmed = item.status === "Confirmed";
              const isDeclined = item.status === "Declined";
              const isCompleted = item.status === "Completed";

              return (
                <GlassCard key={item._id} hoverEffect className="p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs font-bold text-charcoal-subtle">{item.scheduleCode}</span>
                      <Badge
                        variant={
                          isCompleted
                            ? "info"
                            : isConfirmed
                            ? "success"
                            : isDeclined
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {isBreakfast ? (
                        <Sun className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Moon className="h-4 w-4 text-indigo-500" />
                      )}
                      <span className="text-xs font-bold text-primary-container">
                        {item.mealType}
                      </span>
                    </div>

                    <h3 className="font-heading text-base font-bold text-charcoal leading-tight">
                      {item.assignedFamilyName}
                    </h3>

                    <p className="text-xs text-charcoal-subtle flex items-center gap-1 font-medium">
                      <CalendarIcon className="h-3.5 w-3.5 text-primary-container" /> Date: {item.date}
                    </p>

                    <div className="space-y-1 text-xs text-charcoal-subtle pt-1">
                      <p><strong>Contact Phone:</strong> +91 {item.assignedPhone}</p>
                      <p><strong>Headcount:</strong> {item.headcount} Devotees</p>
                      {item.specialInstructions && (
                        <p className="text-[11px] bg-surface-container-low/60 p-2 rounded-xl border border-hairline mt-1">
                          {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-hairline flex items-center justify-between gap-2">
                    {!isConfirmed && !isCompleted && (
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
        </div>
      )}

      {/* TAB 2: My Family Turns (User View) */}
      {activeTab === "my_turns" && (
        <div className="space-y-4">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal">{myFamilyName} - Thal Seva Turns</h3>
                <p className="text-xs text-charcoal-subtle">
                  Assigned Breakfast &amp; Dinner rotation dates for your household
                </p>
              </div>
              <Badge variant="info" size="md">
                {myFamilyTurns.length} Upcoming Turns
              </Badge>
            </div>

            {myFamilyTurns.length === 0 ? (
              <div className="text-center py-8 text-xs text-charcoal-subtle">
                No turns currently assigned to {myFamilyName} for {selectedMonth}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myFamilyTurns.map((turn) => (
                  <div key={turn._id} className="p-4 rounded-2xl border border-hairline bg-white shadow-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-container">{turn.mealType}</span>
                      <Badge variant={turn.status === "Confirmed" ? "success" : "warning"} size="sm">
                        {turn.status}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-heading text-base font-bold text-charcoal">{turn.date}</h4>
                      <p className="text-xs text-charcoal-subtle mt-0.5">Mandir Kitchen Mahaprasad Seva</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-hairline">
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
          <GlassCard className="p-6 space-y-4">
            <div className="border-b border-hairline pb-3">
              <h3 className="font-heading text-lg font-bold text-charcoal">Pending Thal Swap Requests</h3>
              <p className="text-xs text-charcoal-subtle">Review family swap requests and reassign dates</p>
            </div>

            {swapRequests.length === 0 ? (
              <div className="text-center py-8 text-xs text-charcoal-subtle">No pending swap requests.</div>
            ) : (
              <div className="space-y-3">
                {swapRequests.map((req) => (
                  <div key={req._id} className="p-4 rounded-2xl border border-hairline bg-white shadow-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-charcoal">{req.requestingFamilyName}</span>
                        <p className="text-[11px] text-charcoal-subtle">
                          Original Date: <strong>{req.originalDate}</strong> ({req.mealType})
                        </p>
                      </div>
                      <Badge variant={req.status === "Approved" ? "success" : req.status === "Rejected" ? "danger" : "warning"} size="sm">
                        {req.status}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-hairline text-xs text-charcoal">
                      <p><strong>Reason:</strong> {req.reason}</p>
                      {req.targetFamilyName && (
                        <p className="mt-1 text-primary-container">
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

      {/* TAB 4: Fairness Ranking */}
      {activeTab === "fairness" && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-hairline pb-3">
            <Sparkles className="h-5 w-5 text-primary-container" />
            <div>
              <h3 className="font-heading text-base font-bold text-charcoal">
                Fairness-Ranked Household Rotation
              </h3>
              <p className="text-xs text-charcoal-subtle">
                Families ranked by total turns to ensure equitable seva opportunities across households
              </p>
            </div>
          </div>

          <div className="divide-y divide-hairline">
            {fairnessRanking.map((fam, index) => (
              <div key={fam.familyId} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-saffron-100 text-xs font-bold text-primary-container">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-charcoal">{fam.familyName}</p>
                    <p className="text-charcoal-subtle">Captain: {fam.captainName} &bull; {fam.area}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="font-bold text-charcoal">{fam.turnsThisYear} Turns</span>
                    <p className="text-[10px] text-charcoal-subtle">This Year</p>
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

      {/* Assign Thal Turn Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Household Thal Turn"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal">Select Household *</label>
            <select
              value={assignedFamilyName}
              onChange={(e) => setAssignedFamilyName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-hairline px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
            >
              {fairnessRanking.map((f) => (
                <option key={f.familyId} value={f.familyName}>
                  {f.familyName} ({f.turnsThisYear} turns assigned)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-charcoal">Thal Date *</label>
              <input
                type="date"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-hairline px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-charcoal">Meal Type *</label>
              <select
                value={assignMeal}
                onChange={(e) => setAssignMeal(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-hairline px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              >
                <option value="Breakfast (Morning Thal)">Breakfast (Morning Thal)</option>
                <option value="Dinner (Evening Thal)">Dinner (Evening Thal)</option>
                <option value="Special Thal">Special Thal</option>
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
            <label className="text-xs font-semibold text-charcoal">Swap Destination</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setSwapType("admin_open_swap")}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-colors ${
                  swapType === "admin_open_swap"
                    ? "border-primary-container bg-saffron-50 text-primary-container"
                    : "border-hairline hover:bg-surface-container"
                }`}
              >
                Request Admin / Coordinator to Swap
              </button>
              <button
                type="button"
                onClick={() => setSwapType("family_to_family")}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-colors ${
                  swapType === "family_to_family"
                    ? "border-primary-container bg-saffron-50 text-primary-container"
                    : "border-hairline hover:bg-surface-container"
                }`}
              >
                Swap with Specific Family
              </button>
            </div>
          </div>

          {swapType === "family_to_family" && (
            <div>
              <label className="text-xs font-semibold text-charcoal">Select Target Family *</label>
              <select
                value={targetFamilyName}
                onChange={(e) => setTargetFamilyName(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-hairline px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              >
                <option value="">-- Choose Family to Swap With --</option>
                {fairnessRanking.map((f) => (
                  <option key={f.familyId} value={f.familyName}>
                    {f.familyName} ({f.captainName})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-charcoal">Reason for Swap Request *</label>
            <textarea
              rows={3}
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              placeholder="e.g. Out of town travel / family commitment on scheduled date..."
              className="mt-1 w-full rounded-xl border border-hairline p-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
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
