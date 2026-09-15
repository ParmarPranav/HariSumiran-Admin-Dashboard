import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ThalSwapRequest, ThalSchedule, ActionableNotification, Family } from "@/models";
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
    let {
      originalDate,
      mealType,
      requesterFamilyId,
      requestingFamilyId,
      requestingFamilyName,
      requestingCaptainName,
      swapTargetType,
      swapType,
      targetFamilyId,
      targetFamilyName,
      targetCaptainName,
      suggestedDate,
      reason,
    } = body;

    const reqFamilyId = requesterFamilyId || requestingFamilyId;
    let resolvedSwapType = swapType || (swapTargetType === "AdminPool" ? "admin_open_swap" : "family_to_family");

    if (!schedId || !reason) {
      return NextResponse.json(
        { success: false, error: "Thal Schedule ID/Code and Reason are required for swap request." },
        { status: 400 }
      );
    }

    // Auto-resolve schedule details if missing
    let schedule = null;
    if (schedId.match(/^[0-9a-fA-F]{24}$/)) {
      schedule = await ThalSchedule.findById(schedId);
    }
    if (!schedule) {
      schedule = await ThalSchedule.findOne({ scheduleCode: schedId });
    }

    if (schedule) {
      originalDate = originalDate || schedule.date;
      mealType = mealType || schedule.mealType;
      requestingFamilyName = requestingFamilyName || schedule.assignedFamilyName;
      requestingCaptainName = requestingCaptainName || schedule.captainName || "Captain";
    }

    // Auto-resolve requesting family
    if (reqFamilyId && !requestingFamilyName) {
      const rFam = await Family.findById(reqFamilyId);
      if (rFam) {
        requestingFamilyName = rFam.name;
        requestingCaptainName = requestingCaptainName || rFam.captainName;
      }
    }

    // Auto-resolve target family
    if (targetFamilyId && !targetFamilyName) {
      const tFam = await Family.findById(targetFamilyId);
      if (tFam) {
        targetFamilyName = tFam.name;
        targetCaptainName = targetCaptainName || tFam.captainName;
      }
    }

    if (!requestingFamilyName) {
      requestingFamilyName = "Household Devotee";
    }

    const initialStatus = resolvedSwapType === "family_to_family" && targetFamilyName
      ? "Pending Target Captain"
      : "Pending Admin Approval";

    const swap = await ThalSwapRequest.create({
      thalScheduleId: schedId,
      originalDate: originalDate || new Date().toISOString().split("T")[0],
      mealType: mealType || "Breakfast (Morning Thal)",
      requestingFamilyId: reqFamilyId || "unassigned",
      requestingFamilyName,
      requestingCaptainName: requestingCaptainName || "Captain",
      swapType: resolvedSwapType,
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
    if (resolvedSwapType === "family_to_family" && targetFamilyName) {
      await ActionableNotification.create({
        recipientRole: "thal_captain",
        title: "Thal Swap Request Received",
        gujaratiTitle: "થાળ બદલી માટે વિનંતી મળી",
        message: `${requestingFamilyName} requested a Thal swap with your household for ${mealType || "Thal"} on ${originalDate}. Reason: ${reason}`,
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
        message: `${requestingFamilyName} placed ${mealType || "Thal"} on ${originalDate} into open swap pool. Reason: ${reason}`,
        category: "thal_swap",
        actionType: "SWAP_ACCEPT_REJECT",
        actionPayload: { swapId: swap._id.toString(), scheduleId: schedId },
      });
    }

    return NextResponse.json({
      success: true,
      message: resolvedSwapType === "family_to_family" && targetFamilyName
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
      await ThalSchedule.findByIdAndUpdate(swap.thalScheduleId, { swapRequested: false }).catch(() => null);

      return NextResponse.json({ success: true, message: "Swap request was declined by target captain.", swap });
    }

    // Step 3: Admin Final Approval / Rejection / Override
    if (action === "admin_approve") {
      swap.status = "Approved";
      swap.adminNotes = adminNotes || "Approved by Mandir Administrator";
      await swap.save();

      if (swap.targetFamilyName || swap.targetFamilyId) {
        await ThalSchedule.findOneAndUpdate(
          { $or: [{ _id: swap.thalScheduleId }, { scheduleCode: swap.thalScheduleId }] },
          {
            assignedFamilyName: swap.targetFamilyName,
            assignedFamilyId: swap.targetFamilyId || "reassigned",
            status: "Confirmed",
            swapRequested: false,
            declineReason: undefined,
          }
        ).catch(() => null);
      }

      return NextResponse.json({ success: true, message: "Swap approved and schedule updated automatically!", swap });
    }

    if (action === "admin_override") {
      let resolvedOverrideName = overrideFamilyName;
      let resolvedPhone = overridePhone || "9825000000";

      if (overrideFamilyId) {
        const oFam = await Family.findById(overrideFamilyId);
        if (oFam) {
          resolvedOverrideName = resolvedOverrideName || oFam.name;
          resolvedPhone = oFam.phone || resolvedPhone;
        }
      }

      swap.status = "Overridden";
      swap.adminNotes = adminNotes || `Admin reassigned to ${resolvedOverrideName}`;
      await swap.save();

      if (resolvedOverrideName) {
        await ThalSchedule.findOneAndUpdate(
          { $or: [{ _id: swap.thalScheduleId }, { scheduleCode: swap.thalScheduleId }] },
          {
            assignedFamilyName: resolvedOverrideName,
            assignedFamilyId: overrideFamilyId || "override",
            assignedPhone: resolvedPhone,
            status: "Assigned",
            swapRequested: false,
          }
        ).catch(() => null);
      }

      return NextResponse.json({ success: true, message: `Thal reassigned to ${resolvedOverrideName}.`, swap });
    }

    if (action === "admin_reject") {
      swap.status = "Rejected";
      swap.adminNotes = adminNotes || "Rejected by Administrator";
      await swap.save();
      await ThalSchedule.findOneAndUpdate(
        { $or: [{ _id: swap.thalScheduleId }, { scheduleCode: swap.thalScheduleId }] },
        { swapRequested: false }
      ).catch(() => null);

      return NextResponse.json({ success: true, message: "Swap rejected by admin.", swap });
    }

    return NextResponse.json({ success: false, error: "Invalid action parameter" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
