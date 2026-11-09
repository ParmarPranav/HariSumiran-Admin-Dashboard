import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, AuditLog } from "@/models";
import { initialUsers } from "@/lib/seedData";
import { resolveUserScope } from "@/lib/authScope";

const SUPER_ADMIN_EMAIL = "hpsuperadmin@gmail.com";
const SUPER_ADMIN_PASSWORD = "HP@Super#Admin@1809";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email ID and Password are required." },
        { status: 400 }
      );
    }

    // Verify root super admin credentials
    const isRootMatch =
      email === SUPER_ADMIN_EMAIL.toLowerCase() &&
      password === SUPER_ADMIN_PASSWORD;

    if (!isRootMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid Super Admin credentials. Access denied." },
        { status: 401 }
      );
    }

    await connectDB();

    // Look up or auto-upsert the root account in MongoDB
    let matchedUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });

    if (!matchedUser) {
      // Create root super admin in DB from initial seed definition
      const rootSeed = initialUsers[0];
      matchedUser = await User.create({
        name: rootSeed.name,
        phone: rootSeed.phone,
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        role: "super_admin",
        passcodeHash: "1809",
        mandir: "HariPrabodham, Nadiad",
        avatar: rootSeed.avatar,
        biometricEnabled: true,
        active: true,
        responsibilities: [
          {
            type: "super_admin",
            title: "Root Super Administrator",
            gujaratiTitle: "મુખ્ય વહીવટકર્તા (રૂટ)",
            scope: {},
            active: true,
            assignedAt: new Date(),
          },
        ],
      });
    } else {
      // Ensure role is super_admin and active
      if (matchedUser.role !== "super_admin") {
        matchedUser.role = "super_admin";
        await matchedUser.save();
      }
    }

    const scope = resolveUserScope(matchedUser as any);

    // Record login audit log
    await AuditLog.create({
      actorId: matchedUser._id.toString(),
      actorName: matchedUser.name,
      actorRole: "super_admin",
      action: "SUPER_ADMIN_LOGIN",
      module: "Security & Authentication",
      recordId: matchedUser._id.toString(),
      description: `Root Super Admin logged in successfully via dedicated credentials (${SUPER_ADMIN_EMAIL})`,
    });

    return NextResponse.json({
      success: true,
      message: "Super Admin authenticated successfully.",
      user: matchedUser,
      scope,
      token: "super_admin_jwt_" + Date.now(),
    });
  } catch (error: any) {
    console.error("Super Admin auth error:", error);

    // Fallback if MongoDB is temporarily unreachable
    const rootSeed = initialUsers[0];
    return NextResponse.json({
      success: true,
      message: "Super Admin authenticated (in-memory mode).",
      user: rootSeed,
      token: "super_admin_fallback_token_" + Date.now(),
    });
  }
}

