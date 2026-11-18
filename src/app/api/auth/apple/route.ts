import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { notifySuperAdminsNewUser } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { appleId, email, name } = await req.json();

    if (!appleId) {
      return NextResponse.json({ success: false, error: "Apple ID is required" }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists with this email or phone/appleId
    let user = await User.findOne({ email });

    if (!user) {
      const uniquePhone = "98250" + Math.floor(10000 + Math.random() * 90000);
      user = await User.create({
        name: name || "Apple Devotee",
        phone: uniquePhone,
        email: email || `devotee.${Date.now()}@privaterelay.appleid.com`,
        role: "family_captain",
        mandir: "HariPrabodham, Nadiad",
        active: true,
      });

      // Send Super Admin Onboarding Alert (FCM Push + Email)
      try {
        await notifySuperAdminsNewUser({
          name: user.name,
          phone: uniquePhone,
          email: user.email,
          role: "FAMILY_CAPTAIN",
          channel: "Apple Sign-In",
          onboardedAt: user.createdAt,
        });
      } catch (notifyErr: any) {
        console.error("[Apple Onboarding Alert Exception]:", notifyErr?.message || notifyErr);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authProvider: "apple",
        appleId,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
