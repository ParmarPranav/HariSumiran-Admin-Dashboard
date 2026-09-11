"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QRScannerModal } from "@/components/ui/QRScannerModal";
import Link from "next/link";
import {
  CalendarDays,
  QrCode,
  Search,
  CheckCircle2,
  Users,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function SabhaPage() {
  const { role, language } = useApp();
  const [sabhas, setSabhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [activeSession, setActiveSession] = useState<any>(null);

  // Live Attendance Console state
  const [liveMode, setLiveMode] = useState<"search" | "list" | "qr">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [roster, setRoster] = useState<any[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // New Sabha Form state
  const [newSabha, setNewSabha] = useState({
    title: "",
    gujaratiTitle: "",
    type: "Evening Sabha",
    date: new Date().toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "20:00",
    location: "Main Satsang Hall, Nadiad",
    expectedCount: 140,
  });

  const fetchSabhas = () => {
    setLoading(true);
    fetch("/api/sabha")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSabhas(data.sabhas || []);
          const live = data.sabhas.find((s: any) => s.status === "Live") || data.sabhas[0];
          setActiveSession(live);
          if (live) fetchRoster(live._id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchRoster = (sabhaId: string) => {
    fetch(`/api/sabha/attendance?sabhaId=${sabhaId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRoster(data.roster || []);
        }
      });
  };

  useEffect(() => {
    fetchSabhas();
  }, []);

  const handleMarkAttendance = async (memberCode: string) => {
    if (!activeSession) return;
    try {
      const res = await fetch("/api/sabha/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sabhaId: activeSession._id,
          memberCode,
          mode: liveMode.toUpperCase(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Marked Present: ${data.member.name}`, {
          description: `Attendance streak: ${data.member.streak} weeks.`,
        });
        fetchRoster(activeSession._id);
        // update present count in active session
        setActiveSession((prev: any) => ({ ...prev, presentCount: data.liveCount }));
      } else {
        toast.error(data.error || "Member not found");
      }
    } catch (e: any) {
      toast.error("Error marking attendance: " + e.message);
    }
  };

  const handleScheduleSabha = async () => {
    if (!newSabha.title || !newSabha.date) {
      toast.error("Title and Date are required.");
      return;
    }
    try {
      const res = await fetch("/api/sabha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSabha),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Sabha Scheduled Successfully");
        setScheduleModalOpen(false);
        fetchSabhas();
      }
    } catch (e: any) {
      toast.error("Error scheduling sabha: " + e.message);
    }
  };

  const filteredRoster = roster.filter(
    (m) =>
      m.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.familyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
  );

  const presentCount = roster.filter((m) => m.isPresent).length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-amber-400" />
            <h1 className="font-heading text-2xl font-bold text-white">
              {language === "gu" ? "સભા અને લાઈવ હાજરી" : "Sabha & Live Attendance Console"}
            </h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            Real-time multi-mode check-in (Search &bull; Full Roster &bull; QR Pass)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            leftIcon={<QrCode className="h-4 w-4 text-amber-400" />}
            onClick={() => setQrModalOpen(true)}
          >
            Launch QR Scanner
          </Button>
          <Button
            size="md"
            onClick={() => setScheduleModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            + Schedule Sabha
          </Button>
        </div>
      </div>

      {/* Active Session Console Hero */}
      {activeSession && (
        <GlassCard className="border-l-4 border-l-amber-400 p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30 uppercase">
                  {activeSession.status} Session
                </span>
                <span className="text-xs text-charcoal-subtle">&bull; {activeSession.type}</span>
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-white mt-1">
                {activeSession.title}
              </h2>
              <p className="text-xs text-charcoal-subtle mt-0.5">
                {activeSession.date} &bull; {activeSession.startTime} - {activeSession.endTime} &bull; {activeSession.location}
              </p>
            </div>

            {/* Live Count Stat Strip */}
            <div className="flex items-center gap-4 bg-surface-container-low/60 p-3.5 rounded-2xl border border-hairline">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Present / Expected</p>
                <p className="font-heading text-2xl font-extrabold text-white">
                  <span className="text-amber-300">{presentCount}</span> / {activeSession.expectedCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-heading font-bold text-sm">
                {Math.round((presentCount / (activeSession.expectedCount || 1)) * 100)}%
              </div>
            </div>
          </div>

          {/* 3 Entry Modes Bar */}
          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex gap-1.5 bg-white/[0.04] p-1 rounded-2xl border border-white/10 inline-flex">
                <button
                  onClick={() => setLiveMode("search")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    liveMode === "search"
                      ? "bg-amber-500/20 text-amber-300 shadow-sm border border-amber-400/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Typeahead Search</span>
                </button>
                <button
                  onClick={() => setLiveMode("list")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    liveMode === "list"
                      ? "bg-amber-500/20 text-amber-300 shadow-sm border border-amber-400/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Full Roster List</span>
                </button>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-amber-400 hover:bg-amber-500/15 transition-colors"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Camera QR Scanner</span>
                </button>
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type name or phone to mark..."
                  className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Roster / Search Results Stream */}
            <div className="max-h-72 overflow-y-auto divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#161B28]/60">
              {filteredRoster.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No devotees found matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredRoster.map((member) => (
                  <div
                    key={member.memberId}
                    className="flex items-center justify-between p-3 text-xs hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{member.memberName}</span>
                        <span className="text-[11px] text-slate-400">({member.familyName})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">+91 {member.phone} &bull; Streak: {member.attendanceStreak}w</p>
                    </div>

                    <div>
                      {member.isPresent ? (
                        <div className="flex items-center gap-1 text-emerald-300 font-bold text-xs bg-emerald-500/15 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Present
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAttendance(member.memberId)}
                        >
                          Mark Present
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Scheduled Sabhas History & Upcoming List */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-white">All Scheduled Satsang Sessions</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sabhas.map((sabha) => (
            <GlassCard key={sabha._id} hoverEffect className="p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={sabha.status === "Live" ? "danger" : sabha.status === "Completed" ? "success" : "primary"}>
                    {sabha.status}
                  </Badge>
                  <span className="text-[10px] font-mono font-semibold text-slate-400">{sabha.sabhaCode}</span>
                </div>

                <h4 className="font-heading text-base font-bold text-white leading-tight">
                  {sabha.title}
                </h4>
                {sabha.gujaratiTitle && (
                  <p className="text-xs text-slate-400 font-gujarati">{sabha.gujaratiTitle}</p>
                )}

                <div className="space-y-1 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sabha.date} ({sabha.startTime} - {sabha.endTime})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sabha.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sabha.presentCount} / {sabha.expectedCount} Attendees</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveSession(sabha);
                    fetchRoster(sabha._id);
                    toast.info(`Switched console to: ${sabha.title}`);
                  }}
                >
                  Manage Session &rarr;
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Live Sabha QR Attendance Scanner"
        subtitle="Point camera at devotee digital pass or member identity badge"
        onScanSuccess={(code) => handleMarkAttendance(code)}
      />

      {/* Schedule Sabha Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule New Satsang Sabha"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300">Sabha Title *</label>
            <input
              type="text"
              value={newSabha.title}
              onChange={(e) => setNewSabha({ ...newSabha, title: e.target.value })}
              placeholder="e.g. Sunday Evening Satsang Sabha"
              className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3.5 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Sabha Type</label>
              <select
                value={newSabha.type}
                onChange={(e) => setNewSabha({ ...newSabha, type: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
              >
                <option value="Evening Sabha" className="bg-[#161B28] text-white">Evening Sabha</option>
                <option value="Morning Sabha" className="bg-[#161B28] text-white">Morning Sabha</option>
                <option value="Youth Sabha" className="bg-[#161B28] text-white">Youth Sabha</option>
                <option value="Special Mahotsav" className="bg-[#161B28] text-white">Special Mahotsav</option>
                <option value="Bal Sabha" className="bg-[#161B28] text-white">Bal Sabha</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Date *</label>
              <input
                type="date"
                value={newSabha.date}
                onChange={(e) => setNewSabha({ ...newSabha, date: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Start Time</label>
              <input
                type="time"
                value={newSabha.startTime}
                onChange={(e) => setNewSabha({ ...newSabha, startTime: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">End Time</label>
              <input
                type="time"
                value={newSabha.endTime}
                onChange={(e) => setNewSabha({ ...newSabha, endTime: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Hall / Location</label>
            <input
              type="text"
              value={newSabha.location}
              onChange={(e) => setNewSabha({ ...newSabha, location: e.target.value })}
              className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3.5 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleScheduleSabha}>
              Schedule Sabha
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
