import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ThalSwapRequest, ThalSchedule, ActionableNotification, Family } from "@/models";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const {
      action, // "approve" | "admin_approve" | "reject" | "admin_reject" | "override" | "admin_override"
      adminNotes,
      overrideFamilyId,
      overrideFamilyName,
      overridePhone,
    } = body;

    const swap = await ThalSwapRequest.findById(id);
    if (!swap) {
      return NextResponse.json({ success: false, error: "Thal swap request not found." }, { status: 404 });
    }

    const normAction = (action || "").toLowerCase();

    // 1. Admin Approve
    if (normAction === "approve" || normAction === "admin_approve") {
      swap.status = "Approved";
      swap.adminNotes = adminNotes || "Approved by Mandir Administrator";
      await swap.save();

      // Automatically reassign schedule to Target Family
      if (swap.targetFamilyName || swap.targetFamilyId) {
        let tPhone = "9825000000";
        if (swap.targetFamilyId) {
          const tFam = await Family.findById(swap.targetFamilyId);
          if (tFam && tFam.phone) tPhone = tFam.phone;
        }

        await ThalSchedule.findOneAndUpdate(
          { $or: [{ _id: swap.thalScheduleId }, { scheduleCode: swap.thalScheduleId }] },
          {
            assignedFamilyName: swap.targetFamilyName,
            assignedFamilyId: swap.targetFamilyId || "reassigned",
            assignedPhone: tPhone,
            status: "Confirmed",
            swapRequested: false,
            declineReason: undefined,
          }
        ).catch(() => null);
      }

      return NextResponse.json({
        success: true,
        message: "Swap approved and schedule updated automatically!",
        status: "Approved",
        swap,
      });
    }

    // 2. Admin Override / Reassign
    if (normAction === "override" || normAction === "admin_override") {
      let resolvedOverrideName = overrideFamilyName;
      let resolvedOverridePhone = overridePhone || "9825000000";

      if (overrideFamilyId) {
        const oFam = await Family.findById(overrideFamilyId);
        if (oFam) {
          resolvedOverrideName = resolvedOverrideName || oFam.name;
          resolvedOverridePhone = oFam.phone || resolvedOverridePhone;
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
            assignedPhone: resolvedOverridePhone,
            status: "Assigned",
            swapRequested: false,
          }
        ).catch(() => null);
      }

      return NextResponse.json({
        success: true,
        message: `Thal reassigned to ${resolvedOverrideName}.`,
        status: "Overridden",
        swap,
      });
    }

    // 3. Admin Reject
    if (normAction === "reject" || normAction === "admin_reject") {
      swap.status = "Rejected";
      swap.adminNotes = adminNotes || "Rejected by Mandir Administrator";
      await swap.save();

      await ThalSchedule.findOneAndUpdate(
        { $or: [{ _id: swap.thalScheduleId }, { scheduleCode: swap.thalScheduleId }] },
        { swapRequested: false }
      ).catch(() => null);

      return NextResponse.json({
        success: true,
        message: "Swap rejected by administrator.",
        status: "Rejected",
        swap,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action. Use 'approve', 'reject', or 'override'." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
