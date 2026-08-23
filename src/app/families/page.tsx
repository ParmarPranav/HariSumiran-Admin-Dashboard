"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Filter,
  MessageSquare,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function FamiliesPage() {
  const { role, language } = useApp();
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedEngagement, setSelectedEngagement] = useState("All");

  // Registration wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    gujaratiName: "",
    captainName: "",
    phone: "",
    address: "",
    area: "Station Road",
    zone: "North Nadiad",
    notes: "",
  });

  // Duplicate modal
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  // Interaction modal state
  const [interactionModalOpen, setInteractionModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [interactionType, setInteractionType] = useState("Home Visit");
  const [interactionNotes, setInteractionNotes] = useState("");
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);

  const fetchFamilies = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedArea !== "All") params.set("area", selectedArea);
    if (selectedEngagement !== "All") params.set("engagement", selectedEngagement);

    fetch(`/api/families?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFamilies(data.families);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFamilies();
  }, [search, selectedArea, selectedEngagement]);

  const handleRegisterFamily = async () => {
    if (!formData.name || !formData.captainName || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!data.success && data.duplicateDetected) {
        setDuplicateWarning(data.matchedFamily);
        return;
      }

      if (data.success) {
        toast.success("Family Registered Successfully", {
          description: `${formData.name} added to Nadiad directory.`,
        });
        setWizardOpen(false);
        setWizardStep(1);
        setFormData({
          name: "",
          gujaratiName: "",
          captainName: "",
          phone: "",
          address: "",
          area: "Station Road",
          zone: "North Nadiad",
          notes: "",
        });
        fetchFamilies();
      }
    } catch (e: any) {
      toast.error("Failed to register family: " + e.message);
    }
  };

  const handleLogInteraction = async () => {
    if (!selectedFamily) return;
    try {
      const res = await fetch(`/api/families/${selectedFamily._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interactionType,
          notes: interactionNotes,
          requiresFollowUp,
          urgency: "Due Today",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Interaction Logged", {
          description: requiresFollowUp
            ? "Logged note and opened follow-up case."
            : "Interaction logged successfully.",
        });
        setInteractionModalOpen(false);
        setInteractionNotes("");
        setRequiresFollowUp(false);
        fetchFamilies();
      }
    } catch (e: any) {
      toast.error("Error logging interaction: " + e.message);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-container" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">
              {language === "gu" ? "પરિવાર ડિરેક્ટરી" : "Family Directory"}
            </h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            360° Household Profiles, Field Touchpoints &amp; Thal Linkages
          </p>
        </div>

        <Button
          size="md"
          onClick={() => {
            setWizardStep(1);
            setWizardOpen(true);
          }}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          + Register Family
        </Button>
      </div>

      {/* Filters & Search Bar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-subtle" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by family name, captain, phone, address, or code..."
              className="h-10 w-full rounded-xl border border-hairline bg-white pl-10 pr-4 text-xs text-charcoal placeholder:text-charcoal-subtle focus:border-saffron-400 focus:outline-none"
            />
          </div>

          {/* Area Filter */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="h-10 rounded-xl border border-hairline bg-white px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
          >
            <option value="All">All Nadiad Areas</option>
            <option value="Station Road">Station Road</option>
            <option value="Vaniyavad">Vaniyavad</option>
            <option value="Santram Road">Santram Road</option>
            <option value="Dumral Bazar">Dumral Bazar</option>
            <option value="College Road">College Road</option>
            <option value="Petlad Road">Petlad Road</option>
          </select>

          {/* Engagement Filter */}
          <select
            value={selectedEngagement}
            onChange={(e) => setSelectedEngagement(e.target.value)}
            className="h-10 rounded-xl border border-hairline bg-white px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
          >
            <option value="All">All Engagement Levels</option>
            <option value="High">High Engagement</option>
            <option value="Medium">Medium Engagement</option>
            <option value="At-Risk">At-Risk / Inactive</option>
          </select>
        </div>
      </GlassCard>

      {/* Families Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-charcoal-subtle">
          Loading family profiles from MongoDB Atlas...
        </div>
      ) : families.length === 0 ? (
        <GlassCard className="py-12 text-center space-y-3">
          <Users className="h-10 w-10 text-charcoal-subtle mx-auto opacity-40" />
          <p className="text-sm font-semibold text-charcoal">No families match your criteria</p>
          <Button size="sm" variant="outline" onClick={() => { setSearch(""); setSelectedArea("All"); }}>
            Clear Filters
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {families.map((family) => {
            const engagementVariant =
              family.engagementLevel === "High"
                ? "success"
                : family.engagementLevel === "At-Risk"
                ? "danger"
                : "primary";

            return (
              <GlassCard key={family._id} hoverEffect className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-charcoal-subtle">
                        {family.familyCode}
                      </span>
                      <h3 className="font-heading text-base font-bold text-charcoal leading-tight">
                        {family.name}
                      </h3>
                      {family.gujaratiName && (
                        <p className="text-xs text-charcoal-subtle font-gujarati">
                          {family.gujaratiName}
                        </p>
                      )}
                    </div>
                    <Badge variant={engagementVariant} size="sm">
                      {family.engagementLevel}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-charcoal-subtle pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal">Captain:</span>
                      <span>{family.captainName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-charcoal-subtle" />
                      <span>+91 {family.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-charcoal-subtle" />
                      <span className="truncate">{family.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 shrink-0 text-charcoal-subtle" />
                      <span>{family.memberCount} Household Members</span>
                    </div>
                  </div>

                  {family.notes && (
                    <p className="text-[11px] text-charcoal-subtle line-clamp-2 bg-surface-container-low/50 p-2 rounded-xl border border-hairline/60">
                      {family.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-hairline/70 pt-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setSelectedFamily(family);
                      setInteractionModalOpen(true);
                    }}
                  >
                    Log Visit / Call
                  </Button>
                  <Link href={`/families/${family._id}`}>
                    <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      360° Profile
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* 3-Step Family Registration Wizard Modal */}
      <Modal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Register New Household"
        subtitle={`Step ${wizardStep} of 3 — ${
          wizardStep === 1
            ? "Household & Address Basics"
            : wizardStep === 2
            ? "Captain & Contact Details"
            : "Review & Confirm"
        }`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {wizardStep === 1 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Household Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Patel Household (Mukeshbhai)"
                  className="mt-1 h-10 w-full rounded-xl border border-hairline px-3.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Gujarati Name (Optional)</label>
                <input
                  type="text"
                  value={formData.gujaratiName}
                  onChange={(e) => setFormData({ ...formData, gujaratiName: e.target.value })}
                  placeholder="e.g. પટેલ પરિવાર"
                  className="mt-1 h-10 w-full rounded-xl border border-hairline px-3.5 text-xs font-gujarati text-charcoal focus:border-saffron-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-charcoal">Area / Locality *</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-hairline px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                  >
                    <option value="Station Road">Station Road</option>
                    <option value="Vaniyavad">Vaniyavad</option>
                    <option value="Santram Road">Santram Road</option>
                    <option value="Dumral Bazar">Dumral Bazar</option>
                    <option value="College Road">College Road</option>
                    <option value="Petlad Road">Petlad Road</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal">Mandir Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-hairline px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                  >
                    <option value="North Nadiad">North Nadiad</option>
                    <option value="Central Nadiad">Central Nadiad</option>
                    <option value="South Nadiad">South Nadiad</option>
                    <option value="East Nadiad">East Nadiad</option>
                    <option value="West Nadiad">West Nadiad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Street Address *</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Society name, flat number, landmark..."
                  className="mt-1 w-full rounded-xl border border-hairline p-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button size="md" onClick={() => setWizardStep(2)}>
                  Next: Captain Info &rarr;
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Family Captain Full Name *</label>
                <input
                  type="text"
                  value={formData.captainName}
                  onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                  placeholder="e.g. Mukeshbhai Patel"
                  className="mt-1 h-10 w-full rounded-xl border border-hairline px-3.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Captain Primary Mobile (+91) *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="98250 12345"
                  className="mt-1 h-10 w-full rounded-xl border border-hairline px-3.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Fieldwork Notes / Context</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Preferred sabha timings, seva interests, elder health notes..."
                  className="mt-1 w-full rounded-xl border border-hairline p-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" size="md" onClick={() => setWizardStep(1)}>
                  &larr; Back
                </Button>
                <Button size="md" onClick={() => setWizardStep(3)}>
                  Review &amp; Confirm &rarr;
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-hairline bg-surface-container-low/50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-subtle">Household Name:</span>
                  <span className="font-bold text-charcoal">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-subtle">Captain Name:</span>
                  <span className="font-semibold text-charcoal">{formData.captainName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-subtle">Mobile Number:</span>
                  <span className="font-semibold text-charcoal">+91 {formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-subtle">Area / Zone:</span>
                  <span className="font-semibold text-charcoal">{formData.area} ({formData.zone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-subtle">Address:</span>
                  <span className="font-semibold text-charcoal">{formData.address}</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" size="md" onClick={() => setWizardStep(2)}>
                  &larr; Edit Details
                </Button>
                <Button size="md" onClick={handleRegisterFamily}>
                  Confirm &amp; Register Household
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Duplicate Review Modal */}
      {duplicateWarning && (
        <Modal
          isOpen={!!duplicateWarning}
          onClose={() => setDuplicateWarning(null)}
          title="Duplicate Record Detected"
          subtitle="A family with matching phone or name already exists in the Mandir directory."
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-amber-900">Existing Record</p>
                <p className="text-charcoal font-semibold">{duplicateWarning.name}</p>
                <p className="text-charcoal-subtle">Code: {duplicateWarning.familyCode}</p>
                <p className="text-charcoal-subtle">Captain: {duplicateWarning.captainName}</p>
                <p className="text-charcoal-subtle">Phone: +91 {duplicateWarning.phone}</p>
              </div>
              <div className="space-y-1 border-l border-amber-200 pl-3">
                <p className="font-bold text-amber-900">New Entry Attempt</p>
                <p className="text-charcoal font-semibold">{formData.name}</p>
                <p className="text-charcoal-subtle">Captain: {formData.captainName}</p>
                <p className="text-charcoal-subtle">Phone: +91 {formData.phone}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <Button variant="outline" size="md" onClick={() => setDuplicateWarning(null)}>
                Cancel Registration
              </Button>
              <Button
                size="md"
                variant="destructive"
                onClick={async () => {
                  setDuplicateWarning(null);
                  const res = await fetch("/api/families", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, ignoreDuplicateWarning: true }),
                  });
                  if (res.ok) {
                    toast.success("Family Created Despite Duplicate Flag");
                    setWizardOpen(false);
                    fetchFamilies();
                  }
                }}
              >
                Proceed as Separate Household
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Log Interaction Modal */}
      {selectedFamily && (
        <Modal
          isOpen={interactionModalOpen}
          onClose={() => setInteractionModalOpen(false)}
          title={`Log Interaction &bull; ${selectedFamily.name}`}
          subtitle="Record field visit, phone consultation, or Sabha touchpoint"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-charcoal">Touchpoint Type</label>
              <select
                value={interactionType}
                onChange={(e) => setInteractionType(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-hairline px-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              >
                <option value="Home Visit">Home Field Visit</option>
                <option value="Phone Call">Phone Call / WhatsApp</option>
                <option value="Sabha Contact">Sabha Contact Touchpoint</option>
                <option value="Hospital Visit">Hospital / Wellbeing Visit</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal">Observation Notes</label>
              <textarea
                rows={3}
                value={interactionNotes}
                onChange={(e) => setInteractionNotes(e.target.value)}
                placeholder="Family wellbeing status, prasadam delivered, upcoming event reminders..."
                className="mt-1 w-full rounded-xl border border-hairline p-3 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-hairline bg-surface-container-low/40 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresFollowUp}
                onChange={(e) => setRequiresFollowUp(e.target.checked)}
                className="h-4 w-4 rounded text-primary-container focus:ring-saffron-400"
              />
              <div>
                <p className="text-xs font-bold text-charcoal">Open Follow-Up Case</p>
                <p className="text-[10px] text-charcoal-subtle">
                  Automatically schedules a supervisor follow-up alert
                </p>
              </div>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="md" onClick={() => setInteractionModalOpen(false)}>
                Cancel
              </Button>
              <Button size="md" onClick={handleLogInteraction}>
                Save Interaction
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
