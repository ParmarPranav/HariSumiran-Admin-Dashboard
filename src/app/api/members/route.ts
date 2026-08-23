import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Member, Family, AuditLog } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const skill = searchParams.get("skill");
    const status = searchParams.get("status");
    const familyId = searchParams.get("familyId");

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { familyName: { $regex: search, $options: "i" } },
        { memberCode: { $regex: search, $options: "i" } },
      ];
    }

    if (skill && skill !== "All") {
      query.sevaSkills = { $regex: skill, $options: "i" };
    }

    if (status && status !== "All") {
      query.verificationStatus = status;
    }

    if (familyId) {
      query.familyId = familyId;
    }

    const members = await Member.find(query).sort({ attendanceStreak: -1, createdAt: -1 });
    return NextResponse.json({ success: true, count: members.length, members });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      familyId,
      familyName,
      name,
      gujaratiName,
      dob,
      gender,
      phone,
      email,
      relationship,
      sevaSkills,
      communicationConsent = true,
      photoConsent = true,
    } = body;

    if (!name || !phone || !dob || !gender) {
      return NextResponse.json(
        { success: false, error: "Name, Phone, Date of Birth, and Gender are required." },
        { status: 400 }
      );
    }

    let targetFamily = null;
    if (familyId) {
      targetFamily = await Family.findById(familyId);
    } else if (familyName) {
      targetFamily = await Family.findOne({ name: familyName });
    }

    const resolvedFamilyId = targetFamily ? targetFamily._id.toString() : "unassigned";
    const resolvedFamilyName = targetFamily ? targetFamily.name : (familyName || "Independent Devotee");

    const count = await Member.countDocuments();
    const memberCode = `MEM-NAD-${String(count + 1).padStart(3, "0")}`;

    const member = await Member.create({
      memberCode,
      familyId: resolvedFamilyId,
      familyName: resolvedFamilyName,
      name,
      gujaratiName: gujaratiName || "",
      dob,
      gender,
      phone: phone.replace(/\D/g, ""),
      email: email || "",
      relationship: relationship || "Member",
      sevaSkills: sevaSkills || ["General Seva"],
      attendanceStreak: 0,
      verificationStatus: "Pending Verification",
      communicationConsent,
      photoConsent,
    });

    if (targetFamily) {
      targetFamily.memberCount += 1;
      await targetFamily.save();
    }

    await AuditLog.create({
      actorId: "usr-current",
      actorName: "Active User",
      actorRole: "karyakarta",
      action: "REGISTER_MEMBER",
      module: "Members",
      recordId: member._id.toString(),
      description: `Registered new member: ${name} (${memberCode}) in family ${resolvedFamilyName}`,
    });

    return NextResponse.json({
      success: true,
      message: "Member registered successfully",
      member,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
