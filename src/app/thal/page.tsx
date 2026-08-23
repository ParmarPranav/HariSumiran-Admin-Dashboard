"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  UtensilsCrossed,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export default function ThalPage() {
  const { role, user, language } = useApp();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [fairnessRanking, setFairnessRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"calendar" | "fairness" | "swaps">("calendar");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  const [assignDate, setAssignDate] = useState("2026-08-27");
  const [assignMeal, setAssignMeal] = useState("Morning Thal");
  const [assignedFamilyName, setAssignedFamilyName] = useState("Patel Household (Rameshbhai)");

  const [swapReason, setSwapReason] = useState("");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/thal")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchedules(data.schedules || []);
          setFairnessRanking(data.fairnessRanking || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      if (data.conflict) {
        toast.error(data.error);
        return;
      }
      if (data.success) {
        toast.success("Thal turn assigned successfully");
        setAssignModalOpen(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error("Assignment failed: " + e.message);
    }
  };

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

  const handleRequestSwap = async () => {
    if (!selectedSchedule || !swapReason) return;
    try {
      const res = await fetch("/api/thal/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thalScheduleId: selectedSchedule._id,
          originalDate: selectedSchedule.date,
          requestingFamilyName: selectedSchedule.assignedFamilyName,
          reason: swapReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Swap request routed to Coordinator");
        setSwapModalOpen(false);
        setSwapReason("");
        fetchData();
      }
    } catch (e: any) {
      toast.error("Swap request failed: " + e.message);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-primary-container" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">
              {language === "gu" ? "થાળ પરિભ્રમણ અને સેવા" : "Thal Rotation & Fair Distribution"}
            </h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            Fair rotation scheduling, AI suggested family ranking &amp; swap approvals
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            onClick={() => setAssignModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            + Assign Thal Turn
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-hairline pb-2">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "calendar"
              ? "bg-primary-container text-white shadow-sm"
              : "text-charcoal-subtle hover:bg-surface-container"
          }`}
        >
          Rotation Schedule ({schedules.length})
        </button>
        <button
          onClick={() => setActiveTab("fairness")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "fairness"
              ? "bg-primary-container text-white shadow-sm"
              : "text-charcoal-subtle hover:bg-surface-container"
          }`}
        >
          AI Fairness Ranking &amp; Distribution
        </button>
      </div>

      {activeTab === "calendar" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((item) => {
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

                    <h3 className="font-heading text-base font-bold text-charcoal leading-tight">
                      {item.assignedFamilyName}
                    </h3>
                    <p className="text-xs font-semibold text-primary-container">
                      {item.mealType} &bull; {item.date}
                    </p>

                    <div className="space-y-1 text-xs text-charcoal-subtle pt-1">
                      <p><strong>Contact:</strong> +91 {item.assignedPhone}</p>
                      <p><strong>Expected Headcount:</strong> {item.headcount} Devotees</p>
                      {item.specialInstructions && (
                        <p className="text-[11px] bg-surface-container-low/60 p-2 rounded-xl border border-hairline mt-1">
                          {item.specialInstructions}
                        </p>
                      )}
                      {item.declineReason && (
                        <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200 mt-1">
                          Decline Reason: {item.declineReason}
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
                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSchedule(item);
                          setSwapModalOpen(true);
                        }}
                      >
                        Request Swap
                      </Button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      ) : (
        /* AI Fairness Ranking View */
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-hairline pb-3">
            <Sparkles className="h-5 w-5 text-primary-container" />
            <div>
              <h3 className="font-heading text-base font-bold text-charcoal">
                Fairness-Ranked Household Rotation
              </h3>
              <p className="text-xs text-charcoal-subtle">
                Families ranked by time since last Thal turn to ensure equitable seva opportunities
              </p>
            </div>
          </div>

          <div className="divide-y divide-hairline">
            {fairnessRanking.map((fam, index) => (
              <div key={fam.familyId} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron-100 text-[11px] font-bold text-primary-container">
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
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-charcoal">Select Household *</label>
            <select
              value={assignedFamilyName}
              onChange={(e) => setAssignedFamilyName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-hairline px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
            >
              {fairnessRanking.map((f) => (
                <option key={f.familyId} value={f.familyName}>
                  {f.familyName} ({f.turnsThisYear} turns this year)
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
              <label className="text-xs font-semibold text-charcoal">Meal Type</label>
              <select
                value={assignMeal}
                onChange={(e) => setAssignMeal(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-hairline px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              >
                <option value="Morning Thal">Morning Thal</option>
                <option value="Evening Thal">Evening Thal</option>
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
        title="Request Thal Turn Swap"
        subtitle={selectedSchedule?.assignedFamilyName}
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-charcoal">Reason for Swap Request *</label>
            <textarea
              rows={3}
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              placeholder="e.g. Family medical emergency / out of town travel on scheduled date..."
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
