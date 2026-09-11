"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
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
      <div className="p-8 text-center text-xs text-stone-500 font-medium">
        Loading Member 360° Profile...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-stone-900">Member not found</p>
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
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <MandalaBackground />

      {/* Back Link */}
      <div className="relative z-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Members
        </button>
      </div>

      {/* Member 360 Header */}
      <GlassCard className="relative z-10 p-6 space-y-4 bg-white border-stone-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={member.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={member.name}
              className="h-16 w-16 rounded-3xl object-cover border-2 border-amber-400 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-xs">
                  {member.memberCode}
                </span>
                <Badge variant={member.verificationStatus === "Verified" ? "success" : "warning"}>
                  {member.verificationStatus}
                </Badge>
              </div>
              <h1 className="font-heading text-2xl font-bold text-stone-900 leading-tight mt-1">
                {member.name}
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                Household: <strong className="text-stone-900">{member.familyName}</strong> &bull; {member.relationship}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<QrCode className="h-4 w-4 text-amber-600" />}
              onClick={() => toast.info(`Digital Pass Code: ${member.memberCode}`)}
            >
              Digital Pass
            </Button>
          </div>
        </div>

        {/* Attendance Heat-Strip */}
        <div className="border-t border-stone-200 pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-stone-700">Sabha Attendance Consistency (Past 16 Weeks)</span>
            <span className="text-emerald-700 font-bold">{member.attendanceStreak} Consecutive Weeks</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {heatmapWeeks.map((item) => (
              <div
                key={item.week}
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  item.present
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-stone-100 text-stone-400 border border-stone-200"
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
      <div className="relative z-10">
        <Tabs
          tabs={[
            { id: "overview", label: "Profile & Seva Skills", icon: <User className="h-4 w-4" /> },
            { id: "attendance", label: "Attendance Log", count: attendanceHistory.length, icon: <Calendar className="h-4 w-4" /> },
            { id: "seva", label: "Seva Shifts", count: sevaHistory.length, icon: <Sparkles className="h-4 w-4" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <GlassCard className="relative z-10 p-6 space-y-4 bg-white border-stone-200/90 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <span className="text-stone-500 block">Date of Birth:</span>
              <span className="font-bold text-stone-900">{member.dob} (Gender: {member.gender})</span>
            </div>
            <div>
              <span className="text-stone-500 block">Mobile Number:</span>
              <span className="font-bold text-stone-900 font-mono">+91 {member.phone}</span>
            </div>
            <div>
              <span className="text-stone-500 block">WhatsApp Broadcast Consent:</span>
              <span className="font-bold text-emerald-700">Active / Consented</span>
            </div>
            <div>
              <span className="text-stone-500 block">Photo Usage Consent:</span>
              <span className="font-bold text-stone-900">{member.photoConsent ? "Granted" : "Restricted"}</span>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4 space-y-2">
            <h4 className="font-heading text-sm font-bold text-stone-900">Assigned Seva Skills &amp; Departments</h4>
            <div className="flex flex-wrap gap-1.5">
              {member.sevaSkills?.map((skill: string, i: number) => (
                <span key={i} className="rounded-xl bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 shadow-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === "attendance" && (
        <GlassCard className="relative z-10 p-6 space-y-3 bg-white border-stone-200/90 shadow-sm">
          <h4 className="font-heading text-sm font-bold text-stone-900">Recent Sabha Check-Ins</h4>
          <div className="divide-y divide-stone-100">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-stone-900">Sunday Evening Satsang Sabha</p>
                <p className="text-stone-500">23-Aug-2026 &bull; Entry Mode: QR Scanner</p>
              </div>
              <Badge variant="success">Present</Badge>
            </div>
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-stone-900">Saturday Morning Dhyan Sabha</p>
                <p className="text-stone-500">22-Aug-2026 &bull; Entry Mode: Search</p>
              </div>
              <Badge variant="success">Present</Badge>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 3: Seva */}
      {activeTab === "seva" && (
        <GlassCard className="relative z-10 p-6 space-y-3 bg-white border-stone-200/90 shadow-sm">
          <h4 className="font-heading text-sm font-bold text-stone-900">Seva Duties &amp; Shifts</h4>
          <div className="divide-y divide-stone-100">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-stone-900">Sunday Mahaprasad Kitchen Duty</p>
                <p className="text-stone-500">23-Aug-2026 &bull; 16:00 - 19:00</p>
              </div>
              <Badge variant="success">Checked In</Badge>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
