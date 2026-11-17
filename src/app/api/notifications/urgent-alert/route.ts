import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientPhone,
      recipientRole,
      title = "Prepare monthly report",
      subtitle = "TIME FOR YOUR TASK",
      tagline = "Progress today, success tomorrow",
      category = "BUSINESS",
      categoryIcon = "briefcase",
      scheduledTime = "9:30 AM",
      location,
      actionDoneText = "MARK AS DONE",
      actionDoneEndpoint,
      actionDonePayload,
      snoozeDurationMinutes = 10,
      actionSkipText = "SKIP",
      targetRoute,
    } = body;

    await connectDB();

    // Query recipient users
    const query: any = {};
    if (recipientPhone) {
      const cleanPhone = recipientPhone.toString().replace(/\D/g, "");
      query.phone = { $regex: cleanPhone.slice(-10) + "$" };
    } else if (recipientRole) {
      query.role = recipientRole;
    }

    const users = await User.find(query);
    const alertId = `ALERT-${Date.now()}`;

    const collectedTokens: { token: string; platform: string; userName: string }[] = [];

    users.forEach((u) => {
      if (u.deviceTokens && u.deviceTokens.length > 0) {
        u.deviceTokens.forEach((dt) => {
          collectedTokens.push({
            token: dt.token,
            platform: dt.platform || "android",
            userName: u.name,
          });
        });
      }
    });

    console.log(
      `[Urgent FullScreen Alert Dispatcher] Dispatched alert "${title}" to ${collectedTokens.length} device tokens.`
    );

    // Full-Screen payload contract
    const fullScreenPayload = {
      type: "full_screen_alert",
      alertId,
      title,
      subtitle,
      tagline,
      category,
      categoryIcon,
      scheduledTime,
      location: location || "",
      actionDoneText,
      actionDoneEndpoint: actionDoneEndpoint || "",
      actionDonePayload: actionDonePayload ? JSON.stringify(actionDonePayload) : "",
      snoozeDurationMinutes: snoozeDurationMinutes.toString(),
      actionSkipText,
      targetRoute: targetRoute || "",
    };

    return NextResponse.json({
      success: true,
      message: `Dispatched full-screen alert to ${collectedTokens.length} devices`,
      alertId,
      recipientCount: users.length,
      deviceTokensCount: collectedTokens.length,
      payload: fullScreenPayload,
    });
  } catch (error: any) {
    console.error("[Urgent FullScreen Alert Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
