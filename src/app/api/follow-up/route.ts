import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FollowUpCase, Family, AuditLog } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const urgency = searchParams.get("urgency");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const query: any = {};
    if (urgency && urgency !== "All") query.urgency = urgency;
    if (status && status !== "All") query.status = status;
    if (category && category !== "All") query.category = category;

    const cases = await FollowUpCase.find(query).sort({ urgency: 1, dueDate: 1 });
    return NextResponse.json({ success: true, count: cases.length, cases });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      familyId,
      familyName,
      category = "Extended Absence",
      urgency = "Due Today",
      dueDate,
      assignedKaryakartaId = "karyakarta-jaimin",
      assignedKaryakartaName = "Jaimin Trivedi",
      initialNote,
    } = body;

    if (!familyName || !dueDate) {
      return NextResponse.json({ success: false, error: "Family Name and Due Date are required." }, { status: 400 });
    }

    const count = await FollowUpCase.countDocuments();
    const caseCode = `CASE-NAD-${String(count + 101)}`;

    const newCase = await FollowUpCase.create({
      caseCode,
      familyId: familyId || "unassigned",
      familyName,
      category,
      urgency,
      dueDate,
      assignedKaryakartaId,
      assignedKaryakartaName,
      status: "Open",
      confidentialNotes: initialNote
        ? [
            {
              authorName: assignedKaryakartaName,
              note: initialNote,
              createdAt: new Date(),
            },
          ]
        : [],
    });

    await AuditLog.create({
      actorId: assignedKaryakartaId,
      actorName: assignedKaryakartaName,
      actorRole: "karyakarta",
      action: "CREATE_FOLLOW_UP_CASE",
      module: "Follow-Up",
      recordId: newCase._id.toString(),
      description: `Created follow-up case ${caseCode} for ${familyName} (${category})`,
    });

    return NextResponse.json({ success: true, message: "Follow-up case opened successfully", case: newCase });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
