"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import {
  Megaphone,
  Send,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Users,
  Clock,
  Plus,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function AnnouncementsPage() {
  const { role, user, language } = useApp();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [gujaratiTitle, setGujaratiTitle] = useState("");
  const [body, setBody] = useState("");
  const [gujaratiBody, setGujaratiBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("Everyone");
  const [channels, setChannels] = useState<string[]>(["App Push", "WhatsApp"]);

  const fetchAnnouncements = () => {
    setLoading(true);
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAnnouncements(data.announcements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSendAnnouncement = async () => {
    if (!title || !body) {
      toast.error("Please provide title and announcement message.");
      return;
    }
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          gujaratiTitle,
          body,
          gujaratiBody,
          targetAudience,
          channels,
          authorName: user.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Broadcast Dispatched", {
          description: `Delivered to ${data.announcement?.stats?.sentCount || 380} recipients across ${channels.join(", ")}.`,
        });
        setComposerOpen(false);
        setTitle("");
        setBody("");
        fetchAnnouncements();
      }
    } catch (e: any) {
      toast.error("Broadcast failed: " + e.message);
    }
  };

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-600" />
            <h1 className="font-heading text-2xl font-bold text-stone-900">
              {language === "gu" ? "સૂચના અને સંદેશા" : "Communication & Broadcast Center"}
            </h1>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Targeted announcements via WhatsApp, App Push &amp; SMS with mobile preview
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            onClick={() => setComposerOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            + Compose Broadcast
          </Button>
        </div>
      </div>

      {/* Announcements Stream */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((item) => (
          <GlassCard key={item._id} className="p-6 space-y-4 flex flex-col justify-between bg-white border-stone-200/90 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="primary" size="sm">
                  Audience: {item.targetAudience}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                  <Clock className="h-3.5 w-3.5 text-stone-400" />
                  <span>{new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold text-stone-900">{item.title}</h3>
                {item.gujaratiTitle && (
                  <p className="text-xs font-gujarati text-amber-800 font-semibold mt-0.5">{item.gujaratiTitle}</p>
                )}
              </div>

              <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                {item.body}
              </p>

              {item.gujaratiBody && (
                <p className="text-xs font-gujarati text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  {item.gujaratiBody}
                </p>
              )}

              {/* Delivery Stats Bar */}
              <div className="grid grid-cols-3 gap-2 border-t border-stone-200 pt-3 text-center text-xs">
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                  <p className="text-[10px] text-stone-500 font-semibold">Sent</p>
                  <p className="font-bold text-stone-900 font-mono">{item.stats?.sentCount || 0}</p>
                </div>
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                  <p className="text-[10px] text-stone-500 font-semibold">Delivered</p>
                  <p className="font-bold text-emerald-700 font-mono">{item.stats?.deliveredCount || 0}</p>
                </div>
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                  <p className="text-[10px] text-stone-500 font-semibold">Opened</p>
                  <p className="font-bold text-amber-700 font-mono">{item.stats?.openedCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>Author: <strong className="text-stone-800">{item.authorName}</strong></span>
              <div className="flex gap-1">
                {item.channels?.map((ch: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-800">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Broadcast Composer Modal with Mobile Preview */}
      <Modal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        title="Compose Mandir Broadcast"
        subtitle="Multi-channel announcement with WhatsApp and Push previews"
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-stone-700">Title (English) *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Important Janmashtami Sabha Update"
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white placeholder:text-stone-400 shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700">Title (Gujarati Optional)</label>
              <input
                type="text"
                value={gujaratiTitle}
                onChange={(e) => setGujaratiTitle(e.target.value)}
                placeholder="e.g. મહત્વપૂર્ણ સત્સંગ સભા સૂચના"
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3.5 text-xs font-gujarati text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700">Message Body *</label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter details of announcement..."
                className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white placeholder:text-stone-400 shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700">Target Audience Filter</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white shadow-xs"
              >
                <option value="Everyone" className="bg-white text-stone-900">Everyone in Mandir Directory (380)</option>
                <option value="All Families" className="bg-white text-stone-900">All Registered Family Captains (65)</option>
                <option value="Karyakartas Only" className="bg-white text-stone-900">Karyakartas &amp; Field Volunteers (24)</option>
                <option value="Kitchen Seva Volunteers" className="bg-white text-stone-900">Kitchen Seva Volunteers (18)</option>
                <option value="Area: Station Road" className="bg-white text-stone-900">Area: Station Road (42)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="md" onClick={() => setComposerOpen(false)}>
                Cancel
              </Button>
              <Button size="md" onClick={handleSendAnnouncement} leftIcon={<Send className="h-4 w-4" />}>
                Send Broadcast
              </Button>
            </div>
          </div>

          {/* Live Mobile Notification Preview Simulator */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
              <Smartphone className="h-4 w-4 text-stone-500" />
              <span>Mobile Notification Preview</span>
            </div>

            <div className="w-full rounded-2xl bg-white p-4 shadow-md border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-stone-500">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <span className="h-4 w-4 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#EA580C] text-white flex items-center justify-center text-[9px] font-bold shadow-xs">હ</span>
                  <span>HariSumiran</span>
                </div>
                <span>Now</span>
              </div>
              <p className="font-bold text-xs text-stone-900 leading-snug">
                {title || "Announcement Headline"}
              </p>
              <p className="text-[11px] text-stone-600 line-clamp-3 leading-relaxed">
                {body || "Your message preview will appear here in real-time as you compose."}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
