import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ThalSwapRequest, ThalSchedule, AuditLog } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const swapRequests = await ThalSwapRequest.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, swapRequests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      thalScheduleId,
      originalDate,
      mealType = "Breakfast (Morning Thal)",
      requestingFamilyId,
      requestingFamilyName,
      swapType = "admin_open_swap",
      targetFamilyId,
      targetFamilyName,
      suggestedDate,
      reason,
    } = body;

    if (!thalScheduleId || !reason || !requestingFamilyName) {
      return NextResponse.json(
        { success: false, error: "Schedule ID, Requesting Family, and Reason are required." },
        { status: 400 }
      );
    }

    const swap = await ThalSwapRequest.create({
      thalScheduleId,
      originalDate,
      mealType,
      requestingFamilyId: requestingFamilyId || "unassigned",
      requestingFamilyName,
      swapType,
      targetFamilyId,
      targetFamilyName,
      suggestedDate,
      reason,
      status: "Pending Coordinator",
    });

    await ThalSchedule.findByIdAndUpdate(thalScheduleId, { swapRequested: true, declineReason: reason });

    return NextResponse.json({
      success: true,
      message: swapType === "family_to_family" 
        ? `Swap request sent to ${targetFamilyName} & Coordinator` 
        : "Swap request submitted to Mandir Admin",
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
    const { swapId, action = "approve", coordinatorNotes, replacementFamilyName, replacementPhone } = body;

    const swap = await ThalSwapRequest.findById(swapId);
    if (!swap) {
      return NextResponse.json({ success: false, error: "Swap request not found" }, { status: 404 });
    }

    if (action === "approve") {
      swap.status = "Approved";
      swap.coordinatorNotes = coordinatorNotes || "Swap approved by Thal Coordinator.";
      await swap.save();

      // If targetFamilyName or replacementFamilyName specified, reassign original schedule
      const newFamily = replacementFamilyName || swap.targetFamilyName;
      if (newFamily) {
        await ThalSchedule.findByIdAndUpdate(swap.thalScheduleId, {
          assignedFamilyName: newFamily,
          assignedPhone: replacementPhone || "9825000000",
          status: "Assigned",
          swapRequested: false,
          declineReason: undefined,
        });
      }
    } else {
      swap.status = "Rejected";
      swap.coordinatorNotes = coordinatorNotes || "Swap request declined.";
      await swap.save();
      await ThalSchedule.findByIdAndUpdate(swap.thalScheduleId, { swapRequested: false });
    }

    return NextResponse.json({ success: true, message: `Swap request ${swap.status}`, swap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
