import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Sabha, SabhaAttendance, Event, Member } from "@/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { activityType = "Sabha", activityId, qrCodePayload, scannedAt } = body;

    if (!activityId || !qrCodePayload) {
      return NextResponse.json(
        { success: false, error: "activityId and qrCodePayload are required." },
        { status: 400 }
      );
    }

    // Resolve member from qrCodePayload
    // Can be: "HS-MEM-65f2...", "MEMBER:MEM-NAD-001:RAMESHBHAI", "MEM-NAD-001", "65f2...", or phone/name
    let cleanPayload = qrCodePayload.trim();
    if (cleanPayload.startsWith("HS-MEM-")) {
      cleanPayload = cleanPayload.replace("HS-MEM-", "");
    }

    let member = null;

    // 1. Try by ObjectId if valid
    if (cleanPayload.match(/^[0-9a-fA-F]{24}$/)) {
      member = await Member.findById(cleanPayload);
    }

    // 2. Try by exact QR Code match
    if (!member) {
      member = await Member.findOne({ qrCode: qrCodePayload });
    }

    // 3. Try by Member Code (e.g. from MEMBER:MEM-NAD-001:NAME or plain MEM-NAD-001)
    if (!member) {
      const codeMatch = cleanPayload.match(/MEM-NAD-\d+/i);
      if (codeMatch) {
        member = await Member.findOne({ memberCode: new RegExp(codeMatch[0], "i") });
      }
    }

    // 4. Try by Phone or Name
    if (!member) {
      const digitsOnly = cleanPayload.replace(/\D/g, "");
      if (digitsOnly.length >= 10) {
        member = await Member.findOne({ phone: new RegExp(digitsOnly.slice(-10)) });
      } else {
        member = await Member.findOne({
          $or: [
            { name: new RegExp(cleanPayload, "i") },
            { gujaratiName: new RegExp(cleanPayload, "i") },
          ],
        });
      }
    }

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Devotee member not found with the scanned QR pass." },
        { status: 404 }
      );
    }

    const memberId = member._id.toString();

    // Check if already marked
    const existingRecord = await SabhaAttendance.findOne({
      sabhaId: activityId,
      memberId,
    });

    let alreadyMarked = false;
    let record = existingRecord;

    if (existingRecord) {
      if (existingRecord.status === "Present") {
        alreadyMarked = true;
      } else {
        existingRecord.status = "Present";
        existingRecord.mode = "QR";
        existingRecord.markedAt = scannedAt ? new Date(scannedAt) : new Date();
        await existingRecord.save();
      }
    } else {
      record = await SabhaAttendance.create({
        sabhaId: activityId,
        memberId,
        memberName: member.name,
        familyId: member.familyId,
        zone: member.zone || "Central Nadiad",
        sabhaType: member.sabhaCategory || "Family Sabha",
        mode: "QR",
        status: "Present",
        markedAt: scannedAt ? new Date(scannedAt) : new Date(),
        markedBy: "Continuous QR Scanner",
      });

      // Increment attendance streak on new mark
      member.attendanceStreak = (member.attendanceStreak || 0) + 1;
      await member.save();
    }

    // Get live session stats
    let expectedCount = 120;
    let presentCount = await SabhaAttendance.countDocuments({ sabhaId: activityId, status: "Present" });

    if (activityType === "Sabha") {
      const sabha = await Sabha.findById(activityId);
      if (sabha) {
        expectedCount = sabha.expectedCount || 120;
        sabha.presentCount = presentCount;
        if (sabha.status === "Scheduled") {
          sabha.status = "Live";
        }
        await sabha.save();
      }
    } else if (activityType === "Event") {
      const event = await Event.findById(activityId);
      if (event) {
        expectedCount = event.capacity || 500;
        event.registeredCount = Math.max(event.registeredCount || 0, presentCount);
        await event.save();
      }
    }

    return NextResponse.json({
      success: true,
      alreadyMarked,
      message: alreadyMarked
        ? `${member.name} was already marked Present.`
        : `Attendance marked successfully for ${member.name}.`,
      member: {
        id: member._id,
        name: member.name,
        gujaratiName: member.gujaratiName || "",
        familyName: member.familyName,
        attendanceStreak: member.attendanceStreak,
        photoUrl: member.photoUrl || "",
      },
      liveSessionStats: {
        presentCount,
        expectedCount,
      },
      record,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
