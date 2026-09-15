import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Family, Member, AuditLog } from "@/models";
import { resolveUserScope, findUserByIdentifier } from "@/lib/authScope";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const area = searchParams.get("area");
    const zone = searchParams.get("zone");
    const engagement = searchParams.get("engagement");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const authHeader = req.headers.get("authorization");
    let callerIdentifier = userId;
    if (!callerIdentifier && authHeader && authHeader.startsWith("Bearer ")) {
      callerIdentifier = authHeader.replace("Bearer ", "");
    }

    const user = await findUserByIdentifier(callerIdentifier);
    const scope = resolveUserScope(user as any);

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { captainName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { familyCode: { $regex: search, $options: "i" } },
      ];
    }

    if (area && area !== "All") {
      query.area = area;
    }

    if (zone && zone !== "All") {
      query.zone = zone;
    } else if (!scope.isAdmin && scope.isKaryakarta && scope.allowedZones.length > 0 && !scope.allowedZones.includes("*")) {
      query.zone = { $in: scope.allowedZones };
    }

    if (engagement && engagement !== "All") {
      query.engagementLevel = engagement;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const families = await Family.find(query).sort({ lastInteractionAt: -1, createdAt: -1 });
    const count = families.length;

    return NextResponse.json({
      success: true,
      count,
      families,
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
      name,
      gujaratiName,
      captainName,
      phone,
      alternatePhone,
      address,
      area,
      zone,
      notes,
      members = [],
    } = body;

    if (!name || !captainName || !phone || !address || !area) {
      return NextResponse.json(
        { success: false, error: "Name, Captain Name, Phone, Address, and Area are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const existingFamily = await Family.findOne({
      $or: [{ phone: cleanPhone }, { name: { $regex: `^${name}$`, $options: "i" } }],
    });

    if (existingFamily && !body.ignoreDuplicateWarning) {
      return NextResponse.json(
        {
          success: false,
          duplicateDetected: true,
          matchedFamily: existingFamily,
          message: "A family with similar name or phone already exists.",
        },
        { status: 409 }
      );
    }

    const count = await Family.countDocuments();
    const familyCode = `FAM-NAD-${String(count + 1).padStart(3, "0")}`;

    const newFamily = await Family.create({
      familyCode,
      name,
      gujaratiName: gujaratiName || "",
      captainName,
      phone: cleanPhone,
      alternatePhone: alternatePhone || "",
      address,
      area,
      zone: zone || "Central Nadiad",
      memberCount: members.length > 0 ? members.length : 1,
      engagementLevel: "Medium",
      status: "Active",
      lastInteractionAt: new Date(),
      notes: notes || "",
    });

    if (members.length === 0) {
      const memberCode = `MEM-NAD-${String(count * 4 + 1).padStart(3, "0")}`;
      await Member.create({
        memberCode,
        familyId: newFamily._id.toString(),
        familyName: newFamily.name,
        name: captainName,
        dob: "1980-01-01",
        gender: "Male",
        phone: cleanPhone,
        relationship: "Head of Family",
        sevaSkills: ["General Seva"],
        attendanceStreak: 0,
        verificationStatus: "Pending Verification",
        qrCode: `MEMBER:${memberCode}:${captainName.toUpperCase().replace(/\s+/g, "_")}`,
      });
    } else {
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const memberCode = `MEM-NAD-${String(count * 4 + i + 1).padStart(3, "0")}`;
        await Member.create({
          memberCode,
          familyId: newFamily._id.toString(),
          familyName: newFamily.name,
          name: m.name,
          gujaratiName: m.gujaratiName || "",
          dob: m.dob || "1990-01-01",
          gender: m.gender || "Male",
          phone: m.phone || cleanPhone,
          email: m.email || "",
          relationship: m.relationship || "Member",
          sevaSkills: m.sevaSkills || ["General Seva"],
          attendanceStreak: 0,
          verificationStatus: "Pending Verification",
          qrCode: `MEMBER:${memberCode}:${m.name.toUpperCase().replace(/\s+/g, "_")}`,
        });
      }
    }

    await AuditLog.create({
      actorId: "usr-current",
      actorName: "Active User",
      actorRole: "karyakarta",
      action: "REGISTER_FAMILY",
      module: "Families",
      recordId: newFamily._id.toString(),
      description: `Registered new family: ${name} (${familyCode}) with captain ${captainName}`,
    });

    return NextResponse.json({
      success: true,
      message: "Family registered successfully",
      family: newFamily,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
