import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  Sabha,
  Event,
  ThalSchedule,
  ThalSwapRequest,
  SevaOpportunity,
  FollowUpCase,
  TravelRide,
  Announcement,
  User,
} from "@/models";
import {
  initialSabhas,
  initialThalSchedules,
  initialThalSwapRequests,
  initialSevaOpportunities,
  initialFollowUpCases,
  initialTravelRides,
} from "@/lib/seedData";
import { resolveUserScope, findUserByIdentifier } from "@/lib/authScope";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");

    await connectDB();

    const user = await findUserByIdentifier(userId || userName);
    const scope = resolveUserScope(user as any);

    // 1. What is Happening?
    let upcomingSabhas = await Sabha.find({ status: { $in: ["Scheduled", "Live"] } })
      .sort({ date: 1 })
      .limit(3);
    if (!upcomingSabhas || upcomingSabhas.length === 0) {
      upcomingSabhas = initialSabhas as any;
    }

    let upcomingEvents = await Event.find({ status: { $in: ["Planning", "Live"] } })
      .sort({ date: 1 })
      .limit(2);

    let activeRides = await TravelRide.find({ status: "Scheduled" }).limit(2);
    if (!activeRides || activeRides.length === 0) {
      activeRides = initialTravelRides as any;
    }

    let announcements = await Announcement.find({ status: "Sent" }).sort({ createdAt: -1 }).limit(3);

    // 2. What do I need to do? (Action Items)
    const actionItems: any[] = [];

    // Check Thal turn for user's family
    if (scope.familyId) {
      const familyThal = await ThalSchedule.findOne({
        assignedFamilyId: scope.familyId,
        status: { $in: ["Assigned", "Confirmed"] },
      });
      if (familyThal) {
        actionItems.push({
          id: "action-thal",
          type: "thal",
          title: "Your Household Thal Turn",
          gujaratiTitle: "તમારા પરિવારનો થાળ વારો",
          description: `${familyThal.mealType} on ${familyThal.date} (Headcount: ${familyThal.headcount})`,
          link: "/thal",
          urgency: "High",
          badge: familyThal.status,
          itemData: familyThal,
        });
      }
    }

    // Check Pending Thal Swap Requests (if Captain or Admin)
    if (scope.isThalCaptain || scope.isAdmin) {
      const pendingSwaps = await ThalSwapRequest.find({
        status: scope.isAdmin ? "Pending Admin Approval" : "Pending Target Captain",
      });
      for (const swap of pendingSwaps.length > 0 ? pendingSwaps : (initialThalSwapRequests as any)) {
        actionItems.push({
          id: `action-swap-${(swap as any)._id || "01"}`,
          type: "thal_swap",
          title: "Pending Thal Swap Review",
          gujaratiTitle: "થાળ બદલી વિનંતી સમીક્ષા",
          description: `From ${(swap as any).requestingFamilyName} for ${(swap as any).originalDate} (${(swap as any).mealType})`,
          link: "/thal",
          urgency: "Medium",
          badge: "Action Required",
          itemData: swap,
        });
      }
    }

    // Check Karyakarta Follow-ups
    if (scope.isKaryakarta || scope.isAdmin) {
      const followUps = await FollowUpCase.find({ status: "Open" }).limit(3);
      const list = followUps.length > 0 ? followUps : (initialFollowUpCases as any);
      for (const fu of list) {
        actionItems.push({
          id: `action-fu-${(fu as any)._id || (fu as any).caseCode}`,
          type: "followup",
          title: `Follow-up Due: ${(fu as any).familyName}`,
          gujaratiTitle: `ફોલો-અપ: ${(fu as any).familyName}`,
          description: `Category: ${(fu as any).category} &bull; Urgency: ${(fu as any).urgency}`,
          link: "/follow-up",
          urgency: (fu as any).urgency === "Overdue" ? "Critical" : "High",
          badge: (fu as any).urgency,
          itemData: fu,
        });
      }
    }

    // Check Car Owner Pending Passenger Requests
    if (scope.isCarOwner || scope.isAdmin) {
      for (const ride of activeRides) {
        const pendingReqs = (ride.requests || []).filter((r: any) => r.status === "Pending");
        for (const req of pendingReqs) {
          actionItems.push({
            id: `action-ride-${req.requestId}`,
            type: "ride_request",
            title: `Seat Request: ${req.passengerName}`,
            gujaratiTitle: `રાઈડ વિનંતી: ${req.passengerName}`,
            description: `Pickup at ${req.pickupPoint} (${req.seatsRequested} seat) for ${ride.title}`,
            link: "/travel",
            urgency: "Medium",
            badge: "Ride Request",
            itemData: req,
          });
        }
      }
    }

    // Check Main Cook Cooking Preparation Task
    if (scope.isMainCook || scope.isAdmin) {
      actionItems.push({
        id: "action-kitchen-prep",
        type: "kitchen",
        title: "Sunday Mahaprasad Preparation Check",
        gujaratiTitle: "રવિવાર મહાપ્રસાદ રસોઈ તૈયારી",
        description: "Verify ingredient scaling and volunteer check-in for 200 devotees.",
        link: "/kitchen",
        urgency: "High",
        badge: "Kitchen Lead",
      });
    }

    // 3. Where Can I Help? (Open Seva Opportunities)
    let openSeva = await SevaOpportunity.find({ status: "Open" }).limit(4);
    if (!openSeva || openSeva.length === 0) {
      openSeva = initialSevaOpportunities as any;
    }

    return NextResponse.json({
      success: true,
      whatIsHappening: {
        upcomingSabhas,
        upcomingEvents,
        activeRides,
        announcements,
      },
      whatDoINeedToDo: actionItems,
      whereCanIHelp: openSeva,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
