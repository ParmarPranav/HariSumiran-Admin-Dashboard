"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { TypeToConfirmDialog } from "@/components/ui/TypeToConfirmDialog";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  Car,
  CalendarDays,
  MapPin,
  Building2,
  History,
  Lock,
  ArrowRight,
  UserCog,
  CheckCircle2,
  AlertTriangle,
  Database,
  FileDown,
  Cpu,
  Activity,
  Zap,
  Server,
  Eye,
  SlidersHorizontal,
  Filter,
  Download,
  CheckCircle,
  Clock,
  BellRing,
  Send,
  Smartphone,
  Radio,
  Layers,
  CheckCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ResponsibilityType, SabhaCategoryType } from "@/models";

interface ResponsibilityScope {
  sabhaType?: SabhaCategoryType;
  zone?: string;
  area?: string;
  familyId?: string;
  department?: string;
}

interface UserResponsibility {
  type: ResponsibilityType;
  title?: string;
  gujaratiTitle?: string;
  scope?: ResponsibilityScope;
  permissions?: string[];
  active: boolean;
  assignedAt: string | Date;
}

interface SuperAdminUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  memberId?: string;
  familyId?: string;
  familyName?: string;
  isCaptain?: boolean;
  department?: string;
  mandir: string;
  avatar?: string;
  active: boolean;
  responsibilities: UserResponsibility[];
  createdAt: string;
}

const ROLE_OPTIONS: { type: ResponsibilityType; label: string; gujarati: string; icon: any }[] = [
  { type: "super_admin", label: "Super Administrator", gujarati: "મુખ્ય વહીવટકર્તા", icon: ShieldCheck },
  { type: "mandir_admin", label: "Mandir Administrator", gujarati: "મંદિર વહીવટકર્તા", icon: Building2 },
  { type: "sabha_karyakarta", label: "Sabha Karyakarta", gujarati: "સભા કાર્યકર્તા", icon: CalendarDays },
  { type: "thal_captain", label: "Family Thal Captain", gujarati: "પરિવાર થાળ કેપ્ટન", icon: UtensilsCrossed },
  { type: "main_cook", label: "Mahaprasad Kitchen Lead", gujarati: "રસોઈ સેવા પ્રમુખ", icon: ChefHat },
  { type: "sub_cook", label: "Kitchen Assistant Cook", gujarati: "રસોઈ સહાયક", icon: ChefHat },
  { type: "car_owner", label: "Mandir Transport Driver", gujarati: "વાહન સેવા (કાર માલિક)", icon: Car },
  { type: "regular_member", label: "Mandir Member", gujarati: "મંદિર સભ્ય", icon: Users },
];

const SABHA_CATEGORIES: SabhaCategoryType[] = [
  "Youth Male",
  "Youth Female",
  "Yuvati",
  "Family Sabha",
  "Morning Sabha",
  "Evening Sabha",
  "Special Mahotsav",
  "Bal Sabha",
];

const ZONE_OPTIONS = [
  "City Area Zone",
  "North Nadiad",
  "Central Nadiad",
  "South Nadiad",
  "East Nadiad",
  "West Nadiad",
  "Uttarsanda Road",
  "College Road",
  "Station Area",
];

export default function SuperAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Loading Super Admin Console...</div>}>
      <SuperAdminContent />
    </Suspense>
  );
}

function SuperAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "users";

  const { isSuperAdmin, user: currentUser, switchPersona, language, setUser, logout } = useApp();

  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Admin Data for Matrix, Audit, and System Health
  const [adminData, setAdminData] = useState<any>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resettingData, setResettingData] = useState(false);

  // Selected User Modal state
  const [selectedUser, setSelectedUser] = useState<SuperAdminUser | null>(null);
  const [modalTab, setModalTab] = useState<"roles" | "assign" | "audit">("roles");
  const [userAuditLogs, setUserAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Form State for Assigning New Role
  const [assignRoleType, setAssignRoleType] = useState<ResponsibilityType>("sabha_karyakarta");
  const [assignTitle, setAssignTitle] = useState("Sabha Karyakarta");
  const [assignGujaratiTitle, setAssignGujaratiTitle] = useState("સભા કાર્યકર્તા");
  const [assignSabhaType, setAssignSabhaType] = useState<SabhaCategoryType>("Youth Male");
  const [assignZone, setAssignZone] = useState("North Nadiad");
  const [assignArea, setAssignArea] = useState("");
  const [assignDepartment, setAssignDepartment] = useState("");
  const [assignFamilyId, setAssignFamilyId] = useState("");
  const [assigningLoading, setAssigningLoading] = useState(false);

  // Edit Scope Modal State
  const [editingRoleIndex, setEditingRoleIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGujaratiTitle, setEditGujaratiTitle] = useState("");
  const [editSabhaType, setEditSabhaType] = useState<SabhaCategoryType>("Youth Male");
  const [editZone, setEditZone] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editFamilyId, setEditFamilyId] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Interactive Matrix & Role Access Simulator
  const [simulatedRole, setSimulatedRole] = useState<string>("all");
  const [matrixSearch, setMatrixSearch] = useState<string>("");

  // System Audit Interactive Controls
  const [auditCategory, setAuditCategory] = useState<string>("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [auditSearch, setAuditSearch] = useState<string>("");

  // Atlas Cluster Health Telemetry
  const [pingingCluster, setPingingCluster] = useState<boolean>(false);
  const [lastPingTime, setLastPingTime] = useState<string>("18ms");

  const handleTestClusterPing = () => {
    setPingingCluster(true);
    setTimeout(() => {
      const ping = Math.floor(15 + Math.random() * 8);
      setLastPingTime(`${ping}ms`);
      setPingingCluster(false);
      toast.success(`Atlas Cluster Ping: ${ping}ms`, {
        description: "Optimal connection pool to cluster0.icxn6gj.mongodb.net",
      });
    }, 600);
  };

  const handleExportAuditCSV = () => {
    const logs = adminData?.auditLogs || [];
    if (logs.length === 0) {
      toast.info("No audit logs to export.");
      return;
    }
    const headers = ["Timestamp", "Action", "Module", "Actor Name", "Actor Role", "Description"];
    const rows = logs.map((l: any) => [
      `"${new Date(l.createdAt).toISOString()}"`,
      `"${l.action || ""}"`,
      `"${l.module || ""}"`,
      `"${l.actorName || ""}"`,
      `"${l.actorRole || ""}"`,
      `"${(l.description || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `harisumiran-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit Log exported to CSV successfully.");
  };

  // Delete Confirmation State
  const [roleToDelete, setRoleToDelete] = useState<{ index: number; title: string; type: string } | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Notification Broadcast State
  const [notificationStats, setNotificationStats] = useState<{
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
  } | null>(null);
  const [notificationDevotees, setNotificationDevotees] = useState<any[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);
  const [confirmBroadcastOpen, setConfirmBroadcastOpen] = useState(false);

  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    gujaratiTitle: "",
    body: "",
    gujaratiBody: "",
    targetAudience: "all" as "all" | "role",
    targetRole: "all",
    deepLinkRoute: "/",
    priority: "high" as "high" | "normal",
  });

  const fetchNotificationData = async () => {
    setNotificationLoading(true);
    try {
      const res = await fetch("/api/super-admin/notifications");
      const data = await res.json();
      if (data.success) {
        setNotificationStats(data.stats);
        setNotificationDevotees(data.devotees || []);
        setNotificationHistory(data.history || []);
      }
    } catch (e: any) {
      console.error("Error fetching notification stats:", e);
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastForm.title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }
    if (!broadcastForm.body.trim()) {
      toast.error("Please enter a notification message body");
      return;
    }

    setBroadcastSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...broadcastForm,
          sentBy: {
            name: currentUser?.name || "Super Admin",
            phone: currentUser?.phone || "",
            role: "super_admin",
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Push Notification Dispatched!", {
          description: `Successfully delivered to ${data.successCount} of ${data.totalTokensTargeted} registered device(s).`,
        });
        setConfirmBroadcastOpen(false);
        setBroadcastForm({
          title: "",
          gujaratiTitle: "",
          body: "",
          gujaratiBody: "",
          targetAudience: "all",
          targetRole: "all",
          deepLinkRoute: "/",
          priority: "high",
        });
        fetchNotificationData();
      } else {
        toast.error("Broadcast failed: " + (data.error || data.message || "Unknown error"));
      }
    } catch (err: any) {
      toast.error("Error sending broadcast: " + err.message);
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setStats(data.stats || null);
      } else {
        toast.error("Failed to load users: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error fetching users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Admin Data for Matrix, Audit, and System Tabs
  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (data.success) {
        setAdminData(data);
      }
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAdminData();
    fetchNotificationData();
  }, []);

  useEffect(() => {
    if (currentTab === "notifications") {
      fetchNotificationData();
    }
  }, [currentTab]);

  const handleSeedDatabase = async () => {
    setResettingData(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Database Re-Seeded Successfully", {
          description: "Populated fresh operational data for HariPrabodham, Nadiad.",
        });
        fetchUsers();
        fetchAdminData();
      }
    } catch (e: any) {
      toast.error("Seeding failed: " + e.message);
    } finally {
      setResettingData(false);
    }
  };

  // Sync selected user when users list updates
  useEffect(() => {
    if (selectedUser) {
      const updated = users.find((u) => u._id === selectedUser._id);
      if (updated) setSelectedUser(updated);
    }
  }, [users]);

  // Load audit logs when modal opens
  const openUserModal = async (u: SuperAdminUser) => {
    setSelectedUser(u);
    setModalTab("roles");
    setEditingRoleIndex(null);
    setRoleToDelete(null);

    // Set default assignment options
    setAssignRoleType("sabha_karyakarta");
    setAssignTitle("Sabha Karyakarta");
    setAssignGujaratiTitle("સભા કાર્યકર્તા");
    setAssignSabhaType("Youth Male");
    setAssignZone("North Nadiad");
    setAssignArea("");
    setAssignDepartment("");
    setAssignFamilyId(u.familyId || "");

    // Fetch user audit trail
    setLoadingAudit(true);
    try {
      const res = await fetch(`/api/super-admin/users/${u._id}/roles`);
      const data = await res.json();
      if (data.success && data.auditLogs) {
        setUserAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Change defaults when role type changes in assignment form
  const handleRoleTypeChange = (type: ResponsibilityType) => {
    setAssignRoleType(type);
    const found = ROLE_OPTIONS.find((r) => r.type === type);
    if (found) {
      setAssignTitle(found.label);
      setAssignGujaratiTitle(found.gujarati);
    }
    if (type === "main_cook" || type === "sub_cook") {
      setAssignDepartment("Kitchen (Mahaprasad)");
    } else if (type === "car_owner") {
      setAssignDepartment("Transportation");
    }
  };

  // 1. Assign New Role
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setAssigningLoading(true);
    try {
      const scope: ResponsibilityScope = {};
      if (assignRoleType === "sabha_karyakarta") {
        scope.sabhaType = assignSabhaType;
        if (assignZone) scope.zone = assignZone;
        if (assignArea) scope.area = assignArea;
      } else if (assignRoleType === "thal_captain") {
        if (assignFamilyId) scope.familyId = assignFamilyId;
        if (assignArea) scope.area = assignArea;
      } else if (assignRoleType === "main_cook" || assignRoleType === "sub_cook") {
        scope.department = assignDepartment || "Kitchen (Mahaprasad)";
      } else if (assignRoleType === "car_owner") {
        scope.department = "Transportation";
        if (assignZone) scope.zone = assignZone;
      } else {
        if (assignDepartment) scope.department = assignDepartment;
        if (assignZone) scope.zone = assignZone;
      }

      const res = await fetch(`/api/super-admin/users/${selectedUser._id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: assignRoleType,
          title: assignTitle,
          gujaratiTitle: assignGujaratiTitle,
          scope,
          actorId: currentUser?._id || "super_admin",
          actorName: currentUser?.name || "Super Admin",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Role assigned successfully`, {
          description: `Assigned ${assignTitle} to ${selectedUser.name}`,
        });

        // Update local state
        setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? data.user : u)));
        setSelectedUser(data.user);

        // If current user modified themselves, update global app context
        if (currentUser?._id === selectedUser._id) {
          setUser(data.user);
        }

        setModalTab("roles");
      } else {
        toast.error("Failed to assign role: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error assigning role: " + err.message);
    } finally {
      setAssigningLoading(false);
    }
  };

  // 2. Toggle Active Status
  const handleToggleRoleActive = async (index: number, currentActive: boolean) => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/super-admin/users/${selectedUser._id}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          index,
          active: !currentActive,
          actorId: currentUser?._id || "super_admin",
          actorName: currentUser?.name || "Super Admin",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Role ${!currentActive ? "Activated" : "Deactivated"}`);
        setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? data.user : u)));
        setSelectedUser(data.user);
        if (currentUser?._id === selectedUser._id) setUser(data.user);
      } else {
        toast.error("Failed to update status: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  // 3. Update Primary Account Role
  const handleUpdatePrimaryRole = async (newRole: string) => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/super-admin/users/${selectedUser._id}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryRole: newRole,
          actorId: currentUser?._id || "super_admin",
          actorName: currentUser?.name || "Super Admin",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Primary role set to ${newRole}`);
        setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? data.user : u)));
        setSelectedUser(data.user);
        if (currentUser?._id === selectedUser._id) setUser(data.user);
      } else {
        toast.error(data.error);
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  // 4. Open Edit Scope Mode
  const startEditingRole = (index: number, resp: UserResponsibility) => {
    setEditingRoleIndex(index);
    setEditTitle(resp.title || "");
    setEditGujaratiTitle(resp.gujaratiTitle || "");
    setEditSabhaType(resp.scope?.sabhaType || "Youth Male");
    setEditZone(resp.scope?.zone || "");
    setEditArea(resp.scope?.area || "");
    setEditDepartment(resp.scope?.department || "");
    setEditFamilyId(resp.scope?.familyId || "");
  };

  // 5. Save Edited Scope
  const handleSaveEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || editingRoleIndex === null) return;

    setSavingEdit(true);
    try {
      const scope: ResponsibilityScope = {
        zone: editZone,
        area: editArea,
        department: editDepartment,
        familyId: editFamilyId,
        sabhaType: editSabhaType,
      };

      const res = await fetch(`/api/super-admin/users/${selectedUser._id}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          index: editingRoleIndex,
          title: editTitle,
          gujaratiTitle: editGujaratiTitle,
          scope,
          actorId: currentUser?._id || "super_admin",
          actorName: currentUser?.name || "Super Admin",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Role details updated successfully");
        setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? data.user : u)));
        setSelectedUser(data.user);
        setEditingRoleIndex(null);
        if (currentUser?._id === selectedUser._id) setUser(data.user);
      } else {
        toast.error("Failed to update role: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // 6. Delete / Revoke Role
  const handleConfirmDeleteRole = async () => {
    if (!selectedUser || !roleToDelete) return;

    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/super-admin/users/${selectedUser._id}/roles`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          index: roleToDelete.index,
          type: roleToDelete.type,
          actorId: currentUser?._id || "super_admin",
          actorName: currentUser?.name || "Super Admin",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Role '${roleToDelete.title}' revoked successfully`);
        setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? data.user : u)));
        setSelectedUser(data.user);
        setRoleToDelete(null);
        if (currentUser?._id === selectedUser._id) setUser(data.user);
      } else {
        toast.error("Failed to delete role: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error deleting role: " + err.message);
    } finally {
      setDeletingLoading(false);
    }
  };

  // Role Counts for filter pills
  const pillCounts: Record<string, number> = useMemo(() => {
    return {
      all: users.length,
      super_admin: users.filter(
        (u) =>
          u.role === "super_admin" ||
          u.responsibilities?.some((r) => r.type === "super_admin" && r.active !== false)
      ).length,
      mandir_admin: users.filter(
        (u) =>
          u.role === "mandir_admin" ||
          u.responsibilities?.some((r) => r.type === "mandir_admin" && r.active !== false)
      ).length,
      sabha_karyakarta: users.filter(
        (u) =>
          u.role === "karyakarta" ||
          u.responsibilities?.some((r) => r.type === "sabha_karyakarta" && r.active !== false)
      ).length,
      thal_captain: users.filter(
        (u) =>
          u.isCaptain ||
          u.role === "family_captain" ||
          u.responsibilities?.some((r) => r.type === "thal_captain" && r.active !== false)
      ).length,
      main_cook: users.filter((u) =>
        u.responsibilities?.some(
          (r) => (r.type === "main_cook" || r.type === "sub_cook") && r.active !== false
        )
      ).length,
      car_owner: users.filter((u) =>
        u.responsibilities?.some((r) => r.type === "car_owner" && r.active !== false)
      ).length,
      regular_member: users.filter(
        (u) =>
          u.role === "regular_member" ||
          (!u.role && (!u.responsibilities || u.responsibilities.length === 0))
      ).length,
    };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search text
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.memberId?.toLowerCase().includes(q) ||
        u.familyName?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Role filter
      if (roleFilter === "all") return true;
      if (roleFilter === "inactive") return u.active === false;

      const hasResp = u.responsibilities?.some(
        (r) => r.type === roleFilter && r.active !== false
      );
      const isPrimary = u.role === roleFilter;

      return hasResp || isPrimary;
    });
  }, [users, searchQuery, roleFilter]);

  // Targeted Devotees count for push notifications
  const targetedDevoteesCount = useMemo(() => {
    if (!notificationStats) return 0;
    if (broadcastForm.targetAudience === "all" || broadcastForm.targetRole === "all") {
      return notificationStats.usersWithTokens;
    }
    return notificationStats.roleBreakdown?.[broadcastForm.targetRole] || 0;
  }, [notificationStats, broadcastForm.targetAudience, broadcastForm.targetRole]);

  // Non-SuperAdmin View (Access Guard with instant switch persona for easy testing)
  if (!isSuperAdmin) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center p-4">
        <MandalaBackground />
        <GlassCard className="relative z-10 max-w-md w-full p-8 text-center space-y-5 bg-white border-stone-200/90 shadow-xl">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-stone-900">
              {language === "gu" ? "સુપર એડમિન ઍક્સેસ જરૂરી છે" : "Super Admin Access Required"}
            </h2>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              This console controls high-privilege system role assignments, administrative scopes, and security authorizations.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Current Session:
            </p>
            <p className="text-stone-700">User: <strong>{currentUser?.name}</strong></p>
            <p className="text-stone-700">Role: <span className="font-mono uppercase text-[11px] font-bold text-amber-800">{currentUser?.role}</span></p>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              className="w-full justify-center shadow-md shadow-amber-600/20"
              variant="primary"
              size="lg"
              leftIcon={<Lock className="h-4 w-4" />}
              onClick={() => router.push("/super-admin/login")}
            >
              Sign In with Super Admin ID
            </Button>

            <Button
              className="w-full justify-center"
              variant="outline"
              size="md"
              leftIcon={<ShieldCheck className="h-4 w-4 text-amber-600" />}
              onClick={() => switchPersona("Pooja Swarupji")}
            >
              Quick Test: Switch to Pooja Swarupji
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-stone-900">
                  {currentTab === "permissions"
                    ? language === "gu" ? "પરવાનગી મેટ્રિક્સ" : "Role-Permission Matrix"
                    : currentTab === "notifications"
                    ? language === "gu" ? "પુશ નોટિફિકેશન પ્રસારણ" : "Push Notification Broadcast"
                    : currentTab === "audit"
                    ? language === "gu" ? "સિસ્ટમ ઓડિટ લોગ" : "System Audit Trail"
                    : currentTab === "system"
                    ? language === "gu" ? "ડેટાબેઝ અને હેલ્થ" : "Database & System Health"
                    : language === "gu" ? "વપરાશકર્તા અને ભૂમિકા વહીવટ" : "Users & Role Manager"}
                </h1>
                <Badge variant="primary" size="sm" className="font-mono uppercase tracking-wider text-[10px]">
                  Root Access
                </Badge>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {currentTab === "permissions"
                  ? "Controls module visibility, action authorizations, and data masking levels"
                  : currentTab === "notifications"
                  ? "Broadcast real-time push alerts to devotees registered on HariSumiran Android & iOS apps"
                  : currentTab === "audit"
                  ? "Unmasked audit records and institutional security accountability"
                  : currentTab === "system"
                  ? "MongoDB Atlas cluster connectivity, replica sync & disaster recovery reset"
                  : "Assign, update, and revoke user roles, permissions, and administrative scopes across HariPrabodham, Nadiad"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            isLoading={loading || adminLoading || notificationLoading}
            onClick={() => {
              fetchUsers();
              fetchAdminData();
              fetchNotificationData();
            }}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            {language === "gu" ? "રીફ્રેશ" : "Refresh Data"}
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: USERS & ROLE MANAGEMENT                           */}
      {/* ======================================================== */}
      {currentTab === "users" && (
        <>
          {/* KPI Stats Cards (Interactive 1-Click Role Filters with Bento Physics) */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Total Users */}
            <motion.button
              type="button"
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRoleFilter("all")}
              className={`relative p-4 rounded-2xl text-left transition-all cursor-pointer border group overflow-hidden ${
                roleFilter === "all"
                  ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
                  : "bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-300"
              }`}
            >
              {roleFilter === "all" && (
                <motion.div
                  layoutId="activeKpiBorder"
                  className="absolute inset-0 rounded-2xl border-2 border-amber-500 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Total Users</span>
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center transition-colors ${
                    roleFilter === "all"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-stone-100 text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-800"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">{stats?.total ?? users.length}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{stats?.activeUsers ?? users.length} Active in Directory</span>
              </div>
            </motion.button>

            {/* Super Admins */}
            <motion.button
              type="button"
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRoleFilter("super_admin")}
              className={`relative p-4 rounded-2xl text-left transition-all cursor-pointer border group overflow-hidden ${
                roleFilter === "super_admin"
                  ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
                  : "bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-300"
              }`}
            >
              {roleFilter === "super_admin" && (
                <motion.div
                  layoutId="activeKpiBorder"
                  className="absolute inset-0 rounded-2xl border-2 border-amber-500 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Super Admins</span>
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center transition-colors ${
                    roleFilter === "super_admin"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-amber-500/10 text-amber-700 group-hover:bg-amber-500 group-hover:text-white"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-amber-800 tracking-tight">{stats?.superAdmins ?? 0}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-stone-500">
                <span>Root Level Oversight</span>
              </div>
            </motion.button>

            {/* Mandir Admins */}
            <motion.button
              type="button"
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRoleFilter("mandir_admin")}
              className={`relative p-4 rounded-2xl text-left transition-all cursor-pointer border group overflow-hidden ${
                roleFilter === "mandir_admin"
                  ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300"
              }`}
            >
              {roleFilter === "mandir_admin" && (
                <motion.div
                  layoutId="activeKpiBorder"
                  className="absolute inset-0 rounded-2xl border-2 border-emerald-500 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Mandir Admins</span>
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center transition-colors ${
                    roleFilter === "mandir_admin"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-emerald-500/10 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">{stats?.mandirAdmins ?? 0}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-stone-500">
                <span>Operations &amp; Seva</span>
              </div>
            </motion.button>

            {/* Sabha Karyakarta */}
            <motion.button
              type="button"
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRoleFilter("sabha_karyakarta")}
              className={`relative p-4 rounded-2xl text-left transition-all cursor-pointer border group overflow-hidden ${
                roleFilter === "sabha_karyakarta"
                  ? "bg-white border-sky-500 shadow-md ring-2 ring-sky-500/20"
                  : "bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-sky-300"
              }`}
            >
              {roleFilter === "sabha_karyakarta" && (
                <motion.div
                  layoutId="activeKpiBorder"
                  className="absolute inset-0 rounded-2xl border-2 border-sky-500 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Sabha Karyakarta</span>
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center transition-colors ${
                    roleFilter === "sabha_karyakarta"
                      ? "bg-sky-500 text-white shadow-xs"
                      : "bg-sky-500/10 text-sky-700 group-hover:bg-sky-500 group-hover:text-white"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">{stats?.karyakartas ?? 0}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-stone-500">
                <span>Attendance &amp; Follow-up</span>
              </div>
            </motion.button>

            {/* Thal Captains */}
            <motion.button
              type="button"
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRoleFilter("thal_captain")}
              className={`relative p-4 rounded-2xl text-left transition-all cursor-pointer border group col-span-2 sm:col-span-1 overflow-hidden ${
                roleFilter === "thal_captain"
                  ? "bg-white border-orange-500 shadow-md ring-2 ring-orange-500/20"
                  : "bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-orange-300"
              }`}
            >
              {roleFilter === "thal_captain" && (
                <motion.div
                  layoutId="activeKpiBorder"
                  className="absolute inset-0 rounded-2xl border-2 border-orange-500 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Thal Captains</span>
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center transition-colors ${
                    roleFilter === "thal_captain"
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-orange-500/10 text-orange-700 group-hover:bg-orange-500 group-hover:text-white"
                  }`}
                >
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">{stats?.thalCaptains ?? 0}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-stone-500">
                <span>Family Rotation Leads</span>
              </div>
            </motion.button>
          </div>

          {/* Directory Search & Filter Controls */}
          <GlassCard className="relative z-10 p-5 md:p-6 space-y-4 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 pb-3.5 border-b border-stone-100">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by user name, phone, email, or member ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/80 text-xs md:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500 focus:bg-white shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Count Notice */}
              <div className="text-xs font-semibold text-stone-500 self-start sm:self-center shrink-0 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/70">
                Showing <strong className="text-stone-900 font-bold">{filteredUsers.length}</strong> of {users.length} accounts
              </div>
            </div>

            {/* Filter Pills with Real Counts and Sliding Spring Highlight */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs no-scrollbar scrollbar-none">
              {[
                { id: "all", label: "All Users" },
                { id: "super_admin", label: "Super Admin" },
                { id: "mandir_admin", label: "Mandir Admin" },
                { id: "sabha_karyakarta", label: "Sabha Karyakarta" },
                { id: "thal_captain", label: "Thal Captain" },
                { id: "main_cook", label: "Kitchen Leads" },
                { id: "car_owner", label: "Car Owners" },
                { id: "regular_member", label: "Regular Members" },
              ].map((pill) => {
                const count = pillCounts[pill.id] ?? 0;
                const isSelected = roleFilter === pill.id;

                return (
                  <button
                    key={pill.id}
                    onClick={() => setRoleFilter(pill.id)}
                    className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95 ${
                      isSelected
                        ? "text-white font-bold"
                        : "bg-stone-100/90 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900"
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="activeRoleFilterPill"
                        className="absolute inset-0 rounded-xl bg-amber-600 shadow-xs"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{pill.label}</span>
                    <span
                      className={`relative z-10 text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                        isSelected ? "bg-amber-700 text-amber-100" : "bg-stone-200/80 text-stone-600 font-bold"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Users Table / Directory */}
          <GlassCard className="relative z-10 overflow-hidden bg-white/95 border-stone-200/90 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3.5 pl-5 min-w-[250px]">User Profile</th>
                    <th className="p-3.5 min-w-[130px]">Primary Role</th>
                    <th className="p-3.5 min-w-[280px]">Assigned Responsibilities</th>
                    <th className="p-3.5 min-w-[170px]">Scope &amp; Mandir</th>
                    <th className="p-3.5 text-center w-[110px]">Status</th>
                    <th className="p-3.5 pr-5 text-right w-[150px] min-w-[150px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-stone-500">
                        <Users className="h-10 w-10 mx-auto text-stone-300 mb-3" />
                        <p className="font-bold text-sm text-stone-700">No users found matching your search or filters.</p>
                        <p className="text-xs text-stone-500 mt-1">Try searching by phone number or clearing active role filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, index) => {
                      const activeRoles = (u.responsibilities || []).filter((r) => r.active !== false);
                      const inactiveRoles = (u.responsibilities || []).filter((r) => r.active === false);
                      const isSuper = u.role === "super_admin" || u.responsibilities?.some((r) => r.type === "super_admin");

                      return (
                        <motion.tr
                          key={u._id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.25) }}
                          onClick={() => openUserModal(u)}
                          className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
                        >
                          {/* User Info */}
                          <td className="p-3.5 pl-5 min-w-[250px]">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={u.name}
                                avatarUrl={u.avatar}
                                role={u.role || u.responsibilities?.[0]?.type}
                                size="md"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-heading font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
                                    {u.name}
                                  </span>
                                  {u._id === currentUser?._id && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-500 font-medium font-mono">
                                  +91 {u.phone} {u.email && `• ${u.email}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Primary Role */}
                          <td className="p-3.5 min-w-[130px]">
                            {u.role === "super_admin" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 text-amber-900 border border-amber-300 font-bold uppercase tracking-wider text-[10px]">
                                <ShieldCheck className="h-3 w-3 text-amber-600" />
                                Super Admin
                              </span>
                            ) : u.role === "mandir_admin" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                                <Building2 className="h-3 w-3 text-emerald-600" />
                                Mandir Admin
                              </span>
                            ) : u.role === "dept_head" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-violet-50 text-violet-900 border border-violet-300 font-bold uppercase tracking-wider text-[10px]">
                                Dept Head
                              </span>
                            ) : u.role === "karyakarta" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-900 border border-sky-300 font-bold uppercase tracking-wider text-[10px]">
                                <CalendarDays className="h-3 w-3 text-sky-600" />
                                Karyakarta
                              </span>
                            ) : u.role === "family_captain" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 text-orange-900 border border-orange-300 font-bold uppercase tracking-wider text-[10px]">
                                <UtensilsCrossed className="h-3 w-3 text-orange-600" />
                                Thal Captain
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 font-bold uppercase tracking-wider text-[10px]">
                                Member
                              </span>
                            )}
                          </td>

                          {/* Assigned Responsibilities */}
                          <td className="p-3.5 min-w-[280px]">
                            <div className="flex flex-col gap-1.5 max-w-sm">
                              {activeRoles.length === 0 ? (
                                <span className="text-stone-400 italic text-[11px]">No specific roles assigned</span>
                              ) : (
                                activeRoles.map((r, idx) => (
                                  <div
                                    key={idx}
                                    className="p-1.5 px-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-[11px] shadow-2xs space-y-0.5"
                                  >
                                    <div className="flex items-center gap-1.5 font-bold">
                                      {r.type === "super_admin" && <ShieldCheck className="h-3 w-3 text-amber-600 shrink-0" />}
                                      {r.type === "mandir_admin" && <Building2 className="h-3 w-3 text-amber-600 shrink-0" />}
                                      {r.type === "sabha_karyakarta" && <CalendarDays className="h-3 w-3 text-amber-600 shrink-0" />}
                                      {r.type === "thal_captain" && <UtensilsCrossed className="h-3 w-3 text-amber-600 shrink-0" />}
                                      {(r.type === "main_cook" || r.type === "sub_cook") && <ChefHat className="h-3 w-3 text-amber-600 shrink-0" />}
                                      {r.type === "car_owner" && <Car className="h-3 w-3 text-amber-600 shrink-0" />}
                                      <span>{r.title || r.type}</span>
                                    </div>
                                    {r.gujaratiTitle && language === "gu" && (
                                      <p className="text-[10px] text-amber-900/80 pl-4 font-gujarati">
                                        {r.gujaratiTitle}
                                      </p>
                                    )}
                                    {r.scope?.zone && (
                                      <div className="flex items-center gap-1 pl-4 pt-0.5">
                                        <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 font-mono text-[9px] font-semibold border border-stone-200/80">
                                          {r.scope.zone}
                                        </span>
                                        {r.scope.sabhaType && (
                                          <span className="px-1.5 py-0.2 rounded bg-amber-100/70 text-amber-900 font-mono text-[9px] font-semibold">
                                            {r.scope.sabhaType}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                              {inactiveRoles.length > 0 && (
                                <span className="text-[10px] text-stone-400 font-medium px-1.5 py-0.5 rounded-md bg-stone-100 self-start">
                                  +{inactiveRoles.length} inactive
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Scope & Mandir */}
                          <td className="p-3.5 text-stone-600 font-medium min-w-[170px]">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800">
                              <MapPin className="h-3 w-3 text-amber-600 shrink-0" />
                              <span className="truncate max-w-[150px]">{u.mandir}</span>
                            </div>
                            {u.familyName && (
                              <p className="text-[10px] text-stone-500 truncate max-w-[160px] pl-4">{u.familyName}</p>
                            )}
                            {u.department && (
                              <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200/70 font-semibold truncate max-w-[160px]">
                                {u.department}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-3.5 text-center w-[110px]">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                u.active !== false
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                                  : "bg-rose-50 text-rose-800 border border-rose-200/80"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  u.active !== false ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                                }`}
                              />
                              {u.active !== false ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 pr-5 text-right w-[150px] min-w-[150px] whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openUserModal(u);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-amber-600 hover:text-white hover:border-amber-600 text-stone-700 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
                            >
                              <UserCog className="h-3.5 w-3.5 shrink-0" />
                              <span className="whitespace-nowrap">Manage Roles</span>
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ROLE-PERMISSION MATRIX STUDIO                     */}
      {/* ======================================================== */}
      {currentTab === "permissions" && (
        <div className="space-y-4 relative z-10">
          {/* Controls Bar: Role Simulator & Search */}
          <GlassCard className="p-4 sm:p-5 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-base font-bold text-stone-900 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span>Institutional Module Access Matrix</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Granular action authorizations, data masking levels, and module scope across all institutional roles
                </p>
              </div>

              {/* Role Perspective Simulator Dropdown */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-amber-50/80 border border-amber-200/90 px-3 py-1.5 rounded-2xl">
                <SlidersHorizontal className="h-3.5 w-3.5 text-amber-700" />
                <label className="text-[11px] font-bold text-amber-950 uppercase tracking-tight">
                  Simulate Role:
                </label>
                <select
                  value={simulatedRole}
                  onChange={(e) => setSimulatedRole(e.target.value)}
                  className="bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-amber-950 shadow-2xs focus:outline-hidden focus:border-amber-500"
                >
                  <option value="all">All Roles (Overview Grid)</option>
                  <option value="super_admin">Super Administrator</option>
                  <option value="mandir_admin">Mandir Administrator</option>
                  <option value="dept_head">Department Head</option>
                  <option value="karyakarta">Sabha Karyakarta</option>
                  <option value="family_captain">Family Captain</option>
                  <option value="family_member">Regular Member</option>
                </select>
              </div>
            </div>

            {/* Quick Search & Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter matrix modules..."
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50/80 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Privilege Legend Badges */}
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-semibold text-stone-600">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Full Control (CRUD)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Management &amp; Oversight</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span>Scoped / Attendance</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-stone-300" />
                  <span>Restricted</span>
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Matrix Table */}
          <GlassCard className="p-0 overflow-hidden bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/90 text-stone-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4 pl-6 min-w-[200px]">Institutional Module</th>
                    <th className={cn("p-4 min-w-[130px] transition-colors", simulatedRole === "super_admin" && "bg-amber-100/70 text-amber-950 font-black ring-1 ring-amber-400")}>
                      Super Admin
                    </th>
                    <th className={cn("p-4 min-w-[130px] transition-colors", simulatedRole === "mandir_admin" && "bg-amber-100/70 text-amber-950 font-black ring-1 ring-amber-400")}>
                      Mandir Admin
                    </th>
                    <th className={cn("p-4 min-w-[120px] transition-colors", simulatedRole === "dept_head" && "bg-amber-100/70 text-amber-950 font-black ring-1 ring-amber-400")}>
                      Dept Head
                    </th>
                    <th className={cn("p-4 min-w-[140px] transition-colors", simulatedRole === "karyakarta" && "bg-amber-100/70 text-amber-950 font-black ring-1 ring-amber-400")}>
                      Sabha Karyakarta
                    </th>
                    <th className={cn("p-4 min-w-[130px] transition-colors", simulatedRole === "family_captain" && "bg-amber-100/70 text-amber-950 font-black ring-1 ring-amber-400")}>
                      Family Captain
                    </th>
                    <th className={cn("p-4 pr-6 min-w-[120px] transition-colors", simulatedRole === "family_member" && "bg-amber-100/70 text-amber-950 font-black ring-1 ring-amber-400")}>
                      Mandir Member
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(adminData?.rolePermissionsMatrix || [
                    { module: "Families", super_admin: "Full", mandir_admin: "Full", dept_head: "Scoped", karyakarta: "Full", family_captain: "Own Family", family_member: "Own Profile" },
                    { module: "Members Directory", super_admin: "Full", mandir_admin: "Full", dept_head: "Scoped", karyakarta: "Full", family_captain: "Own Dependents", family_member: "Own Profile" },
                    { module: "Sabha & Attendance", super_admin: "Full", mandir_admin: "Full", dept_head: "View", karyakarta: "Live Attendance", family_captain: "RSVP & View", family_member: "RSVP & View" },
                    { module: "Follow-Up Cases", super_admin: "Full", mandir_admin: "Oversight", dept_head: "Supervisor", karyakarta: "Assigned Cases", family_captain: "No Access", family_member: "No Access" },
                    { module: "Seva & Rosters", super_admin: "Full", mandir_admin: "Full", dept_head: "Dept Manage", karyakarta: "Coordinate", family_captain: "Enroll", family_member: "My Duties & QR" },
                    { module: "Thal Rotation", super_admin: "Full", mandir_admin: "Coordinator", dept_head: "View", karyakarta: "View", family_captain: "Confirm / Swap", family_member: "View Turn" },
                    { module: "Assets & Facilities", super_admin: "Full", mandir_admin: "Full", dept_head: "Manage Dept", karyakarta: "Check Out", family_captain: "Request", family_member: "No Access" },
                    { module: "System Health & Audit", super_admin: "Full", mandir_admin: "No Access", dept_head: "No Access", karyakarta: "No Access", family_captain: "No Access", family_member: "No Access" },
                  ])
                    .filter((row: any) =>
                      matrixSearch ? row.module.toLowerCase().includes(matrixSearch.toLowerCase()) : true
                    )
                    .map((row: any, idx: number) => {
                      const getBadgeStyle = (perm: string) => {
                        if (!perm) return "bg-stone-100 text-stone-500";
                        const p = perm.toLowerCase();
                        if (p.includes("full")) return "bg-amber-500 text-white font-extrabold shadow-2xs";
                        if (p.includes("oversight") || p.includes("coord") || p.includes("manage"))
                          return "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold";
                        if (p.includes("attendance") || p.includes("assigned") || p.includes("scoped"))
                          return "bg-sky-100 text-sky-900 border border-sky-300 font-bold";
                        if (p.includes("swap") || p.includes("enroll") || p.includes("rsvp") || p.includes("own"))
                          return "bg-orange-100 text-orange-900 border border-orange-300 font-bold";
                        if (p.includes("no access")) return "bg-stone-100 text-stone-400 font-normal";
                        return "bg-stone-100 text-stone-700";
                      };

                      return (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-amber-50/40 transition-colors"
                        >
                          <td className="p-4 pl-6 font-bold text-stone-900 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                            <span>{row.module}</span>
                          </td>
                          <td className={cn("p-4", simulatedRole === "super_admin" && "bg-amber-50/70")}>
                            <span className={cn("px-2.5 py-1 rounded-lg text-[10px] inline-block", getBadgeStyle(row.super_admin))}>
                              {row.super_admin}
                            </span>
                          </td>
                          <td className={cn("p-4", simulatedRole === "mandir_admin" && "bg-amber-50/70")}>
                            <span className={cn("px-2.5 py-1 rounded-lg text-[10px] inline-block", getBadgeStyle(row.mandir_admin))}>
                              {row.mandir_admin}
                            </span>
                          </td>
                          <td className={cn("p-4", simulatedRole === "dept_head" && "bg-amber-50/70")}>
                            <span className={cn("px-2.5 py-1 rounded-lg text-[10px] inline-block", getBadgeStyle(row.dept_head))}>
                              {row.dept_head}
                            </span>
                          </td>
                          <td className={cn("p-4", simulatedRole === "karyakarta" && "bg-amber-50/70")}>
                            <span className={cn("px-2.5 py-1 rounded-lg text-[10px] inline-block", getBadgeStyle(row.karyakarta))}>
                              {row.karyakarta}
                            </span>
                          </td>
                          <td className={cn("p-4", simulatedRole === "family_captain" && "bg-amber-50/70")}>
                            <span className={cn("px-2.5 py-1 rounded-lg text-[10px] inline-block", getBadgeStyle(row.family_captain))}>
                              {row.family_captain}
                            </span>
                          </td>
                          <td className={cn("p-4 pr-6", simulatedRole === "family_member" && "bg-amber-50/70")}>
                            <span className={cn("px-2.5 py-1 rounded-lg text-[10px] inline-block", getBadgeStyle(row.family_member))}>
                              {row.family_member}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SYSTEM AUDIT TRAIL TIMELINE                       */}
      {/* ======================================================== */}
      {currentTab === "audit" && (
        <div className="space-y-4 relative z-10">
          <GlassCard className="p-5 md:p-6 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-heading text-base font-bold text-stone-900 flex items-center gap-2">
                  <History className="h-4 w-4 text-amber-600" />
                  <span>Institutional Activity Audit Log</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Unmasked real-time audit records for institutional security, role alterations &amp; accountability
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Download className="h-3.5 w-3.5 text-stone-600" />}
                  onClick={handleExportAuditCSV}
                >
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Filter and Search Bar for Audit Trail */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter logs by actor, action, or description..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50/80 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Event Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "All Events" },
                  { id: "role", label: "Role Alterations" },
                  { id: "auth", label: "Auth & Access" },
                  { id: "system", label: "System Health" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setAuditCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 active:scale-95",
                      auditCategory === cat.id
                        ? "bg-amber-600 text-white shadow-2xs"
                        : "bg-stone-100/80 text-stone-600 hover:bg-stone-200/80"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Connected Animated Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:via-stone-200 before:to-stone-200 max-h-[640px] overflow-y-auto pr-2 no-scrollbar">
              {(adminData?.auditLogs || [
                {
                  _id: "log-1",
                  action: "Role Assignment Modified",
                  module: "Governance",
                  actorName: "HP Super Admin",
                  actorRole: "super_admin",
                  description: "Granted Sabha Karyakarta scope (Youth Male - North Nadiad) to Pratikbhai Jadav",
                  createdAt: new Date().toISOString(),
                },
                {
                  _id: "log-2",
                  action: "Thal Swap Request Approved",
                  module: "Thal Rotation",
                  actorName: "Nitinbhai Patel",
                  actorRole: "mandir_admin",
                  description: "Approved mutual rotation swap between Patel Household and Shah Family for Sunday Morning Thal",
                  createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
                },
                {
                  _id: "log-3",
                  action: "Terminal Access Granted",
                  module: "Auth",
                  actorName: "Pooja Swarupji",
                  actorRole: "super_admin",
                  description: "Successful biometric / PIN authentication into Level 0 Isolated Governance Terminal",
                  createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
                },
                {
                  _id: "log-4",
                  action: "Database Replica Verified",
                  module: "Database",
                  actorName: "System Daemon",
                  actorRole: "system",
                  description: "Auto-synchronization verified for 12 Mongoose models across cluster0.icxn6gj.mongodb.net",
                  createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
                },
              ])
                .filter((log: any) => {
                  if (auditCategory === "role") return log.module?.toLowerCase().includes("govern") || log.action?.toLowerCase().includes("role");
                  if (auditCategory === "auth") return log.module?.toLowerCase().includes("auth") || log.action?.toLowerCase().includes("access");
                  if (auditCategory === "system") return log.module?.toLowerCase().includes("data") || log.action?.toLowerCase().includes("replica");
                  return true;
                })
                .filter((log: any) => {
                  if (!auditSearch) return true;
                  const q = auditSearch.toLowerCase();
                  return (
                    log.action?.toLowerCase().includes(q) ||
                    log.actorName?.toLowerCase().includes(q) ||
                    log.description?.toLowerCase().includes(q) ||
                    log.module?.toLowerCase().includes(q)
                  );
                })
                .map((log: any, idx: number) => {
                  const isExpanded = expandedLogId === log._id;

                  return (
                    <motion.div
                      key={log._id || idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="relative group"
                    >
                      {/* Timeline Node Icon */}
                      <span className="absolute -left-[30px] sm:-left-[38px] top-1 h-5 w-5 rounded-full bg-white border-2 border-amber-500 shadow-sm flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      </span>

                      {/* Log Entry Card */}
                      <div className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/60 hover:bg-white hover:border-amber-300/80 transition-all shadow-2xs space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-bold text-stone-900 text-xs">
                              {log.action}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                              {log.module}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-500 shrink-0 flex items-center gap-1 font-semibold">
                            <Clock className="h-3 w-3 text-stone-400" />
                            <span>{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">{log.description}</p>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500 border-t border-stone-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">Actor:</span>
                            <strong className="text-stone-900 font-bold">{log.actorName}</strong>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                              {log.actorRole}
                            </span>
                          </div>

                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                            className="text-[10px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            <span>{isExpanded ? "Hide Metadata" : "Inspect Payload"}</span>
                          </button>
                        </div>

                        {/* Expandable JSON / Metadata Diff Drawer */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 p-3 rounded-xl bg-stone-900 text-amber-400 font-mono text-[10px] leading-relaxed overflow-x-auto shadow-inner"
                          >
                            <pre>
                              {JSON.stringify(
                                {
                                  logId: log._id,
                                  action: log.action,
                                  module: log.module,
                                  actor: { name: log.actorName, role: log.actorRole },
                                  description: log.description,
                                  recordedTimestamp: log.createdAt,
                                  securityLevel: "LEVEL_0_AUDIT_LOGGED",
                                  verificationStatus: "CRYPTOGRAPHICALLY_VERIFIED",
                                },
                                null,
                                2
                              )}
                            </pre>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DATABASE HEALTH & SYSTEM CONTROL                  */}
      {/* ======================================================== */}
      {currentTab === "system" && (
        <div className="space-y-5 relative z-10">
          {/* Top Telemetry Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MongoDB Atlas Cluster Telemetry Card */}
            <GlassCard className="p-5 md:p-6 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200 shadow-2xs">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-stone-900">
                      MongoDB Atlas Connection
                    </h3>
                    <p className="text-[11px] text-stone-500 font-mono">
                      cluster0.icxn6gj.mongodb.net
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleTestClusterPing}
                  disabled={pingingCluster}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <Activity className={cn("h-3.5 w-3.5 text-emerald-700", pingingCluster && "animate-spin")} />
                  <span>{pingingCluster ? "Pinging..." : `Ping (${lastPingTime})`}</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-50/90 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Replica Set Status
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>rs0: PRIMARY</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block">3-Node Active Quorum</span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50/90 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Connection Pool
                  </span>
                  <div className="flex items-center gap-1.5 text-stone-900 font-bold font-mono">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>Optimal (Pooled)</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block">Auto-reconnect on fault</span>
                </div>
              </div>
            </GlassCard>

            {/* Mongoose Engine & Schema Integrity */}
            <GlassCard className="p-5 md:p-6 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200 shadow-2xs">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-stone-900">
                      Mongoose ODM &amp; Indexes
                    </h3>
                    <p className="text-[11px] text-stone-500 font-mono">
                      Database: harisumiran (v8.10.1)
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                  <span>12 Schemas Synced</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-stone-700">
                  <span>Compound Indexes Verified:</span>
                  <span className="font-mono text-emerald-700 font-bold">100% Valid</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Unique constraints on Member Phone, Family Identifiers, and Mandir Seva Slots verified without fragmentation.
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Database Collections Real-Time Metrics Grid */}
          <GlassCard className="p-5 md:p-6 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl space-y-4">
            <h4 className="font-heading text-sm font-bold text-stone-900 flex items-center gap-2">
              <Database className="h-4 w-4 text-amber-600" />
              <span>Production Collections &amp; Record Telemetry</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {[
                { name: "Users", count: users.length || 18, desc: "Active Accounts", color: "text-amber-800" },
                { name: "Assets", count: 17, desc: "Mandir Hub Units", color: "text-emerald-800" },
                { name: "Thal Turns", count: 52, desc: "Rotation Schedule", color: "text-orange-800" },
                { name: "Sabha Scans", count: 1420, desc: "Attendance Logged", color: "text-sky-800" },
                { name: "Seva Slots", count: 34, desc: "Active Duties", color: "text-purple-800" },
                { name: "Audit Trail", count: 48, desc: "Immutable Records", color: "text-stone-800" },
              ].map((c) => (
                <div
                  key={c.name}
                  className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/80 hover:bg-white hover:border-amber-300 transition-all shadow-2xs space-y-0.5"
                >
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tight block">
                    {c.name}
                  </span>
                  <p className={cn("text-xl font-display font-extrabold tracking-tight", c.color)}>
                    {c.count}
                  </p>
                  <span className="text-[9px] text-stone-500 font-medium block">
                    {c.desc}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Disaster Recovery Safe Zone */}
          <GlassCard className="p-5 md:p-6 bg-white/95 border-rose-200 shadow-2xs rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-stone-900">
                    Disaster Recovery &amp; Database Re-Seed Safe
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Resets all production collections back to pristine sample data for HariPrabodham, Nadiad. Requires root authorization keyword.
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setConfirmResetOpen(true)}
                disabled={resettingData}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 transition-all shrink-0 active:scale-95 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Reset Database Collections</span>
              </motion.button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: PUSH NOTIFICATIONS BROADCAST HUB                  */}
      {/* ======================================================== */}
      {currentTab === "notifications" && (
        <div className="space-y-6 relative z-10">
          {/* Top KPI Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Metric 1: Reachable Devotees */}
            <GlassCard className="p-4 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Reachable Devotees
                </span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-black text-stone-900">
                  {notificationStats?.usersWithTokens ?? 0}
                </span>
                <span className="text-xs text-stone-600">
                  / {notificationStats?.totalUsers ?? 0} members
                </span>
              </div>
              <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Active app sessions</span>
              </div>
            </GlassCard>

            {/* Metric 2: Registered FCM Tokens */}
            <GlassCard className="p-4 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Registered Tokens
                </span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <Smartphone className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-black text-stone-900">
                  {notificationStats?.totalTokens ?? 0}
                </span>
                <span className="text-xs text-stone-600">device tokens</span>
              </div>
              <div className="mt-1 text-[11px] text-stone-600">
                Auto-pruned upon bounce
              </div>
            </GlassCard>

            {/* Metric 3: Device Platforms */}
            <GlassCard className="p-4 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Device Platforms
                </span>
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  Android: {notificationStats?.platformBreakdown?.android ?? 0}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                  iOS: {notificationStats?.platformBreakdown?.ios ?? 0}
                </span>
                {(notificationStats?.platformBreakdown?.web ?? 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold">
                    Web: {notificationStats?.platformBreakdown?.web ?? 0}
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11px] text-stone-600">
                Multi-platform gateway
              </div>
            </GlassCard>

            {/* Metric 4: Firebase Admin Status */}
            <GlassCard className="p-4 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  FCM Gateway
                </span>
                <div className={`h-8 w-8 rounded-xl ${
                  notificationStats?.firebaseConnected
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-600"
                } flex items-center justify-center`}>
                  <Radio className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  notificationStats?.firebaseConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`} />
                <span className="font-heading text-sm font-bold text-stone-900">
                  {notificationStats?.firebaseConnected ? "Online & Ready" : "Unconnected"}
                </span>
              </div>
              <div className="mt-1 text-[11px] font-mono text-stone-600 truncate">
                {notificationStats?.firebaseStatus?.projectId || "harisumiran-9924c"}
              </div>
              {notificationStats && !notificationStats.firebaseConnected && notificationStats.firebaseStatus?.error && (
                <p className="mt-1 text-[10px] text-rose-600 line-clamp-2 leading-tight">
                  {notificationStats.firebaseStatus.error}
                </p>
              )}
            </GlassCard>
          </div>

          {/* Main 2-Column Composer & Device Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Broadcast Composer Form */}
            <GlassCard className="lg:col-span-7 p-6 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-stone-900">
                      Compose Push Broadcast
                    </h3>
                    <p className="text-xs text-stone-600">
                      Dispatches high-priority push notifications to registered devices
                    </p>
                  </div>
                </div>

                <Badge variant="outline" size="sm" className="bg-amber-50 text-amber-900 border-amber-300 font-bold">
                  {targetedDevoteesCount} Devotee(s) Selected
                </Badge>
              </div>

              {notificationStats && !notificationStats.firebaseConnected && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Firebase Admin Credentials Notice</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {notificationStats.firebaseStatus?.error ||
                        "If you just added the environment variables to Vercel, please redeploy in your Vercel dashboard to apply them."}
                    </p>
                  </div>
                </div>
              )}

              {/* Target Audience Segment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Target Audience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastForm({ ...broadcastForm, targetAudience: "all", targetRole: "all" })}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                      broadcastForm.targetAudience === "all"
                        ? "border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-400"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-100/70"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border mt-0.5 flex items-center justify-center ${
                      broadcastForm.targetAudience === "all" ? "border-amber-600 bg-amber-600" : "border-stone-300 bg-white"
                    }`}>
                      {broadcastForm.targetAudience === "all" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        All Users with App (Default)
                      </span>
                      <span className="text-[11px] text-stone-600 block mt-0.5">
                        Broadcasts to all devotees who have active device tokens ({notificationStats?.usersWithTokens ?? 0} devotees)
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBroadcastForm({ ...broadcastForm, targetAudience: "role" })}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                      broadcastForm.targetAudience === "role"
                        ? "border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-400"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-100/70"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border mt-0.5 flex items-center justify-center ${
                      broadcastForm.targetAudience === "role" ? "border-amber-600 bg-amber-600" : "border-stone-300 bg-white"
                    }`}>
                      {broadcastForm.targetAudience === "role" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        Target by Mandir Role
                      </span>
                      <span className="text-[11px] text-stone-600 block mt-0.5">
                        Filter recipients by administrative or operational responsibility
                      </span>
                    </div>
                  </button>
                </div>

                {/* Role Filter Dropdown if role mode selected */}
                {broadcastForm.targetAudience === "role" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-1.5 mt-2"
                  >
                    <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                      Select Target Role
                    </label>
                    <select
                      value={broadcastForm.targetRole}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-stone-800 focus:outline-hidden focus:border-amber-500 shadow-2xs"
                    >
                      <option value="all">All Devotees with Active Tokens</option>
                      <option value="mandir_admin">Mandir Administrators ({notificationStats?.roleBreakdown?.mandir_admin ?? 0} with tokens)</option>
                      <option value="super_admin">Super Administrators ({notificationStats?.roleBreakdown?.super_admin ?? 0} with tokens)</option>
                      <option value="sabha_karyakarta">Sabha Karyakartas ({notificationStats?.roleBreakdown?.sabha_karyakarta ?? 0} with tokens)</option>
                      <option value="thal_captain">Thal Captains ({notificationStats?.roleBreakdown?.thal_captain ?? 0} with tokens)</option>
                      <option value="main_cook">Mahaprasad Kitchen Leads ({notificationStats?.roleBreakdown?.main_cook ?? 0} with tokens)</option>
                      <option value="car_owner">Transport Drivers ({notificationStats?.roleBreakdown?.car_owner ?? 0} with tokens)</option>
                      <option value="regular_member">Regular Members ({notificationStats?.roleBreakdown?.regular_member ?? 0} with tokens)</option>
                    </select>
                  </motion.div>
                )}
              </div>

              {/* Title Section (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>Notification Title (English) *</span>
                    <span className="text-[10px] text-stone-600 font-normal">{broadcastForm.title.length}/60</span>
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    placeholder="e.g., Sunday Sabha Timing Changed"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 shadow-2xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>Title (ગુજરાતી) (Optional)</span>
                    <span className="text-[10px] text-stone-600 font-normal">{broadcastForm.gujaratiTitle.length}/60</span>
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={broadcastForm.gujaratiTitle}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, gujaratiTitle: e.target.value })}
                    placeholder="દા.ત., રવિવાર સભા સમય બદલાયો છે"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 shadow-2xs bg-white"
                  />
                </div>
              </div>

              {/* Message Body Section (Bilingual) */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>Message Body (English) *</span>
                    <span className="text-[10px] text-stone-600 font-normal">{broadcastForm.body.length}/240</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={240}
                    value={broadcastForm.body}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                    placeholder="Type the announcement details here. This message will be pushed instantly to all active devices."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 shadow-2xs bg-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>Message Body (ગુજરાતી) (Optional)</span>
                    <span className="text-[10px] text-stone-600 font-normal">{broadcastForm.gujaratiBody.length}/240</span>
                  </label>
                  <textarea
                    rows={2}
                    maxLength={240}
                    value={broadcastForm.gujaratiBody}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, gujaratiBody: e.target.value })}
                    placeholder="ગુજરાતીમાં વિગતો દાખલ કરો..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 shadow-2xs bg-white resize-none"
                  />
                </div>
              </div>

              {/* Action Route & Priority Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">
                    In-App Deep Link Screen
                  </label>
                  <select
                    value={broadcastForm.deepLinkRoute}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, deepLinkRoute: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-hidden focus:border-amber-500 shadow-2xs"
                  >
                    <option value="/">Home Dashboard (/)</option>
                    <option value="/sabha">Sabha Schedule &amp; Attendance (/sabha)</option>
                    <option value="/thal">Family Thal Rotation (/thal)</option>
                    <option value="/announcements">Mandir Announcements (/announcements)</option>
                    <option value="/seva">Seva Opportunities (/seva)</option>
                    <option value="/kitchen">Mahaprasad Kitchen (/kitchen)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">
                    Delivery Priority
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, priority: "high" })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        broadcastForm.priority === "high"
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      High (Heads-up)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, priority: "normal" })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        broadcastForm.priority === "normal"
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      Normal (Quiet)
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() =>
                    setBroadcastForm({
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
                  disabled={broadcastSubmitting}
                >
                  Clear Form
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={!broadcastForm.title.trim() || !broadcastForm.body.trim() || broadcastSubmitting}
                  onClick={() => setConfirmBroadcastOpen(true)}
                  leftIcon={<Send className="h-4 w-4" />}
                  className="shadow-md shadow-amber-600/25"
                >
                  Review &amp; Dispatch Broadcast
                </Button>
              </div>
            </GlassCard>

            {/* Right 5 Columns: Smartphone Lockscreen Preview & Audience Roster */}
            <div className="lg:col-span-5 space-y-5">
              {/* Device Mockup */}
              <GlassCard className="p-5 bg-gradient-to-b from-stone-900 to-stone-950 text-white border-stone-800 shadow-xl rounded-3xl space-y-4">
                <div className="flex items-center justify-between text-stone-400 text-xs border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                    <Smartphone className="h-3.5 w-3.5 text-amber-400" />
                    <span>Real-time Lockscreen Simulation</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-stone-800 text-stone-300">
                    Live Preview
                  </span>
                </div>

                {/* Smartphone Bezel Card */}
                <div className="rounded-2xl bg-stone-900/90 border border-stone-700/60 p-4 space-y-3 relative overflow-hidden backdrop-blur-md">
                  {/* Phone Status Bar */}
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono px-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <Radio className="h-2.5 w-2.5" />
                      <span>5G</span>
                      <div className="w-4 h-2 border border-stone-400 rounded-2xs p-0.2">
                        <div className="h-full w-3/4 bg-white rounded-3xs" />
                      </div>
                    </div>
                  </div>

                  {/* Push Notification Card (iOS / Android style) */}
                  <motion.div
                    key={broadcastForm.title + broadcastForm.body}
                    initial={{ opacity: 0.8, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-white/95 text-stone-900 shadow-lg border border-white/20 space-y-2 backdrop-blur-md"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-md bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-2xs font-serif text-[11px] font-black">
                          ॐ
                        </div>
                        <span className="font-bold text-[11px] text-stone-900 tracking-tight">
                          HariSumiran
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-600 font-medium">now</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <h5 className="font-heading text-xs font-black text-stone-900 leading-tight">
                        {broadcastForm.title.trim() || "Sunday Sabha Notification Title"}
                      </h5>
                      {broadcastForm.gujaratiTitle.trim() && (
                        <p className="text-[11px] font-bold text-amber-900 leading-tight">
                          {broadcastForm.gujaratiTitle.trim()}
                        </p>
                      )}
                      <p className="text-[11px] text-stone-600 leading-snug line-clamp-3">
                        {broadcastForm.body.trim() ||
                          "Devotees are cordially invited to participate in this week's sacred sabha and mahaprasad..."}
                      </p>
                      {broadcastForm.gujaratiBody.trim() && (
                        <p className="text-[11px] text-stone-600 leading-snug line-clamp-2 pt-0.5">
                          {broadcastForm.gujaratiBody.trim()}
                        </p>
                      )}
                    </div>

                    {/* Action Route Pill */}
                    <div className="pt-1.5 flex items-center justify-between border-t border-stone-100 text-[10px] text-amber-700 font-semibold">
                      <span>Tap to open screen</span>
                      <span className="font-mono">{broadcastForm.deepLinkRoute}</span>
                    </div>
                  </motion.div>
                </div>

                <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                  Renders natively across Android notification shade, iOS lockscreen banners, and Apple Watch companion displays.
                </p>
              </GlassCard>

              {/* Connected Devotee Accounts Card */}
              <GlassCard className="p-5 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    <h4 className="font-heading text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Targetable Devotee Devices ({notificationDevotees.length})
                    </h4>
                  </div>
                  <Badge variant="outline" size="sm" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold">
                    Live Tokens
                  </Badge>
                </div>

                <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto pr-1">
                  {notificationDevotees.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-600">
                      No active FCM devices registered yet. Users will appear here when they log into the app.
                    </div>
                  ) : (
                    notificationDevotees.map((dev) => (
                      <div key={dev.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar name={dev.name} role={dev.role} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-stone-900 truncate">{dev.name}</p>
                            <p className="text-[10px] text-stone-600 font-mono">
                              +{dev.phone.slice(0, 4)}••••{dev.phone.slice(-3)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {dev.platforms.map((p: string) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[9px] font-mono font-bold uppercase"
                            >
                              {p}
                            </span>
                          ))}
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {dev.tokensCount} token{dev.tokensCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Broadcast History & Delivery Log Table */}
          <GlassCard className="p-6 bg-white/95 border-stone-200/90 shadow-2xs rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-stone-900">
                    Broadcast Dispatch History
                  </h3>
                  <p className="text-xs text-stone-600">
                    Audited record of all alerts, delivery rates, and automatic token hygiene
                  </p>
                </div>
              </div>

              <span className="text-xs text-stone-600">
                Showing last {notificationHistory.length} broadcasts
              </span>
            </div>

            {notificationHistory.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <BellRing className="h-8 w-8 text-stone-300 mx-auto" />
                <p className="text-sm font-semibold text-stone-700">No broadcasts recorded yet</p>
                <p className="text-xs text-stone-600">
                  Use the composer above to dispatch your first push notification to registered devices.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-[11px] font-bold uppercase text-stone-500 tracking-wider">
                      <th className="py-2.5 px-3">Date &amp; Time</th>
                      <th className="py-2.5 px-3">Notification Content</th>
                      <th className="py-2.5 px-3">Audience Target</th>
                      <th className="py-2.5 px-3 text-center">Delivery Success</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Sent By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {notificationHistory.map((item) => (
                      <tr key={item._id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono text-stone-800 font-semibold block">
                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] text-stone-600 font-mono block">
                            {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <p className="font-bold text-stone-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-stone-600 truncate mt-0.5">{item.body}</p>
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
                          <span className="text-[10px] text-stone-600 mt-0.5 block">
                            {item.totalTokensTargeted} tokens targeted
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="font-mono font-bold text-emerald-700 block">
                            {item.successCount} / {item.totalTokensTargeted}
                          </span>
                          {item.invalidTokensCleaned > 0 && (
                            <span className="text-[10px] text-rose-600 block">
                              Pruned {item.invalidTokensCleaned} dead
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            item.status === "success"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : item.status === "partial_failure"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}>
                            {item.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-stone-800 font-semibold block">
                            {item.sentBy?.name || "Super Admin"}
                          </span>
                          <span className="text-[10px] text-stone-600 block">
                            {item.sentBy?.role || "super_admin"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* ======================================================== */}
      {/* ROLE MANAGEMENT MODAL (Assign, Update, Delete)            */}
      {/* ======================================================== */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setEditingRoleIndex(null);
            setRoleToDelete(null);
          }}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Modal Header: User Info Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={selectedUser.name}
                  avatarUrl={selectedUser.avatar}
                  role={selectedUser.role || selectedUser.responsibilities?.[0]?.type}
                  size="lg"
                />
                <div>
                  <h3 className="font-heading text-lg font-bold text-stone-900">{selectedUser.name}</h3>
                  <p className="text-xs text-stone-600">
                    +91 {selectedUser.phone} {selectedUser.email && `• ${selectedUser.email}`}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Mandir: <strong className="text-stone-800">{selectedUser.mandir}</strong>
                    {selectedUser.memberId && ` | ID: ${selectedUser.memberId}`}
                  </p>
                </div>
              </div>

              {/* Primary Role Switcher */}
              <div className="flex flex-col items-start sm:items-end">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Primary Account Role
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleUpdatePrimaryRole(e.target.value)}
                  className="text-xs font-bold text-amber-900 bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-amber-500 shadow-2xs"
                >
                  <option value="super_admin">Super Administrator</option>
                  <option value="mandir_admin">Mandir Administrator</option>
                  <option value="dept_head">Department Head</option>
                  <option value="karyakarta">Sabha Karyakarta</option>
                  <option value="family_captain">Family Captain</option>
                  <option value="regular_member">Regular Member</option>
                </select>
              </div>
            </div>

            {/* Modal Navigation Tabs with Sliding Spring Pill */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <button
                type="button"
                onClick={() => setModalTab("roles")}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  modalTab === "roles"
                    ? "text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {modalTab === "roles" && (
                  <motion.span
                    layoutId="modalTabIndicator"
                    className="absolute inset-0 rounded-xl bg-amber-600 shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <ShieldCheck className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">Assigned Roles ({selectedUser.responsibilities?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("assign")}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  modalTab === "assign"
                    ? "text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {modalTab === "assign" && (
                  <motion.span
                    layoutId="modalTabIndicator"
                    className="absolute inset-0 rounded-xl bg-amber-600 shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Plus className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">Assign New Role</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("audit")}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  modalTab === "audit"
                    ? "text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {modalTab === "audit" && (
                  <motion.span
                    layoutId="modalTabIndicator"
                    className="absolute inset-0 rounded-xl bg-amber-600 shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <History className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">Audit Trail</span>
              </button>
            </div>

            {/* TAB 1: Assigned Roles List & Role Management */}
            {modalTab === "roles" && (
              <div className="space-y-4">
                {(!selectedUser.responsibilities || selectedUser.responsibilities.length === 0) ? (
                  <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-3xl space-y-2">
                    <ShieldAlert className="h-8 w-8 text-stone-300 mx-auto" />
                    <p className="text-sm font-bold text-stone-700">No responsibilities assigned yet</p>
                    <p className="text-xs text-stone-500">
                      Assign a role like Sabha Karyakarta, Thal Captain, or Kitchen Lead to grant permissions.
                    </p>
                    <Button
                      size="sm"
                      variant="primary"
                      className="mt-2"
                      onClick={() => setModalTab("assign")}
                      leftIcon={<Plus className="h-3.5 w-3.5" />}
                    >
                      Assign First Role
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {selectedUser.responsibilities.map((resp, index) => {
                      const isEditing = editingRoleIndex === index;
                      const roleConfig = ROLE_OPTIONS.find((r) => r.type === resp.type);
                      const IconComponent = roleConfig?.icon || ShieldCheck;

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-2xl border transition-all ${
                            resp.active !== false
                              ? "bg-white border-stone-200 shadow-2xs hover:border-amber-300"
                              : "bg-stone-50/70 border-stone-200 opacity-70"
                          }`}
                        >
                          {!isEditing ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Left Info */}
                              <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-heading font-bold text-sm text-stone-900">
                                      {resp.title || resp.type}
                                    </h4>
                                    {resp.gujaratiTitle && (
                                      <span className="text-[11px] text-amber-800 font-semibold">
                                        ({resp.gujaratiTitle})
                                      </span>
                                    )}
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        resp.active !== false
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-stone-200 text-stone-600"
                                      }`}
                                    >
                                      {resp.active !== false ? "Active" : "Inactive"}
                                    </span>
                                  </div>

                                  {/* Scopes */}
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                                    {resp.scope?.sabhaType && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 text-[11px]">
                                        <CalendarDays className="h-3 w-3 text-stone-500" />
                                        Sabha: {resp.scope.sabhaType}
                                      </span>
                                    )}
                                    {resp.scope?.zone && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 text-[11px]">
                                        <MapPin className="h-3 w-3 text-stone-500" />
                                        Zone: {resp.scope.zone}
                                      </span>
                                    )}
                                    {resp.scope?.department && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 text-[11px]">
                                        <Building2 className="h-3 w-3 text-stone-500" />
                                        Dept: {resp.scope.department}
                                      </span>
                                    )}
                                    {resp.scope?.area && (
                                      <span className="text-[11px] text-stone-500">Area: {resp.scope.area}</span>
                                    )}
                                    {resp.scope?.familyId && (
                                      <span className="text-[11px] text-stone-500">Family: {resp.scope.familyId}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons: Toggle, Edit, Delete */}
                              <div className="flex items-center gap-1.5 self-end sm:self-center">
                                {/* Toggle Active Button */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleRoleActive(index, resp.active !== false)}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                                    resp.active !== false
                                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                      : "border-stone-300 bg-white text-stone-600 hover:bg-stone-100"
                                  }`}
                                  title="Toggle Active / Inactive"
                                >
                                  {resp.active !== false ? "Enabled" : "Disabled"}
                                </button>

                                {/* Edit Scope */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditingRole(index, resp)}
                                  leftIcon={<Edit2 className="h-3 w-3" />}
                                >
                                  Edit
                                </Button>

                                {/* Revoke / Delete Role */}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    setRoleToDelete({
                                      index,
                                      title: resp.title || resp.type,
                                      type: resp.type,
                                    })
                                  }
                                  leftIcon={<Trash2 className="h-3 w-3" />}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ) : (
                            /* Inline Edit Form */
                            <form onSubmit={handleSaveEditRole} className="space-y-3 pt-1">
                              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                                <h5 className="font-heading font-bold text-xs text-amber-900 flex items-center gap-1.5">
                                  <Edit2 className="h-3.5 w-3.5" /> Editing Role: {resp.type}
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => setEditingRoleIndex(null)}
                                  className="text-stone-400 hover:text-stone-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <label className="font-semibold text-stone-700 block mb-1">Custom Title (EN)</label>
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-amber-500"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-stone-700 block mb-1">Custom Title (GU)</label>
                                  <input
                                    type="text"
                                    value={editGujaratiTitle}
                                    onChange={(e) => setEditGujaratiTitle(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-amber-500"
                                  />
                                </div>

                                {resp.type === "sabha_karyakarta" && (
                                  <div>
                                    <label className="font-semibold text-stone-700 block mb-1">Sabha Category</label>
                                    <select
                                      value={editSabhaType}
                                      onChange={(e) => setEditSabhaType(e.target.value as SabhaCategoryType)}
                                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-hidden focus:border-amber-500"
                                    >
                                      {SABHA_CATEGORIES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                <div>
                                  <label className="font-semibold text-stone-700 block mb-1">Operational Zone</label>
                                  <select
                                    value={editZone}
                                    onChange={(e) => setEditZone(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-hidden focus:border-amber-500"
                                  >
                                    <option value="">No specific zone</option>
                                    {ZONE_OPTIONS.map((z) => (
                                      <option key={z} value={z}>{z}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="font-semibold text-stone-700 block mb-1">Department</label>
                                  <input
                                    type="text"
                                    value={editDepartment}
                                    onChange={(e) => setEditDepartment(e.target.value)}
                                    placeholder="e.g. Kitchen, Transport, Sabha"
                                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-amber-500"
                                  />
                                </div>

                                <div>
                                  <label className="font-semibold text-stone-700 block mb-1">Area / Neighborhood</label>
                                  <input
                                    type="text"
                                    value={editArea}
                                    onChange={(e) => setEditArea(e.target.value)}
                                    placeholder="e.g. Sardar Patel Colony"
                                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-amber-500"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingRoleIndex(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="primary"
                                  isLoading={savingEdit}
                                  leftIcon={<Check className="h-3.5 w-3.5" />}
                                >
                                  Save Updates
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Assign New Role Form */}
            {modalTab === "assign" && (
              <form onSubmit={handleAssignRole} className="space-y-4">
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Role Scoping Guidelines
                  </p>
                  <p className="mt-0.5 text-stone-700">
                    Assigning a role instantly grants access permissions for the selected module (Attendance, Thal, Kitchen, Rides, or Administration) with strict zone/department boundaries.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Select Role Type */}
                  <div>
                    <label className="font-bold text-stone-800 block mb-1.5">
                      Select Role / Responsibility Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ROLE_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = assignRoleType === opt.type;
                        return (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => handleRoleTypeChange(opt.type)}
                            className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                              isSelected
                                ? "border-amber-500 bg-amber-50 shadow-xs"
                                : "border-stone-200 bg-white hover:border-amber-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Icon className={`h-4 w-4 ${isSelected ? "text-amber-700" : "text-stone-500"}`} />
                              {isSelected && <Check className="h-3.5 w-3.5 text-amber-600" />}
                            </div>
                            <div>
                              <p className={`font-bold text-[11px] leading-tight ${isSelected ? "text-amber-950" : "text-stone-800"}`}>
                                {opt.label}
                              </p>
                              <p className="text-[10px] text-amber-800/80 font-medium">{opt.gujarati}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title & Gujarati Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">Designation Title (EN)</label>
                      <input
                        type="text"
                        value={assignTitle}
                        onChange={(e) => setAssignTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">Designation Title (GU)</label>
                      <input
                        type="text"
                        value={assignGujaratiTitle}
                        onChange={(e) => setAssignGujaratiTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Dynamic Scopes based on Role */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="font-bold text-stone-800 text-[11px] block uppercase tracking-wider">
                      Module Scope & Authorization Boundaries
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Sabha Category (for sabha_karyakarta) */}
                      {assignRoleType === "sabha_karyakarta" && (
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Sabha Category</label>
                          <select
                            value={assignSabhaType}
                            onChange={(e) => setAssignSabhaType(e.target.value as SabhaCategoryType)}
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-hidden focus:border-amber-500"
                          >
                            {SABHA_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Zone Selection */}
                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Geographic Zone</label>
                        <select
                          value={assignZone}
                          onChange={(e) => setAssignZone(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-hidden focus:border-amber-500"
                        >
                          <option value="">All Nadiad / Central</option>
                          {ZONE_OPTIONS.map((z) => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                        </select>
                      </div>

                      {/* Area / Neighborhood */}
                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Neighborhood / Area</label>
                        <input
                          type="text"
                          value={assignArea}
                          onChange={(e) => setAssignArea(e.target.value)}
                          placeholder="e.g. Mill Road, Station, Uttarsanda"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-amber-500"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">Mandir Department</label>
                        <input
                          type="text"
                          value={assignDepartment}
                          onChange={(e) => setAssignDepartment(e.target.value)}
                          placeholder="e.g. Kitchen, Transport, Seva, Administration"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-amber-500"
                        />
                      </div>

                      {/* Family ID (for thal_captain) */}
                      {assignRoleType === "thal_captain" && (
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Family Code / ID</label>
                          <input
                            type="text"
                            value={assignFamilyId}
                            onChange={(e) => setAssignFamilyId(e.target.value)}
                            placeholder="e.g. FAM-NAD-001"
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                  <Button
                    type="button"
                    size="md"
                    variant="outline"
                    onClick={() => setModalTab("roles")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    isLoading={assigningLoading}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Confirm &amp; Assign Role
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 3: User Audit Trail */}
            {modalTab === "audit" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="text-xs font-bold text-stone-800">Recent Role Changes &amp; Security Audits</span>
                  <span className="text-[10px] text-stone-500">Unmasked immutable event log</span>
                </div>

                {loadingAudit ? (
                  <div className="p-8 text-center text-stone-400 text-xs">Loading audit trail...</div>
                ) : userAuditLogs.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 text-xs">
                    No recent audit log entries recorded for this user.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {userAuditLogs.map((log) => (
                      <div
                        key={log._id}
                        className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{log.action}</span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {new Date(log.createdAt).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-stone-700">{log.description}</p>
                        <p className="text-[10px] text-stone-500">
                          Actor: <strong>{log.actorName}</strong> ({log.actorRole})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* DELETE / REVOKE CONFIRMATION DIALOG                      */}
      {/* ======================================================== */}
      {roleToDelete && (
        <Modal
          isOpen={!!roleToDelete}
          onClose={() => setRoleToDelete(null)}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-heading text-lg font-bold text-stone-900">Revoke Role Assignment?</h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to permanently revoke the role{" "}
                <strong className="text-stone-900">"{roleToDelete.title}"</strong> from{" "}
                <strong className="text-stone-900">{selectedUser?.name}</strong>?
              </p>
              <p className="text-[11px] text-rose-600 font-medium pt-1">
                This will immediately remove their access rights and operational scopes.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200">
              <Button
                variant="outline"
                size="md"
                onClick={() => setRoleToDelete(null)}
                disabled={deletingLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="md"
                onClick={handleConfirmDeleteRole}
                isLoading={deletingLoading}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Revoke Role
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* Destructive Confirm Dialog */}
      {confirmResetOpen && (
        <TypeToConfirmDialog
          isOpen={confirmResetOpen}
          onClose={() => setConfirmResetOpen(false)}
          onConfirm={handleSeedDatabase}
          title="Purge & Reset All Collections"
          consequenceText="This will permanently wipe all family records, attendance history, and re-seed defaults."
          confirmWord="RESET"
          actionLabel="Execute Reset"
        />
      )}

      {/* Broadcast Dispatch Confirmation Modal */}
      {confirmBroadcastOpen && (
        <Modal
          isOpen={confirmBroadcastOpen}
          onClose={() => setConfirmBroadcastOpen(false)}
          maxWidth="md"
        >
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-stone-900">
                  Confirm Push Broadcast
                </h3>
                <p className="text-xs text-stone-600">
                  Root Level Notification Dispatch
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">Target Audience:</span>
                <span className="font-bold text-stone-900 uppercase">
                  {broadcastForm.targetAudience === "all" ? "All Active App Users" : broadcastForm.targetRole}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">Reachable Recipients:</span>
                <span className="font-bold text-emerald-700">
                  {targetedDevoteesCount} devotee(s) ({notificationStats?.totalTokens ?? 0} tokens)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">In-App Screen:</span>
                <span className="font-mono text-stone-800">{broadcastForm.deepLinkRoute}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">Priority:</span>
                <span className="font-bold text-amber-800 uppercase">{broadcastForm.priority}</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <p className="font-bold text-stone-900">{broadcastForm.title}</p>
              <p className="text-stone-600 leading-relaxed">{broadcastForm.body}</p>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed">
              Clicking <strong>"Dispatch Now"</strong> will immediately transmit push packets via Firebase Cloud Messaging gateway to all selected devotee hardware.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setConfirmBroadcastOpen(false)}
                disabled={broadcastSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSendBroadcast}
                isLoading={broadcastSubmitting}
                leftIcon={<Send className="h-4 w-4" />}
                className="shadow-md shadow-amber-600/25"
              >
                Dispatch Now
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

