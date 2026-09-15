import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ThalSwapRequest, ThalSchedule, ActionableNotification } from "@/models";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { decision, action, notes } = body;

    const isAccept = decision === "Accepted" || action === "target_accept" || action === "accept";
    const isReject = decision === "Rejected" || action === "target_reject" || action === "reject";

    if (!isAccept && !isReject) {
      return NextResponse.json(
        { success: false, error: "Valid decision ('Accepted' or 'Rejected') is required." },
        { status: 400 }
      );
    }

    const swap = await ThalSwapRequest.findById(id);
    if (!swap) {
      return NextResponse.json({ success: false, error: "Thal swap request not found" }, { status: 404 });
    }

    if (isAccept) {
      swap.targetCaptainDecision = "Accepted";
      swap.targetCaptainDecidedAt = new Date();
      swap.status = "Pending Admin Approval";
      if (notes) swap.reason = `${swap.reason} | Target Note: ${notes}`;
      await swap.save();

      await ActionableNotification.create({
        recipientRole: "mandir_admin",
        title: "Thal Swap Agreed by Target Captain - Ready for Approval",
        gujaratiTitle: "થાળ બદલી બંને પરિવારે સ્વીકારી - એડમિન મંજૂરી બાકી",
        message: `${swap.targetFamilyName} agreed to swap with ${swap.requestingFamilyName} on ${swap.originalDate}.`,
        category: "thal_swap",
        actionType: "VIEW_LINK",
      });

      return NextResponse.json({
        success: true,
        message: "Target Captain accepted. Sent to Mandir Admin for final approval.",
        swap,
      });
    }

    if (isReject) {
      swap.targetCaptainDecision = "Rejected";
      swap.targetCaptainDecidedAt = new Date();
      swap.status = "Rejected";
      await swap.save();

      await ThalSchedule.findByIdAndUpdate(swap.thalScheduleId, { swapRequested: false }).catch(() => null);

      return NextResponse.json({
        success: true,
        message: "Swap request was declined by target captain.",
        swap,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
