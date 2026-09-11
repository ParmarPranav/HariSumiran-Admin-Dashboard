"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import Link from "next/link";
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  QrCode,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function MembersPage() {
  const { role, language } = useApp();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [activeTab, setActiveTab] = useState<"directory" | "verification">("directory");

  // Registration modal
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    familyName: "Patel Household (Rameshbhai)",
    dob: "1990-01-01",
    gender: "Male",
    phone: "",
    email: "",
    relationship: "Member",
    sevaSkills: "Kitchen, General",
    communicationConsent: true,
  });

  const fetchMembers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedSkill !== "All") params.set("skill", selectedSkill);
    if (selectedStatus !== "All") params.set("status", selectedStatus);

    fetch(`/api/members?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMembers(data.members);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [search, selectedSkill, selectedStatus]);

  const handleRegisterMember = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sevaSkills: formData.sevaSkills.split(",").map((s) => s.trim()),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Member Registered Successfully", {
          description: `${formData.name} added with consent verification.`,
        });
        setRegisterModalOpen(false);
        fetchMembers();
      }
    } catch (e: any) {
      toast.error("Error registering member: " + e.message);
    }
  };

  const handleVerify = async (memberId: string, status: "Verified" | "Rejected") => {
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: status }),
      });
      if (res.ok) {
        toast.success(`Member status updated to ${status}`);
        fetchMembers();
      }
    } catch (e: any) {
      toast.error("Verification update failed: " + e.message);
    }
  };

  const pendingVerificationList = members.filter((m) => m.verificationStatus === "Pending Verification");

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-amber-600" />
            <h1 className="font-heading text-2xl md:text-3xl font-black text-stone-900">
              {language === "gu" ? "સભ્યો ડિરેક્ટરી" : "Member Registry"}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-stone-600 mt-0.5">
            Individual Attendance Streaks, Seva Skills &amp; Digital Passes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            onClick={() => setRegisterModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            + Register Member
          </Button>
        </div>
      </div>

      {/* Tabs for Directory vs Verification Queue */}
      <div className="relative z-10 flex gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "directory"
              ? "bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white font-black shadow-sm"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          All Members ({members.length})
        </button>
        {(role === "mandir_admin" || role === "super_admin") && (
          <button
            onClick={() => setActiveTab("verification")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "verification"
                ? "bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white font-black shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <span>Verification Queue</span>
            {pendingVerificationList.length > 0 && (
              <span className="bg-white text-stone-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingVerificationList.length}
              </span>
            )}
          </button>
        )}
      </div>

      {activeTab === "directory" ? (
        <>
          {/* Filters Bar */}
          <GlassCard className="relative z-10 p-4 space-y-3 bg-white border-stone-200/90 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by member name, phone, code, or household..."
                  className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-xs text-stone-900 focus:border-amber-500 focus:outline-none placeholder:text-stone-400 shadow-xs"
                />
              </div>

              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="h-10 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs text-stone-800 focus:border-amber-500 focus:outline-none shadow-xs"
              >
                <option value="All" className="bg-white text-stone-900">All Seva Skills</option>
                <option value="Kitchen" className="bg-white text-stone-900">Kitchen / Mahaprasad</option>
                <option value="Sound" className="bg-white text-stone-900">Sound &amp; Broadcast</option>
                <option value="Security" className="bg-white text-stone-900">Security &amp; Parking</option>
                <option value="Bal Mandal" className="bg-white text-stone-900">Bal Mandal &amp; Teaching</option>
                <option value="Decoration" className="bg-white text-stone-900">Rangoli &amp; Decoration</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs text-stone-800 focus:border-amber-500 focus:outline-none shadow-xs"
              >
                <option value="All" className="bg-white text-stone-900">All Verification Status</option>
                <option value="Verified" className="bg-white text-stone-900">Verified</option>
                <option value="Pending Verification" className="bg-white text-stone-900">Pending Verification</option>
              </select>
            </div>
          </GlassCard>

          {/* Members Grid */}
          {loading ? (
            <div className="relative z-10 py-12 text-center text-xs text-stone-500">
              Loading members registry...
            </div>
          ) : members.length === 0 ? (
            <GlassCard className="relative z-10 py-12 text-center text-xs text-stone-500 bg-white border-stone-200/90 shadow-sm">
              No members found matching your search.
            </GlassCard>
          ) : (
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <GlassCard key={member._id} hoverEffect className="p-5 space-y-3 flex flex-col justify-between bg-white border-stone-200/90 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                          alt={member.name}
                          className="h-12 w-12 rounded-2xl object-cover border border-stone-200 shadow-xs"
                        />
                        <div>
                          <span className="font-mono text-[10px] font-black text-amber-700">
                            {member.memberCode}
                          </span>
                          <h3 className="font-heading text-sm font-black text-stone-900 leading-tight">
                            {member.name}
                          </h3>
                          <p className="text-xs text-stone-500 truncate max-w-[160px]">
                            {member.familyName}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={member.verificationStatus === "Verified" ? "success" : "warning"}
                        size="sm"
                      >
                        {member.verificationStatus}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-stone-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-amber-600" />
                        <span>+91 {member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-amber-600" />
                        <span>DOB: {member.dob} ({member.relationship})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-bold text-stone-900">
                          {member.attendanceStreak} Consecutive Sabhas
                        </span>
                      </div>
                    </div>

                    {member.sevaSkills && member.sevaSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {member.sevaSkills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-lg bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex justify-end">
                    <Link href={`/members/${member._id}`}>
                      <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                        360° Profile
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Verification Queue Tab for Mandir Admin */
        <div className="relative z-10 space-y-4">
          {pendingVerificationList.length === 0 ? (
            <GlassCard className="py-12 text-center text-xs text-stone-500 space-y-2 bg-white border-stone-200/90 shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <p className="font-black text-stone-900 text-sm">Verification Queue Cleared</p>
              <p>All devotee ID documents and registration requests have been approved.</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {pendingVerificationList.map((member) => (
                <GlassCard key={member._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-stone-200/90 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={member.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                      alt={member.name}
                      className="h-12 w-12 rounded-2xl object-cover border border-stone-200 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-sm font-black text-stone-900">{member.name}</h4>
                        <span className="font-mono text-[10px] text-stone-500">{member.memberCode}</span>
                      </div>
                      <p className="text-xs text-stone-600">{member.familyName} &bull; +91 {member.phone}</p>
                      <p className="text-[11px] text-stone-500">Relationship: {member.relationship} &bull; DOB: {member.dob}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<XCircle className="h-4 w-4 text-rose-500" />}
                      onClick={() => handleVerify(member._id, "Rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      onClick={() => handleVerify(member._id, "Verified")}
                    >
                      Approve &amp; Issue Pass
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Member Registration Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Register Individual Member"
        subtitle="Collect mandatory consent and contact details"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-800">Member Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Devansh Patel"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-white shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-800">Household Link</label>
            <input
              type="text"
              value={formData.familyName}
              onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-white shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-white shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-800">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-white shadow-xs"
              >
                <option value="Male" className="bg-white text-stone-900">Male</option>
                <option value="Female" className="bg-white text-stone-900">Female</option>
                <option value="Other" className="bg-white text-stone-900">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-800">Mobile Number (+91) *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="98250 12345"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-white shadow-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-800">Seva Skills &amp; Talents</label>
            <input
              type="text"
              value={formData.sevaSkills}
              onChange={(e) => setFormData({ ...formData, sevaSkills: e.target.value })}
              placeholder="e.g. Sound, Kitchen, First Aid"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none bg-white shadow-xs"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.communicationConsent}
              onChange={(e) => setFormData({ ...formData, communicationConsent: e.target.checked })}
              className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs text-stone-600 font-medium">
              Devotee has consented to receive WhatsApp / SMS announcements from HariPrabodham Mandir.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleRegisterMember}>
              Complete Registration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
