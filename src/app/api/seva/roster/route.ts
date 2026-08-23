import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SevaRoster, SevaOpportunity, Member, AuditLog } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const department = searchParams.get("department");

    const query: any = {};
    if (date) query.date = date;
    if (department && department !== "All") query.department = department;

    const rosters = await SevaRoster.find(query).sort({ shiftStartTime: 1 });
    return NextResponse.json({ success: true, rosters });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      opportunityId,
      date,
      shiftStartTime = "16:00",
      shiftEndTime = "19:00",
      volunteerId,
      volunteerName,
      volunteerPhone,
    } = body;

    const opp = await SevaOpportunity.findById(opportunityId);
    if (!opp) {
      return NextResponse.json({ success: false, error: "Opportunity not found" }, { status: 404 });
    }

    const roster = await SevaRoster.create({
      opportunityId,
      opportunityTitle: opp.title,
      department: opp.department,
      date: date || new Date().toISOString().split("T")[0],
      shiftStartTime,
      shiftEndTime,
      volunteerId: volunteerId || "vol-adhoc",
      volunteerName: volunteerName || "Devotee Volunteer",
      volunteerPhone: volunteerPhone || "9825000000",
      status: "Assigned",
    });

    opp.filledSlots += 1;
    if (opp.filledSlots >= opp.totalSlots) {
      opp.status = "Full";
    }
    await opp.save();

    return NextResponse.json({ success: true, message: "Volunteer scheduled for seva duty", roster });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
