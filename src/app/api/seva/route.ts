import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SevaOpportunity, SevaRoster, Member, AuditLog } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    const query: any = {};
    if (department && department !== "All") query.department = department;

    const opportunities = await SevaOpportunity.find(query).sort({ createdAt: -1 });
    const rosters = await SevaRoster.find({}).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      opportunities,
      rosters,
    });
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
      department,
      description,
      skillsRequired = [],
      timeCommitment,
      totalSlots = 5,
      leadName = "Mandir Seva Coordinator",
    } = body;

    if (!title || !department || !description || !timeCommitment) {
      return NextResponse.json(
        { success: false, error: "Title, Department, Description, and Time Commitment are required." },
        { status: 400 }
      );
    }

    const opportunity = await SevaOpportunity.create({
      title,
      gujaratiTitle: gujaratiTitle || "",
      department,
      description,
      skillsRequired,
      timeCommitment,
      totalSlots,
      filledSlots: 0,
      status: "Open",
      leadName,
    });

    return NextResponse.json({
      success: true,
      message: "Seva opportunity created successfully",
      opportunity,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
