import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Sabha, AuditLog } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const query: any = {};
    if (type && type !== "All") query.type = type;
    if (status && status !== "All") query.status = status;
    if (date) query.date = date;

    const sabhas = await Sabha.find(query).sort({ date: -1, startTime: -1 });
    return NextResponse.json({ success: true, count: sabhas.length, sabhas });
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
      type = "Evening Sabha",
      date,
      startTime = "18:00",
      endTime = "20:00",
      location = "Main Satsang Hall, Nadiad",
      expectedCount = 120,
      checklist = [],
      notes,
    } = body;

    if (!title || !date) {
      return NextResponse.json({ success: false, error: "Title and Date are required." }, { status: 400 });
    }

    const count = await Sabha.countDocuments();
    const sabhaCode = `SAB-${date.replace(/-/g, "")}-${String(count + 1).slice(-2)}`;

    const defaultChecklist =
      checklist.length > 0
        ? checklist
        : [
            { item: "Microphone & Sound System Checked", completed: false },
            { item: "Stage Floral Decoration Setup", completed: false },
            { item: "Mahaprasad Kitchen Readiness", completed: false },
            { item: "Live Streaming Setup", completed: false },
            { item: "Parking & Shoe Stand Volunteers", completed: false },
          ];

    const sabha = await Sabha.create({
      sabhaCode,
      title,
      gujaratiTitle: gujaratiTitle || "",
      type,
      date,
      startTime,
      endTime,
      location,
      status: "Scheduled",
      expectedCount,
      presentCount: 0,
      checklist: defaultChecklist,
      notes: notes || "",
    });

    await AuditLog.create({
      actorId: "usr-current",
      actorName: "Active User",
      actorRole: "karyakarta",
      action: "SCHEDULE_SABHA",
      module: "Sabha",
      recordId: sabha._id.toString(),
      description: `Scheduled ${type}: ${title} for ${date}`,
    });

    return NextResponse.json({ success: true, message: "Sabha scheduled successfully", sabha });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
