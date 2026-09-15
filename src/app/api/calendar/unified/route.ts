import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  ThalSchedule,
  Sabha,
  Event,
  SevaOpportunity,
  TravelRide,
} from "@/models";
import {
  initialThalSchedules,
  initialSabhas,
  initialSevaOpportunities,
  initialTravelRides,
} from "@/lib/seedData";
import { resolveUserScope, findUserByIdentifier } from "@/lib/authScope";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || "2026-09";
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");

    const user = await findUserByIdentifier(userId || userName);
    const scope = resolveUserScope(user as any);

    const unifiedEvents: any[] = [];

    // 1. Thal Schedules
    const thalQuery: any = { date: { $regex: `^${month}` } };
    let thalList = await ThalSchedule.find(thalQuery).sort({ date: 1, mealType: 1 });
    if (!thalList || thalList.length === 0) {
      thalList = (initialThalSchedules as any[]).filter((t) => t.date.startsWith(month)) as any;
    }

    for (const thal of thalList) {
      const isMyFamily =
        scope.familyId &&
        (thal.assignedFamilyId === scope.familyId ||
          (user && user.familyName && thal.assignedFamilyName === user.familyName));

      const isCaptain = isMyFamily && scope.isThalCaptain;

      unifiedEvents.push({
        id: `THAL-${(thal as any)._id || thal.scheduleCode}`,
        category: "Thal",
        date: thal.date,
        time: thal.mealType.includes("Breakfast") ? "07:30 AM" : "06:30 PM",
        title: thal.mealType,
        gujaratiTitle: thal.mealType.includes("Breakfast") ? "સવાર સંધ્યા થાળ વારો" : "સાંજ સંધ્યા થાળ વારો",
        badge: isMyFamily ? "My Family Turn" : isCaptain ? "Captain Duty" : "Mandir Rotation",
        status: thal.status,
        isPersonal: Boolean(isMyFamily || scope.isAdmin),
        details: {
          family: thal.assignedFamilyName,
          phone: thal.assignedPhone,
          headcount: thal.headcount,
          instructions: thal.specialInstructions,
          swapRequested: thal.swapRequested,
        },
      });
    }

    // 2. Sabha Sessions
    const sabhaQuery: any = { date: { $regex: `^${month}` } };
    let sabhaList = await Sabha.find(sabhaQuery).sort({ date: 1 });
    if (!sabhaList || sabhaList.length === 0) {
      sabhaList = (initialSabhas as any[]).filter((s) => s.date.startsWith(month)) as any;
    }

    for (const sabha of sabhaList) {
      unifiedEvents.push({
        id: `SABHA-${(sabha as any)._id || sabha.sabhaCode}`,
        category: "Sabha",
        date: sabha.date,
        time: `${sabha.startTime} - ${sabha.endTime}`,
        title: sabha.title,
        gujaratiTitle: sabha.gujaratiTitle || "સત્સંગ સભા",
        badge: scope.isKaryakarta ? "Karyakarta Duty" : "Sabha Session",
        status: sabha.status,
        isPersonal: true,
        details: {
          type: sabha.type,
          location: sabha.location,
          expectedCount: sabha.expectedCount,
          presentCount: sabha.presentCount,
          checklistCount: (sabha.checklist || []).length,
        },
      });
    }

    // 3. Mahotsav & Mandir Events
    const eventQuery: any = { date: { $regex: `^${month}` } };
    let eventsList = await Event.find(eventQuery).sort({ date: 1 });

    for (const evt of eventsList) {
      unifiedEvents.push({
        id: `EVT-${(evt as any)._id || evt.eventCode}`,
        category: "Event",
        date: evt.date,
        time: "09:00 AM - 09:00 PM",
        title: evt.title,
        gujaratiTitle: evt.gujaratiTitle || "મંદિર મહોત્સવ",
        badge: "Mandir Mahotsav",
        status: evt.status,
        isPersonal: true,
        details: {
          location: evt.location,
          capacity: evt.capacity,
          registeredCount: evt.registeredCount,
          description: evt.description,
        },
      });
    }

    // 4. Seva Opportunities
    const sevaQuery: any = { date: { $regex: `^${month}` } };
    let sevaList = await SevaOpportunity.find(sevaQuery).sort({ date: 1 });
    if (!sevaList || sevaList.length === 0) {
      sevaList = (initialSevaOpportunities as any[]).filter((s) => s.date && s.date.startsWith(month)) as any;
    }

    for (const seva of sevaList) {
      const isClaimedByMe = (seva.volunteers || []).some(
        (v: any) => v.memberId === scope.memberId || (user && v.phone === user.phone)
      );

      unifiedEvents.push({
        id: `SEVA-${(seva as any)._id || "01"}`,
        category: "Seva",
        date: seva.date || `${month}-15`,
        time: seva.startTime ? `${seva.startTime} - ${seva.endTime}` : seva.timeCommitment || "07:00 AM - 10:00 AM",
        title: seva.title,
        gujaratiTitle: seva.gujaratiTitle || "મંદિર સેવા",
        badge: isClaimedByMe ? "My Seva Shift" : "Open Volunteer Slot",
        status: seva.status,
        isPersonal: Boolean(isClaimedByMe || scope.isAdmin),
        details: {
          department: seva.department,
          location: seva.location,
          slots: `${seva.acceptedVolunteerCount || seva.filledSlots || 0}/${seva.requiredVolunteerCount || seva.totalSlots || 5}`,
          leadName: seva.leadName,
        },
      });
    }

    // 5. Carpool Rides
    let rideList = await TravelRide.find({ status: { $in: ["Scheduled", "Full"] } });
    if (!rideList || rideList.length === 0) {
      rideList = initialTravelRides as any;
    }

    for (const ride of rideList) {
      const isDriver = user && (ride.driverMemberId === scope.memberId || ride.driverPhone === user.phone);
      const isPassenger = (ride.requests || []).some(
        (r: any) => r.passengerMemberId === scope.memberId || (user && r.passengerPhone === user.phone)
      );

      unifiedEvents.push({
        id: `RIDE-${(ride as any)._id || ride.rideCode}`,
        category: "Carpool",
        date: `${month}-13`, // Standard weekly sabha ride
        time: ride.departureTime,
        title: ride.title,
        gujaratiTitle: ride.gujaratiTitle || "કારપૂલ યાત્રા",
        badge: isDriver ? "My Vehicle (Driver)" : isPassenger ? "Booked Passenger" : "Available Carpool",
        status: ride.status,
        isPersonal: Boolean(isDriver || isPassenger || scope.isAdmin),
        details: {
          driverName: ride.driverName,
          vehicle: `${ride.vehicleModel} (${ride.vehicleNumber})`,
          seatsAvailable: ride.availableSeats,
          pickup: ride.departureLocation,
          destination: ride.destination,
        },
      });
    }

    // Sort unified calendar chronologically
    unifiedEvents.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

    return NextResponse.json({
      success: true,
      month,
      count: unifiedEvents.length,
      events: unifiedEvents,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
