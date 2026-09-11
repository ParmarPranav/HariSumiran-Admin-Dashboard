"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QRScannerModal } from "@/components/ui/QRScannerModal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import {
  PartyPopper,
  QrCode,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function EventsPage() {
  const { role, user, language } = useApp();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Digital Pass & Registration state
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<any>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const [attendeeName, setAttendeeName] = useState("Devansh Patel");
  const [attendeeFamily, setAttendeeFamily] = useState("Patel Household (Rameshbhai)");

  const fetchEvents = () => {
    setLoading(true);
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEvents(data.events || []);
          if (!selectedEvent && data.events?.length > 0) {
            setSelectedEvent(data.events[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent._id,
          memberName: attendeeName,
          familyName: attendeeFamily,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedPass({
          passCode: data.passCode,
          eventTitle: selectedEvent.title,
          memberName: attendeeName,
          date: selectedEvent.date,
          location: selectedEvent.location,
        });
        setRegisterModalOpen(false);
        setPassModalOpen(true);
        toast.success("Event Pass Issued", {
          description: `Pass Code: ${data.passCode}`,
        });
        fetchEvents();
      }
    } catch (e: any) {
      toast.error("Registration failed: " + e.message);
    }
  };

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-amber-600" />
            <h1 className="font-heading text-2xl font-bold text-stone-900">
              {language === "gu" ? "ઉત્સવ અને મહોત્સવ" : "Festivals, Events & Digital Passes"}
            </h1>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Festival oversight, committee planning tasks &amp; Apple Wallet-style QR passes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            leftIcon={<QrCode className="h-4 w-4 text-amber-600" />}
            onClick={() => setQrModalOpen(true)}
          >
            Scan Pass at Gate
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => {
          const isLive = evt.status === "Live";
          const progress = Math.round((evt.registeredCount / (evt.capacity || 1)) * 100);

          return (
            <SpotlightCard
              key={evt._id}
              spotlightColor={isLive ? "rgba(244, 63, 94, 0.12)" : "rgba(245, 158, 11, 0.12)"}
              className={`p-6 space-y-5 border-l-4 bg-white border-stone-200/90 shadow-sm ${
                isLive ? "border-l-rose-500" : "border-l-amber-500"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-500">{evt.eventCode}</span>
                    <Badge variant={isLive ? "danger" : "primary"} size="sm">
                      {evt.status}
                    </Badge>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-stone-900 mt-1 leading-tight">
                    {evt.title}
                  </h3>
                  {evt.gujaratiTitle && (
                    <p className="text-xs text-amber-800 font-semibold font-gujarati mt-0.5">{evt.gujaratiTitle}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">{evt.description}</p>

              {/* Progress Capacity Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-600">Registration Capacity:</span>
                  <span className="font-mono font-bold text-amber-800">
                    {evt.registeredCount} / {evt.capacity} Devotees ({progress}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-stone-100 border border-stone-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] to-[#EA580C] transition-all duration-300 shadow-xs"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Committee Leads */}
              {evt.committeeLeads && evt.committeeLeads.length > 0 && (
                <div className="space-y-2 border-t border-stone-200 pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Organizing Committee Leads
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {evt.committeeLeads.map((lead: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                        <p className="font-bold text-stone-900">{lead.leadName}</p>
                        <p className="text-[10px] text-stone-500 font-medium">{lead.department}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Checklist */}
              {evt.tasks && evt.tasks.length > 0 && (
                <div className="space-y-1.5 border-t border-stone-200 pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Readiness Checklist ({evt.tasks.filter((t: any) => t.completed).length} / {evt.tasks.length})
                  </p>
                  <div className="space-y-1">
                    {evt.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-2 text-xs text-stone-700">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 ${
                            task.completed ? "text-emerald-600 font-bold" : "text-stone-300"
                          }`}
                        />
                        <span className={task.completed ? "line-through text-stone-400" : "font-medium"}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                <div className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-amber-600" />
                  <span>{evt.date}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedEvent(evt);
                    setRegisterModalOpen(true);
                  }}
                >
                  Get Digital Pass &rarr;
                </Button>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Register Pass Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Get Event Entry Pass"
        subtitle={selectedEvent?.title}
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-700">Attendee Devotee Name *</label>
            <input
              type="text"
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700">Household Name</label>
            <input
              type="text"
              value={attendeeFamily}
              onChange={(e) => setAttendeeFamily(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleRegister}>
              Generate Pass
            </Button>
          </div>
        </div>
      </Modal>

      {/* Apple Wallet-Style Pass Modal */}
      {generatedPass && (
        <Modal
          isOpen={passModalOpen}
          onClose={() => setPassModalOpen(false)}
          title="Digital Entry Pass"
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            <div className="rounded-3xl border border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-stone-50 p-6 shadow-xl space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#EA580C] text-white font-heading font-black text-xl shadow-sm">
                હ
              </div>

              <div>
                <h4 className="font-heading text-base font-bold text-stone-900">{generatedPass.eventTitle}</h4>
                <p className="text-xs text-stone-500">HariPrabodham Mandir, Nadiad</p>
              </div>

              {/* Simulated QR Code */}
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl bg-white p-2.5 border border-amber-200 shadow-sm">
                <QrCode className="h-28 w-28 text-stone-900" />
              </div>

              <div className="border-t border-dashed border-stone-300 pt-3 text-xs space-y-1">
                <p className="font-bold text-stone-900">{generatedPass.memberName}</p>
                <p className="font-mono text-[11px] font-bold text-amber-800">{generatedPass.passCode}</p>
                <p className="text-[10px] text-stone-500">Date: {generatedPass.date} &bull; Gate Pass</p>
              </div>
            </div>

            <Button size="md" className="w-full" onClick={() => setPassModalOpen(false)}>
              Done
            </Button>
          </div>
        </Modal>
      )}

      {/* Gate Pass QR Scanner */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Event Gate Pass Scanner"
        subtitle="Verify digital passes at mandir entrance gates"
        onScanSuccess={(code) => {
          toast.success("Pass Validated", {
            description: `Devotee admitted with pass: ${code}`,
          });
        }}
      />
    </div>
  );
}
