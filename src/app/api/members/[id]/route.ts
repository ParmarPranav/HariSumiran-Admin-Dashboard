import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Member, SabhaAttendance, SevaRoster, AuditLog } from "@/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const member = await Member.findById(id);
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    const [attendanceHistory, sevaHistory] = await Promise.all([
      SabhaAttendance.find({ memberId: id }).sort({ markedAt: -1 }),
      SevaRoster.find({ volunteerId: id }).sort({ date: -1 }),
    ]);

    return NextResponse.json({
      success: true,
      member,
      attendanceHistory,
      sevaHistory,
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

    const updated = await Member.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    await AuditLog.create({
      actorId: "usr-current",
      actorName: "Active User",
      actorRole: "karyakarta",
      action: "UPDATE_MEMBER",
      module: "Members",
      recordId: id,
      description: `Updated member profile: ${updated.name}`,
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
