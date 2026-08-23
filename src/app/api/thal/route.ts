import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ThalSchedule, Family, AuditLog } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // e.g., "2026-08"

    const query: any = {};
    if (month) {
      query.date = { $regex: `^${month}` };
    }

    const schedules = await ThalSchedule.find(query).sort({ date: 1, mealType: 1 });
    const families = await Family.find({ status: "Active" });

    // Compute fairness metric: turns per family
    const turnCounts: Record<string, number> = {};
    families.forEach((f) => (turnCounts[f.name] = 0));
    schedules.forEach((s) => {
      turnCounts[s.assignedFamilyName] = (turnCounts[s.assignedFamilyName] || 0) + 1;
    });

    const fairnessRanking = families
      .map((f) => ({
        familyId: f._id.toString(),
        familyName: f.name,
        captainName: f.captainName,
        phone: f.phone,
        area: f.area,
        turnsThisYear: turnCounts[f.name] || 0,
        lastTurnDate: f.lastInteractionAt,
      }))
      .sort((a, b) => a.turnsThisYear - b.turnsThisYear);

    return NextResponse.json({
      success: true,
      count: schedules.length,
      schedules,
      fairnessRanking,
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
      date,
      mealType = "Morning Thal",
      assignedFamilyId,
      assignedFamilyName,
      assignedPhone,
      headcount = 45,
      specialInstructions,
    } = body;

    if (!date || !assignedFamilyName) {
      return NextResponse.json({ success: false, error: "Date and Assigned Family are required." }, { status: 400 });
    }

    // Check conflict
    const existing = await ThalSchedule.findOne({ date, mealType });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `${mealType} on ${date} is already assigned to ${existing.assignedFamilyName}.`,
        },
        { status: 409 }
      );
    }

    const scheduleCode = `THAL-${date.replace(/-/g, "")}-${mealType.startsWith("Morning") ? "M" : "E"}`;

    const schedule = await ThalSchedule.create({
      scheduleCode,
      date,
      mealType,
      assignedFamilyId: assignedFamilyId || "unassigned",
      assignedFamilyName,
      assignedPhone: assignedPhone || "9825000000",
      headcount,
      status: "Assigned",
      specialInstructions: specialInstructions || "Standard Satvik Thal preparation.",
    });

    await AuditLog.create({
      actorId: "usr-admin",
      actorName: "Thal Coordinator",
      actorRole: "mandir_admin",
      action: "ASSIGN_THAL",
      module: "Thal Rotation",
      recordId: schedule._id.toString(),
      description: `Assigned ${assignedFamilyName} for ${mealType} on ${date}`,
    });

    return NextResponse.json({
      success: true,
      message: "Thal turn assigned successfully",
      schedule,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, status, declineReason, specialInstructions } = body;

    const schedule = await ThalSchedule.findById(id);
    if (!schedule) {
      return NextResponse.json({ success: false, error: "Thal schedule entry not found" }, { status: 404 });
    }

    if (status) schedule.status = status;
    if (declineReason) {
      schedule.declineReason = declineReason;
      schedule.swapRequested = true;
    }
    if (specialInstructions) schedule.specialInstructions = specialInstructions;
    if (status === "Completed") schedule.completedAt = new Date();

    await schedule.save();

    return NextResponse.json({
      success: true,
      message: `Thal status updated to ${schedule.status}`,
      schedule,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
