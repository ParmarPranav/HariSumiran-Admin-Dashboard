"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
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
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <MandalaBackground />

      {/* Page Title */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-amber-600" />
            <h1 className="font-heading text-2xl font-bold text-stone-900">Devotee Profile &amp; Household</h1>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Manage your authenticated profile, family registration, and family captain designation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            <span className="inline-flex items-center gap-1.5 font-bold">
              {user.biometricEnabled ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>PIN + Biometric Protected</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>App PIN Protected</span>
                </>
              )}
            </span>
          </Badge>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.12)"
          className="p-6 space-y-4 md:col-span-1 flex flex-col justify-between bg-white border-stone-200/90 shadow-sm"
        >
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={user.name}
                className="h-20 w-20 rounded-full border-2 border-amber-400 mx-auto object-cover shadow-sm"
              />
              <div>
                <h3 className="font-heading text-lg font-bold text-stone-900">{user.name}</h3>
                <p className="text-xs text-amber-700 font-bold uppercase tracking-wide">
                  {role.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5 text-stone-400" /> Email:
                </span>
                <span className="font-bold text-stone-900 text-[11px] truncate max-w-[150px]">
                  {user.email || "devotee@apple.com"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                  <Phone className="h-3.5 w-3.5 text-stone-400" /> Phone:
                </span>
                <span className="font-bold text-stone-900 font-mono">+91 {user.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" /> Mandir:
                </span>
                <span className="font-bold text-stone-900">{user.mandir}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <p className="font-bold text-amber-900 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-amber-600" /> Authenticated Status
              </p>
              <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
                Active member registered for Thal Breakfast &amp; Dinner turns.
              </p>
            </div>
          </div>
        </SpotlightCard>

        {/* Household & Captain Details */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.12)"
          className="p-6 space-y-6 md:col-span-2 bg-white border-stone-200/90 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              <h2 className="font-heading text-lg font-bold text-stone-900">Household Family Profile</h2>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 shadow-xs">
                <div>
                  <h3 className="font-heading text-xl font-bold text-stone-900">{family.name}</h3>
                  {family.gujaratiName && (
                    <p className="text-sm font-gujarati text-amber-800 font-semibold">
                      {family.gujaratiName}
                    </p>
                  )}
                  <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-600" /> {family.address}, {family.area}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="success" size="sm">
                    {family.status}
                  </Badge>
                  <p className="text-xs font-bold text-stone-700">{family.memberCount} Registered Members</p>
                </div>
              </div>

              {/* Family Captain Section */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-600" />
                    <div>
                      <h4 className="font-heading text-sm font-bold text-stone-900">Designated Family Captain</h4>
                      <p className="text-[11px] text-stone-600">Responsible for Thal rotation RSVPs &amp; swap requests</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setCaptainModalOpen(true)}>
                    Change Captain
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-amber-200 shadow-xs">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#EA580C] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">{family.captainName}</p>
                    <p className="text-[11px] text-stone-600 font-mono">Contact: +91 {family.phone}</p>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="font-heading text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Family Members ({members.length})
                </h4>
                <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 overflow-hidden bg-white">
                  {members.map((m) => (
                    <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold border border-amber-200">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 flex items-center gap-1.5">
                            {m.name}
                            {m.isCaptain && (
                              <Crown className="h-3.5 w-3.5 text-amber-600 inline" />
                            )}
                          </p>
                          <p className="text-stone-500 font-mono">{m.relationship} &bull; +91 {m.phone}</p>
                        </div>
                      </div>

                      {!m.isCaptain && (
                        <button
                          onClick={() => handleSelectCaptain(m.name)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors"
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
              <Users className="h-12 w-12 text-stone-400 mx-auto opacity-50" />
              <p className="text-xs text-stone-600">You have not registered a household family yet.</p>
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
            <label className="text-xs font-semibold text-stone-700">Family Name (English) *</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. Shah Household (Dipakbhai)"
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700">Gujarati Name</label>
            <input
              type="text"
              value={gujaratiName}
              onChange={(e) => setGujaratiName(e.target.value)}
              placeholder="e.g. શાહ પરિવાર"
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs font-gujarati"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700">Address *</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full residence address in Nadiad..."
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700">Area / Locality</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              >
                <option value="Santram Road" className="bg-white text-stone-900">Santram Road</option>
                <option value="Station Road" className="bg-white text-stone-900">Station Road</option>
                <option value="College Road" className="bg-white text-stone-900">College Road</option>
                <option value="Vaniavad" className="bg-white text-stone-900">Vaniavad</option>
                <option value="Pij Road" className="bg-white text-stone-900">Pij Road</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700">Initial Captain</label>
              <input
                type="text"
                disabled
                value={user.name}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-100 px-3 py-2 text-xs text-stone-600 font-medium"
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
          <p className="text-xs text-stone-600">
            Select one family member to serve as the Family Captain for Thal rotation reminders &amp; approvals:
          </p>

          <div className="space-y-2">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectCaptain(m.name)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition-all ${
                  m.name === family?.captainName
                    ? "border-amber-400 bg-amber-50 font-bold text-amber-900 shadow-xs"
                    : "border-stone-200 bg-white hover:bg-stone-50 text-stone-800"
                }`}
              >
                <div>
                  <p className="font-bold text-stone-900">{m.name}</p>
                  <p className="text-[10px] text-stone-500">{m.relationship}</p>
                </div>
                {m.name === family?.captainName && <Crown className="h-4 w-4 text-amber-600" />}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
