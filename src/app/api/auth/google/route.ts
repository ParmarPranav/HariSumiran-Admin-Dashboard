import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { sendNewUserOnboardingAlert } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, name, googleId } = await req.json();

    await connectDB();

    const targetEmail = email || "ramesh.patel@gmail.com";
    const targetName = name || "Rameshbhai Patel";

    let user = await User.findOne({ email: targetEmail });
    const isNewUser = !user;

    if (!user) {
      user = await User.create({
        name: targetName,
        phone: "9825056789",
        email: targetEmail,
        role: "family_captain",
        mandir: "HariPrabodham, Nadiad",
        active: true,
      });

      // Send Super Admin Onboarding Alert
      try {
        await sendNewUserOnboardingAlert({
          name: targetName,
          phone: user.phone || "9825056789",
          email: targetEmail,
          role: "FAMILY_CAPTAIN",
          familyName: "Patel Household (Rameshbhai)",
          channel: "Google Sign-In",
          onboardedAt: user.createdAt,
        });
      } catch (mailErr: any) {
        console.error("[Google Onboarding Alert Exception]:", mailErr?.message || mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Authenticated with Google Account",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "family_captain",
        mandir: user.mandir,
        familyId: "FAM-101",
        familyName: "Patel Household (Rameshbhai)",
        authProvider: "google",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
