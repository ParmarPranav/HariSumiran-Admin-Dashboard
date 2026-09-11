"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import {
  HeartHandshake,
  AlertTriangle,
  Clock,
  Lock,
  Plus,
  CheckCircle2,
  Calendar,
  User,
  MessageSquare,
  ArrowRight,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export default function FollowUpPage() {
  const { role, user, language } = useApp();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrgency, setSelectedUrgency] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Add Note Modal
  const [activeCase, setActiveCase] = useState<any>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Plan Visit Modal
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitPlan, setVisitPlan] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "18:00",
    coVisitor: "Nitinbhai Patel",
  });

  // Closure Request Modal
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [closureReason, setClosureReason] = useState("");

  const fetchCases = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedUrgency !== "All") params.set("urgency", selectedUrgency);
    if (selectedStatus !== "All") params.set("status", selectedStatus);

    fetch(`/api/follow-up?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCases(data.cases || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, [selectedUrgency, selectedStatus]);

  const handleAddNote = async () => {
    if (!activeCase || !noteText.trim()) return;
    try {
      const res = await fetch(`/api/follow-up/${activeCase._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          authorName: user.name,
          note: noteText,
        }),
      });
      if (res.ok) {
        toast.success("Confidential note logged");
        setNoteModalOpen(false);
        setNoteText("");
        fetchCases();
      }
    } catch (e: any) {
      toast.error("Error adding note: " + e.message);
    }
  };

  const handlePlanVisit = async () => {
    if (!activeCase) return;
    try {
      const res = await fetch(`/api/follow-up/${activeCase._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "plan_visit",
          visitPlan,
        }),
      });
      if (res.ok) {
        toast.success("Visit scheduled successfully");
        setVisitModalOpen(false);
        fetchCases();
      }
    } catch (e: any) {
      toast.error("Error planning visit: " + e.message);
    }
  };

  const handleRequestClosure = async () => {
    if (!activeCase) return;
    try {
      const res = await fetch(`/api/follow-up/${activeCase._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_closure",
          closureReason: closureReason || "Case resolved satisfactorily.",
        }),
      });
      if (res.ok) {
        toast.success("Closure submitted for supervisor approval");
        setClosureModalOpen(false);
        setClosureReason("");
        fetchCases();
      }
    } catch (e: any) {
      toast.error("Error requesting closure: " + e.message);
    }
  };

  const handleApproveClosure = async (caseId: string) => {
    try {
      const res = await fetch(`/api/follow-up/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_closure",
          approvedBy: user.name,
        }),
      });
      if (res.ok) {
        toast.success("Case marked as Closed");
        fetchCases();
      }
    } catch (e: any) {
      toast.error("Error approving closure: " + e.message);
    }
  };

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-amber-600" />
            <h1 className="font-heading text-2xl font-bold text-stone-900">
              {language === "gu" ? "સંપર્ક અને ફોલો-અપ" : "Prioritized Follow-Up & Pastoral Care"}
            </h1>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Empathetic pastoral care with strictly role-masked confidential notes
          </p>
        </div>
      </div>

      {/* Urgency Filter Strip */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-3">
        <SpotlightCard
          onClick={() => setSelectedUrgency("All")}
          spotlightColor="rgba(245, 158, 11, 0.12)"
          className={`cursor-pointer text-center p-4 border-2 transition-all bg-white ${
            selectedUrgency === "All" ? "border-amber-400 bg-amber-50/70 shadow-xs" : "border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="text-xs font-semibold text-stone-500">All Open Cases</p>
          <p className="font-heading text-xl font-bold text-stone-900 font-mono mt-0.5">{cases.length}</p>
        </SpotlightCard>

        <SpotlightCard
          onClick={() => setSelectedUrgency("Overdue")}
          spotlightColor="rgba(244, 63, 94, 0.15)"
          className={`cursor-pointer text-center p-4 border-2 transition-all bg-white ${
            selectedUrgency === "Overdue" ? "border-rose-400 bg-rose-50/80 shadow-xs" : "border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="text-xs font-semibold text-rose-700">Overdue (&gt; 7 Days)</p>
          <p className="font-heading text-xl font-bold text-rose-700 font-mono mt-0.5">
            {cases.filter((c) => c.urgency === "Overdue").length}
          </p>
        </SpotlightCard>

        <SpotlightCard
          onClick={() => setSelectedUrgency("Due Today")}
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className={`cursor-pointer text-center p-4 border-2 transition-all bg-white ${
            selectedUrgency === "Due Today" ? "border-amber-400 bg-amber-50/80 shadow-xs" : "border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="text-xs font-semibold text-amber-800">Due Today</p>
          <p className="font-heading text-xl font-bold text-amber-800 font-mono mt-0.5">
            {cases.filter((c) => c.urgency === "Due Today").length}
          </p>
        </SpotlightCard>

        <SpotlightCard
          onClick={() => setSelectedUrgency("Upcoming")}
          spotlightColor="rgba(14, 165, 233, 0.15)"
          className={`cursor-pointer text-center p-4 border-2 transition-all bg-white ${
            selectedUrgency === "Upcoming" ? "border-sky-400 bg-sky-50/80 shadow-xs" : "border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="text-xs font-semibold text-sky-800">Upcoming</p>
          <p className="font-heading text-xl font-bold text-sky-800 font-mono mt-0.5">
            {cases.filter((c) => c.urgency === "Upcoming").length}
          </p>
        </SpotlightCard>
      </div>

      {/* Cases Stream */}
      {loading ? (
        <div className="relative z-10 py-12 text-center text-xs text-stone-500 font-medium">
          Loading pastoral care cases...
        </div>
      ) : cases.length === 0 ? (
        <SpotlightCard className="relative z-10 py-12 text-center text-xs text-stone-500 space-y-2 bg-white border-stone-200 shadow-sm">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
          <p className="font-bold text-stone-900 text-sm">No Pending Follow-Up Cases</p>
          <p>All devotee care touchpoints are up to date.</p>
        </SpotlightCard>
      ) : (
        <div className="relative z-10 space-y-4">
          {cases.map((c) => {
            const isOverdue = c.urgency === "Overdue";
            const isDueToday = c.urgency === "Due Today";

            return (
              <SpotlightCard
                key={c._id}
                spotlightColor={isOverdue ? "rgba(244, 63, 94, 0.12)" : isDueToday ? "rgba(245, 158, 11, 0.12)" : "rgba(14, 165, 233, 0.12)"}
                className={`p-5 space-y-4 border-l-4 bg-white border-stone-200/90 shadow-sm ${
                  isOverdue ? "border-l-rose-500" : isDueToday ? "border-l-amber-500" : "border-l-sky-500"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-500">{c.caseCode}</span>
                      <Badge variant={isOverdue ? "danger" : isDueToday ? "warning" : "info"} size="sm">
                        {c.urgency}
                      </Badge>
                      <span className="text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md">
                        {c.category}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-stone-900 mt-1">
                      {c.familyName}
                    </h3>
                    <p className="text-xs text-stone-600">
                      Assigned to: <strong className="text-stone-900">{c.assignedKaryakartaName}</strong> &bull; Target Due Date: <strong className="text-stone-800">{c.dueDate}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Lock className="h-3.5 w-3.5 text-amber-600" />}
                      onClick={() => {
                        setActiveCase(c);
                        setNoteModalOpen(true);
                      }}
                    >
                      + Confidential Note
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Calendar className="h-3.5 w-3.5" />}
                      onClick={() => {
                        setActiveCase(c);
                        setVisitModalOpen(true);
                      }}
                    >
                      Plan Visit
                    </Button>
                    {c.status === "Pending Approval" && (role === "mandir_admin" || role === "dept_head") ? (
                      <Button
                        size="sm"
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        onClick={() => handleApproveClosure(c._id)}
                      >
                        Approve Closure
                      </Button>
                    ) : c.status !== "Closed" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setActiveCase(c);
                          setClosureModalOpen(true);
                        }}
                      >
                        Request Closure
                      </Button>
                    ) : (
                      <Badge variant="success">Closed</Badge>
                    )}
                  </div>
                </div>

                {/* Visit Plan Pill if Scheduled */}
                {c.visitPlan && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-stone-900">Home Visit Scheduled:</span>{" "}
                      <span className="text-stone-700">{c.visitPlan.date} at {c.visitPlan.time}</span>
                      {c.visitPlan.coVisitor && <span className="text-stone-500"> (Co-visitor: {c.visitPlan.coVisitor})</span>}
                    </div>
                  </div>
                )}

                {/* Confidential Notes Stream */}
                {c.confidentialNotes && c.confidentialNotes.length > 0 && (
                  <div className="space-y-2 border-t border-stone-200 pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      <span>Confidential Supervisor Notes ({c.confidentialNotes.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {c.confidentialNotes.map((note: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-xs text-stone-800 leading-relaxed shadow-xs"
                        >
                          <div className="flex justify-between items-center text-[10px] text-stone-500 mb-1">
                            <span className="font-bold text-amber-900">{note.authorName}</span>
                            <span>{new Date(note.createdAt).toLocaleString("en-IN")}</span>
                          </div>
                          <p>{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* Add Confidential Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Add Confidential Follow-Up Note"
        subtitle="Visible strictly to assigned Karyakarta and Mandir Supervisors"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-900">
            <Lock className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Confidentiality active. This note will never appear on general family profile exports.</span>
          </div>

          <textarea
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Record medical updates, pastoral care discussions, elder health status..."
            className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleAddNote}>
              Save Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* Plan Visit Modal */}
      <Modal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        title="Schedule Pastoral Home Visit"
        subtitle={`Planning visit for ${activeCase?.familyName}`}
        maxWidth="md"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700">Visit Date</label>
              <input
                type="date"
                value={visitPlan.date}
                onChange={(e) => setVisitPlan({ ...visitPlan, date: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700">Visit Time</label>
              <input
                type="time"
                value={visitPlan.time}
                onChange={(e) => setVisitPlan({ ...visitPlan, time: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700">Accompanying Co-Visitor</label>
            <input
              type="text"
              value={visitPlan.coVisitor}
              onChange={(e) => setVisitPlan({ ...visitPlan, coVisitor: e.target.value })}
              placeholder="e.g. Nitinbhai Patel / Dipakbhai Shah"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setVisitModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handlePlanVisit}>
              Confirm Visit Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Closure Request Modal */}
      <Modal
        isOpen={closureModalOpen}
        onClose={() => setClosureModalOpen(false)}
        title="Request Case Closure"
        subtitle="Submit resolution summary for Mandir Supervisor confirmation"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-700">Resolution Summary *</label>
            <textarea
              rows={3}
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
              placeholder="Family visited, health recovered, returned to Sunday Sabha..."
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setClosureModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleRequestClosure}>
              Submit for Approval
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
