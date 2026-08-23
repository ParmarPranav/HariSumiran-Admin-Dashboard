import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Sabha, SabhaAttendance, Member, AuditLog } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const sabhaId = searchParams.get("sabhaId");

    if (!sabhaId) {
      return NextResponse.json({ success: false, error: "sabhaId is required" }, { status: 400 });
    }

    const records = await SabhaAttendance.find({ sabhaId }).sort({ markedAt: -1 });
    const members = await Member.find({});

    const markedMemberIds = new Set(records.filter((r) => r.status === "Present").map((r) => r.memberId));

    const roster = members.map((m) => ({
      memberId: m._id.toString(),
      memberName: m.name,
      gujaratiName: m.gujaratiName,
      familyName: m.familyName,
      phone: m.phone,
      isPresent: markedMemberIds.has(m._id.toString()),
      attendanceStreak: m.attendanceStreak,
    }));

    return NextResponse.json({
      success: true,
      totalCount: members.length,
      presentCount: markedMemberIds.size,
      records,
      roster,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { sabhaId, memberId, memberCode, mode = "QR", markedBy = "Karyakarta" } = body;

    if (!sabhaId) {
      return NextResponse.json({ success: false, error: "sabhaId is required." }, { status: 400 });
    }

    let member = null;
    if (memberId) {
      member = await Member.findById(memberId);
    } else if (memberCode) {
      member = await Member.findOne({
        $or: [{ memberCode }, { phone: memberCode.replace(/\D/g, "") }, { name: { $regex: memberCode, $options: "i" } }],
      });
    }

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found with provided QR or Code." },
        { status: 404 }
      );
    }

    // Check if already marked
    let record = await SabhaAttendance.findOne({ sabhaId, memberId: member._id.toString() });

    if (record) {
      if (record.status === "Present") {
        return NextResponse.json({
          success: true,
          alreadyMarked: true,
          message: `${member.name} is already marked Present.`,
          record,
          member,
        });
      }
      record.status = "Present";
      record.markedAt = new Date();
      record.mode = mode;
      record.markedBy = markedBy;
      await record.save();
    } else {
      record = await SabhaAttendance.create({
        sabhaId,
        memberId: member._id.toString(),
        memberName: member.name,
        familyId: member.familyId,
        mode,
        status: "Present",
        markedAt: new Date(),
        markedBy,
      });
    }

    // Increment member attendance streak & sabha count
    member.attendanceStreak += 1;
    await member.save();

    const presentCount = await SabhaAttendance.countDocuments({ sabhaId, status: "Present" });
    await Sabha.findByIdAndUpdate(sabhaId, { presentCount, status: "Live" });

    return NextResponse.json({
      success: true,
      message: `Marked attendance for ${member.name}`,
      record,
      member: {
        id: member._id,
        name: member.name,
        familyName: member.familyName,
        streak: member.attendanceStreak,
      },
      liveCount: presentCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
