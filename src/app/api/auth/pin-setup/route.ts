import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { initialUsers } from "@/lib/seedData";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, currentPin, newPin } = body;

    if (!newPin || newPin.length < 4) {
      return NextResponse.json(
        { success: false, error: "New PIN must be at least 4 digits." },
        { status: 400 }
      );
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else {
      // Default to first admin user if no specific ID passed in demo mode
      user = (await User.findOne({ "responsibilities.type": "mandir_admin" })) || (await User.findOne({}));
    }

    if (user) {
      if (currentPin && user.passcodeHash && user.passcodeHash !== currentPin && user.passcodeHash !== "3690") {
        return NextResponse.json(
          { success: false, error: "Current PIN is incorrect." },
          { status: 401 }
        );
      }
      user.passcodeHash = newPin;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "App PIN updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
