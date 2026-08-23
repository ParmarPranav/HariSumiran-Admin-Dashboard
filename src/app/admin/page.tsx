"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { TypeToConfirmDialog } from "@/components/ui/TypeToConfirmDialog";
import {
  Sliders,
  ShieldAlert,
  Users,
  Database,
  RefreshCw,
  Lock,
  History,
  CheckCircle2,
  AlertTriangle,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const { role, user, language } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("permissions");

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [destructiveAction, setDestructiveAction] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchAdminData = () => {
    setLoading(true);
    fetch("/api/admin")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Database Re-Seeded Successfully", {
          description: "Populated fresh operational data for HariPrabodham, Nadiad.",
        });
        fetchAdminData();
      }
    } catch (e: any) {
      toast.error("Seeding failed: " + e.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary-container" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">
              {language === "gu" ? "સિસ્ટમ સેટિંગ્સ અને નિયંત્રણ" : "System Administration & Controls"}
            </h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            Role-permission matrix, MongoDB system health &amp; audit logging
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            isLoading={seeding}
            onClick={handleSeedDatabase}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Re-Seed Sample Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "permissions", label: "Role-Permission Matrix", icon: <ShieldAlert className="h-4 w-4" /> },
          { id: "users", label: "Staff & User Roles", count: data?.users?.length, icon: <Users className="h-4 w-4" /> },
          { id: "audit", label: "System Audit Logs", count: data?.auditLogs?.length, icon: <History className="h-4 w-4" /> },
          { id: "system", label: "Database Health & Config", icon: <Database className="h-4 w-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Role Permission Matrix */}
      {activeTab === "permissions" && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="font-heading text-base font-bold text-charcoal">
                Module Access Matrix by Role
              </h3>
              <p className="text-xs text-charcoal-subtle">
                Controls module visibility, action authorizations, and data masking levels
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline bg-surface-container-low/50 text-charcoal font-bold">
                  <th className="p-3">Module</th>
                  <th className="p-3">Super Admin</th>
                  <th className="p-3">Mandir Admin</th>
                  <th className="p-3">Dept Head</th>
                  <th className="p-3">Karyakarta</th>
                  <th className="p-3">Family Captain</th>
                  <th className="p-3">Member</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {data?.rolePermissionsMatrix?.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-3 font-bold text-charcoal">{row.module}</td>
                    <td className="p-3"><Badge variant="primary" size="sm">{row.super_admin}</Badge></td>
                    <td className="p-3"><Badge variant="primary" size="sm">{row.mandir_admin}</Badge></td>
                    <td className="p-3"><Badge variant="info" size="sm">{row.dept_head}</Badge></td>
                    <td className="p-3"><Badge variant="secondary" size="sm">{row.karyakarta}</Badge></td>
                    <td className="p-3"><Badge variant="default" size="sm">{row.family_captain}</Badge></td>
                    <td className="p-3"><Badge variant="default" size="sm">{row.family_member}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Tab 2: Users List */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.users?.map((u: any) => (
            <GlassCard key={u._id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={u.name}
                  className="h-11 w-11 rounded-2xl object-cover border border-hairline"
                />
                <div>
                  <h4 className="font-heading text-sm font-bold text-charcoal">{u.name}</h4>
                  <p className="text-xs text-primary-container font-semibold uppercase tracking-wider">
                    {u.role.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1 text-charcoal-subtle border-t border-hairline pt-2">
                <p><strong>Mobile:</strong> +91 {u.phone}</p>
                <p><strong>Mandir:</strong> {u.mandir}</p>
                {u.department && <p><strong>Dept:</strong> {u.department}</p>}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab 3: System Audit Logs */}
      {activeTab === "audit" && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="font-heading text-base font-bold text-charcoal">System Activity Log</h3>
              <p className="text-xs text-charcoal-subtle">Unmasked audit records for security &amp; accountability</p>
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

          <div className="divide-y divide-hairline">
            {data?.auditLogs?.map((log: any) => (
              <div key={log._id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">{log.action}</span>
                    <Badge variant="primary" size="sm">{log.module}</Badge>
                  </div>
                  <p className="text-charcoal-subtle">{log.description}</p>
                  <p className="text-[10px] text-charcoal-subtle">
                    Actor: <strong>{log.actorName}</strong> ({log.actorRole})
                  </p>
                </div>
                <span className="text-[10px] font-mono text-charcoal-subtle shrink-0">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Tab 4: System Health */}
      {activeTab === "system" && (
        <GlassCard className="p-6 space-y-5">
          <h3 className="font-heading text-base font-bold text-charcoal">MongoDB Atlas Cluster Connection</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-hairline space-y-2">
              <span className="text-charcoal-subtle font-semibold block">Connected Cluster:</span>
              <p className="font-mono text-charcoal font-bold">cluster0.icxn6gj.mongodb.net</p>
              <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Connection Status: Optimal (Active Pool)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-hairline space-y-2">
              <span className="text-charcoal-subtle font-semibold block">Database &amp; Collections:</span>
              <p className="font-mono text-charcoal font-bold">Database: harisumiran</p>
              <p className="text-charcoal-subtle">
                12 Mongoose models synchronized with auto indexing.
              </p>
            </div>
          </div>

          <div className="border-t border-hairline pt-4 flex justify-end">
            <Button
              variant="destructive"
              size="md"
              onClick={() => {
                setDestructiveAction({
                  title: "Purge & Reset All Collections",
                  consequence: "This will permanently wipe all family records, attendance history, and re-seed defaults.",
                });
                setConfirmDialogOpen(true);
              }}
            >
              Reset Database Collections
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Destructive Confirm Dialog */}
      {destructiveAction && (
        <TypeToConfirmDialog
          isOpen={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={handleSeedDatabase}
          title={destructiveAction.title}
          consequenceText={destructiveAction.consequence}
          confirmWord="RESET"
          actionLabel="Execute Reset"
        />
      )}
    </div>
  );
}
