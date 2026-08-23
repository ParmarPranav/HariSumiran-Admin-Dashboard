import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SevaRoster, AuditLog } from "@/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { rosterId, action = "check_in" } = body;

    const roster = await SevaRoster.findById(rosterId);
    if (!roster) {
      return NextResponse.json({ success: false, error: "Roster entry not found" }, { status: 404 });
    }

    if (action === "check_in") {
      roster.status = "Checked In";
      roster.checkInTime = new Date();
    } else if (action === "check_out") {
      roster.status = "Completed";
      roster.checkOutTime = new Date();
    } else if (action === "request_replacement") {
      roster.status = "Replacement Requested";
      roster.replacementNotes = body.reason || "Unable to attend shift.";
    }

    await roster.save();

    return NextResponse.json({
      success: true,
      message: `Seva duty status updated to ${roster.status}`,
      roster,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
