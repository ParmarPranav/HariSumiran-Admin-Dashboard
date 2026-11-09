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

  // Delete Confirmation State
  const [roleToDelete, setRoleToDelete] = useState<{ index: number; title: string; type: string } | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

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
  }, []);

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
            isLoading={loading || adminLoading}
            onClick={() => {
              fetchUsers();
              fetchAdminData();
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
          {/* KPI Stats Cards */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <GlassCard className="p-4 bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Total Users</span>
                <div className="h-7 w-7 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">{stats?.total ?? users.length}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{stats?.activeUsers ?? users.length} Active in Directory</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Super Admins</span>
                <div className="h-7 w-7 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-amber-800 tracking-tight">{stats?.superAdmins ?? 0}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-stone-500">
                <span>Root Level Oversight</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Mandir Admins</span>
                <div className="h-7 w-7 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">{stats?.mandirAdmins ?? 0}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-stone-500">
                <span>Operations &amp; Seva</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Sabha Karyakarta</span>
                <div className="h-7 w-7 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  <CalendarDays className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">{stats?.karyakartas ?? 0}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-stone-500">
                <span>Attendance &amp; Follow-up</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-white/95 border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Thal Captains</span>
                <div className="h-7 w-7 rounded-xl bg-orange-500/10 text-orange-700 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">{stats?.thalCaptains ?? 0}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-stone-500">
                <span>Family Rotation Leads</span>
              </div>
            </GlassCard>
          </div>

          {/* Directory Search & Filter Controls */}
          <GlassCard className="relative z-10 p-4 space-y-3 bg-white/95 border-stone-200/90 shadow-2xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by user name, phone, email, or member ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 rounded-2xl border border-stone-200 bg-stone-50/70 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Count Notice */}
              <div className="text-xs text-stone-500 self-center">
                Showing <strong className="text-stone-800 font-bold">{filteredUsers.length}</strong> of {users.length} accounts
              </div>
            </div>

            {/* Filter Pills with Real Counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95 ${
                      isSelected
                        ? "bg-amber-600 text-white font-bold shadow-xs"
                        : "bg-stone-100/90 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
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
                    <th className="p-3.5 pl-5">User Profile</th>
                    <th className="p-3.5">Primary Role</th>
                    <th className="p-3.5">Assigned Responsibilities</th>
                    <th className="p-3.5">Scope &amp; Mandir</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-500">
                        <Users className="h-8 w-8 mx-auto text-stone-300 mb-2" />
                        <p className="font-medium">No users found matching your search or filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const activeRoles = (u.responsibilities || []).filter((r) => r.active !== false);
                      const inactiveRoles = (u.responsibilities || []).filter((r) => r.active === false);
                      const isSuper = u.role === "super_admin" || u.responsibilities?.some((r) => r.type === "super_admin");

                      return (
                        <tr
                          key={u._id}
                          onClick={() => openUserModal(u)}
                          className="hover:bg-amber-50/40 cursor-pointer transition-colors group"
                        >
                          {/* User Info */}
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                                  alt={u.name}
                                  className={`h-10 w-10 rounded-2xl object-cover border-2 border-white shadow-2xs transition-all ${
                                    isSuper ? "ring-2 ring-amber-400 ring-offset-1" : "ring-1 ring-stone-200"
                                  }`}
                                />
                                {isSuper && (
                                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-2xs">
                                    <ShieldCheck className="h-2.5 w-2.5" />
                                  </span>
                                )}
                              </div>
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
                          <td className="p-3.5">
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
                          <td className="p-3.5">
                            <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                              {activeRoles.length === 0 ? (
                                <span className="text-stone-400 italic text-[11px]">No specific roles assigned</span>
                              ) : (
                                activeRoles.map((r, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-[11px] font-medium shadow-2xs"
                                  >
                                    {r.type === "super_admin" && <ShieldCheck className="h-3 w-3 text-amber-600" />}
                                    {r.type === "mandir_admin" && <Building2 className="h-3 w-3 text-amber-600" />}
                                    {r.type === "sabha_karyakarta" && <CalendarDays className="h-3 w-3 text-amber-600" />}
                                    {r.type === "thal_captain" && <UtensilsCrossed className="h-3 w-3 text-amber-600" />}
                                    {(r.type === "main_cook" || r.type === "sub_cook") && <ChefHat className="h-3 w-3 text-amber-600" />}
                                    {r.type === "car_owner" && <Car className="h-3 w-3 text-amber-600" />}
                                    <span>{r.title || r.type}</span>
                                    {r.gujaratiTitle && (
                                      <span className="text-[10px] text-amber-800/80 font-normal">
                                        ({r.gujaratiTitle})
                                      </span>
                                    )}
                                  </span>
                                ))
                              )}
                              {inactiveRoles.length > 0 && (
                                <span className="text-[10px] text-stone-400 font-medium px-1.5 py-0.5 rounded-md bg-stone-100">
                                  +{inactiveRoles.length} inactive
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Scope & Mandir */}
                          <td className="p-3.5 text-stone-600 font-medium">
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
                          <td className="p-3.5 text-center">
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
                          <td className="p-3.5 pr-5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openUserModal(u);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-amber-600 hover:text-white hover:border-amber-600 text-stone-700 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95"
                            >
                              <UserCog className="h-3.5 w-3.5" />
                              <span>Manage Roles</span>
                            </button>
                          </td>
                        </tr>
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
      {/* TAB 2: ROLE-PERMISSION MATRIX                            */}
      {/* ======================================================== */}
      {currentTab === "permissions" && (
        <GlassCard className="relative z-10 p-6 space-y-4 bg-white border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-heading text-base font-bold text-stone-900">
                Institutional Module Access Matrix by Role
              </h3>
              <p className="text-xs text-stone-500">
                Controls module visibility, action authorizations, and data masking levels across all roles
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-900 font-bold">
                  <th className="p-3">Module</th>
                  <th className="p-3">Super Admin</th>
                  <th className="p-3">Mandir Admin</th>
                  <th className="p-3">Dept Head</th>
                  <th className="p-3">Karyakarta</th>
                  <th className="p-3">Family Captain</th>
                  <th className="p-3">Member</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {adminData?.rolePermissionsMatrix?.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-3 font-bold text-stone-900">{row.module}</td>
                    <td className="p-3"><Badge variant="primary" size="sm">{row.super_admin}</Badge></td>
                    <td className="p-3"><Badge variant="primary" size="sm">{row.mandir_admin}</Badge></td>
                    <td className="p-3"><Badge variant="info" size="sm">{row.dept_head}</Badge></td>
                    <td className="p-3"><Badge variant="secondary" size="sm">{row.karyakarta}</Badge></td>
                    <td className="p-3"><Badge variant="neutral" size="sm">{row.family_captain}</Badge></td>
                    <td className="p-3"><Badge variant="neutral" size="sm">{row.family_member}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SYSTEM AUDIT LOGS                                 */}
      {/* ======================================================== */}
      {currentTab === "audit" && (
        <GlassCard className="relative z-10 p-6 space-y-4 bg-white border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-heading text-base font-bold text-stone-900">Institutional Activity Audit Log</h3>
              <p className="text-xs text-stone-500">Unmasked audit records for security &amp; institutional accountability</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FileDown className="h-3.5 w-3.5" />}
              onClick={() => toast.success("Audit Log Exported to CSV")}
            >
              Export Log
            </Button>
          </div>

          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
            {adminData?.auditLogs?.map((log: any) => (
              <div key={log._id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{log.action}</span>
                    <Badge variant="primary" size="sm">{log.module}</Badge>
                  </div>
                  <p className="text-stone-600">{log.description}</p>
                  <p className="text-[10px] text-stone-500">
                    Actor: <strong className="text-stone-800">{log.actorName}</strong> ({log.actorRole})
                  </p>
                </div>
                <span className="text-[10px] font-mono text-stone-500 shrink-0 font-medium">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DATABASE HEALTH & SYSTEM CONTROL                  */}
      {/* ======================================================== */}
      {currentTab === "system" && (
        <GlassCard className="relative z-10 p-6 space-y-5 bg-white border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-heading text-base font-bold text-stone-900">MongoDB Atlas Cluster Connection</h3>
              <p className="text-xs text-stone-500">Active pool connections, replica set status, and disaster recovery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-stone-500 font-semibold block">Connected Cluster:</span>
              <p className="font-mono text-stone-900 font-bold">cluster0.icxn6gj.mongodb.net</p>
              <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                Connection Status: Optimal (Active Pool)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-stone-500 font-semibold block">Database &amp; Collections:</span>
              <p className="font-mono text-stone-900 font-bold">Database: harisumiran</p>
              <p className="text-stone-600">
                12 Mongoose models synchronized with auto indexing.
              </p>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-xs text-stone-500">
              Emergency recovery: resets collections to pristine sample data for HariPrabodham, Nadiad.
            </p>
            <Button
              variant="destructive"
              size="md"
              isLoading={resettingData}
              onClick={() => setConfirmResetOpen(true)}
            >
              Reset Database Collections
            </Button>
          </div>
        </GlassCard>
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
                <img
                  src={selectedUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={selectedUser.name}
                  className="h-12 w-12 rounded-2xl object-cover border border-amber-300 shadow-xs"
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

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <button
                onClick={() => setModalTab("roles")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  modalTab === "roles"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Assigned Roles ({selectedUser.responsibilities?.length || 0})
              </button>

              <button
                onClick={() => setModalTab("assign")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  modalTab === "assign"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Assign New Role
              </button>

              <button
                onClick={() => setModalTab("audit")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  modalTab === "audit"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                Audit Trail
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
    </div>
  );
}

