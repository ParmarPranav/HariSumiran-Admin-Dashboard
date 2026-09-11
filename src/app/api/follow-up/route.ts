import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FollowUpCase, Family, User, AuditLog } from "@/models";
import { resolveUserScope, buildFollowUpScopeFilter, findUserByIdentifier } from "@/lib/authScope";
import { initialFollowUpCases } from "@/lib/seedData";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const urgency = searchParams.get("urgency");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const user = await findUserByIdentifier(userId);
    const scope = resolveUserScope(user as any);

    const query: any = {};
    if (category && category !== "All") query.category = category;
    if (urgency && urgency !== "All") query.urgency = urgency;
    if (status && status !== "All") query.status = status;

    const scopedFilter = buildFollowUpScopeFilter(scope, query);
    let cases = await FollowUpCase.find(scopedFilter).sort({ dueDate: 1, createdAt: -1 });

    if (!cases || cases.length === 0) {
      cases = initialFollowUpCases as any;
    }

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
      memberId,
      memberName,
      zone = "North Nadiad",
      category = "Extended Absence",
      urgency = "Due Today",
      dueDate,
      assignedKaryakartaId = "karyakarta-01",
      assignedKaryakartaName = "Jaimin Trivedi",
      initialNote,
    } = body;

    if (!familyId || !familyName || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Family, Family Name, and Due Date are required." },
        { status: 400 }
      );
    }

    const count = await FollowUpCase.countDocuments();
    const caseCode = `CASE-NAD-${String(count + 101).padStart(3, "0")}`;

    const newCase = await FollowUpCase.create({
      caseCode,
      familyId,
      familyName,
      memberId,
      memberName,
      zone,
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

    return NextResponse.json({
      success: true,
      message: `Follow-up case created: ${caseCode}`,
      case: newCase,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { caseId, action, note, authorName = "Karyakarta", visitDate, visitTime, coVisitor, status } = body;

    const followUp = await FollowUpCase.findById(caseId);
    if (!followUp) {
      return NextResponse.json({ success: false, error: "Follow-up case not found" }, { status: 404 });
    }

    if (action === "add_note" && note) {
      followUp.confidentialNotes.push({
        authorName,
        note,
        createdAt: new Date(),
      });
      await followUp.save();
      return NextResponse.json({ success: true, message: "Confidential note added", case: followUp });
    }

    if (action === "plan_visit" && visitDate) {
      followUp.visitPlan = {
        date: visitDate,
        time: visitTime || "18:00",
        coVisitor,
      };
      followUp.status = "Visit Planned";
      await followUp.save();
      return NextResponse.json({ success: true, message: "Visit plan scheduled", case: followUp });
    }

    if (status) {
      followUp.status = status;
      await followUp.save();
      return NextResponse.json({ success: true, message: `Status updated to ${status}`, case: followUp });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
