import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { initialUsers } from "@/lib/seedData";
import { resolveUserScope } from "@/lib/authScope";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, pin, phone, email, userId, newPin } = body;

    await connectDB();

    // 1. PIN / Passcode Unlock
    if (action === "unlock" || action === "login") {
      const inputPin = pin || "3690";
      let matchedUser = null;

      if (userId) {
        matchedUser = await User.findById(userId);
      } else if (email) {
        matchedUser = await User.findOne({ email });
      } else if (phone) {
        matchedUser = await User.findOne({ phone });
      }

      if (!matchedUser) {
        // Fallback to seed data or default user (Rameshbhai)
        matchedUser = (await User.findOne({ "responsibilities.type": "mandir_admin" })) || initialUsers[2];
      }

      const scope = resolveUserScope(matchedUser as any);

      return NextResponse.json({
        success: true,
        message: "Unlock successful",
        user: matchedUser,
        scope,
        token: "jwt_token_" + Date.now(),
      });
    }

    // 2. Setup / Change Passcode
    if (action === "setup_pin") {
      if (!newPin || newPin.length < 4) {
        return NextResponse.json({ success: false, error: "PIN must be at least 4 digits." }, { status: 400 });
      }

      if (userId) {
        await User.findByIdAndUpdate(userId, { passcodeHash: newPin });
      }

      return NextResponse.json({
        success: true,
        message: "Passcode updated successfully",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid auth action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    let users = await User.find({ active: true });

    if (!users || users.length === 0) {
      // Seed users
      await User.insertMany(initialUsers as any);
      users = await User.find({ active: true });
    }

    return NextResponse.json({
      success: true,
      users,
      personas: initialUsers.map((u) => ({
        name: u.name,
        phone: u.phone,
        email: u.email,
        responsibilities: u.responsibilities,
        avatar: u.avatar,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
