"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-primary-container" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">
              {language === "gu" ? "સંપર્ક અને ફોલો-અપ" : "Prioritized Follow-Up & Pastoral Care"}
            </h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            Empathetic pastoral care with strictly role-masked confidential notes
          </p>
        </div>
      </div>

      {/* Urgency Filter Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <GlassCard
          onClick={() => setSelectedUrgency("All")}
          className={`cursor-pointer text-center p-3.5 border-2 transition-all ${
            selectedUrgency === "All" ? "border-amber-500/50 bg-amber-500/10 shadow-glow-sm" : "border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-xs font-semibold text-gray-400">All Open Cases</p>
          <p className="font-heading text-xl font-bold text-white">{cases.length}</p>
        </GlassCard>

        <GlassCard
          onClick={() => setSelectedUrgency("Overdue")}
          className={`cursor-pointer text-center p-3.5 border-2 transition-all ${
            selectedUrgency === "Overdue" ? "border-rose-500/60 bg-rose-500/15 shadow-[0_0_12px_rgba(244,63,94,0.2)]" : "border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-xs font-semibold text-rose-400">Overdue (&gt; 7 Days)</p>
          <p className="font-heading text-xl font-bold text-rose-300">
            {cases.filter((c) => c.urgency === "Overdue").length}
          </p>
        </GlassCard>

        <GlassCard
          onClick={() => setSelectedUrgency("Due Today")}
          className={`cursor-pointer text-center p-3.5 border-2 transition-all ${
            selectedUrgency === "Due Today" ? "border-amber-500/60 bg-amber-500/15 shadow-glow-sm" : "border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-xs font-semibold text-amber-300">Due Today</p>
          <p className="font-heading text-xl font-bold text-amber-300">
            {cases.filter((c) => c.urgency === "Due Today").length}
          </p>
        </GlassCard>

        <GlassCard
          onClick={() => setSelectedUrgency("Upcoming")}
          className={`cursor-pointer text-center p-3.5 border-2 transition-all ${
            selectedUrgency === "Upcoming" ? "border-sky-500/60 bg-sky-500/15 shadow-[0_0_12px_rgba(14,165,233,0.2)]" : "border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-xs font-semibold text-sky-300">Upcoming</p>
          <p className="font-heading text-xl font-bold text-sky-300">
            {cases.filter((c) => c.urgency === "Upcoming").length}
          </p>
        </GlassCard>
      </div>

      {/* Cases Stream */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">
          Loading pastoral care cases...
        </div>
      ) : cases.length === 0 ? (
        <GlassCard className="py-12 text-center text-xs text-gray-400 space-y-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
          <p className="font-bold text-white text-sm">No Pending Follow-Up Cases</p>
          <p>All devotee care touchpoints are up to date.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const isOverdue = c.urgency === "Overdue";
            const isDueToday = c.urgency === "Due Today";

            return (
              <GlassCard
                key={c._id}
                className={`p-5 space-y-4 border-l-4 ${
                  isOverdue ? "border-l-rose-500" : isDueToday ? "border-l-amber-500" : "border-l-sky-500"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-400">{c.caseCode}</span>
                      <Badge variant={isOverdue ? "danger" : isDueToday ? "warning" : "info"} size="sm">
                        {c.urgency}
                      </Badge>
                      <span className="text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                        {c.category}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white mt-1">
                      {c.familyName}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Assigned to: <strong className="text-white">{c.assignedKaryakartaName}</strong> &bull; Target Due Date: <strong className="text-gray-200">{c.dueDate}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Lock className="h-3.5 w-3.5 text-amber-400" />}
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
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-[#161B28]/60 text-xs">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white">Home Visit Scheduled:</span>{" "}
                      <span className="text-gray-300">{c.visitPlan.date} at {c.visitPlan.time}</span>
                      {c.visitPlan.coVisitor && <span className="text-gray-400"> (Co-visitor: {c.visitPlan.coVisitor})</span>}
                    </div>
                  </div>
                )}

                {/* Confidential Notes Stream */}
                {c.confidentialNotes && c.confidentialNotes.length > 0 && (
                  <div className="space-y-2 border-t border-white/10 pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      <Lock className="h-3.5 w-3.5 text-amber-400" />
                      <span>Confidential Supervisor Notes ({c.confidentialNotes.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {c.confidentialNotes.map((note: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/10 bg-[#161B28]/60 p-3 text-xs text-gray-200 leading-relaxed"
                        >
                          <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                            <span className="font-semibold text-amber-300">{note.authorName}</span>
                            <span>{new Date(note.createdAt).toLocaleString("en-IN")}</span>
                          </div>
                          <p>{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
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
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300">
            <Lock className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Confidentiality active. This note will never appear on general family profile exports.</span>
          </div>

          <textarea
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Record medical updates, pastoral care discussions, elder health status..."
            className="w-full rounded-xl border border-white/10 bg-[#161B28] p-3 text-xs text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:outline-none"
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
              <label className="text-xs font-semibold text-gray-300">Visit Date</label>
              <input
                type="date"
                value={visitPlan.date}
                onChange={(e) => setVisitPlan({ ...visitPlan, date: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3 text-xs text-white focus:border-amber-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300">Visit Time</label>
              <input
                type="time"
                value={visitPlan.time}
                onChange={(e) => setVisitPlan({ ...visitPlan, time: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3 text-xs text-white focus:border-amber-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300">Accompanying Co-Visitor</label>
            <input
              type="text"
              value={visitPlan.coVisitor}
              onChange={(e) => setVisitPlan({ ...visitPlan, coVisitor: e.target.value })}
              placeholder="e.g. Nitinbhai Patel / Dipakbhai Shah"
              className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3.5 text-xs text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:outline-none"
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
            <label className="text-xs font-semibold text-gray-300">Resolution Summary *</label>
            <textarea
              rows={3}
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
              placeholder="Family visited, health recovered, returned to Sunday Sabha..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#161B28] p-3 text-xs text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:outline-none"
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
