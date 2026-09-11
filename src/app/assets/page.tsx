"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QRScannerModal } from "@/components/ui/QRScannerModal";
import {
  Package,
  QrCode,
  Calendar,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function AssetsPage() {
  const { role, user, language } = useApp();
  const [assets, setAssets] = useState<any[]>([]);
  const [roomBookings, setRoomBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"assets" | "rooms">("assets");

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const [holderName, setHolderName] = useState("Jaimin Trivedi");
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );

  const [newBooking, setNewBooking] = useState({
    roomName: "Conference Hall B",
    purpose: "",
    bookedBy: user.name,
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

  const handleBorrowAsset = async () => {
    if (!selectedAsset) return;
    try {
      const res = await fetch("/api/assets/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAsset._id,
          action: "borrow",
          holderName,
          returnDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Asset issued to ${holderName}`);
        setBorrowModalOpen(false);
        fetchData();
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
        toast.success("Asset returned to store inventory");
        fetchData();
      }
    } catch (e: any) {
      toast.error("Return failed: " + e.message);
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

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-container" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">
              {language === "gu" ? "મંદિર સાધન સામગ્રી" : "Mandir Assets & Hall Bookings"}
            </h1>
          </div>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            QR inventory management, borrow/return logs &amp; conflict-free hall reservations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            leftIcon={<QrCode className="h-4 w-4 text-primary-container" />}
            onClick={() => setQrModalOpen(true)}
          >
            Scan Asset QR
          </Button>
          <Button
            size="md"
            onClick={() => setRoomModalOpen(true)}
            leftIcon={<Calendar className="h-4 w-4" />}
          >
            + Reserve Hall
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-1.5 p-1 rounded-2xl bg-[#121622]/80 backdrop-blur-md border border-white/10">
        <button
          onClick={() => setActiveTab("assets")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "assets"
              ? "bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40 shadow-glow-sm font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Asset Registry ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "rooms"
              ? "bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40 shadow-glow-sm font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Hall &amp; Room Bookings ({roomBookings.length})
        </button>
      </div>

      {activeTab === "assets" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const isAvailable = asset.status === "Available";
            return (
              <GlassCard key={asset._id} hoverEffect className="p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                      {asset.assetCode}
                    </span>
                    <Badge variant={isAvailable ? "success" : "warning"} size="sm">
                      {asset.status}
                    </Badge>
                  </div>

                  <h3 className="font-heading text-base font-bold text-white leading-tight">
                    {asset.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Category: <strong className="text-gray-200">{asset.category}</strong>
                  </p>

                  <div className="space-y-1 text-xs text-gray-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" />
                      <span>{asset.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>Condition: {asset.condition}</span>
                    </div>
                    {!isAvailable && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                        Issued to: <strong>{asset.currentHolder}</strong> (Due: {asset.expectedReturnDate})
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  {isAvailable ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setBorrowModalOpen(true);
                      }}
                    >
                      Issue / Borrow &rarr;
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReturnAsset(asset._id)}
                    >
                      Process Return
                    </Button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        /* Room Bookings Calendar View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomBookings.map((booking) => (
              <GlassCard key={booking._id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={booking.status === "Confirmed" ? "success" : "warning"} size="sm">
                    {booking.status}
                  </Badge>
                  <span className="text-xs font-semibold text-gray-400">{booking.attendees} Devotees</span>
                </div>

                <h3 className="font-heading text-base font-bold text-white leading-tight">
                  {booking.roomName}
                </h3>
                <p className="text-xs text-amber-400 font-semibold">{booking.purpose}</p>

                <div className="space-y-1 text-xs text-gray-400 pt-1">
                  <p><strong>Booked By:</strong> {booking.bookedBy}</p>
                  <p><strong>Date &amp; Time:</strong> {booking.date} ({booking.startTime} - {booking.endTime})</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Borrow Asset Modal */}
      <Modal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        title="Issue / Borrow Mandir Asset"
        subtitle={selectedAsset?.name}
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-300">Issued To (Karyakarta / Member) *</label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3.5 text-xs text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300">Expected Return Date *</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3 text-xs text-white focus:border-amber-500/60 focus:outline-none"
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
            <label className="text-xs font-semibold text-gray-300">Hall / Room</label>
            <select
              value={newBooking.roomName}
              onChange={(e) => setNewBooking({ ...newBooking, roomName: e.target.value })}
              className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3 text-xs text-white focus:border-amber-500/60 focus:outline-none"
            >
              <option className="bg-[#161B28] text-white" value="Main Satsang Sabhagruh">Main Satsang Sabhagruh</option>
              <option className="bg-[#161B28] text-white" value="Conference Hall B">Conference Hall B</option>
              <option className="bg-[#161B28] text-white" value="Dining Hall (Bhojanshala)">Dining Hall (Bhojanshala)</option>
              <option className="bg-[#161B28] text-white" value="Prarthana Hall">Prarthana Hall</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300">Purpose of Booking *</label>
            <input
              type="text"
              value={newBooking.purpose}
              onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
              placeholder="e.g. Youth Shibir Planning / Family Thal"
              className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3.5 text-xs text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300">Reservation Date</label>
              <input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3 text-xs text-white focus:border-amber-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300">Expected Devotees</label>
              <input
                type="number"
                value={newBooking.attendees}
                onChange={(e) => setNewBooking({ ...newBooking, attendees: parseInt(e.target.value) || 20 })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3 text-xs text-white focus:border-amber-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300">Start Time</label>
              <input
                type="time"
                value={newBooking.startTime}
                onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3 text-xs text-white focus:border-amber-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300">End Time</label>
              <input
                type="time"
                value={newBooking.endTime}
                onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#161B28] px-3 text-xs text-white focus:border-amber-500/60 focus:outline-none"
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
          toast.success("Asset Lookup Complete", {
            description: `Identified asset: ${code}`,
          });
        }}
      />
    </div>
  );
}
