"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Send,
  BellRing,
  Smartphone,
  Radio,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Users,
  Copy,
  Check,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Play,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  CornerDownRight,
  Wifi,
  Battery,
  Flame,
  SmartphoneCharging,
  Maximize2,
  Columns2,
  LayoutTemplate,
  CheckCheck,
  XCircle,
  Activity,
  Compass,
  HeartHandshake,
  Calendar,
  UtensilsCrossed,
  Volume1,
} from "lucide-react";

interface PushNotificationStudioProps {
  stats: {
    totalUsers: number;
    usersWithTokens: number;
    totalTokens: number;
    platformBreakdown: { android: number; ios: number; web: number; other: number };
    roleBreakdown: Record<string, number>;
    firebaseConnected: boolean;
    firebaseStatus?: {
      connected: boolean;
      projectId: string | null;
      clientEmail: string | null;
      hasPrivateKey: boolean;
      error: string | null;
    };
  } | null;
  devotees: {
    id: string;
    name: string;
    phone: string;
    role: string;
    tokensCount: number;
    platforms: string[];
  }[];
  history: any[];
  loading: boolean;
  onRefresh: () => void;
  currentUser?: any;
}

// 5 Curated Temple Notification Presets for HariPrabodham, Nadiad
const PRESET_TEMPLATES = [
  {
    id: "sabha",
    label: "Sunday Sabha Alert",
    gujaratiLabel: "રવિવાર સભા સૂચના",
    title: "Sunday Sabha at 5:00 PM",
    gujaratiTitle: "રવિવાર સભા સાંજે ૫:૦૦ કલાકે",
    body: "All devotees are warmly welcomed for this week's sacred sabha and divine darshan. Mahaprasad will follow.",
    gujaratiBody: "આ અઠવાડિયાની પવિત્ર સભા અને દિવ્ય દર્શન માટે તમામ ભક્તોનું સ્વાગત છે. સભા બાદ મહાપ્રસાદ યોજાશે.",
    route: "/sabha",
    priority: "high" as const,
    icon: Sparkles,
  },
  {
    id: "thal",
    label: "Mahaprasad Thal Rotation",
    gujaratiLabel: "મહાપ્રસાદ થાળ સેવા",
    title: "Today's Thal Seva Rotation Updated",
    gujaratiTitle: "આજનો થાળ સેવા રોટેશન અપડેટ",
    body: "Assigned Thal Captains: Kindly check your scheduled timing and devotee parivar responsibilities in the app.",
    gujaratiBody: "પરિવાર થાળ કેપ્ટનશ્રીઓ: કૃપા કરી એપ્લિકેશનમાં તમારા નિર્ધારિત સમય અને જવાબદારીઓની સમીક્ષા કરો.",
    route: "/thal",
    priority: "high" as const,
    icon: UtensilsCrossed,
  },
  {
    id: "announcement",
    label: "Mandir Mahotsav Notice",
    gujaratiLabel: "મંદિર ઉત્સવ જાહેરાત",
    title: "Special Satsang & Kirtan Aradhana",
    gujaratiTitle: "વિશેષ સત્સંગ અને કીર્તન આરાધના",
    body: "Sacred festivities and kirtan bhakti commence tonight at HariPrabodham, Nadiad. Join with your entire parivar.",
    gujaratiBody: "આજે સાંજે હરિપ્રબોધમ્, નડિયાદ ખાતે વિશેષ કીર્તન આરાધના યોજાશે. સમગ્ર પરિવાર સાથે પધારવા વિનંતી.",
    route: "/announcements",
    priority: "normal" as const,
    icon: BellRing,
  },
  {
    id: "youth",
    label: "Youth Satsang Sabha",
    gujaratiLabel: "યુવા સત્સંગ સભા",
    title: "Special Youth Sabha This Saturday",
    gujaratiTitle: "શનિવારે વિશેષ યુવા સત્સંગ સભા",
    body: "Inspiring guidance, satsang discourse, and group seva projects for young haribhaktas. 6:30 PM at the main hall.",
    gujaratiBody: "યુવા હરિભક્તો માટે પ્રેરક માર્ગદર્શન અને સત્સંગ ચર્ચા. શનિવારે સાંજે ૬:૩૦ કલાકે મુખ્ય હોલમાં.",
    route: "/sabha",
    priority: "normal" as const,
    icon: Flame,
  },
  {
    id: "urgent",
    label: "Emergency Seva Call",
    gujaratiLabel: "તાકીદની સેવા સહાય",
    title: "Urgent Seva Assistance Requested",
    gujaratiTitle: "મંદિર સેવામાં સ્વયંસેવકોની જરૂર છે",
    body: "Additional volunteers requested in the kitchen and assembly hall for upcoming sabha preparations.",
    gujaratiBody: "આગામી સભા વ્યવસ્થા અને રસોઈ સેવામાં સહાય માટે સ્વયંસેવકોની તાકીદે જરૂર છે.",
    route: "/seva",
    priority: "high" as const,
    icon: Zap,
  },
];

