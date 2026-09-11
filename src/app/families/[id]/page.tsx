"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import Link from "next/link";
import {
  Users,
  Phone,
  MapPin,
  Calendar,
  HeartHandshake,
  UtensilsCrossed,
  ShieldCheck,
  ArrowLeft,
  QrCode,
  Plus,
  Clock,
  History,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function FamilyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { role } = useApp();

  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [followUpCases, setFollowUpCases] = useState<any[]>([]);
  const [thalHistory, setThalHistory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Member registration sub-modal
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    dob: "1995-01-01",
    gender: "Male",
    phone: "",
    relationship: "Son",
    sevaSkills: "Sound & Broadcast, Kitchen",
  });

  const fetchFamilyDetails = () => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/families/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFamily(data.family);
          setMembers(data.members || []);
          setFollowUpCases(data.followUpCases || []);
          setThalHistory(data.thalHistory || []);
          setAuditLogs(data.auditLogs || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFamilyDetails();
  }, [id]);

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.phone) {
      toast.error("Please provide member name and phone.");
      return;
    }

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId: id,
          familyName: family?.name,
          name: newMember.name,
          dob: newMember.dob,
          gender: newMember.gender,
          phone: newMember.phone,
          relationship: newMember.relationship,
          sevaSkills: newMember.sevaSkills.split(",").map((s) => s.trim()),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Member added to household");
        setAddMemberOpen(false);
        fetchFamilyDetails();
      }
    } catch (e: any) {
      toast.error("Error adding member: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-stone-500 font-medium">
        Loading 360° Household Profile...
      </div>
    );
  }

  if (!family) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-stone-900">Family record not found</p>
        <Link href="/families">
          <Button size="sm" variant="outline">&larr; Return to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <MandalaBackground />

      {/* Back Button */}
      <div className="relative z-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Families Directory
        </button>
      </div>

      {/* 360° Profile Header Hero Card */}
      <GlassCard className="relative z-10 p-6 space-y-4 bg-white border-stone-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-xs">
                {family.familyCode}
              </span>
              <Badge
                variant={
                  family.engagementLevel === "High"
                    ? "success"
                    : family.engagementLevel === "At-Risk"
                    ? "danger"
                    : "primary"
                }
              >
                {family.engagementLevel} Engagement
              </Badge>
            </div>
            <h1 className="font-heading text-2xl font-bold text-stone-900">
              {family.name}
            </h1>
            {family.gujaratiName && (
              <p className="text-sm font-gujarati text-amber-800 font-semibold">
                {family.gujaratiName}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setAddMemberOpen(true)}
            >
              + Add Family Member
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-stone-200 pt-4 text-xs font-medium">
          <div>
            <span className="text-stone-500 block">Family Captain:</span>
            <span className="font-bold text-stone-900">{family.captainName}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Primary Phone:</span>
            <span className="font-bold text-stone-900 font-mono">+91 {family.phone}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Locality &amp; Zone:</span>
            <span className="font-bold text-stone-900">{family.area} ({family.zone})</span>
          </div>
          <div>
            <span className="text-stone-500 block">Household Address:</span>
            <span className="font-bold text-stone-900 truncate block">{family.address}</span>
          </div>
        </div>
      </GlassCard>

      {/* Profile Tabs */}
      <div className="relative z-10">
        <Tabs
          tabs={[
            { id: "overview", label: "Household Members", count: members.length, icon: <Users className="h-4 w-4" /> },
            { id: "interactions", label: "Touchpoints & Notes", count: family.notes ? 1 : 0, icon: <FileText className="h-4 w-4" /> },
            { id: "thal", label: "Thal Rotation History", count: thalHistory.length, icon: <UtensilsCrossed className="h-4 w-4" /> },
            { id: "followup", label: "Follow-Up Welfare", count: followUpCases.length, icon: <HeartHandshake className="h-4 w-4" /> },
            { id: "audit", label: "Audit Log", count: auditLogs.length, icon: <ShieldCheck className="h-4 w-4" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab 1: Household Members */}
      {activeTab === "overview" && (
        <div className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <GlassCard key={member._id} className="p-4 space-y-3 bg-white border-stone-200/90 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={member.name}
                      className="h-11 w-11 rounded-2xl object-cover border border-stone-200 shadow-xs"
                    />
                    <div>
                      <h4 className="font-heading text-sm font-bold text-stone-900">{member.name}</h4>
                      <p className="text-[11px] text-stone-500 font-medium">{member.relationship} &bull; DOB: {member.dob}</p>
                    </div>
                  </div>
                  <Badge variant={member.verificationStatus === "Verified" ? "success" : "warning"} size="sm">
                    {member.verificationStatus}
                  </Badge>
                </div>

                <div className="text-xs space-y-1 text-stone-600 font-medium">
                  <p><strong>Mobile:</strong> +91 {member.phone}</p>
                  <p><strong>Sabha Streak:</strong> {member.attendanceStreak} Weeks</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {member.sevaSkills?.map((skill: string, idx: number) => (
                      <span key={idx} className="rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-end">
                  <Link href={`/members/${member._id}`}>
                    <Button size="sm" variant="ghost">View Full Member Profile &rarr;</Button>
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Interactions & Notes */}
      {activeTab === "interactions" && (
        <GlassCard className="relative z-10 p-6 space-y-4 bg-white border-stone-200/90 shadow-sm">
          <h3 className="font-heading text-base font-bold text-stone-900">Field Visit &amp; Interaction Log</h3>
          {family.notes ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 font-mono text-xs text-stone-800 whitespace-pre-line leading-relaxed">
              {family.notes}
            </div>
          ) : (
            <p className="text-xs text-stone-500">No interaction notes recorded yet.</p>
          )}
        </GlassCard>
      )}

      {/* Tab 3: Thal Schedule History */}
      {activeTab === "thal" && (
        <div className="relative z-10 space-y-4">
          {thalHistory.length === 0 ? (
            <GlassCard className="p-8 text-center text-xs text-stone-500 bg-white border-stone-200 shadow-sm">
              No Thal turns recorded for this household yet.
            </GlassCard>
          ) : (
            <div className="space-y-2.5">
              {thalHistory.map((turn) => (
                <GlassCard key={turn._id} className="p-4 flex items-center justify-between bg-white border-stone-200/90 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{turn.mealType}</span>
                      <Badge variant={turn.status === "Completed" ? "success" : "primary"} size="sm">
                        {turn.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-600 font-medium">
                      Date: {turn.date} &bull; Expected Headcount: {turn.headcount}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Follow-up Cases */}
      {activeTab === "followup" && (
        <div className="relative z-10 space-y-4">
          {followUpCases.length === 0 ? (
            <GlassCard className="p-8 text-center text-xs text-stone-500 bg-white border-stone-200 shadow-sm">
              No active or closed follow-up cases for this household.
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {followUpCases.map((c) => (
                <GlassCard key={c._id} className="p-4 space-y-2 bg-white border-stone-200/90 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{c.caseCode} &bull; {c.category}</span>
                    <Badge variant={c.urgency === "Overdue" ? "danger" : "warning"} size="sm">
                      {c.urgency}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-600 font-medium">
                    Assigned Karyakarta: {c.assignedKaryakartaName} &bull; Due: {c.dueDate}
                  </p>
                  <Link href="/follow-up" className="text-xs font-bold text-amber-700 hover:text-amber-800 block pt-1">
                    Manage Case &rarr;
                  </Link>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === "audit" && (
        <GlassCard className="relative z-10 p-6 space-y-3 bg-white border-stone-200/90 shadow-sm">
          <h3 className="font-heading text-base font-bold text-stone-900">Record Audit Trail</h3>
          <div className="divide-y divide-stone-100">
            {auditLogs.map((log) => (
              <div key={log._id} className="py-2.5 text-xs flex justify-between items-center">
                <div>
                  <p className="font-semibold text-stone-900">{log.action}</p>
                  <p className="text-stone-500 font-medium">{log.description}</p>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title="Add Household Member"
        subtitle={`Linking new member to ${family.name}`}
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-700">Member Full Name *</label>
            <input
              type="text"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              placeholder="e.g. Devansh Patel"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700">Date of Birth</label>
              <input
                type="date"
                value={newMember.dob}
                onChange={(e) => setNewMember({ ...newMember, dob: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700">Relationship</label>
              <select
                value={newMember.relationship}
                onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              >
                <option value="Head of Family" className="bg-white text-stone-900">Head of Family</option>
                <option value="Spouse" className="bg-white text-stone-900">Spouse</option>
                <option value="Son" className="bg-white text-stone-900">Son</option>
                <option value="Daughter" className="bg-white text-stone-900">Daughter</option>
                <option value="Father" className="bg-white text-stone-900">Father</option>
                <option value="Mother" className="bg-white text-stone-900">Mother</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700">Phone Number (+91) *</label>
            <input
              type="tel"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
              placeholder="98250 12345"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700">Seva Skills (Comma separated)</label>
            <input
              type="text"
              value={newMember.sevaSkills}
              onChange={(e) => setNewMember({ ...newMember, sevaSkills: e.target.value })}
              placeholder="e.g. Sound, Kitchen, First Aid"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleAddMember}>
              Save Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
