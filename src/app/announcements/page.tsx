"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary-container" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">
              {language === "gu" ? "સૂચના અને સંદેશા" : "Communication & Broadcast Center"}
            </h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((item) => (
          <GlassCard key={item._id} className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="primary" size="sm">
                  Audience: {item.targetAudience}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-charcoal-subtle">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal">{item.title}</h3>
                {item.gujaratiTitle && (
                  <p className="text-xs font-gujarati text-charcoal-subtle mt-0.5">{item.gujaratiTitle}</p>
                )}
              </div>

              <p className="text-xs text-charcoal-subtle leading-relaxed bg-surface-container-low/50 p-3 rounded-xl border border-hairline/60">
                {item.body}
              </p>

              {item.gujaratiBody && (
                <p className="text-xs font-gujarati text-charcoal-subtle leading-relaxed bg-surface-container-low/50 p-3 rounded-xl border border-hairline/60">
                  {item.gujaratiBody}
                </p>
              )}

              {/* Delivery Stats Bar */}
              <div className="grid grid-cols-3 gap-2 border-t border-hairline pt-3 text-center text-xs">
                <div className="p-2 rounded-xl bg-surface-container-low">
                  <p className="text-[10px] text-charcoal-subtle">Sent</p>
                  <p className="font-bold text-charcoal">{item.stats?.sentCount || 0}</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-container-low">
                  <p className="text-[10px] text-charcoal-subtle">Delivered</p>
                  <p className="font-bold text-emerald-600">{item.stats?.deliveredCount || 0}</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-container-low">
                  <p className="text-[10px] text-charcoal-subtle">Opened</p>
                  <p className="font-bold text-primary-container">{item.stats?.openedCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs text-charcoal-subtle">
              <span>Author: <strong>{item.authorName}</strong></span>
              <div className="flex gap-1">
                {item.channels?.map((ch: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-saffron-50 text-[10px] font-semibold text-primary-container">
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
              <label className="text-xs font-semibold text-charcoal">Title (English) *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Important Janmashtami Sabha Update"
                className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3.5 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Title (Gujarati Optional)</label>
              <input
                type="text"
                value={gujaratiTitle}
                onChange={(e) => setGujaratiTitle(e.target.value)}
                placeholder="e.g. મહત્વપૂર્ણ સત્સંગ સભા સૂચના"
                className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3.5 text-xs font-gujarati text-white focus:border-amber-400 focus:outline-none bg-white/5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Message Body *</label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter details of announcement..."
                className="mt-1 w-full rounded-xl border border-white/10 p-3 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Target Audience Filter</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 text-xs text-white focus:border-amber-400 focus:outline-none bg-white/5"
              >
                <option value="Everyone" className="bg-[#161B28] text-white">Everyone in Mandir Directory (380)</option>
                <option value="All Families" className="bg-[#161B28] text-white">All Registered Family Captains (65)</option>
                <option value="Karyakartas Only" className="bg-[#161B28] text-white">Karyakartas &amp; Field Volunteers (24)</option>
                <option value="Kitchen Seva Volunteers" className="bg-[#161B28] text-white">Kitchen Seva Volunteers (18)</option>
                <option value="Area: Station Road" className="bg-[#161B28] text-white">Area: Station Road (42)</option>
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
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Smartphone className="h-4 w-4" />
              <span>Mobile Notification Preview</span>
            </div>

            <div className="w-full rounded-2xl bg-[#161B28] p-3.5 shadow-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <span className="h-3.5 w-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] font-bold">હ</span>
                  <span>HariSumiran</span>
                </div>
                <span>Now</span>
              </div>
              <p className="font-bold text-xs text-white leading-snug">
                {title || "Announcement Headline"}
              </p>
              <p className="text-[11px] text-slate-400 line-clamp-3">
                {body || "Your message preview will appear here in real-time as you compose."}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
