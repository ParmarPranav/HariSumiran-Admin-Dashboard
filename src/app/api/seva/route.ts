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
      department = "Kitchen",
      description,
      instructions,
      date = new Date().toISOString().split("T")[0],
      startTime,
      shiftStartTime,
      endTime,
      shiftEndTime,
      location = "HariPrabodham Mandir, Nadiad",
      requiredVolunteers,
      totalSlots,
      targetScope,
      genderEligibility,
      zoneEligibility,
      skillsRequired = [],
      timeCommitment,
      leadName = "Mandir Seva Coordinator",
      leadPhone,
    } = body;

    if (!title || !department) {
      return NextResponse.json(
        { success: false, error: "Title and Department are required." },
        { status: 400 }
      );
    }

    const sStart = shiftStartTime || startTime || "06:00 AM";
    const sEnd = shiftEndTime || endTime || "09:00 AM";
    const reqCount = Number(requiredVolunteers || totalSlots || 5);
    const desc = description || instructions || "Standard temple seva assignment.";
    const commitment = timeCommitment || `${sStart} - ${sEnd}`;
    const gender = (targetScope?.gender as any) || genderEligibility || "All";
    const zone = targetScope?.zone || zoneEligibility || "All Nadiad";

    const opportunity = await SevaOpportunity.create({
      title,
      gujaratiTitle: gujaratiTitle || "",
      category: department === "Kitchen" ? "Kitchen" : "Mandir Service",
      department,
      description: desc,
      date,
      startTime: sStart,
      endTime: sEnd,
      location,
      requiredVolunteerCount: reqCount,
      acceptedVolunteerCount: 0,
      totalSlots: reqCount,
      filledSlots: 0,
      timeCommitment: commitment,
      skillsRequired,
      genderEligibility: gender,
      zoneEligibility: zone,
      status: "Open",
      leadName,
      leadPhone: leadPhone || "9825000000",
      volunteers: [],
    });

    await AuditLog.create({
      actorId: "usr-admin",
      actorName: leadName,
      actorRole: "karyakarta",
      action: "CREATE_SEVA_OPPORTUNITY",
      module: "Seva",
      recordId: opportunity._id.toString(),
      description: `Created Seva opportunity: ${title} (${department}) for ${reqCount} volunteers`,
    });

    return NextResponse.json({
      success: true,
      message: "Seva opportunity created successfully",
      opportunityId: opportunity._id.toString(),
      status: "Open",
      opportunity,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
