import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Family, Member, FollowUpCase, ThalSchedule, AuditLog } from "@/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const family = await Family.findById(id);
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 });
    }

    const [members, followUpCases, thalHistory, auditLogs] = await Promise.all([
      Member.find({ familyId: id }),
      FollowUpCase.find({ familyId: id }),
      ThalSchedule.find({ assignedFamilyName: family.name }),
      AuditLog.find({ recordId: id }).sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({
      success: true,
      family,
      members,
      followUpCases,
      thalHistory,
      auditLogs,
    });
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

    const updated = await Family.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 });
    }

    await AuditLog.create({
      actorId: "usr-current",
      actorName: "Active User",
      actorRole: "karyakarta",
      action: "UPDATE_FAMILY",
      module: "Families",
      recordId: id,
      description: `Updated profile details for family: ${updated.name}`,
    });

    return NextResponse.json({ success: true, family: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { interactionType, notes, requiresFollowUp, urgency, category } = body;

    const family = await Family.findById(id);
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 });
    }

    // Update last interaction
    family.lastInteractionAt = new Date();
    if (notes) {
      family.notes = `${new Date().toLocaleDateString("en-IN")}: [${interactionType || "Visit"}] ${notes}\n${family.notes || ""}`;
    }
    await family.save();

    // Create follow-up case if requested
    let newCase = null;
    if (requiresFollowUp) {
      const caseCount = await FollowUpCase.countDocuments();
      newCase = await FollowUpCase.create({
        caseCode: `CASE-NAD-${String(caseCount + 101)}`,
        familyId: id,
        familyName: family.name,
        category: category || "Extended Absence",
        urgency: urgency || "Due Today",
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        assignedKaryakartaId: "karyakarta-jaimin",
        assignedKaryakartaName: "Jaimin Trivedi",
        status: "Open",
        confidentialNotes: [
          {
            authorName: "Jaimin Trivedi",
            note: notes || "Follow-up triggered from field interaction.",
            createdAt: new Date(),
          },
        ],
      });
    }

    await AuditLog.create({
      actorId: "usr-current",
      actorName: "Active User",
      actorRole: "karyakarta",
      action: "LOG_INTERACTION",
      module: "Families",
      recordId: id,
      description: `Logged [${interactionType || "Interaction"}] for ${family.name}. ${requiresFollowUp ? "Follow-up case opened." : ""}`,
    });

    return NextResponse.json({
      success: true,
      message: "Interaction logged successfully",
      family,
      followUpCase: newCase,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