// Deep Link Route Options with descriptions and icon metadata
const DEEP_LINK_ROUTES = [
  { value: "/", label: "Home Dashboard", gujarati: "મુખ્ય પેજ", desc: "Default landing screen" },
  { value: "/sabha", label: "Sabha Schedule & Attendance", gujarati: "સભા કાર્યક્રમ", desc: "Opens sabha details & QR check-in" },
  { value: "/thal", label: "Family Thal Rotation", gujarati: "થાળ સેવા રોટેશન", desc: "Opens thal captain parivar schedule" },
  { value: "/announcements", label: "Mandir Announcements", gujarati: "મંદિર જાહેરાતો", desc: "Opens official satsang notices" },
  { value: "/seva", label: "Seva Opportunities", gujarati: "સેવા સહાય", desc: "Opens active volunteer seva requests" },
  { value: "/kitchen", label: "Mahaprasad Kitchen", gujarati: "રસોઈ ઘર", desc: "Opens kitchen preparation checklist" },
];

/**
 * High-end Web Audio API Synthesizer
 * Generates an Apple-style two-tone crystal notification chime (E6 -> A6)
 */
function playTactileChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: E6 (~1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Tone 2: A6 (~1760 Hz) slightly staggered
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1760, now + 0.07);
    gain2.gain.setValueAtTime(0.09, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.35);
  } catch {
    // Fail silently if audio context is blocked
  }
}

