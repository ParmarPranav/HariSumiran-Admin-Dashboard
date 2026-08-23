import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FollowUpCase, AuditLog } from "@/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const followUpCase = await FollowUpCase.findById(id);
    if (!followUpCase) {
      return NextResponse.json({ success: false, error: "Follow-up case not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, case: followUpCase });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { action, note, authorName = "Jaimin Trivedi", visitPlan, closureReason, approvedBy } = body;

    const followUpCase = await FollowUpCase.findById(id);
    if (!followUpCase) {
      return NextResponse.json({ success: false, error: "Follow-up case not found" }, { status: 404 });
    }

    if (action === "add_note" && note) {
      followUpCase.confidentialNotes.push({
        authorName,
        note,
        createdAt: new Date(),
      });
      await followUpCase.save();
    } else if (action === "plan_visit" && visitPlan) {
      followUpCase.visitPlan = visitPlan;
      followUpCase.status = "Visit Planned";
      await followUpCase.save();
    } else if (action === "request_closure") {
      followUpCase.status = "Pending Approval";
      followUpCase.closureReason = closureReason || "Issue resolved satisfactorily.";
      await followUpCase.save();
    } else if (action === "approve_closure") {
      followUpCase.status = "Closed";
      followUpCase.closureApprovedBy = approvedBy || "Nitinbhai Patel (Mandir Admin)";
      await followUpCase.save();
    } else {
      // General update
      Object.assign(followUpCase, body);
      await followUpCase.save();
    }

    await AuditLog.create({
      actorId: "usr-current",
      actorName: authorName,
      actorRole: "karyakarta",
      action: `UPDATE_CASE_${action || "GENERAL"}`,
      module: "Follow-Up",
      recordId: id,
      description: `Updated case ${followUpCase.caseCode} (${action || "edit"})`,
    });

    return NextResponse.json({ success: true, case: followUpCase });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
