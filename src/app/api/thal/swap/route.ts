import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ThalSwapRequest, ThalSchedule, ActionableNotification, AuditLog } from "@/models";
import { initialThalSwapRequests } from "@/lib/seedData";

export async function GET(req: Request) {
  try {
    await connectDB();
    let swapRequests = await ThalSwapRequest.find({}).sort({ createdAt: -1 });
    if (!swapRequests || swapRequests.length === 0) {
      swapRequests = initialThalSwapRequests as any;
    }
    return NextResponse.json({ success: true, swapRequests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const schedId = body.thalScheduleId || body.scheduleCode;
    const {
      originalDate,
      mealType = "Breakfast (Morning Thal)",
      requestingFamilyId,
      requestingFamilyName,
      requestingCaptainName = "Captain",
      swapType = "family_to_family",
      targetFamilyId,
      targetFamilyName,
      targetCaptainName,
      suggestedDate,
      reason,
    } = body;

    if (!schedId || !reason || !requestingFamilyName) {
      return NextResponse.json(
        { success: false, error: "Schedule ID or Code, Requesting Family, and Reason are required." },
        { status: 400 }
      );
    }

    const initialStatus = swapType === "family_to_family" ? "Pending Target Captain" : "Pending Admin Approval";

    const swap = await ThalSwapRequest.create({
      thalScheduleId: schedId,
      originalDate: originalDate || new Date().toISOString().split("T")[0],
      mealType,
      requestingFamilyId: requestingFamilyId || "unassigned",
      requestingFamilyName,
      requestingCaptainName,
      swapType,
      targetFamilyId,
      targetFamilyName,
      targetCaptainName,
      targetCaptainDecision: "Pending",
      suggestedDate,
      reason,
      status: initialStatus,
    });

    if (schedId) {
      await ThalSchedule.findOneAndUpdate(
        { $or: [{ _id: schedId }, { scheduleCode: schedId }] },
        { swapRequested: true, declineReason: reason }
      ).catch(() => null);
    }

    // Create Actionable Notification for Target Captain or Admin
    if (swapType === "family_to_family" && targetFamilyName) {
      await ActionableNotification.create({
        recipientRole: "thal_captain",
        title: "Thal Swap Request Received",
        gujaratiTitle: "થાળ બદલી માટે વિનંતી મળી",
        message: `${requestingFamilyName} requested a Thal swap with your household for ${mealType} on ${originalDate}. Reason: ${reason}`,
        gujaratiMessage: `${requestingFamilyName} એ ${originalDate} માટે થાળ બદલીની વિનંતી કરી છે. કારણ: ${reason}`,
        category: "thal_swap",
        actionType: "SWAP_ACCEPT_REJECT",
        actionPayload: { swapId: swap._id.toString(), scheduleId: schedId },
      });
    } else {
      await ActionableNotification.create({
        recipientRole: "mandir_admin",
        title: "New Thal Swap Request (Open Pool)",
        gujaratiTitle: "થાળ બદલી માટે નવી વિનંતી (એડમિન પુલ)",
        message: `${requestingFamilyName} placed ${mealType} on ${originalDate} into open swap pool. Reason: ${reason}`,
        category: "thal_swap",
        actionType: "SWAP_ACCEPT_REJECT",
        actionPayload: { swapId: swap._id.toString(), scheduleId: schedId },
      });
    }

    return NextResponse.json({
      success: true,
      message: swapType === "family_to_family"
        ? `Swap request sent to ${targetFamilyName}. Pending target captain acceptance.`
        : "Swap request placed in open pool for Mandir Admin approval.",
      swap,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      swapId,
      action, // "target_accept" | "target_reject" | "admin_approve" | "admin_reject" | "admin_override"
      adminNotes,
      overrideFamilyId,
      overrideFamilyName,
      overridePhone,
    } = body;

    const swap = await ThalSwapRequest.findById(swapId);
    if (!swap) {
      return NextResponse.json({ success: false, error: "Swap request not found" }, { status: 404 });
    }

    // Step 2: Target Captain Decision
    if (action === "target_accept") {
      swap.targetCaptainDecision = "Accepted";
      swap.targetCaptainDecidedAt = new Date();
      swap.status = "Pending Admin Approval";
      await swap.save();

      // Notify Admin
      await ActionableNotification.create({
        recipientRole: "mandir_admin",
        title: "Thal Swap Agreed by Target Captain - Ready for Approval",
        gujaratiTitle: "થાળ બદલી બંને પરિવારે સ્વીકારી - એડમિન મંજૂરી બાકી",
        message: `${swap.targetFamilyName} agreed to swap with ${swap.requestingFamilyName} on ${swap.originalDate}.`,
        category: "thal_swap",
        actionType: "VIEW_LINK",
      });

      return NextResponse.json({ success: true, message: "Target Captain accepted. Sent to Admin for final approval.", swap });
    }

    if (action === "target_reject") {
      swap.targetCaptainDecision = "Rejected";
      swap.targetCaptainDecidedAt = new Date();
      swap.status = "Rejected";
      await swap.save();
      await ThalSchedule.findByIdAndUpdate(swap.thalScheduleId, { swapRequested: false });

      return NextResponse.json({ success: true, message: "Swap request was declined by target captain.", swap });
    }

    // Step 3: Admin Final Approval / Rejection / Override
    if (action === "admin_approve") {
      swap.status = "Approved";
      swap.adminNotes = adminNotes || "Approved by Mandir Administrator";
      await swap.save();

      // Automatically reassign schedule to Target Family
      if (swap.targetFamilyName) {
        await ThalSchedule.findByIdAndUpdate(swap.thalScheduleId, {
          assignedFamilyName: swap.targetFamilyName,
          assignedFamilyId: swap.targetFamilyId || "reassigned",
          status: "Confirmed",
          swapRequested: false,
          declineReason: undefined,
        });
      }

      return NextResponse.json({ success: true, message: "Swap approved and schedule updated automatically!", swap });
    }

    if (action === "admin_override") {
      swap.status = "Overridden";
      swap.adminNotes = adminNotes || `Admin reassigned to ${overrideFamilyName}`;
      await swap.save();

      if (overrideFamilyName) {
        await ThalSchedule.findByIdAndUpdate(swap.thalScheduleId, {
          assignedFamilyName: overrideFamilyName,
          assignedFamilyId: overrideFamilyId || "override",
          assignedPhone: overridePhone || "9825000000",
          status: "Assigned",
          swapRequested: false,
        });
      }

      return NextResponse.json({ success: true, message: `Thal reassigned to ${overrideFamilyName}.`, swap });
    }

    if (action === "admin_reject") {
      swap.status = "Rejected";
      swap.adminNotes = adminNotes || "Rejected by Administrator";
      await swap.save();
      await ThalSchedule.findByIdAndUpdate(swap.thalScheduleId, { swapRequested: false });

      return NextResponse.json({ success: true, message: "Swap rejected by admin.", swap });
    }

    return NextResponse.json({ success: false, error: "Invalid action parameter" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
