import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RoomBooking, AuditLog } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const bookings = await RoomBooking.find({}).sort({ date: 1, startTime: 1 });
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { roomName, purpose, bookedBy, date, startTime, endTime, attendees } = body;

    if (!roomName || !purpose || !bookedBy || !date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Room Name, Purpose, Booked By, Date, and Time slots are required." },
        { status: 400 }
      );
    }

    // Check for double booking conflict
    const conflict = await RoomBooking.findOne({
      roomName,
      date,
      status: "Confirmed",
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      ],
    });

    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          conflict: true,
          error: `Room conflict: ${roomName} is already booked from ${conflict.startTime} to ${conflict.endTime} for "${conflict.purpose}".`,
        },
        { status: 409 }
      );
    }

    const booking = await RoomBooking.create({
      roomName,
      purpose,
      bookedBy,
      date,
      startTime,
      endTime,
      attendees: attendees || 20,
      status: "Confirmed",
    });

    return NextResponse.json({
      success: true,
      message: "Room booked successfully",
      booking,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
