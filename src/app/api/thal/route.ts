import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ThalSchedule, Family, AuditLog } from "@/models";
import { initialFamilies } from "@/lib/seedData";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // e.g., "2026-08"

    const query: any = {};
    if (month) {
      query.date = { $regex: `^${month}` };
    }

    let schedules = await ThalSchedule.find(query).sort({ date: 1, mealType: 1 });
    let families = await Family.find({ status: "Active" });

    // Auto seed 60 turns for September 2026 across 30 families if empty
    if (schedules.length === 0 && (!month || month === "2026-09")) {
      if (families.length === 0) {
        await Family.insertMany(initialFamilies);
        families = await Family.find({ status: "Active" });
      }

      const year = 2026;
      const m = 9;
      const daysInMonth = 30;

      const menusMorning = [
        "Puri, Shrikhand, Bataka nu Shaak, Dal Bhat",
        "Rotli, Paneer Bhurji, Chana Dal, Rice",
        "Bhakhri, Sev Tameta, Gujarati Kadi, Khichdi",
        "Methi Thepla, Sukhi Bhaji, Dudhi Chana Dal, Rice",
        "Rotli, Undhiyu, Tuver Dal, Rice",
      ];
      const menusEvening = [
        "Khichdi, Kadhi, Ringan Bharta, Sukhdi",
        "Handvo, Vaghareli Khichdi, Masala Chhash",
        "Vagharlo Bhaat, Dal Fry, Jeera Rice, Mohanthal",
        "Kathiyawadi Khichdi, Kadhi, Lasaniya Bataka",
        "Sabudana Khichdi, Rajgira Puri, Farali Kadhi",
      ];

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = d < 10 ? `0${d}` : `${d}`;
        const dateStr = `${year}-09-${dayStr}`;

        const mFam = families[(d - 1) % families.length];
        const eFam = families[(d + 14) % families.length];

        await ThalSchedule.create({
          scheduleCode: `THAL-2026-09${dayStr}-M`,
          date: dateStr,
          monthPeriod: "2026-09",
          mealType: "Breakfast (Morning Thal)",
          assignedFamilyId: mFam._id.toString(),
          assignedFamilyName: mFam.name,
          assignedPhone: mFam.phone || "9825000000",
          captainName: mFam.captainName,
          headcount: 45 + (d % 15),
          status: d <= 6 ? "Confirmed" : "Assigned",
          specialInstructions: menusMorning[d % menusMorning.length],
        });

        await ThalSchedule.create({
          scheduleCode: `THAL-2026-09${dayStr}-E`,
          date: dateStr,
          monthPeriod: "2026-09",
          mealType: "Dinner (Evening Thal)",
          assignedFamilyId: eFam._id.toString(),
          assignedFamilyName: eFam.name,
          assignedPhone: eFam.phone || "9825000000",
          captainName: eFam.captainName,
          headcount: 50 + (d % 20),
          status: d <= 6 ? "Confirmed" : d === 12 ? "Declined" : "Assigned",
          specialInstructions: menusEvening[d % menusEvening.length],
          declineReason: d === 12 ? "Family medical checkup; swap requested." : undefined,
          swapRequested: d === 12,
        });
      }

      schedules = await ThalSchedule.find(query).sort({ date: 1, mealType: 1 });
    }

    const fairnessRanking = families
      .map((f) => ({
        familyId: f._id.toString(),
        familyName: f.name,
        captainName: f.captainName,
        phone: f.phone,
        area: f.area,
        turnsThisYear: schedules.filter((s) => s.assignedFamilyName === f.name).length,
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
      action,
      month = "2026-09",
      date,
      mealType = "Breakfast (Morning Thal)",
      assignedFamilyId,
      assignedFamilyName,
      assignedPhone,
      headcount = 50,
      specialInstructions,
    } = body;

    // Monthly Auto-Schedule Generator for September / selected month
    if (action === "auto_generate") {
      const families = await Family.find({ status: "Active" });
      if (families.length === 0) {
        return NextResponse.json({ success: false, error: "No active families found for rotation." }, { status: 400 });
      }

      // Generate dates for the month (e.g. 2026-09-01 to 2026-09-30)
      const year = parseInt(month.split("-")[0]);
      const m = parseInt(month.split("-")[1]);
      const daysInMonth = new Date(year, m, 0).getDate();

      let createdCount = 0;
      let familyIdx = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = d < 10 ? `0${d}` : `${d}`;
        const dateStr = `${year}-${m < 10 ? `0${m}` : m}-${dayStr}`;

        const meals = ["Breakfast (Morning Thal)", "Dinner (Evening Thal)"];

        for (const meal of meals) {
          const existing = await ThalSchedule.findOne({ date: dateStr, mealType: meal });
          if (!existing) {
            const fam = families[familyIdx % families.length];
            familyIdx++;

            const scheduleCode = `THAL-${dateStr.replace(/-/g, "")}-${meal.includes("Breakfast") ? "B" : "D"}`;

            await ThalSchedule.create({
              scheduleCode,
              date: dateStr,
              monthPeriod: month,
              mealType: meal,
              assignedFamilyId: fam._id.toString(),
              assignedFamilyName: fam.name,
              assignedPhone: fam.phone || "9825000000",
              captainId: fam.captainId,
              captainName: fam.captainName,
              headcount: 50,
              status: "Assigned",
              specialInstructions: "Standard Satvik Mahaprasad preparation.",
            });
            createdCount++;
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully generated ${createdCount} Thal turns for ${month}`,
        createdCount,
      });
    }

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

    const monthPeriod = date.substring(0, 7);
    const scheduleCode = `THAL-${date.replace(/-/g, "")}-${mealType.includes("Breakfast") ? "B" : "D"}`;

    const schedule = await ThalSchedule.create({
      scheduleCode,
      date,
      monthPeriod,
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
