import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Sabha, SabhaAttendance, Member } from "@/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { activityType = "Sabha", activityId, memberId, isPresent = true, notes } = body;

    if (!activityId || !memberId) {
      return NextResponse.json(
        { success: false, error: "activityId and memberId are required." },
        { status: 400 }
      );
    }

    let member = await Member.findById(memberId);
    if (!member) {
      member = await Member.findOne({ memberCode: memberId });
    }

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found." },
        { status: 404 }
      );
    }

    const mId = member._id.toString();
    let record = await SabhaAttendance.findOne({ sabhaId: activityId, memberId: mId });

    if (record) {
      record.status = isPresent ? "Present" : "Absent";
      record.mode = "List";
      record.markedAt = new Date();
      await record.save();
    } else {
      record = await SabhaAttendance.create({
        sabhaId: activityId,
        memberId: mId,
        memberName: member.name,
        familyId: member.familyId,
        zone: member.zone || "Central Nadiad",
        sabhaType: member.sabhaCategory || "Family Sabha",
        mode: "List",
        status: isPresent ? "Present" : "Absent",
        markedAt: new Date(),
        markedBy: "Manual Roster Entry",
      });
    }

    if (isPresent) {
      member.attendanceStreak = (member.attendanceStreak || 0) + 1;
      await member.save();
    }

    const presentCount = await SabhaAttendance.countDocuments({ sabhaId: activityId, status: "Present" });
    await Sabha.findByIdAndUpdate(activityId, { presentCount }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: `Attendance updated for ${member.name}`,
      memberId: mId,
      isPresent,
      record,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
