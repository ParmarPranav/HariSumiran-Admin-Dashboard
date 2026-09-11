"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QRScannerModal } from "@/components/ui/QRScannerModal";
import {
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  QrCode,
  Plus,
  ArrowRight,
  AlertCircle,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export default function SevaPage() {
  const { role, user, language } = useApp();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [rosters, setRosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("All");
  const [activeTab, setActiveTab] = useState<"catalog" | "roster" | "my_shifts">("catalog");

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [createOppOpen, setCreateOppOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);

  const [newOpp, setNewOpp] = useState({
    title: "",
    department: "Kitchen (Mahaprasad)",
    description: "",
    skillsRequired: "Cooking, Cleanliness",
    timeCommitment: "3 Hours",
    totalSlots: 10,
  });

  const [volunteerName, setVolunteerName] = useState("Rameshbhai Patel");
  const [volunteerPhone, setVolunteerPhone] = useState("9825056789");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/seva")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOpportunities(data.opportunities || []);
          setRosters(data.rosters || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (rosterId: string, action: "check_in" | "check_out" | "request_replacement") => {
    try {
      const res = await fetch("/api/seva/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rosterId, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Seva status updated: ${action.replace("_", " ")}`);
        fetchData();
      }
    } catch (e: any) {
      toast.error("Action failed: " + e.message);
    }
  };

  const handleAssignVolunteer = async () => {
    if (!selectedOpp || !volunteerName) return;
    try {
      const res = await fetch("/api/seva/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: selectedOpp._id,
          date: new Date().toISOString().split("T")[0],
          shiftStartTime: "16:00",
          shiftEndTime: "19:00",
          volunteerName,
          volunteerPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Volunteer assigned to seva shift");
        setAssignModalOpen(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error("Error assigning volunteer: " + e.message);
    }
  };

  const handleCreateOpp = async () => {
    if (!newOpp.title || !newOpp.description) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const res = await fetch("/api/seva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOpp,
          skillsRequired: newOpp.skillsRequired.split(",").map((s) => s.trim()),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Seva opportunity created");
        setCreateOppOpen(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error("Error creating opportunity: " + e.message);
    }
  };

  const filteredOpps = opportunities.filter(
    (o) => selectedDept === "All" || o.department === selectedDept
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h1 className="font-heading text-2xl font-bold text-white">
              {language === "gu" ? "સેવા અને રોસ્ટર" : "Seva Opportunities & Volunteer Rosters"}
            </h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            Skill-matched volunteering, shift coordination &amp; QR duty check-in
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            leftIcon={<QrCode className="h-4 w-4 text-amber-400" />}
            onClick={() => setQrModalOpen(true)}
          >
            Duty QR Check-In
          </Button>
          {(role === "mandir_admin" || role === "dept_head" || role === "super_admin") && (
            <Button
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setCreateOppOpen(true)}
            >
              + Create Seva Role
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-hairline pb-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "catalog"
              ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-400/30 shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Opportunity Catalog ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "roster"
              ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-400/30 shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Today&apos;s Active Rosters ({rosters.length})
        </button>
      </div>

      {activeTab === "catalog" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpps.map((opp) => (
              <GlassCard key={opp._id} hoverEffect className="p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-400/30">
                      {opp.department}
                    </span>
                    <Badge variant={opp.status === "Open" ? "success" : "warning"} size="sm">
                      {opp.filledSlots} / {opp.totalSlots} Filled
                    </Badge>
                  </div>

                  <h3 className="font-heading text-base font-bold text-white leading-tight">
                    {opp.title}
                  </h3>
                  {opp.gujaratiTitle && (
                    <p className="text-xs text-slate-400 font-gujarati">{opp.gujaratiTitle}</p>
                  )}

                  <p className="text-xs text-slate-400 leading-relaxed">{opp.description}</p>

                  <div className="space-y-1 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{opp.timeCommitment}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>Coordinator: {opp.leadName}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {opp.skillsRequired?.map((skill: string, idx: number) => (
                      <span key={idx} className="rounded-md bg-white/[0.04] border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedOpp(opp);
                      setAssignModalOpen(true);
                    }}
                  >
                    Assign Volunteer &rarr;
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : (
        /* Rosters List */
        <div className="space-y-4">
          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#161B28]/60 p-4">
            {rosters.map((roster) => (
              <div key={roster._id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{roster.volunteerName}</span>
                    <Badge
                      variant={
                        roster.status === "Checked In"
                          ? "success"
                          : roster.status === "Completed"
                          ? "info"
                          : "primary"
                      }
                      size="sm"
                    >
                      {roster.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {roster.opportunityTitle} &bull; {roster.department}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Shift: {roster.shiftStartTime} - {roster.shiftEndTime} &bull; Mobile: +91 {roster.volunteerPhone}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {roster.status === "Assigned" && (
                    <Button size="sm" onClick={() => handleCheckIn(roster._id, "check_in")}>
                      Check In
                    </Button>
                  )}
                  {roster.status === "Checked In" && (
                    <Button size="sm" variant="secondary" onClick={() => handleCheckIn(roster._id, "check_out")}>
                      Complete Shift
                    </Button>
                  )}
                  {roster.status === "Assigned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCheckIn(roster._id, "request_replacement")}
                    >
                      Request Replacement
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Duty Check-In Modal */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Seva Duty Check-In Scanner"
        subtitle="Scan your volunteer identity pass at the mandir seva counter"
        onScanSuccess={() => {
          toast.success("Shift Checked In", {
            description: "Shift timer started. Jai Swaminarayan!",
          });
        }}
      />

      {/* Assign Volunteer Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Schedule Volunteer for Seva"
        subtitle={selectedOpp?.title}
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300">Volunteer Name *</label>
            <input
              type="text"
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              placeholder="e.g. Rameshbhai Patel"
              className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3.5 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Contact Number (+91) *</label>
            <input
              type="tel"
              value={volunteerPhone}
              onChange={(e) => setVolunteerPhone(e.target.value)}
              placeholder="98250 56789"
              className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3.5 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleAssignVolunteer}>
              Confirm Shift
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Opportunity Modal */}
      <Modal
        isOpen={createOppOpen}
        onClose={() => setCreateOppOpen(false)}
        title="Create New Seva Opportunity"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300">Role Title *</label>
            <input
              type="text"
              value={newOpp.title}
              onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
              placeholder="e.g. Mahaprasad Kitchen Service"
              className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3.5 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Department</label>
            <select
              value={newOpp.department}
              onChange={(e) => setNewOpp({ ...newOpp, department: e.target.value })}
              className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
            >
              <option value="Kitchen (Mahaprasad)" className="bg-[#161B28] text-white">Kitchen (Mahaprasad)</option>
              <option value="Sound & Broadcast" className="bg-[#161B28] text-white">Sound &amp; Broadcast</option>
              <option value="Security & Parking" className="bg-[#161B28] text-white">Security &amp; Parking</option>
              <option value="Bal Mandal & Youth" className="bg-[#161B28] text-white">Bal Mandal &amp; Youth</option>
              <option value="Decoration & Rangoli" className="bg-[#161B28] text-white">Decoration &amp; Rangoli</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Description *</label>
            <textarea
              rows={2}
              value={newOpp.description}
              onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
              placeholder="Detailed responsibility description..."
              className="mt-1 w-full rounded-xl border border-white/10 p-3 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5 placeholder:text-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setCreateOppOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleCreateOpp}>
              Create Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
