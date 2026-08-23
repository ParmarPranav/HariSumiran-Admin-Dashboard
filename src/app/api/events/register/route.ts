import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration, Member, AuditLog } from "@/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { eventId, memberId, memberName, familyId } = body;

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Check capacity
    const isFull = event.registeredCount >= event.capacity;
    const status = isFull ? "Waitlisted" : "Registered";

    const passCode = `PASS-${event.eventCode.slice(-4)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const registration = await EventRegistration.create({
      eventId,
      eventTitle: event.title,
      memberId: memberId || "mem-adhoc",
      memberName: memberName || "Devotee",
      familyId: familyId || "fam-adhoc",
      passCode,
      status,
    });

    if (!isFull) {
      event.registeredCount += 1;
      await event.save();
    }

    return NextResponse.json({
      success: true,
      message: isFull ? "Added to event waitlist" : "Event pass generated successfully",
      registration,
      passCode,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
