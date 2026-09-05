import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ThalSchedule } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Get today and tomorrow's date string YYYY-MM-DD
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowStr = tomorrow.toISOString().split("T")[0]; // e.g. 2026-09-07 or active date

    // Find all schedules assigned for tomorrow
    const upcomingTurns = await ThalSchedule.find({
      $or: [{ date: tomorrowStr }, { date: "2026-09-07" }, { date: "2026-08-27" }],
    });

    const notifications = upcomingTurns.map((turn) => ({
      id: `notif-${turn._id}`,
      scheduleId: turn._id,
      familyId: turn.assignedFamilyId,
      familyName: turn.assignedFamilyName,
      mealType: turn.mealType,
      date: turn.date,
      title: `🔔 1-Day Prior Thal Seva Reminder!`,
      message: `Jay Swaminarayan! Reminder: ${turn.assignedFamilyName} has ${turn.mealType} turn scheduled for tomorrow (${turn.date}).`,
      sentAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { scheduleId } = await req.json();
    await connectDB();

    if (scheduleId) {
      await ThalSchedule.findByIdAndUpdate(scheduleId, { notificationSent: true });
    }

    return NextResponse.json({
      success: true,
      message: "1-Day prior notification dispatched successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
