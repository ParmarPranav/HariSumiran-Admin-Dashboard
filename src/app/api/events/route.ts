import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration, AuditLog } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: any = {};
    if (status && status !== "All") query.status = status;

    const events = await Event.find(query).sort({ date: 1 });
    return NextResponse.json({ success: true, count: events.length, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      title,
      gujaratiTitle,
      date,
      endDate,
      location = "HariPrabodham Mandir Ground, Nadiad",
      description,
      capacity = 500,
      committeeLeads = [],
      tasks = [],
    } = body;

    if (!title || !date || !description) {
      return NextResponse.json({ success: false, error: "Title, Date, and Description are required." }, { status: 400 });
    }

    const count = await Event.countDocuments();
    const eventCode = `EVT-${date.slice(0, 4)}-${String(count + 1).padStart(3, "0")}`;

    const event = await Event.create({
      eventCode,
      title,
      gujaratiTitle: gujaratiTitle || "",
      date,
      endDate: endDate || date,
      location,
      description,
      capacity,
      registeredCount: 0,
      status: "Planning",
      committeeLeads,
      tasks,
    });

    return NextResponse.json({ success: true, message: "Event created successfully", event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
