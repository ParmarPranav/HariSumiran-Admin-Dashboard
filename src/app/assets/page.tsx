"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QRScannerModal } from "@/components/ui/QRScannerModal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { AssetIcon } from "@/components/assets/AssetIcon";
import Link from "next/link";
import {
  Package,
  QrCode,
  Calendar,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  Search,
  Phone,
  RotateCcw,
  Volume2,
  UtensilsCrossed,
  Wrench,
  Armchair,
  Truck,
  Grid,
  MoreVertical,
  Layers,
  DoorOpen,
  Info,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function AssetsPage() {
  const { role, user, language } = useApp();
  const [assets, setAssets] = useState<any[]>([]);
  const [roomBookings, setRoomBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"assets" | "rooms">("assets");

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Available" | "In Custody" | "Maintenance">("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Modals
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [addAssetModalOpen, setAddAssetModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Borrow Form State
  const [holderName, setHolderName] = useState("");
  const [holderRole, setHolderRole] = useState("Sabha Karyakarta");
  const [holderPhone, setHolderPhone] = useState("");
  const [dueTime, setDueTime] = useState("Today, 9:30 PM • Sunday Evening Sabha");
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );

  // New Asset Form State
  const [newAssetData, setNewAssetData] = useState({
    name: "",
    gujaratiName: "",
    category: "Sound & AV",
    subcategory: "Microphone",
    iconType: "mic",
    location: "Audio Booth Locker 01",
    condition: "Excellent",
    notes: "",
  });

  // Room Booking State
  const [newBooking, setNewBooking] = useState({
    roomName: "Conference Hall B",
    purpose: "",
    bookedBy: user?.name || "Active Devotee",
    date: new Date().toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "20:00",
    attendees: 20,
  });

  const fetchData = () => {
    setLoading(true);
    fetch("/api/assets")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAssets(data.assets || []);
          setRoomBookings(data.roomBookings || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute live KPI counts
  const totalCount = assets.length;
  const availableCount = assets.filter((a) => a.status === "Available").length;
  const inCustodyCount = assets.filter((a) => a.status === "In Custody" || a.status === "In Use").length;
  const maintenanceCount = assets.filter((a) => a.status === "Maintenance" || a.status === "Under Maintenance").length;

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Status match
      if (statusFilter === "Available" && asset.status !== "Available") return false;
      if (statusFilter === "In Custody" && asset.status !== "In Custody" && asset.status !== "In Use") return false;
      if (statusFilter === "Maintenance" && asset.status !== "Maintenance" && asset.status !== "Under Maintenance") return false;

      // Category match
      if (selectedCategory !== "All" && asset.category !== selectedCategory) return false;

      // Search match (name, gujarati, assetCode, currentHolder, location)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (asset.name || "").toLowerCase().includes(q);
        const matchesGuj = (asset.gujaratiName || "").toLowerCase().includes(q);
        const matchesCode = (asset.assetCode || "").toLowerCase().includes(q);
        const matchesHolder = (asset.currentHolder || "").toLowerCase().includes(q);
        const matchesLoc = (asset.location || "").toLowerCase().includes(q);
        if (!matchesName && !matchesGuj && !matchesCode && !matchesHolder && !matchesLoc) {
          return false;
        }
      }

      return true;
    });
  }, [assets, statusFilter, selectedCategory, search]);

  const handleBorrowAsset = async () => {
    if (!selectedAsset) return;
    if (!holderName.trim()) {
      toast.error("Please enter the name of the devotee/karyakarta");
      return;
    }
    try {
      const res = await fetch("/api/assets/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAsset._id,
          action: "borrow",
          holderName,
          holderRole,
          holderPhone,
          dueTime,
          returnDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Asset issued to ${holderName}`, {
          description: `Due: ${dueTime}`,
        });
        setBorrowModalOpen(false);
        fetchData();
      } else {
        toast.error(data.error || "Borrow failed");
      }
    } catch (e: any) {
      toast.error("Borrow failed: " + e.message);
    }
  };

  const handleReturnAsset = async (assetId: string) => {
    try {
      const res = await fetch("/api/assets/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          action: "return",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Asset returned to store inventory", {
          description: "Status reset to Available.",
        });
        fetchData();
      }
    } catch (e: any) {
      toast.error("Return failed: " + e.message);
    }
  };

  const handleAddAsset = async () => {
    if (!newAssetData.name || !newAssetData.category) {
      toast.error("Name and Category are required");
      return;
    }
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssetData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("New Asset Created", {
          description: `${newAssetData.name} (${data.asset?.assetCode}) added to Mandir registry.`,
        });
        setAddAssetModalOpen(false);
        setNewAssetData({
          name: "",
          gujaratiName: "",
          category: "Sound & AV",
          subcategory: "Microphone",
          iconType: "mic",
          location: "Audio Booth Locker 01",
          condition: "Excellent",
          notes: "",
        });
        fetchData();
      } else {
        toast.error(data.error || "Failed to add asset");
      }
    } catch (e: any) {
      toast.error("Error creating asset: " + e.message);
    }
  };

  const handleBookRoom = async () => {
    if (!newBooking.purpose) {
      toast.error("Please enter booking purpose.");
      return;
    }
    try {
      const res = await fetch("/api/assets/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });
      const data = await res.json();
      if (data.conflict) {
        toast.error(data.error);
        return;
      }
      if (data.success) {
        toast.success("Room booked successfully!");
        setRoomModalOpen(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error("Booking failed: " + e.message);
    }
  };

  const categories = [
    { label: "All", id: "All", icon: Grid },
    { label: "Sound & AV", id: "Sound & AV", icon: Volume2 },
    { label: "Utility & Facilities", id: "Utility & Facilities", icon: Wrench },
    { label: "Kitchen", id: "Kitchen", icon: UtensilsCrossed },
    { label: "Furniture", id: "Furniture", icon: Armchair },
    { label: "Vehicles", id: "Vehicles", icon: Truck },
  ];

  return (
    <div className="relative min-h-screen bg-[#FFFBF7] p-3 md:p-8 space-y-5 max-w-6xl mx-auto text-stone-900 pb-20">
      <MandalaBackground />

      {/* Top Navigation Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-stone-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex items-center justify-center h-9 w-9 rounded-full bg-white border border-stone-200 shadow-xs text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-black text-lg text-stone-900">
              Mandir Asset Hub
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-900">
            🌐 {language.toUpperCase()}
          </span>

          <button
            onClick={() => setQrModalOpen(true)}
            title="Scan QR Code"
            className="flex items-center justify-center h-9 w-9 rounded-full bg-white border border-stone-200 shadow-xs text-stone-700 hover:text-amber-700 hover:border-amber-300 transition-colors"
          >
            <QrCode className="h-4 w-4" />
          </button>

          <button
            onClick={() => setActiveTab(activeTab === "assets" ? "rooms" : "assets")}
            title="Toggle Hall & Room Bookings"
            className={`flex items-center justify-center h-9 w-9 rounded-full border shadow-xs transition-colors ${
              activeTab === "rooms"
                ? "bg-amber-600 border-amber-600 text-white"
                : "bg-white border-stone-200 text-stone-700 hover:text-amber-700"
            }`}
          >
            <DoorOpen className="h-4 w-4" />
          </button>
        </div>
      </div>

      {activeTab === "assets" ? (
        <>
          {/* Main Title & Add Action Row */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-black text-[#EA580C] tracking-tight">
                Asset Operations
              </h1>
              <p className="text-xs md:text-sm text-stone-600 font-medium mt-0.5">
                Temple Equipment, Facilities &amp; Custody
              </p>
            </div>

            <button
              onClick={() => setAddAssetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#EA580C] text-[#EA580C] hover:bg-orange-50 font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>

          {/* 3 Interactive KPI Stat Cards (Clickable to switch sub-list view) */}
          <div className="relative z-10 grid grid-cols-3 gap-2.5 md:gap-4">
            {/* Total Assets Card */}
            <button
              type="button"
              onClick={() => setStatusFilter("All")}
              className={`p-3 md:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between active:scale-[0.98] ${
                statusFilter === "All"
                  ? "bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                  : "bg-white/90 border-stone-200/90 shadow-xs hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-stone-100 text-stone-800">
                  <Package className="h-4 w-4" />
                </div>
                <span className="font-heading text-lg md:text-2xl font-black text-stone-900">
                  {totalCount}
                </span>
              </div>
              <p className="text-[11px] md:text-xs font-semibold text-stone-600 mt-2">
                Total Assets
              </p>
            </button>

            {/* Available Card */}
            <button
              type="button"
              onClick={() => setStatusFilter("Available")}
              className={`p-3 md:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between active:scale-[0.98] ${
                statusFilter === "Available"
                  ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "bg-white/90 border-stone-200/90 shadow-xs hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="font-heading text-lg md:text-2xl font-black text-emerald-700">
                  {availableCount}
                </span>
              </div>
              <p className="text-[11px] md:text-xs font-semibold text-stone-600 mt-2">
                Available
              </p>
            </button>

            {/* In Custody Card */}
            <button
              type="button"
              onClick={() => setStatusFilter("In Custody")}
              className={`p-3 md:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between active:scale-[0.98] ${
                statusFilter === "In Custody"
                  ? "bg-white border-[#EA580C] ring-2 ring-[#EA580C]/20 shadow-md"
                  : "bg-white/90 border-stone-200/90 shadow-xs hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-orange-50 text-[#EA580C]">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <span className="font-heading text-lg md:text-2xl font-black text-[#EA580C]">
                  {inCustodyCount}
                </span>
              </div>
              <p className="text-[11px] md:text-xs font-semibold text-stone-600 mt-2">
                In Custody
              </p>
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative z-10">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search equipment, QR code, or holder..."
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 text-xs md:text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Status Filter Pills (Matching Mockup: All (17) | Available (11) | In Custody (5)) */}
          <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setStatusFilter("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "All"
                  ? "bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white shadow-xs"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("Available")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "Available"
                  ? "bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white shadow-xs"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => setStatusFilter("In Custody")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "In Custody"
                  ? "bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white shadow-xs"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              In Custody ({inCustodyCount})
            </button>
            {maintenanceCount > 0 && (
              <button
                onClick={() => setStatusFilter("Maintenance")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === "Maintenance"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
              >
                Needs Service ({maintenanceCount})
              </button>
            )}
          </div>

          {/* Category Filter Pills with Icons (Matching Mockup) */}
          <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-purple-50 text-purple-900 border-purple-400 font-bold shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5 text-purple-700" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active View Subheader */}
          <div className="relative z-10 flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              Showing <strong className="text-stone-800">{filteredAssets.length}</strong> of {totalCount} assets
              {statusFilter !== "All" && ` • Filtered by ${statusFilter}`}
              {selectedCategory !== "All" && ` • ${selectedCategory}`}
            </span>
            {(statusFilter !== "All" || selectedCategory !== "All" || search) && (
              <button
                onClick={() => {
                  setStatusFilter("All");
                  setSelectedCategory("All");
                  setSearch("");
                }}
                className="text-amber-700 hover:underline font-bold text-[11px]"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Asset List View */}
          {loading ? (
            <div className="relative z-10 py-16 text-center text-xs text-stone-500">
              Loading Mandir assets inventory...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="relative z-10 py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-2">
              <Package className="h-8 w-8 text-stone-300 mx-auto" />
              <h3 className="font-heading text-sm font-bold text-stone-800">
                No matching equipment found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No assets match your search or selected filter. Try choosing "All" or searching for a different keyword.
              </p>
            </div>
          ) : (
            <div className="relative z-10 space-y-4">
              {filteredAssets.map((asset) => {
                const isAvailable = asset.status === "Available";
                const isInCustody = asset.status === "In Custody" || asset.status === "In Use";
                const isMaintenance = asset.status === "Maintenance" || asset.status === "Under Maintenance";

                return (
                  <div
                    key={asset._id}
                    className="relative bg-white rounded-3xl p-4 md:p-5 border border-stone-200/90 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    {/* Top Row: Category Badge + Condition Badge + Status Badge + 3-Dot Menu */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Category Pill with Dedicated Icon */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 border border-purple-200/80 text-[11px] font-bold text-purple-900">
                          <AssetIcon iconType={asset.iconType} category={asset.category} size="sm" className="text-purple-700" />
                          <span>{asset.category}</span>
                        </span>

                        {/* Condition Badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                          <span>{asset.condition || "Good"}</span>
                        </span>

                        {/* Status Badge */}
                        {isInCustody && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200/80 text-[11px] font-bold text-[#EA580C]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C]"></span>
                            <span>In Custody</span>
                          </span>
                        )}
                        {isAvailable && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                            <span>Available</span>
                          </span>
                        )}
                        {isMaintenance && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200/80 text-[11px] font-bold text-rose-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                            <span>Needs Service</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedAsset(asset);
                          setDetailsModalOpen(true);
                        }}
                        className="text-stone-400 hover:text-stone-700 p-1"
                        title="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Titles: English + Gujarati */}
                    <div>
                      <h3 className="font-heading text-base md:text-lg font-black text-stone-900 leading-snug">
                        {asset.name}
                      </h3>
                      {asset.gujaratiName && (
                        <p className="text-xs text-stone-500 font-medium mt-0.5">
                          {asset.gujaratiName}
                        </p>
                      )}
                    </div>

                    {/* Metadata Line: QR Code / AssetCode & Location */}
                    <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800">
                        <QrCode className="h-3 w-3 text-amber-600" />
                        <span>{asset.assetCode}</span>
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="inline-flex items-center gap-1 text-stone-600 truncate">
                        <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
                        <span className="truncate">{asset.location}</span>
                      </span>
                    </div>

                    {/* Custody Callout Box (Rendered when In Custody, matching design screenshot) */}
                    {isInCustody && (
                      <div className="rounded-2xl bg-[#FFF6E9] border border-[#FDE3B7] p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#EA580C] text-white font-black text-xs shrink-0">
                            {(asset.currentHolder || "K").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-900 leading-tight">
                              Held by: {asset.currentHolder}{" "}
                              {asset.holderRole && (
                                <span className="font-normal text-stone-600">
                                  ({asset.holderRole})
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-stone-600 mt-0.5">
                              Due: {asset.dueTime || asset.expectedReturnDate || "Tonight"}
                            </p>
                          </div>
                        </div>

                        {asset.holderPhone && (
                          <a
                            href={`tel:+91${asset.holderPhone}`}
                            title={`Call ${asset.currentHolder}`}
                            className="flex items-center justify-center h-8 w-8 rounded-full bg-white border border-stone-200 text-emerald-700 shadow-xs hover:bg-emerald-50 transition-colors shrink-0"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setDetailsModalOpen(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs shadow-xs text-center transition-colors"
                      >
                        Details
                      </button>

                      {isInCustody ? (
                        <button
                          type="button"
                          onClick={() => handleReturnAsset(asset._id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Return Asset</span>
                        </button>
                      ) : isAvailable ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setHolderName("");
                            setHolderPhone("");
                            setBorrowModalOpen(true);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:brightness-105 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                          <span>Issue / Borrow</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            toast.info("Equipment is currently under scheduled maintenance.");
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-stone-100 text-stone-500 font-bold text-xs text-center cursor-not-allowed"
                        >
                          Under Service
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Hall & Room Bookings View (Preserved) */
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-black text-stone-900">
                Hall &amp; Room Bookings
              </h2>
              <p className="text-xs text-stone-600">
                Conflict-free reservations across Mandir halls
              </p>
            </div>
            <Button
              size="md"
              onClick={() => setRoomModalOpen(true)}
              leftIcon={<Calendar className="h-4 w-4" />}
            >
              + Reserve Hall
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomBookings.map((booking) => (
              <GlassCard key={booking._id} className="p-5 space-y-3 bg-white border-stone-200/90 shadow-sm">
                <div className="flex items-center justify-between">
                  <Badge variant={booking.status === "Confirmed" ? "success" : "warning"} size="sm">
                    {booking.status}
                  </Badge>
                  <span className="text-xs font-bold text-stone-600">{booking.attendees} Devotees</span>
                </div>

                <h3 className="font-heading text-base font-bold text-stone-900 leading-tight">
                  {booking.roomName}
                </h3>
                <p className="text-xs text-amber-800 font-bold">{booking.purpose}</p>

                <div className="space-y-1 text-xs text-stone-600 pt-1 font-medium">
                  <p><strong>Booked By:</strong> {booking.bookedBy}</p>
                  <p><strong>Date &amp; Time:</strong> {booking.date} ({booking.startTime} - {booking.endTime})</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Asset Dossier & Specifications"
        subtitle={selectedAsset?.assetCode}
        maxWidth="md"
      >
        {selectedAsset && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-amber-800">
                  {selectedAsset.assetCode}
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  selectedAsset.status === "Available"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedAsset.status === "In Custody"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-stone-200 text-stone-800"
                }`}>
                  {selectedAsset.status}
                </span>
              </div>
              <h4 className="font-heading text-base font-black text-stone-900">
                {selectedAsset.name}
              </h4>
              {selectedAsset.gujaratiName && (
                <p className="text-xs text-stone-500 font-medium">
                  {selectedAsset.gujaratiName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase font-black">Category</span>
                <p className="font-bold text-stone-800 mt-0.5">{selectedAsset.category}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase font-black">Condition</span>
                <p className="font-bold text-emerald-700 mt-0.5">{selectedAsset.condition || "Good"}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 col-span-2">
                <span className="text-[10px] text-stone-400 uppercase font-black">Storage Location</span>
                <p className="font-bold text-stone-800 mt-0.5">{selectedAsset.location}</p>
              </div>
            </div>

            {selectedAsset.currentHolder && (
              <div className="p-3 rounded-2xl bg-[#FFF6E9] border border-[#FDE3B7] space-y-1">
                <span className="text-[10px] text-amber-900 uppercase font-black">Active Custody</span>
                <p className="font-bold text-stone-900 text-xs">
                  {selectedAsset.currentHolder} ({selectedAsset.holderRole || "Karyakarta"})
                </p>
                <p className="text-[11px] text-stone-600">
                  Due: {selectedAsset.dueTime || selectedAsset.expectedReturnDate}
                </p>
                {selectedAsset.holderPhone && (
                  <p className="font-mono text-[11px] text-amber-900 font-bold">
                    📞 +91 {selectedAsset.holderPhone}
                  </p>
                )}
              </div>
            )}

            {selectedAsset.notes && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-[11px]">
                <strong className="text-stone-800">Operational Notes:</strong> {selectedAsset.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Borrow / Issue Asset Modal */}
      <Modal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        title="Issue Mandir Equipment"
        subtitle={selectedAsset?.name}
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-700">Holder Name (Karyakarta / Member) *</label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="e.g. Rahul Patel / Sarjanbhai Patel"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700">Role / Department</label>
              <input
                type="text"
                value={holderRole}
                onChange={(e) => setHolderRole(e.target.value)}
                placeholder="e.g. Sound Lead"
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700">Contact Mobile</label>
              <input
                type="tel"
                value={holderPhone}
                onChange={(e) => setHolderPhone(e.target.value)}
                placeholder="98250 12345"
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700">Due Event &amp; Timestamp *</label>
            <input
              type="text"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="e.g. Today, 9:30 PM • Sunday Evening Sabha"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700">Expected Return Date</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setBorrowModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleBorrowAsset}>
              Confirm Issue
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add New Asset Modal */}
      <Modal
        isOpen={addAssetModalOpen}
        onClose={() => setAddAssetModalOpen(false)}
        title="Add Equipment to Mandir Registry"
        subtitle="Automatic QR code generation and category mapping"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-700">Equipment Name (English) *</label>
            <input
              type="text"
              value={newAssetData.name}
              onChange={(e) => setNewAssetData({ ...newAssetData, name: e.target.value })}
              placeholder="e.g. Shure QLXD24 Dual Cordless Mic Kit"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700">Gujarati Name (Optional)</label>
            <input
              type="text"
              value={newAssetData.gujaratiName}
              onChange={(e) => setNewAssetData({ ...newAssetData, gujaratiName: e.target.value })}
              placeholder="e.g. શ્યોર ક્યુએલ કોર્ડલેસ માઈક કિટ"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700">Category *</label>
              <select
                value={newAssetData.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  let icon = "box";
                  if (cat === "Sound & AV") icon = "mic";
                  if (cat === "Kitchen") icon = "cauldron";
                  if (cat === "Utility & Facilities") icon = "generator";
                  if (cat === "Furniture") icon = "chair";
                  if (cat === "Vehicles") icon = "vehicle";
                  setNewAssetData({ ...newAssetData, category: cat, iconType: icon });
                }}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
              >
                <option value="Sound & AV">Sound &amp; AV</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Utility & Facilities">Utility &amp; Facilities</option>
                <option value="Furniture">Furniture</option>
                <option value="Vehicles">Vehicles</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700">Condition</label>
              <select
                value={newAssetData.condition}
                onChange={(e) => setNewAssetData({ ...newAssetData, condition: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Service">Needs Service</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700">Storage Location *</label>
            <input
              type="text"
              value={newAssetData.location}
              onChange={(e) => setNewAssetData({ ...newAssetData, location: e.target.value })}
              placeholder="e.g. Audio Booth Locker 01 / Kitchen Store"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700">Operational Notes</label>
            <textarea
              rows={2}
              value={newAssetData.notes}
              onChange={(e) => setNewAssetData({ ...newAssetData, notes: e.target.value })}
              placeholder="Technical specs, serial number, handling protocols..."
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setAddAssetModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleAddAsset}>
              Save Asset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reserve Hall Modal */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title="Reserve Mandir Hall / Room"
        subtitle="Automatic double-booking conflict prevention"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-700">Hall / Room</label>
            <select
              value={newBooking.roomName}
              onChange={(e) => setNewBooking({ ...newBooking, roomName: e.target.value })}
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
            >
              <option className="bg-white text-stone-900" value="Main Satsang Sabhagruh">Main Satsang Sabhagruh</option>
              <option className="bg-white text-stone-900" value="Conference Hall B">Conference Hall B</option>
              <option className="bg-white text-stone-900" value="Dining Hall (Bhojanshala)">Dining Hall (Bhojanshala)</option>
              <option className="bg-white text-stone-900" value="Prarthana Hall">Prarthana Hall</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700">Purpose of Booking *</label>
            <input
              type="text"
              value={newBooking.purpose}
              onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
              placeholder="e.g. Youth Shibir Planning / Family Thal"
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700">Reservation Date</label>
              <input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700">Expected Devotees</label>
              <input
                type="number"
                value={newBooking.attendees}
                onChange={(e) => setNewBooking({ ...newBooking, attendees: parseInt(e.target.value) || 20 })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700">Start Time</label>
              <input
                type="time"
                value={newBooking.startTime}
                onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700">End Time</label>
              <input
                type="time"
                value={newBooking.endTime}
                onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="md" onClick={() => setRoomModalOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleBookRoom}>
              Reserve Room
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Scanner */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Scan Mandir Asset QR Code"
        subtitle="Lookup asset details, condition history, and holder assignment"
        onScanSuccess={(code) => {
          setSearch(code);
          toast.success("Asset Lookup Complete", {
            description: `Filtered by QR code: ${code}`,
          });
        }}
      />
    </div>
  );
}