export function PushNotificationStudio({
  stats,
  devotees,
  history,
  loading,
  onRefresh,
  currentUser,
}: PushNotificationStudioProps) {
  // Broadcast Form State
  const [form, setForm] = useState({
    title: "",
    gujaratiTitle: "",
    body: "",
    gujaratiBody: "",
    targetAudience: "all" as "all" | "role",
    targetRole: "all",
    deepLinkRoute: "/",
    priority: "high" as "high" | "normal",
  });

  // UI Interactive States
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState<"ios" | "android">("ios");
  const [simulatedAlertActive, setSimulatedAlertActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTabLanguage, setActiveTabLanguage] = useState<"en" | "gu">("en");
  const [viewMode, setViewMode] = useState<"tabbed" | "split">("tabbed");
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "success" | "partial_failure">("all");
  const [copiedTokenIdx, setCopiedTokenIdx] = useState<string | null>(null);
  const [directPingUserId, setDirectPingUserId] = useState<string | null>(null);
  const [directPingLoading, setDirectPingLoading] = useState(false);
  const [devoteeSearch, setDevoteeSearch] = useState("");
  const [devoteePlatformFilter, setDevoteePlatformFilter] = useState<"all" | "android" | "ios">("all");
  const [currentTimeStr, setCurrentTimeStr] = useState("9:41 AM");
  const [wallpaperTheme, setWallpaperTheme] = useState<"temple" | "obsidian" | "saffron">("temple");

  // Keep simulated time updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute targeted recipients count
  const targetedDevoteesCount = useMemo(() => {
    if (!stats) return 0;
    if (form.targetAudience === "all" || form.targetRole === "all") {
      return stats.usersWithTokens;
    }
    return stats.roleBreakdown?.[form.targetRole] || 0;
  }, [stats, form.targetAudience, form.targetRole]);

  // Trigger push alert animation in simulator
  const triggerSimulatedAlert = (withChime = true) => {
    if (withChime && soundEnabled) {
      playTactileChime();
    }
    setSimulatedAlertActive(false);
    setTimeout(() => {
      setSimulatedAlertActive(true);
    }, 40);
  };

  // Apply template
  const applyTemplate = (tpl: (typeof PRESET_TEMPLATES)[0]) => {
    setForm({
      ...form,
      title: tpl.title,
      gujaratiTitle: tpl.gujaratiTitle,
      body: tpl.body,
      gujaratiBody: tpl.gujaratiBody,
      deepLinkRoute: tpl.route,
      priority: tpl.priority,
    });
    triggerSimulatedAlert(true);
    toast.success(`Template applied: ${tpl.label}`, {
      description: "Composer fields and simulated device preview updated.",
    });
  };

  // Handle Full Broadcast Dispatch
  const handleSendBroadcast = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }
    if (!form.body.trim()) {
      toast.error("Please enter a notification message body");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sentBy: {
            name: currentUser?.name || "Super Admin",
            phone: currentUser?.phone || "",
            role: "super_admin",
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (soundEnabled) playTactileChime();
        toast.success("Push Notification Dispatched!", {
          description: `Delivered to ${data.successCount} of ${data.totalTokensTargeted} registered device(s).`,
        });
        setConfirmModalOpen(false);
        setForm({
          title: "",
          gujaratiTitle: "",
          body: "",
          gujaratiBody: "",
          targetAudience: "all",
          targetRole: "all",
          deepLinkRoute: "/",
          priority: "high",
        });
        triggerSimulatedAlert(false);
        onRefresh();
      } else {
        toast.error("Broadcast failed: " + (data.error || data.message || "Unknown error"));
      }
    } catch (err: any) {
      toast.error("Error sending broadcast: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Direct Test Ping to a single Devotee's hardware
  const handleDirectDevicePing = async (dev: (typeof devotees)[0]) => {
    setDirectPingUserId(dev.id);
    setDirectPingLoading(true);
    try {
      const pingTitle = form.title.trim() || "HariSumiran Test Ping";
      const pingBody = form.body.trim() || `Personal test alert dispatched to ${dev.name}'s device.`;

      const res = await fetch("/api/super-admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pingTitle,
          gujaratiTitle: form.gujaratiTitle.trim() || undefined,
          body: pingBody,
          gujaratiBody: form.gujaratiBody.trim() || undefined,
          targetAudience: "single_user",
          targetUserId: dev.id,
          deepLinkRoute: form.deepLinkRoute || "/",
          priority: "high",
          sentBy: {
            name: currentUser?.name || "Super Admin",
            phone: currentUser?.phone || "",
            role: "super_admin",
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (soundEnabled) playTactileChime();
        toast.success(`Direct test ping dispatched to ${dev.name}!`, {
          description: `Received by ${data.successCount} device token(s). Check devotee's handset.`,
        });
        triggerSimulatedAlert(false);
        onRefresh();
      } else {
        toast.error(`Direct ping failed: ${data.error || data.message || "Unknown error"}`);
      }
    } catch (err: any) {
      toast.error("Ping error: " + err.message);
    } finally {
      setDirectPingLoading(false);
      setDirectPingUserId(null);
    }
  };

  // Filtered broadcast history
  const filteredHistory = useMemo(() => {
    if (historyFilter === "all") return history;
    return history.filter((h) => h.status === historyFilter);
  }, [history, historyFilter]);

  // Filtered Devotees list
  const filteredDevotees = useMemo(() => {
    return devotees.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(devoteeSearch.toLowerCase()) ||
        d.phone.includes(devoteeSearch);
      const matchesPlatform =
        devoteePlatformFilter === "all" ||
        d.platforms.includes(devoteePlatformFilter);
      return matchesSearch && matchesPlatform;
    });
  }, [devotees, devoteeSearch, devoteePlatformFilter]);

  // Copy token helper
  const handleCopyToken = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTokenIdx(id);
    toast.success("Device token copied to clipboard");
    setTimeout(() => setCopiedTokenIdx(null), 2000);
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* ======================================================== */}
      {/* 1. TOP TELEMETRY BENCHMARK BENTO CARDS                   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Reachable Devotees */}
        <motion.div
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          className="p-5 bg-white/95 backdrop-blur-2xl border border-stone-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.03)] rounded-3xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Reachable Devotees
            </span>
            <div className="h-9 w-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-stone-900 tracking-tight">
              {stats?.usersWithTokens ?? 0}
            </span>
            <span className="text-xs text-stone-500 font-mono">
              / {stats?.totalUsers ?? 0} members
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active app sessions</span>
            </div>
            <span className="font-mono text-stone-400 font-bold">
              {stats?.totalUsers
                ? Math.round(((stats.usersWithTokens || 0) / stats.totalUsers) * 100)
                : 0}
              %
            </span>
          </div>
          {/* Subtle Progress Bar */}
          <div className="mt-2 h-1 w-full bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${
                  stats?.totalUsers
                    ? ((stats.usersWithTokens || 0) / stats.totalUsers) * 100
                    : 0
                }%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
            />
          </div>
        </motion.div>

        {/* Metric 2: Registered Hardware Tokens */}
        <motion.div
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          className="p-5 bg-white/95 backdrop-blur-2xl border border-stone-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.03)] rounded-3xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Push Fleet Tokens
            </span>
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-500/20">
              <Smartphone className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-stone-900 tracking-tight">
              {stats?.totalTokens ?? 0}
            </span>
            <span className="text-xs text-stone-500 font-mono">active hardware</span>
          </div>
          <div className="mt-2.5 text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Auto-pruned upon bounce</span>
          </div>
          <div className="mt-2 h-1 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-emerald-500 rounded-full" />
          </div>
        </motion.div>

        {/* Metric 3: Multi-Platform Mesh */}
        <motion.div
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          className="p-5 bg-white/95 backdrop-blur-2xl border border-stone-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.03)] rounded-3xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Device Platforms
            </span>
            <div className="h-9 w-9 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 transition-colors group-hover:bg-sky-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold font-mono">
              Android: {stats?.platformBreakdown?.android ?? 0}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-bold font-mono">
              iOS: {stats?.platformBreakdown?.ios ?? 0}
            </span>
          </div>
          {/* Visual Platform Proportion Segment Bar */}
          <div className="mt-3 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden flex">
            <div
              style={{
                width: `${
                  stats?.totalTokens
                    ? ((stats?.platformBreakdown?.android ?? 0) / stats.totalTokens) * 100
                    : 100
                }%`,
              }}
              className="bg-emerald-500 h-full transition-all duration-500"
            />
            <div
              style={{
                width: `${
                  stats?.totalTokens
                    ? ((stats?.platformBreakdown?.ios ?? 0) / stats.totalTokens) * 100
                    : 0
                }%`,
              }}
              className="bg-sky-500 h-full transition-all duration-500"
            />
          </div>
        </motion.div>

        {/* Metric 4: Firebase Admin Live Radar Gateway */}
        <motion.div
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          className="p-5 bg-white/95 backdrop-blur-2xl border border-stone-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.03)] rounded-3xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              FCM Gateway
            </span>
            <div
              className={cn(
                "h-9 w-9 rounded-2xl flex items-center justify-center relative",
                stats?.firebaseConnected
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-600"
              )}
            >
              <Radio className="h-4 w-4 relative z-10" />
              {stats?.firebaseConnected && (
                <span className="absolute inset-0 rounded-2xl bg-emerald-400 opacity-30 animate-ping" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full shrink-0",
                stats?.firebaseConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              )}
            />
            <span className="font-heading text-sm font-bold text-stone-900">
              {stats?.firebaseConnected ? "Online & Ready" : "Unconnected"}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-stone-600 truncate flex items-center justify-between">
            <span className="truncate">{stats?.firebaseStatus?.projectId || "harisumiran-9924c"}</span>
            <span className="text-[10px] text-emerald-600 font-bold ml-1 shrink-0">v1 API</span>
          </div>
        </motion.div>
      </div>

      {/* ======================================================== */}
      {/* 2. INSTANT TEMPLATE PRESETS ACCELERATOR                  */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>Instant Announcement Templates (1-Click Fill)</span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            Click any template to auto-populate &amp; test
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESET_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <motion.button
                key={tpl.id}
                type="button"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => applyTemplate(tpl)}
                className="group p-3.5 rounded-2xl bg-white/95 hover:bg-amber-50/80 border border-stone-200/90 hover:border-amber-300 text-left transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-700 flex items-center justify-center transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] uppercase font-mono font-bold text-stone-400 group-hover:text-amber-800">
                    Apply
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 group-hover:text-amber-950 transition-colors line-clamp-1">
                    {tpl.label}
                  </p>
                  <p className="text-[10px] text-stone-500 truncate mt-0.5">{tpl.gujaratiLabel}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN SPLIT STUDIO: COMPOSER & SMARTPHONE SIMULATOR    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Executive Broadcast Composer */}
        <GlassCard className="lg:col-span-7 p-6 bg-white/95 backdrop-blur-2xl border-stone-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_36px_rgba(0,0,0,0.03)] rounded-3xl space-y-5">
          {/* Composer Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-stone-900">
                  Compose Push Broadcast
                </h3>
                <p className="text-xs text-stone-500">
                  Transmits high-priority alerts to active devotee hardware
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                key={targetedDevoteesCount}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold font-mono shadow-xs"
              >
                {targetedDevoteesCount} Devotee(s) Selected
              </motion.div>

              {/* View Mode Toggle: Tabbed vs Split */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
                <button
                  type="button"
                  title="Tabbed view"
                  onClick={() => setViewMode("tabbed")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs font-bold transition-all",
                    viewMode === "tabbed"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  )}
                >
                  <LayoutTemplate className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Side-by-side view"
                  onClick={() => setViewMode("split")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs font-bold transition-all",
                    viewMode === "split"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  )}
                >
                  <Columns2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Target Audience Segment Control */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Audience Targeting Mode
            </label>
            <div className="p-1 rounded-2xl bg-stone-100 border border-stone-200/80 grid grid-cols-2 gap-1 relative">
              <button
                type="button"
                onClick={() => setForm({ ...form, targetAudience: "all", targetRole: "all" })}
                className={cn(
                  "relative z-10 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2",
                  form.targetAudience === "all" ? "text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
                )}
              >
                {form.targetAudience === "all" && (
                  <motion.div
                    layoutId="audienceSelector"
                    className="absolute inset-0 rounded-xl bg-white shadow-xs border border-stone-200/80"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">All Devotees with App ({stats?.usersWithTokens ?? 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, targetAudience: "role" })}
                className={cn(
                  "relative z-10 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2",
                  form.targetAudience === "role" ? "text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
                )}
              >
                {form.targetAudience === "role" && (
                  <motion.div
                    layoutId="audienceSelector"
                    className="absolute inset-0 rounded-xl bg-white shadow-xs border border-stone-200/80"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Target by Mandir Role</span>
              </button>
            </div>

            {/* Role Filter Chips when role targeting selected */}
            <AnimatePresence>
              {form.targetAudience === "role" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2"
                >
                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                      Choose Mandir Functional Group
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "all", label: "All Active Roles" },
                        { id: "mandir_admin", label: "Mandir Admins", count: stats?.roleBreakdown?.mandir_admin },
                        { id: "super_admin", label: "Super Admins", count: stats?.roleBreakdown?.super_admin },
                        { id: "sabha_karyakarta", label: "Sabha Leads", count: stats?.roleBreakdown?.sabha_karyakarta },
                        { id: "thal_captain", label: "Thal Captains", count: stats?.roleBreakdown?.thal_captain },
                        { id: "main_cook", label: "Kitchen Cooks", count: stats?.roleBreakdown?.main_cook },
                        { id: "car_owner", label: "Transport Drivers", count: stats?.roleBreakdown?.car_owner },
                        { id: "regular_member", label: "Devotees", count: stats?.roleBreakdown?.regular_member },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setForm({ ...form, targetRole: item.id })}
                          className={cn(
                            "px-2.5 py-1.5 rounded-xl text-left border text-xs font-bold transition-all flex items-center justify-between",
                            form.targetRole === item.id
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white text-stone-700 border-amber-200 hover:bg-amber-100/50"
                          )}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.count !== undefined && (
                            <span
                              className={cn(
                                "ml-1 px-1.5 py-0.2 rounded-md text-[10px] font-mono",
                                form.targetRole === item.id
                                  ? "bg-amber-700 text-amber-100"
                                  : "bg-stone-100 text-stone-600"
                              )}
                            >
                              {item.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bilingual Message Inputs (Tabbed or Split View) */}
          {viewMode === "tabbed" ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Message Content Studio
                </span>
                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setActiveTabLanguage("en")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                      activeTabLanguage === "en"
                        ? "bg-white text-stone-900 shadow-xs"
                        : "text-stone-500 hover:text-stone-900"
                    )}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabLanguage("gu")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                      activeTabLanguage === "gu"
                        ? "bg-white text-stone-900 shadow-xs"
                        : "text-stone-500 hover:text-stone-900"
                    )}
                  >
                    ગુજરાતી
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">
                    {activeTabLanguage === "en" ? "Notification Title *" : "નોટિફિકેશન શીર્ષક (Title) *"}
                  </label>
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold",
                      (activeTabLanguage === "en" ? form.title.length : form.gujaratiTitle.length) > 50
                        ? "text-rose-600"
                        : "text-stone-400"
                    )}
                  >
                    {activeTabLanguage === "en" ? form.title.length : form.gujaratiTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={60}
                  value={activeTabLanguage === "en" ? form.title : form.gujaratiTitle}
                  onChange={(e) => {
                    if (activeTabLanguage === "en") {
                      setForm({ ...form, title: e.target.value });
                    } else {
                      setForm({ ...form, gujaratiTitle: e.target.value });
                    }
                    triggerSimulatedAlert(false);
                  }}
                  placeholder={
                    activeTabLanguage === "en"
                      ? "e.g., Sunday Sabha Timing Changed"
                      : "દા.ત., રવિવાર સભા સમય બદલાયો છે"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 shadow-2xs bg-white transition-all"
                />
              </div>

              {/* Body Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">
                    {activeTabLanguage === "en" ? "Message Body Text *" : "સંદેશ વિગત (Message Body) *"}
                  </label>
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold",
                      (activeTabLanguage === "en" ? form.body.length : form.gujaratiBody.length) > 200
                        ? "text-rose-600"
                        : "text-stone-400"
                    )}
                  >
                    {activeTabLanguage === "en" ? form.body.length : form.gujaratiBody.length}/240
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={240}
                  value={activeTabLanguage === "en" ? form.body : form.gujaratiBody}
                  onChange={(e) => {
                    if (activeTabLanguage === "en") {
                      setForm({ ...form, body: e.target.value });
                    } else {
                      setForm({ ...form, gujaratiBody: e.target.value });
                    }
                    triggerSimulatedAlert(false);
                  }}
                  placeholder={
                    activeTabLanguage === "en"
                      ? "Type announcement details here. This message appears on devotees lock screens."
                      : "ગુજરાતીમાં વિગતો દાખલ કરો..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 shadow-2xs bg-white resize-none transition-all"
                />
              </div>
            </div>
          ) : (
            /* Split View (Side-by-side English and Gujarati) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* English Side */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                  English Content
                </span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700">Title *</label>
                    <span className="text-[10px] font-mono text-stone-400">{form.title.length}/60</span>
                  </div>
                  <input
                    type="text"
                    maxLength={60}
                    value={form.title}
                    onChange={(e) => {
                      setForm({ ...form, title: e.target.value });
                      triggerSimulatedAlert(false);
                    }}
                    placeholder="e.g., Sunday Sabha Timing Changed"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700">Body *</label>
                    <span className="text-[10px] font-mono text-stone-400">{form.body.length}/240</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={240}
                    value={form.body}
                    onChange={(e) => {
                      setForm({ ...form, body: e.target.value });
                      triggerSimulatedAlert(false);
                    }}
                    placeholder="Enter English announcement text..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white resize-none"
                  />
                </div>
              </div>

              {/* Gujarati Side */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                  ગુજરાતી વિગતો (Optional)
                </span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700">શીર્ષક (Title)</label>
                    <span className="text-[10px] font-mono text-stone-400">{form.gujaratiTitle.length}/60</span>
                  </div>
                  <input
                    type="text"
                    maxLength={60}
                    value={form.gujaratiTitle}
                    onChange={(e) => {
                      setForm({ ...form, gujaratiTitle: e.target.value });
                      triggerSimulatedAlert(false);
                    }}
                    placeholder="દા.ત., રવિવાર સભા સમય બદલાયો છે"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300/80 text-xs text-stone-900 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700">સંદેશ વિગત (Body)</label>
                    <span className="text-[10px] font-mono text-stone-400">{form.gujaratiBody.length}/240</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={240}
                    value={form.gujaratiBody}
                    onChange={(e) => {
                      setForm({ ...form, gujaratiBody: e.target.value });
                      triggerSimulatedAlert(false);
                    }}
                    placeholder="ગુજરાતીમાં વિગતો દાખલ કરો..."
                    className="w-full px-3 py-2 rounded-xl border border-amber-300/80 text-xs text-stone-900 bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Deep Link Route & Priority Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                In-App Screen Deep Link
              </label>
              <select
                value={form.deepLinkRoute}
                onChange={(e) => setForm({ ...form, deepLinkRoute: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 focus:outline-hidden focus:border-amber-500 shadow-2xs"
              >
                {DEEP_LINK_ROUTES.map((route) => (
                  <option key={route.value} value={route.value}>
                    {route.label} ({route.value})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-stone-500">
                {DEEP_LINK_ROUTES.find((r) => r.value === form.deepLinkRoute)?.desc}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Delivery Priority Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, priority: "high" })}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5",
                    form.priority === "high"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                  )}
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>High (Heads-up)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, priority: "normal" })}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5",
                    form.priority === "normal"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Normal (Quiet)</span>
                </button>
              </div>
              <p className="text-[10px] text-stone-500">
                {form.priority === "high"
                  ? "Wakes screen, sound alert & heads-up banner"
                  : "Silent delivery into the system notification shade"}
              </p>
            </div>
          </div>

          {/* Form Action Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() =>
                setForm({
                  title: "",
                  gujaratiTitle: "",
                  body: "",
                  gujaratiBody: "",
                  targetAudience: "all",
                  targetRole: "all",
                  deepLinkRoute: "/",
                  priority: "high",
                })
              }
              disabled={submitting}
            >
              Clear Form
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => triggerSimulatedAlert(true)}
                leftIcon={<Play className="h-3.5 w-3.5 text-amber-600" />}
                className="hidden sm:inline-flex"
              >
                Ping Simulator
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={!form.title.trim() || !form.body.trim() || submitting}
                onClick={() => setConfirmModalOpen(true)}
                leftIcon={<Send className="h-4 w-4" />}
                className="shadow-md shadow-amber-600/25 px-5"
              >
                Review &amp; Dispatch Broadcast
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Right 5 Columns: Titanium Pro Smartphone Simulator */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 bg-gradient-to-b from-stone-900 via-stone-950 to-neutral-950 text-white border border-stone-800 shadow-[0_24px_50px_rgba(0,0,0,0.4)] rounded-3xl space-y-4 relative overflow-hidden">
            {/* Simulator Header & Controls */}
            <div className="flex items-center justify-between text-stone-400 text-xs border-b border-stone-800/80 pb-3">
              <div className="flex items-center gap-2 font-semibold text-[11px] text-stone-300">
                <Smartphone className="h-4 w-4 text-amber-400" />
                <span>Live Device Simulator</span>
              </div>

              {/* iOS vs Android Switcher */}
              <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                <button
                  type="button"
                  onClick={() => setPreviewPlatform("ios")}
                  className={cn(
                    "px-2.5 py-0.5 rounded text-[10px] font-bold transition-all",
                    previewPlatform === "ios"
                      ? "bg-amber-500 text-stone-950 shadow-xs"
                      : "text-stone-400 hover:text-white"
                  )}
                >
                  iOS 18
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlatform("android")}
                  className={cn(
                    "px-2.5 py-0.5 rounded text-[10px] font-bold transition-all",
                    previewPlatform === "android"
                      ? "bg-amber-500 text-stone-950 shadow-xs"
                      : "text-stone-400 hover:text-white"
                  )}
                >
                  Android 15
                </button>
              </div>
            </div>

            {/* Titanium Smartphone Frame */}
            <div className="relative mx-auto rounded-[42px] p-3.5 bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900 border-4 border-stone-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_20px_40px_rgba(0,0,0,0.6)]">
              {/* Screen Glass */}
              <div
                className={cn(
                  "rounded-[34px] min-h-[380px] p-4 flex flex-col justify-between relative overflow-hidden border border-stone-800/90 transition-all duration-700",
                  wallpaperTheme === "temple" &&
                    "bg-gradient-to-br from-stone-950 via-amber-950/20 to-neutral-950",
                  wallpaperTheme === "obsidian" &&
                    "bg-gradient-to-br from-neutral-950 via-stone-950 to-black",
                  wallpaperTheme === "saffron" &&
                    "bg-gradient-to-br from-stone-950 via-amber-900/30 to-stone-950"
                )}
              >
                {/* Dynamic Island / Top Camera Notch */}
                <div className="relative z-20 flex justify-center mb-1">
                  <motion.div
                    layout
                    onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
                    className={cn(
                      "rounded-full bg-black border border-stone-800/80 flex items-center justify-between px-3 cursor-pointer transition-all hover:border-stone-700 shadow-md",
                      dynamicIslandExpanded ? "h-11 w-64" : simulatedAlertActive ? "h-7 w-48" : "h-6 w-24"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {dynamicIslandExpanded && (
                        <span className="text-[10px] font-bold text-amber-400">HariSumiran</span>
                      )}
                    </div>

                    {dynamicIslandExpanded ? (
                      <div className="flex items-center gap-2 text-[10px] text-stone-300 font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>FCM Alert Active</span>
                        <div className="flex items-center gap-0.5">
                          <span className="h-2.5 w-0.5 bg-amber-400 animate-bounce" />
                          <span className="h-3.5 w-0.5 bg-amber-400 animate-bounce [animation-delay:0.1s]" />
                          <span className="h-2 w-0.5 bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    ) : simulatedAlertActive ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 text-[9px] font-mono text-amber-300 font-bold"
                      >
                        <BellRing className="h-2.5 w-2.5 animate-bounce" />
                        <span>FCM Alert</span>
                      </motion.div>
                    ) : null}

                    <div className="h-2.5 w-2.5 rounded-full bg-stone-900 border border-stone-700/50" />
                  </motion.div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 px-2 my-1">
                  <span className="font-bold text-white">{currentTimeStr}</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" />
                    <span className="text-[10px]">5G</span>
                    <Battery className="h-3.5 w-3.5 text-stone-300" />
                  </div>
                </div>

                {/* Simulated Push Alert Card with Physics Bounce */}
                <div className="relative z-10 my-auto py-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={form.title + form.body + (simulatedAlertActive ? "active" : "idle")}
                      initial={{ y: -35, opacity: 0, scale: 0.94 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -20, opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className={cn(
                        "rounded-2xl p-3.5 space-y-2 backdrop-blur-3xl transition-all shadow-2xl relative",
                        previewPlatform === "ios"
                          ? "bg-white/95 text-stone-900 border border-white/40 shadow-[0_12px_30px_rgba(0,0,0,0.3)]"
                          : "bg-stone-900/95 text-stone-100 border border-stone-700/80 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
                      )}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-md bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                            HS
                          </div>
                          <span
                            className={cn(
                              "font-bold text-[11px] tracking-tight",
                              previewPlatform === "ios" ? "text-stone-900" : "text-stone-200"
                            )}
                          >
                            HariSumiran
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono font-medium">now</span>
                      </div>

                      {/* Content Title & Body */}
                      <div className="space-y-1">
                        <h5
                          className={cn(
                            "font-heading text-xs font-black leading-tight",
                            previewPlatform === "ios" ? "text-stone-950" : "text-white"
                          )}
                        >
                          {form.title.trim() || "Sunday Sabha Notification Title"}
                        </h5>
                        {form.gujaratiTitle.trim() && (
                          <p className="text-[11px] font-bold text-amber-700 leading-tight">
                            {form.gujaratiTitle.trim()}
                          </p>
                        )}
                        <p
                          className={cn(
                            "text-[11px] leading-snug line-clamp-3",
                            previewPlatform === "ios" ? "text-stone-600" : "text-stone-300"
                          )}
                        >
                          {form.body.trim() ||
                            "Devotees are cordially invited to participate in this week's sacred sabha and mahaprasad..."}
                        </p>
                        {form.gujaratiBody.trim() && (
                          <p className="text-[11px] text-stone-400 leading-snug line-clamp-2 pt-0.5">
                            {form.gujaratiBody.trim()}
                          </p>
                        )}
                      </div>

                      {/* Action Deep Link Pill */}
                      <div
                        className={cn(
                          "pt-2 flex items-center justify-between border-t text-[10px] font-mono font-semibold",
                          previewPlatform === "ios"
                            ? "border-stone-200 text-amber-700"
                            : "border-stone-800 text-amber-400"
                        )}
                      >
                        <span className="flex items-center gap-1">
                          <CornerDownRight className="h-3 w-3" />
                          <span>Tap to open screen</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 font-mono">
                          {form.deepLinkRoute}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Home Indicator */}
                <div className="pt-2 flex justify-center">
                  <div className="h-1 w-28 rounded-full bg-stone-600" />
                </div>
              </div>
            </div>

            {/* Interactive Simulator Tools Toolbar */}
            <div className="flex items-center justify-between pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => triggerSimulatedAlert(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-600/30"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Simulate Push Alert</span>
              </motion.button>

              <div className="flex items-center gap-2">
                {/* Wallpaper theme selector */}
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
                  <button
                    type="button"
                    title="Temple Theme"
                    onClick={() => setWallpaperTheme("temple")}
                    className={cn(
                      "h-3.5 w-3.5 rounded-full bg-amber-700 transition-all",
                      wallpaperTheme === "temple" && "ring-2 ring-white"
                    )}
                  />
                  <button
                    type="button"
                    title="Obsidian Theme"
                    onClick={() => setWallpaperTheme("obsidian")}
                    className={cn(
                      "h-3.5 w-3.5 rounded-full bg-stone-800 transition-all",
                      wallpaperTheme === "obsidian" && "ring-2 ring-white"
                    )}
                  />
                  <button
                    type="button"
                    title="Saffron Theme"
                    onClick={() => setWallpaperTheme("saffron")}
                    className={cn(
                      "h-3.5 w-3.5 rounded-full bg-amber-500 transition-all",
                      wallpaperTheme === "saffron" && "ring-2 ring-white"
                    )}
                  />
                </div>

                {/* Sound Chime Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[10px] font-mono">Sound ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-3.5 w-3.5 text-stone-500" />
                      <span className="text-[10px] font-mono">Muted</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Connected Devotee Fleet & Live Direct Ping Panel */}
          <GlassCard className="p-5 bg-white/95 backdrop-blur-2xl border-stone-200/90 shadow-2xs rounded-3xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <h4 className="font-heading text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Targetable Devotee Devices ({devotees.length})
                </h4>
              </div>
              <Badge
                variant="outline"
                size="sm"
                className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
              >
                Live Fleet
              </Badge>
            </div>

            {/* Fleet Search & Filter */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search devotees by name or phone..."
                value={devoteeSearch}
                onChange={(e) => setDevoteeSearch(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500"
              />
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setDevoteePlatformFilter("all")}
                  className={cn(
                    "px-2 py-1 rounded-lg transition-all",
                    devoteePlatformFilter === "all" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setDevoteePlatformFilter("android")}
                  className={cn(
                    "px-2 py-1 rounded-lg transition-all",
                    devoteePlatformFilter === "android" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"
                  )}
                >
                  Android
                </button>
              </div>
            </div>

            {/* Devotees List */}
            <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto pr-1">
              {filteredDevotees.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-500">
                  No active devices matching search.
                </div>
              ) : (
                filteredDevotees.map((dev) => (
                  <motion.div
                    key={dev.id}
                    whileHover={{ x: 2 }}
                    className="py-2.5 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar name={dev.name} role={dev.role} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{dev.name}</p>
                        <p className="text-[10px] text-stone-500 font-mono">
                          +{dev.phone.slice(0, 4)}••••{dev.phone.slice(-3)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {dev.platforms.map((p: string) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[9px] font-mono font-bold uppercase"
                        >
                          {p}
                        </span>
                      ))}

                      {/* Direct Test Ping Button */}
                      <button
                        type="button"
                        title={`Send direct test ping to ${dev.name}'s handset`}
                        disabled={directPingLoading && directPingUserId === dev.id}
                        onClick={() => handleDirectDevicePing(dev)}
                        className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 transition-all flex items-center gap-1 shadow-2xs"
                      >
                        {directPingLoading && directPingUserId === dev.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin text-amber-700" />
                        ) : (
                          <Send className="h-3 w-3 text-amber-600" />
                        )}
                        <span>Ping Device</span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. BROADCAST HISTORY & AUDIT LOG                         */}
      {/* ======================================================== */}
      <GlassCard className="p-6 bg-white/95 backdrop-blur-2xl border-stone-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_36px_rgba(0,0,0,0.03)] rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-stone-900">
                Broadcast Dispatch Timeline
              </h3>
              <p className="text-xs text-stone-500">
                Audited historical delivery logs, retry counts, and dead token purges
              </p>
            </div>
          </div>

          {/* History Status Filters */}
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => setHistoryFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                historyFilter === "all" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
              )}
            >
              All ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter("success")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                historyFilter === "success" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
              )}
            >
              Delivered
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter("partial_failure")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                historyFilter === "partial_failure"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              Bounced
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <BellRing className="h-8 w-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-700">No broadcasts recorded in this view</p>
            <p className="text-xs text-stone-500">
              Compose a message above to transmit your first push alert to active devices.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-bold uppercase text-stone-500 tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Announcement Content</th>
                  <th className="py-2.5 px-3">Target Scope</th>
                  <th className="py-2.5 px-3 text-center">Delivery Ratio</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Dispatcher</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-stone-800 font-semibold block">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono block">
                        {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <p className="font-bold text-stone-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{item.body}</p>
                      {item.deepLinkRoute && item.deepLinkRoute !== "/" && (
                        <span className="text-[10px] text-amber-700 font-mono mt-1 inline-block">
                          Target: {item.deepLinkRoute}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 text-[11px] font-bold uppercase block w-fit">
                        {item.targetAudience === "all" ? "All Devotees" : item.targetRole || "Role Segment"}
                      </span>
                      <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                        {item.totalTokensTargeted} target tokens
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-emerald-700 block">
                        {item.successCount} / {item.totalTokensTargeted}
                      </span>
                      {item.invalidTokensCleaned > 0 && (
                        <span className="text-[10px] text-rose-600 block">
                          Cleaned {item.invalidTokensCleaned} dead
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                          item.status === "success"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : item.status === "partial_failure"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-stone-800 font-semibold block">{item.sentBy?.name || "Super Admin"}</span>
                      <span className="text-[10px] text-stone-500 block">{item.sentBy?.role || "super_admin"}</span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            title: item.title,
                            gujaratiTitle: item.gujaratiTitle || "",
                            body: item.body,
                            gujaratiBody: item.gujaratiBody || "",
                            deepLinkRoute: item.deepLinkRoute || "/",
                          });
                          triggerSimulatedAlert(true);
                          toast.success("Loaded broadcast content into composer");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-bold transition-all inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Re-send</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* ======================================================== */}
      {/* 5. PRE-FLIGHT VERIFICATION & DISPATCH MODAL              */}
      {/* ======================================================== */}
      {confirmModalOpen && (
        <Modal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} maxWidth="md">
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-stone-900">
                  Confirm Push Broadcast
                </h3>
                <p className="text-xs text-stone-500">Root-level hardware alert transmission</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">Target Scope:</span>
                <span className="font-bold text-stone-900 uppercase">
                  {form.targetAudience === "all" ? "All Active App Users" : form.targetRole}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">Reachable Recipients:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {targetedDevoteesCount} devotee(s) ({stats?.totalTokens ?? 0} tokens)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">Target Screen:</span>
                <span className="font-mono text-stone-800">{form.deepLinkRoute}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">Priority:</span>
                <span className="font-bold text-amber-800 uppercase font-mono">{form.priority}</span>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
              <p className="font-bold text-stone-900">{form.title}</p>
              {form.gujaratiTitle && <p className="text-amber-800 font-bold">{form.gujaratiTitle}</p>}
              <p className="text-stone-600 leading-relaxed">{form.body}</p>
              {form.gujaratiBody && <p className="text-stone-500 leading-relaxed">{form.gujaratiBody}</p>}
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              Clicking <strong>&quot;Dispatch Broadcast&quot;</strong> will immediately transmit push packets via Google Firebase Cloud Messaging gateway to all selected devotee hardware.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setConfirmModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSendBroadcast}
                isLoading={submitting}
                leftIcon={<Send className="h-4 w-4" />}
                className="shadow-md shadow-amber-600/25 px-5"
              >
                Dispatch Broadcast
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
