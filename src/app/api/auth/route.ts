import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { initialUsers } from "@/lib/seedData";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, phone, email, otp, role } = body;

    await connectDB();

    if (action === "send_otp") {
      if (!phone && !email) {
        return NextResponse.json({ success: false, error: "Phone or email is required" }, { status: 400 });
      }

      // Look up user or match default
      const user = await User.findOne(phone ? { phone: phone.replace(/\D/g, "") } : { email });
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to " + (phone || email),
        mockOtp: "123456", // Demo OTP
        registeredUser: !!user,
        role: user?.role || "karyakarta",
      });
    }

    if (action === "verify_otp") {
      if (otp !== "123456" && otp !== "111111") {
        return NextResponse.json({ success: false, error: "Invalid verification code. Please enter 123456." }, { status: 400 });
      }

      let user = await User.findOne(phone ? { phone: phone.replace(/\D/g, "") } : { email });
      if (!user) {
        // Fallback demo user
        user = (await User.findOne({ role: role || "karyakarta" })) || (await User.create({
          name: "Volunteer User",
          phone: phone || "9825000000",
          email: email || "user@harisumiran.org",
          role: role || "karyakarta",
          mandir: "HariPrabodham, Nadiad",
        }));
      }

      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          department: user.department,
          mandir: user.mandir,
          avatar: user.avatar,
        },
        token: "demo_jwt_token_" + Date.now(),
      });
    }

    if (action === "switch_role") {
      const targetUser = (await User.findOne({ role })) || initialUsers.find((u) => u.role === role);
      if (!targetUser) {
        return NextResponse.json({ success: false, error: "Role not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: targetUser,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid auth action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({ active: true });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
