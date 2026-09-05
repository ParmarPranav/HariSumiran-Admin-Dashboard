"use client";

import React, { useState, useEffect } from "react";
import { useApp, getRoleLabel } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { QRScannerModal } from "@/components/ui/QRScannerModal";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  ArrowRight,
  Plus,
  UtensilsCrossed,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { role, user, t, language } = useApp();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login page at start
    router.replace("/auth");
  }, [router]);

  // Today's greeting in Gujarati / English
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-subtle">
              {todayFormatted}
            </p>
          </div>
          <h1 className="mt-1 font-heading text-2xl md:text-3xl font-bold tracking-tight text-charcoal">
            {language === "gu" ? "જય સ્વામિનારાયણ" : "Jai Swaminarayan"},{" "}
            <span className="text-primary-container">{user.name}</span>
          </h1>
          <p className="text-xs md:text-sm text-charcoal-subtle mt-0.5">
            {getRoleLabel(role)} &bull; {user.mandir}
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            leftIcon={<QrCode className="h-4 w-4 text-primary-container" />}
            onClick={() => setQrModalOpen(true)}
          >
            Scan QR
          </Button>
          {role === "karyakarta" && (
            <Link href="/sabha">
              <Button size="md" leftIcon={<CalendarDays className="h-4 w-4" />}>
                Live Attendance
              </Button>
            </Link>
          )}
          {role === "mandir_admin" && (
            <Link href="/announcements">
              <Button size="md" leftIcon={<Plus className="h-4 w-4" />}>
                New Broadcast
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Role-Aware Dynamic View */}
      {role === "mandir_admin" || role === "super_admin" ? (
        <AdminDashboardView data={data} />
      ) : role === "karyakarta" ? (
        <KaryakartaTodayView onOpenQR={() => setQrModalOpen(true)} />
      ) : role === "dept_head" ? (
        <DeptHeadDashboardView />
      ) : (
        <FamilyPortalView />
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanSuccess={(code) => {
          toast.success("Identity Verified", { description: `Scanned code: ${code}` });
        }}
      />
    </div>
  );
}

// 1. Mandir Administrator Operations Dashboard
function AdminDashboardView({ data }: { data: any }) {
  const [approving, setApproving] = useState<string | null>(null);

  const handleApprove = (id: string, name: string) => {
    setApproving(id);
    setTimeout(() => {
      setApproving(null);
      toast.success("Approved", { description: `${name} approved successfully.` });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Alerts & Risks Band */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="border-l-4 border-l-amber-500 bg-amber-50/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-charcoal">3 Follow-Up Cases Overdue &gt; 7 Days</h4>
              <p className="text-xs text-charcoal-subtle mt-0.5">Trivedi Parivar, Vora Family require urgent supervisor review.</p>
              <Link href="/follow-up" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-container hover:underline">
                Review Cases <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-emerald-600 bg-emerald-50/30">
          <div className="flex items-start gap-3">
            <UtensilsCrossed className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-charcoal">Today's Thal: 100% Covered</h4>
              <p className="text-xs text-charcoal-subtle mt-0.5">Morning Thal: Patel Household &bull; Evening: Shah Family.</p>
              <Link href="/thal" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline">
                View Rotation <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-primary-container bg-saffron-50/30">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-primary-container shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-charcoal">Sunday Evening Sabha Live</h4>
              <p className="text-xs text-charcoal-subtle mt-0.5">94 / 140 Marked Present &bull; 5 Seva Volunteers Checked In.</p>
              <Link href="/sabha" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-container hover:underline">
                Open Console <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Families"
          value={data?.kpis?.totalFamilies || "6"}
          subtitle="All Nadiad zones"
          icon={<Users className="h-5 w-5 text-primary-container" />}
          iconBg="saffron"
        />
        <StatCard
          title="Registered Members"
          value={data?.kpis?.totalMembers || "6"}
          subtitle="Verified & active"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          iconBg="green"
        />
        <StatCard
          title="Active Follow-ups"
          value={data?.kpis?.activeFollowUps || "3"}
          subtitle="1 Due Today"
          icon={<HeartHandshake className="h-5 w-5 text-amber-600" />}
          iconBg="neutral"
        />
        <StatCard
          title="Avg Sabha Attendance"
          value="94 Devotees"
          subtitle="+8% this month"
          icon={<TrendingUp className="h-5 w-5 text-sky-600" />}
          iconBg="blue"
        />
      </div>

      {/* Operational Hub: Pending Approvals & Live Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Queue */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="font-heading text-base font-bold text-charcoal">Pending Approvals Queue</h3>
              <p className="text-xs text-charcoal-subtle">Human confirmation required for sensitive actions</p>
            </div>
            <Badge variant="primary">2 Pending</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-hairline bg-surface-container-low/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="sm">Thal Swap Request</Badge>
                  <span className="text-xs font-semibold text-charcoal">Trivedi Parivar &rarr; Open Waitlist</span>
                </div>
                <p className="text-xs text-charcoal-subtle">
                  Reason: Medical recovery after cataract surgery &bull; Date: 26-Aug-2026
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info("Request Returned with Feedback")}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  isLoading={approving === "swap1"}
                  onClick={() => handleApprove("swap1", "Thal Swap for Trivedi Parivar")}
                >
                  Approve
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-hairline bg-surface-container-low/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="sm">Hall Booking</Badge>
                  <span className="text-xs font-semibold text-charcoal">Dining Hall (Bhojanshala)</span>
                </div>
                <p className="text-xs text-charcoal-subtle">
                  Mukeshbhai Shah &bull; 29-Aug (12:00 - 15:00) &bull; 75 Attendees
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.info("Booking Rejected")}>
                  Decline
                </Button>
                <Button
                  size="sm"
                  isLoading={approving === "room1"}
                  onClick={() => handleApprove("room1", "Dining Hall Booking")}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Navigation Cards */}
        <div className="space-y-4">
          <GlassCard className="p-4 space-y-3">
            <h4 className="font-heading text-sm font-bold text-charcoal">Upcoming Major Event</h4>
            <div className="rounded-xl border border-saffron-200 bg-saffron-50/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-saffron-800">Janmashtami Mahotsav</span>
                <Badge variant="primary" size="sm">30 Aug</Badge>
              </div>
              <p className="text-[11px] text-charcoal-subtle mt-1">420 / 600 Passes Issued</p>
              <div className="w-full bg-saffron-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary-container h-full rounded-full" style={{ width: "70%" }} />
              </div>
            </div>
            <Link href="/events" className="flex items-center justify-between text-xs font-semibold text-primary-container hover:underline">
              <span>View Committee & Tasks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </GlassCard>

          <GlassCard className="p-4 space-y-2.5">
            <h4 className="font-heading text-sm font-bold text-charcoal">Mandir Health & System</h4>
            <div className="flex items-center justify-between text-xs py-1 border-b border-hairline">
              <span className="text-charcoal-subtle">MongoDB Connection</span>
              <span className="font-medium text-emerald-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Atlas Online
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-hairline">
              <span className="text-charcoal-subtle">Daily Backup</span>
              <span className="font-medium text-charcoal">02:00 AM IST (Passed)</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-charcoal-subtle">Audit Trail</span>
              <Link href="/admin" className="font-semibold text-primary-container hover:underline">
                View Log
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// 2. Karyakarta Today View (Fieldwork Focus)
function KaryakartaTodayView({ onOpenQR }: { onOpenQR: () => void }) {
  return (
    <div className="space-y-6">
      {/* Next Actions Card (Max 3) */}
      <GlassCard className="space-y-3 border-l-4 border-l-primary-container">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-bold text-charcoal">Today's Priority Actions</h3>
          <Badge variant="primary">3 Tasks</Badge>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl border border-hairline bg-surface-container-low/30 hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal">Call Trivedi Parivar — Surgery Follow-up</p>
                <p className="text-[11px] text-charcoal-subtle">Overdue 2 days &bull; Contact Hareshbhai (98250 76543)</p>
              </div>
            </div>
            <Link href="/follow-up">
              <Button size="sm">Open Case</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-hairline bg-surface-container-low/30 hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron-100 text-saffron-800">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal">Sunday Evening Satsang Sabha Attendance</p>
                <p className="text-[11px] text-charcoal-subtle">Session is Live &bull; 94 Check-ins logged</p>
              </div>
            </div>
            <Link href="/sabha">
              <Button size="sm" variant="secondary">Mark Attendance</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-hairline bg-surface-container-low/30 hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal">Kitchen Seva Shift Check-In</p>
                <p className="text-[11px] text-charcoal-subtle">16:00 - 19:00 with Dipakbhai Shah</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onOpenQR}>Scan QR Check-In</Button>
          </div>
        </div>
      </GlassCard>

      {/* Field KPI Strip */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="text-center p-4">
          <p className="text-xs font-medium text-charcoal-subtle">Families in Your Zone</p>
          <p className="font-heading text-xl font-bold text-charcoal mt-1">18</p>
        </GlassCard>
        <GlassCard className="text-center p-4">
          <p className="text-xs font-medium text-charcoal-subtle">Visits This Month</p>
          <p className="font-heading text-xl font-bold text-emerald-600 mt-1">12</p>
        </GlassCard>
        <GlassCard className="text-center p-4">
          <p className="text-xs font-medium text-charcoal-subtle">Pending Notes</p>
          <p className="font-heading text-xl font-bold text-amber-600 mt-1">1</p>
        </GlassCard>
      </div>
    </div>
  );
}

// 3. Department Head Dashboard View
function DeptHeadDashboardView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Kitchen Volunteers"
          value="8 / 10"
          subtitle="Sunday Mahaprasad Duty"
          icon={<Sparkles className="h-5 w-5 text-secondary" />}
          iconBg="green"
        />
        <StatCard
          title="Kitchen Utensil Inventory"
          value="14 Units"
          subtitle="Steam cookers inspected"
          icon={<UtensilsCrossed className="h-5 w-5 text-primary-container" />}
          iconBg="saffron"
        />
        <StatCard
          title="Open Seva Slots"
          value="2 Slots"
          subtitle="Janmashtami prep"
          icon={<Users className="h-5 w-5 text-sky-600" />}
          iconBg="blue"
        />
      </div>

      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h3 className="font-heading text-base font-bold text-charcoal">Today's Kitchen Volunteer Roster</h3>
          <Link href="/seva">
            <Button size="sm" variant="outline">Manage Full Roster</Button>
          </Link>
        </div>

        <div className="divide-y divide-hairline">
          <div className="py-2.5 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-charcoal">Rameshbhai Patel</p>
              <p className="text-charcoal-subtle">Mahaprasad Preparation &bull; 16:00 - 19:00</p>
            </div>
            <Badge variant="success">Checked In</Badge>
          </div>
          <div className="py-2.5 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-charcoal">Hansaben Patel</p>
              <p className="text-charcoal-subtle">Mahaprasad Preparation &bull; 16:00 - 19:00</p>
            </div>
            <Badge variant="success">Checked In</Badge>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// 4. Family Captain / Member View
function FamilyPortalView() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Your Thal Turn Card */}
      <GlassCard className="border-l-4 border-l-secondary bg-emerald-50/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-secondary" />
            <h3 className="font-heading text-base font-bold text-charcoal">Your Household Thal Turn</h3>
          </div>
          <Badge variant="success">Assigned</Badge>
        </div>

        <p className="text-xs text-charcoal-subtle leading-relaxed">
          Your family is scheduled for <strong>Morning Thal</strong> on <strong>Sunday, 23rd August</strong> (Headcount: 45).
        </p>

        <div className="flex items-center gap-2 pt-2">
          {confirmed ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Turn Confirmed with Mandir Office
            </div>
          ) : (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setConfirmed(true);
                  toast.success("Thal Turn Confirmed", { description: "Mandir kitchen team notified." });
                }}
              >
                Confirm Turn
              </Button>
              <Link href="/thal">
                <Button size="sm" variant="outline">Request Swap</Button>
              </Link>
            </>
          )}
        </div>
      </GlassCard>

      {/* Mandir Announcements Feed */}
      <GlassCard className="space-y-3">
        <h3 className="font-heading text-base font-bold text-charcoal">Updates from Mandir Office</h3>
        <div className="p-3 rounded-xl border border-hairline bg-surface-container-low/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal">Janmashtami Mahotsav Pass Available</span>
            <span className="text-[10px] text-charcoal-subtle">Today</span>
          </div>
          <p className="text-xs text-charcoal-subtle">
            Get your digital entry pass for the 30th August celebration.
          </p>
          <Link href="/events" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-container hover:underline pt-1">
            View My Pass <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
