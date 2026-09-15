import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FollowUpCase, AuditLog } from "@/models";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const {
      authorId,
      authorName = "Karyakarta",
      date = new Date().toISOString(),
      type = "Home Visit",
      note,
      isConfidential = true,
      status,
      newStatus,
    } = body;

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note text is required." },
        { status: 400 }
      );
    }

    let followUpCase = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      followUpCase = await FollowUpCase.findById(id);
    }
    if (!followUpCase) {
      followUpCase = await FollowUpCase.findOne({ caseCode: id });
    }

    if (!followUpCase) {
      return NextResponse.json(
        { success: false, error: "Follow-up case not found." },
        { status: 404 }
      );
    }

    followUpCase.confidentialNotes.push({
      authorName: `${authorName}${type ? ` (${type})` : ""}`,
      note,
      createdAt: date ? new Date(date) : new Date(),
    });

    const targetStatus = newStatus || status;
    if (targetStatus && ["Open", "Visit Planned", "Pending Approval", "Closed"].includes(targetStatus)) {
      followUpCase.status = targetStatus;
    } else if (followUpCase.status === "Open") {
      followUpCase.status = "Visit Planned";
    }

    await followUpCase.save();

    await AuditLog.create({
      actorId: authorId || "usr-current",
      actorName: authorName,
      actorRole: "karyakarta",
      action: "ADD_CASE_NOTE",
      module: "Follow-Up",
      recordId: followUpCase._id.toString(),
      description: `Appended ${isConfidential ? "confidential " : ""}interaction note (${type}) to case ${followUpCase.caseCode}`,
    });

    return NextResponse.json({
      success: true,
      message: "Interaction note recorded successfully",
      case: followUpCase,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
