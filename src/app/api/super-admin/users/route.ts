import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const roleFilter = searchParams.get("role")?.trim() || "";

    const query: any = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { memberId: { $regex: q, $options: "i" } },
        { familyName: { $regex: q, $options: "i" } },
      ];
    }

    if (roleFilter && roleFilter !== "all") {
      query.$or = [
        ...(query.$or || []),
        { role: roleFilter },
        { "responsibilities.type": roleFilter },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    // Aggregate key stats across all users
    const allUsers = await User.find({}, "role responsibilities active");
    const stats = {
      total: allUsers.length,
      superAdmins: allUsers.filter(
        (u) =>
          u.role === "super_admin" ||
          u.responsibilities?.some(
            (r: any) => r.type === "super_admin" && r.active !== false
          )
      ).length,
      mandirAdmins: allUsers.filter(
        (u) =>
          u.role === "mandir_admin" ||
          u.responsibilities?.some(
            (r: any) => r.type === "mandir_admin" && r.active !== false
          )
      ).length,
      karyakartas: allUsers.filter(
        (u) =>
          u.role === "karyakarta" ||
          u.responsibilities?.some(
            (r: any) => r.type === "sabha_karyakarta" && r.active !== false
          )
      ).length,
      thalCaptains: allUsers.filter(
        (u) =>
          u.isCaptain ||
          u.role === "family_captain" ||
          u.responsibilities?.some(
            (r: any) => r.type === "thal_captain" && r.active !== false
          )
      ).length,
      activeUsers: allUsers.filter((u) => u.active !== false).length,
    };

    return NextResponse.json({
      success: true,
      users,
      stats,
    });
  } catch (error: any) {
    console.error("Super Admin users GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

