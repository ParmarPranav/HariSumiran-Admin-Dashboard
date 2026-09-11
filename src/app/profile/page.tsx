"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  User,
  Users,
  ShieldCheck,
  Crown,
  Plus,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Calendar,
  UtensilsCrossed,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, role, setUser } = useApp();

  const [family, setFamily] = useState<any>({
    familyCode: "FAM-101",
    name: "Patel Household (Rameshbhai)",
    gujaratiName: "પટેલ પરિવાર (રમેશભાઈ)",
    captainName: "Rameshbhai Patel",
    phone: "9825056789",
    address: "12, Pramukh Heights, Santram Road",
    area: "Santram Road",
    zone: "Central",
    memberCount: 4,
    status: "Active",
  });

  const [members, setMembers] = useState<any[]>([
    { id: "m1", name: "Rameshbhai Patel", relationship: "Head / Father", phone: "9825056789", isCaptain: true },
    { id: "m2", name: "Sunitaben Patel", relationship: "Spouse", phone: "9825056790", isCaptain: false },
    { id: "m3", name: "Devansh Patel", relationship: "Son", phone: "9825067890", isCaptain: false },
    { id: "m4", name: "Ananya Patel", relationship: "Daughter", phone: "9825067891", isCaptain: false },
  ]);

  const [createFamilyModalOpen, setCreateFamilyModalOpen] = useState(false);
  const [captainModalOpen, setCaptainModalOpen] = useState(false);

  // New Family Form state
  const [familyName, setFamilyName] = useState("");
  const [gujaratiName, setGujaratiName] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("Santram Road");
  const [selectedCaptain, setSelectedCaptain] = useState("Rameshbhai Patel");

  const handleCreateFamily = () => {
    if (!familyName || !address) {
      toast.error("Please fill in Family Name and Address");
      return;
    }
    const newFam = {
      familyCode: `FAM-${Math.floor(100 + Math.random() * 900)}`,
      name: familyName,
      gujaratiName: gujaratiName || familyName,
      captainName: user.name,
      phone: user.phone || "9825099999",
      address,
      area,
      zone: "Central",
      memberCount: 1,
      status: "Active",
    };
    setFamily(newFam);
    setUser({ ...user, familyId: newFam.familyCode, familyName: newFam.name, isCaptain: true });
    setCreateFamilyModalOpen(false);
    toast.success("Family Created Successfully!", {
      description: `${familyName} registered with code ${newFam.familyCode}`,
    });
  };

  const handleSelectCaptain = (captainName: string) => {
    setSelectedCaptain(captainName);
    setFamily((prev: any) => ({ ...prev, captainName }));
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        isCaptain: m.name === captainName,
      }))
    );
    setCaptainModalOpen(false);
    toast.success("Family Captain Updated!", {
      description: `${captainName} is now set as Captain for ${family.name}.`,
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-amber-400" />
            <h1 className="font-display text-2xl font-bold text-white">Devotee Profile &amp; Household</h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            Manage your authenticated profile, family registration, and family captain designation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            <span className="inline-flex items-center gap-1.5">
              {user.biometricEnabled ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>PIN + Biometric Protected</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>App PIN Protected</span>
                </>
              )}
            </span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.12)"
          className="p-6 space-y-4 md:col-span-1 flex flex-col justify-between bg-[#121624]/90 border-white/10"
        >
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={user.name}
                className="h-20 w-20 rounded-full border-2 border-amber-400/50 mx-auto object-cover shadow-soft"
              />
              <div>
                <h3 className="font-display text-lg font-bold text-white">{user.name}</h3>
                <p className="text-xs text-amber-300 font-semibold uppercase tracking-wide">
                  {role.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-hairline pt-4">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-subtle flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email:
                </span>
                <span className="font-semibold text-white text-[11px] truncate max-w-[150px]">
                  {user.email || "devotee@apple.com"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-subtle flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone:
                </span>
                <span className="font-semibold text-white font-mono">+91 {user.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-subtle flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Mandir:
                </span>
                <span className="font-semibold text-white">{user.mandir}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-hairline">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-amber-400" /> Authenticated Status
              </p>
              <p className="text-[11px] text-zinc-300">
                Active member registered for Thal Breakfast &amp; Dinner turns.
              </p>
            </div>
          </div>
        </SpotlightCard>

        {/* Household & Captain Details */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.12)"
          className="p-6 space-y-6 md:col-span-2 bg-[#121624]/90 border-white/10"
        >
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-lg font-bold text-white">Household Family Profile</h2>
            </div>
            {!family ? (
              <Button size="sm" onClick={() => setCreateFamilyModalOpen(true)}>
                Register Family
              </Button>
            ) : (
              <Badge variant="primary">Family Code: {family.familyCode}</Badge>
            )}
          </div>

          {family ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#141824] border border-white/10 shadow-sm">
                <div>
                  <h3 className="font-display text-xl font-bold text-white">{family.name}</h3>
                  {family.gujaratiName && (
                    <p className="text-sm font-gujarati text-amber-300 font-medium">
                      {family.gujaratiName}
                    </p>
                  )}
                  <p className="text-xs text-charcoal-subtle flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" /> {family.address}, {family.area}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="success" size="sm">
                    {family.status}
                  </Badge>
                  <p className="text-xs font-semibold text-charcoal">{family.memberCount} Registered Members</p>
                </div>
              </div>

              {/* Family Captain Section */}
              <div className="p-4 rounded-2xl border border-white/10 bg-[#161B28]/80 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-400" />
                    <div>
                      <h4 className="font-display text-sm font-bold text-white">Designated Family Captain</h4>
                      <p className="text-[11px] text-slate-400">Responsible for Thal rotation RSVPs &amp; swap requests</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setCaptainModalOpen(true)}>
                    Change Captain
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FCE082] via-[#E8B038] to-[#C98B1C] text-stone-950 flex items-center justify-center font-bold text-sm shadow-md">
                    <Crown className="h-5 w-5 text-stone-950" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{family.captainName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Contact: +91 {family.phone}</p>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="font-display text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Family Members ({members.length})
                </h4>
                <div className="divide-y divide-white/10 rounded-2xl border border-white/10 overflow-hidden">
                  {members.map((m) => (
                    <div key={m.id} className="p-3.5 flex items-center justify-between bg-[#161B28]/60 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-slate-300">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {m.name}
                            {m.isCaptain && (
                              <Crown className="h-3.5 w-3.5 text-amber-400 inline" />
                            )}
                          </p>
                          <p className="text-slate-400 font-mono">{m.relationship} &bull; +91 {m.phone}</p>
                        </div>
                      </div>

                      {!m.isCaptain && (
                        <button
                          onClick={() => handleSelectCaptain(m.name)}
                          className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          Make Captain
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <Users className="h-12 w-12 text-charcoal-subtle mx-auto opacity-50" />
              <p className="text-xs text-charcoal-subtle">You have not registered a household family yet.</p>
              <Button size="md" onClick={() => setCreateFamilyModalOpen(true)}>
                Register Family Profile Now
              </Button>
            </div>
          )}
        </SpotlightCard>
      </div>

      {/* Create Family Modal */}
      <Modal
        isOpen={createFamilyModalOpen}
        onClose={() => setCreateFamilyModalOpen(false)}
        title="Create & Register Household Family"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-200">Family Name (English) *</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. Shah Household (Dipakbhai)"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#161B28] px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-200">Gujarati Name</label>
            <input
              type="text"
              value={gujaratiName}
              onChange={(e) => setGujaratiName(e.target.value)}
              placeholder="e.g. શાહ પરિવાર"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#161B28] px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-200">Address *</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full residence address in Nadiad..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#161B28] p-3 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-200">Area / Locality</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#161B28] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="Santram Road">Santram Road</option>
                <option value="Station Road">Station Road</option>
                <option value="College Road">College Road</option>
                <option value="Vaniavad">Vaniavad</option>
                <option value="Pij Road">Pij Road</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-200">Initial Captain</label>
              <input
                type="text"
                disabled
                value={user.name}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#121622] px-3 py-2 text-xs text-zinc-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setCreateFamilyModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleCreateFamily}>
              Register Household
            </Button>
          </div>
        </div>
      </Modal>

      {/* Select Captain Modal */}
      <Modal
        isOpen={captainModalOpen}
        onClose={() => setCaptainModalOpen(false)}
        title="Select Family Captain"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">
            Select one family member to serve as the Family Captain for Thal rotation reminders &amp; approvals:
          </p>

          <div className="space-y-2">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectCaptain(m.name)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                  m.name === family?.captainName
                    ? "border-amber-400/50 bg-amber-500/15 font-bold text-amber-300 shadow-sm"
                    : "border-white/10 hover:bg-[#1A2030] text-zinc-300"
                }`}
              >
                <div>
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="text-[10px] text-zinc-400">{m.relationship}</p>
                </div>
                {m.name === family?.captainName && <Crown className="h-4 w-4 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
