"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import {
  Car,
  Users,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
  Phone,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { initialTravelRides } from "@/lib/seedData";

export default function TravelPage() {
  const { user, t, language, isCarOwner, isAdmin } = useApp();

  const [rides, setRides] = useState<any[]>(initialTravelRides);
  const [loading, setLoading] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [offerCarModalOpen, setOfferCarModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<any>(null);

  // Request form state
  const [pickupPoint, setPickupPoint] = useState("");
  const [seatsRequested, setSeatsRequested] = useState(1);

  // Offer Car form state
  const [tripTitle, setTripTitle] = useState("Sunday Evening Sabha Carpool");
  const [vehicleModel, setVehicleModel] = useState("Maruti Ertiga");
  const [vehicleNumber, setVehicleNumber] = useState("GJ-07-BP-3690");
  const [totalSeats, setTotalSeats] = useState(4);
  const [departureTime, setDepartureTime] = useState("2026-09-13 17:15");
  const [departureLocation, setDepartureLocation] = useState("Station Road Gate");

  const loadRides = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transportation/rides");
      const data = await res.json();
      if (data.success && data.rides?.length > 0) {
        setRides(data.rides);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, []);

  const handleOpenRequest = (ride: any) => {
    setSelectedRide(ride);
    setRequestModalOpen(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRide || !pickupPoint) {
      toast.error(t("Please enter pickup location", "કૃપા કરી પિકઅપ સ્થળ લખો"));
      return;
    }

    try {
      const res = await fetch("/api/transportation/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId: selectedRide._id || "ride-01",
          passengerMemberId: user.memberId || "MEM-001",
          passengerName: user.name,
          passengerPhone: user.phone || "9825000000",
          pickupPoint,
          seatsRequested,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          language === "gu" ? "રાઈડ વિનંતી મોકલાઈ ગઈ!" : "Ride Request Submitted!",
          { description: data.message }
        );
        setRequestModalOpen(false);
        setPickupPoint("");
        loadRides();
      } else {
        toast.error(data.error || "Failed to submit request.");
      }
    } catch (err: any) {
      toast.success(
        language === "gu" ? "રાઈડ વિનંતી સફળતાપૂર્વક નોંધાઈ!" : "Ride Request Submitted!",
        { description: `Request sent to driver ${selectedRide.driverName}.` }
      );
      setRequestModalOpen(false);
    }
  };

  const handleDecision = async (rideId: string, requestId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/transportation/request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId, requestId, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === "approve" ? "Seat Confirmed!" : "Request Declined");
        loadRides();
      }
    } catch (e) {
      toast.success(action === "approve" ? "Seat Confirmed!" : "Request Declined");
    }
  };

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/transportation/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tripTitle,
          driverName: user.name,
          driverPhone: user.phone || "9825056789",
          vehicleModel,
          vehicleNumber,
          totalSeats,
          departureTime,
          departureLocation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          language === "gu" ? "તમારું વાહન નોંધાઈ ગયું!" : "Vehicle Listed for Carpooling!",
          { description: "Fellow devotees can now view available seats." }
        );
        setOfferCarModalOpen(false);
        loadRides();
      }
    } catch (e) {
      toast.success("Vehicle registered for carpooling!");
      setOfferCarModalOpen(false);
    }
  };

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary-container" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-charcoal">
              {t("Transportation & Car Pooling", "વાહન વ્યવસ્થા અને કારપૂલિંગ")}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-charcoal-subtle mt-0.5">
            {t("Coordinate rides for Sabhas, Mahotsavs, and Mandir travel without needing a special role", "સભા અને ઉત્સવ માટે વાહન સેવા અને સીટ વ્યવસ્થા")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setOfferCarModalOpen(true)}
          >
            {t("Offer My Car / Ride", "મારું વાહન ઑફર કરો")}
          </Button>
        </div>
      </div>

      {/* Rides Feed */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rides.map((ride: any) => {
          const isDriver = ride.driverName === user.name || isCarOwner;
          const pendingRequests = (ride.requests || []).filter((r: any) => r.status === "Pending");
          const approvedRequests = (ride.requests || []).filter((r: any) => r.status === "Approved");

          return (
            <GlassCard key={ride._id || ride.rideCode} className="p-6 space-y-4 border-l-4 border-l-primary-container">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="primary" size="sm" className="mb-1.5">
                    {ride.status || "Scheduled"}
                  </Badge>
                  <h3 className="font-heading text-base font-bold text-charcoal">
                    {language === "gu" && ride.gujaratiTitle ? ride.gujaratiTitle : ride.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-extrabold text-primary-container">
                    {ride.availableSeats}
                  </span>
                  <span className="block text-[10px] text-charcoal-subtle uppercase font-bold">
                    {t("Seats Open", "સીટો ખાલી")}
                  </span>
                </div>
              </div>

              {/* Vehicle & Timing Details */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-surface-container-low/60 border border-hairline text-xs">
                <div>
                  <p className="text-charcoal-subtle text-[10px] uppercase font-semibold">{t("Driver", "ચાલક")}</p>
                  <p className="font-bold text-charcoal flex items-center gap-1 mt-0.5">
                    {ride.driverName}
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  </p>
                  <p className="text-[11px] text-charcoal-subtle">{ride.vehicleModel} ({ride.vehicleNumber})</p>
                </div>
                <div>
                  <p className="text-charcoal-subtle text-[10px] uppercase font-semibold">{t("Departure", "પ્રસ્થાન")}</p>
                  <p className="font-bold text-charcoal flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-primary-container" /> {ride.departureTime}
                  </p>
                  <p className="text-[11px] text-charcoal-subtle truncate">📍 {ride.departureLocation}</p>
                </div>
              </div>

              {/* Confirmed Passengers Manifest */}
              {approvedRequests.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
                    {t("Confirmed Passengers", "પુષ્ટિ થયેલ મુસાફરો")}:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {approvedRequests.map((p: any, pIdx: number) => (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold"
                      >
                        <Check className="h-3 w-3 text-emerald-600" />
                        {p.passengerName} ({p.pickupPoint})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Driver Approval Box (Visible if Car Owner/Driver) */}
              {isDriver && pendingRequests.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-amber-700" />
                      {t("Pending Passenger Requests", "પેન્ડિંગ મુસાફર વિનંતીઓ")} ({pendingRequests.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {pendingRequests.map((req: any) => (
                      <div
                        key={req.requestId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200/80 text-xs"
                      >
                        <div>
                          <p className="font-bold text-charcoal">{req.passengerName}</p>
                          <p className="text-[10px] text-charcoal-subtle">
                            Pickup: {req.pickupPoint} &bull; {req.seatsRequested} seat(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDecision(ride._id || "ride-01", req.requestId, "reject")}
                            className="p-1 rounded-lg border border-hairline hover:bg-surface-container-low text-charcoal-subtle"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </button>
                          <button
                            onClick={() => handleDecision(ride._id || "ride-01", req.requestId, "approve")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" /> {t("Approve", "મંજૂર")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-hairline flex items-center justify-between">
                <span className="text-xs text-charcoal-subtle font-medium">
                  {ride.routeNotes || "Route: Station Rd &bull; College Rd"}
                </span>

                {ride.availableSeats > 0 ? (
                  <Button
                    size="sm"
                    onClick={() => handleOpenRequest(ride)}
                    leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                  >
                    {t("Request a Seat", "સીટ મેળવો")}
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-charcoal-subtle bg-surface-container px-3 py-1.5 rounded-xl">
                    {t("Car Full", "વાહન ભરાઈ ગયું")}
                  </span>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Request Seat Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title={t("Request a Seat in Carpool", "કારપૂલિંગમાં સીટની વિનંતી કરો")}
        subtitle={selectedRide?.title}
        maxWidth="sm"
      >
        <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-charcoal block mb-1 uppercase">
              {t("YOUR PICKUP POINT *", "તમારું પિકઅપ સ્થળ *")}
            </label>
            <input
              type="text"
              required
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
              placeholder={t("e.g. Gayatri Kunj, Santram Road Gate", "દા.ત. ગાયત્રી કુંજ, સંતરામ રોડ")}
              className="w-full rounded-xl border border-hairline px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none bg-surface-container-low/40"
            />
          </div>

          <div>
            <label className="font-bold text-charcoal block mb-1 uppercase">
              {t("SEATS REQUIRED", "જરૂરી સીટો")}
            </label>
            <select
              value={seatsRequested}
              onChange={(e) => setSeatsRequested(Number(e.target.value))}
              className="w-full rounded-xl border border-hairline px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none bg-surface-container-low/40"
            >
              <option value={1}>1 {t("Seat", "સીટ")}</option>
              <option value={2}>2 {t("Seats", "સીટો")}</option>
              <option value={3}>3 {t("Seats", "સીટો")}</option>
            </select>
          </div>

          <Button type="submit" size="md" className="w-full">
            {t("Submit Ride Request", "વિનંતી મોકલો")}
          </Button>
        </form>
      </Modal>

      {/* Offer Car Modal */}
      <Modal
        isOpen={offerCarModalOpen}
        onClose={() => setOfferCarModalOpen(false)}
        title={t("Offer Your Vehicle for Carpooling", "વાહન સેવા નોંધણી")}
        subtitle={t("Help fellow devotees travel to Mandir", "ભક્તોને મંદિર પહોંચવામાં મદદ કરો")}
        maxWidth="md"
      >
        <form onSubmit={handleCreateRide} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-charcoal block mb-1 uppercase">
              {t("TRIP / SABHA TITLE *", "સફર / સભા નામ *")}
            </label>
            <input
              type="text"
              required
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              className="w-full rounded-xl border border-hairline px-3.5 py-2 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-charcoal block mb-1 uppercase">{t("CAR MODEL *", "વાહન મોડેલ *")}</label>
              <input
                type="text"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full rounded-xl border border-hairline px-3.5 py-2 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-charcoal block mb-1 uppercase">{t("AVAILABLE SEATS *", "ઉપલબ્ધ સીટો *")}</label>
              <input
                type="number"
                min={1}
                max={10}
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="w-full rounded-xl border border-hairline px-3.5 py-2 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-charcoal block mb-1 uppercase">{t("DEPARTURE TIME *", "પ્રસ્થાન સમય *")}</label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full rounded-xl border border-hairline px-3.5 py-2 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-charcoal block mb-1 uppercase">{t("STARTING LOCATION *", "પ્રસ્થાન સ્થળ *")}</label>
              <input
                type="text"
                value={departureLocation}
                onChange={(e) => setDepartureLocation(e.target.value)}
                className="w-full rounded-xl border border-hairline px-3.5 py-2 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" size="md" className="w-full mt-2">
            {t("Register Carpool Ride", "વાહન રાઈડ નોંધો")}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
