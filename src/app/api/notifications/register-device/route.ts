import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

export async function POST(req: Request) {
  try {
    const { userId, phone, deviceToken, platform = "ios" } = await req.json();

    if (!deviceToken) {
      return NextResponse.json({ success: false, error: "deviceToken is required" }, { status: 400 });
    }

    await connectDB();

    // Find user by userId or phone
    const query = userId ? { _id: userId } : phone ? { phone } : { role: "mandir_admin" };
    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Add or update device token
    const existingIndex = (user.deviceTokens || []).findIndex((dt) => dt.token === deviceToken);

    if (existingIndex > -1) {
      user.deviceTokens![existingIndex].updatedAt = new Date();
      user.deviceTokens![existingIndex].platform = platform;
    } else {
      user.deviceTokens = [
        ...(user.deviceTokens || []),
        { token: deviceToken, platform, updatedAt: new Date() },
      ];
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: `Registered ${platform.toUpperCase()} device push token successfully`,
      registeredTokens: user.deviceTokens?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
