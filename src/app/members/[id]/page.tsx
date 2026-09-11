"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import Link from "next/link";
import {
  User,
  Phone,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  QrCode,
  HeartHandshake,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function MemberProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { role } = useApp();

  const [member, setMember] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [sevaHistory, setSevaHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/members/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMember(data.member);
          setAttendanceHistory(data.attendanceHistory || []);
          setSevaHistory(data.sevaHistory || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-charcoal-subtle">
        Loading Member 360° Profile...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-charcoal">Member not found</p>
        <Link href="/members">
          <Button size="sm" variant="outline">&larr; Return to Registry</Button>
        </Link>
      </div>
    );
  }

  // Simulated 16-week attendance heatmap boxes
  const heatmapWeeks = Array.from({ length: 16 }, (_, i) => ({
    week: i + 1,
    present: i >= 16 - member.attendanceStreak,
  }));

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-subtle hover:text-charcoal transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </button>

      {/* Member 360 Header */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={member.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={member.name}
              className="h-16 w-16 rounded-3xl object-cover border-2 border-hairline shadow-soft"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-400/30 shadow-sm">
                  {member.memberCode}
                </span>
                <Badge variant={member.verificationStatus === "Verified" ? "success" : "warning"}>
                  {member.verificationStatus}
                </Badge>
              </div>
              <h1 className="font-heading text-2xl font-bold text-charcoal leading-tight mt-1">
                {member.name}
              </h1>
              <p className="text-xs text-charcoal-subtle">
                Household: <strong className="text-charcoal">{member.familyName}</strong> &bull; {member.relationship}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<QrCode className="h-4 w-4" />}
              onClick={() => toast.info(`Digital Pass Code: ${member.memberCode}`)}
            >
              Digital Pass
            </Button>
          </div>
        </div>

        {/* Attendance Heat-Strip */}
        <div className="border-t border-hairline pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-charcoal">Sabha Attendance Consistency (Past 16 Weeks)</span>
            <span className="font-semibold text-emerald-700">{member.attendanceStreak} Consecutive Weeks</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {heatmapWeeks.map((item) => (
              <div
                key={item.week}
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  item.present
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-surface-container text-charcoal-subtle"
                }`}
                title={`Week ${item.week}: ${item.present ? "Present" : "Absent"}`}
              >
                {item.week}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Profile Tabs */}
      <Tabs
        tabs={[
          { id: "overview", label: "Profile & Seva Skills", icon: <User className="h-4 w-4" /> },
          { id: "attendance", label: "Attendance Log", count: attendanceHistory.length, icon: <Calendar className="h-4 w-4" /> },
          { id: "seva", label: "Seva Shifts", count: sevaHistory.length, icon: <Sparkles className="h-4 w-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <GlassCard className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-charcoal-subtle block">Date of Birth:</span>
              <span className="font-bold text-charcoal">{member.dob} (Gender: {member.gender})</span>
            </div>
            <div>
              <span className="text-charcoal-subtle block">Mobile Number:</span>
              <span className="font-bold text-charcoal">+91 {member.phone}</span>
            </div>
            <div>
              <span className="text-charcoal-subtle block">WhatsApp Broadcast Consent:</span>
              <span className="font-bold text-emerald-600">Active / Consented</span>
            </div>
            <div>
              <span className="text-charcoal-subtle block">Photo Usage Consent:</span>
              <span className="font-bold text-charcoal">{member.photoConsent ? "Granted" : "Restricted"}</span>
            </div>
          </div>

          <div className="border-t border-hairline pt-4 space-y-2">
            <h4 className="font-heading text-sm font-bold text-charcoal">Assigned Seva Skills &amp; Departments</h4>
            <div className="flex flex-wrap gap-1.5">
              {member.sevaSkills?.map((skill: string, i: number) => (
                <span key={i} className="rounded-xl bg-amber-500/15 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === "attendance" && (
        <GlassCard className="p-6 space-y-3">
          <h4 className="font-heading text-sm font-bold text-charcoal">Recent Sabha Check-Ins</h4>
          <div className="divide-y divide-hairline">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-charcoal">Sunday Evening Satsang Sabha</p>
                <p className="text-charcoal-subtle">23-Aug-2026 &bull; Entry Mode: QR Scanner</p>
              </div>
              <Badge variant="success">Present</Badge>
            </div>
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-charcoal">Saturday Morning Dhyan Sabha</p>
                <p className="text-charcoal-subtle">22-Aug-2026 &bull; Entry Mode: Search</p>
              </div>
              <Badge variant="success">Present</Badge>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 3: Seva */}
      {activeTab === "seva" && (
        <GlassCard className="p-6 space-y-3">
          <h4 className="font-heading text-sm font-bold text-charcoal">Seva Duties &amp; Shifts</h4>
          <div className="divide-y divide-hairline">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-charcoal">Sunday Mahaprasad Kitchen Duty</p>
                <p className="text-charcoal-subtle">23-Aug-2026 &bull; 16:00 - 19:00</p>
              </div>
              <Badge variant="success">Checked In</Badge>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
