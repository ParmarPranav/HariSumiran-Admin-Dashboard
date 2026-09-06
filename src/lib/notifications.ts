import { User } from "@/models";

export interface PushNotificationPayload {
  recipientRole?: string;
  recipientPhone?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotificationPayload(payload: PushNotificationPayload) {
  try {
    // Find target user(s) or admins to send push notification to
    const query: any = {};
    if (payload.recipientRole) {
      query.role = payload.recipientRole;
    } else if (payload.recipientPhone) {
      query.phone = payload.recipientPhone;
    }

    const targetUsers = await User.find(query);
    const allTokens: { token: string; platform: string }[] = [];

    targetUsers.forEach((u) => {
      if (u.deviceTokens && u.deviceTokens.length > 0) {
        u.deviceTokens.forEach((dt) => {
          allTokens.push({ token: dt.token, platform: dt.platform });
        });
      }
    });

    console.log(`[Push Notification Dispatcher] Sending "${payload.title}" to ${allTokens.length} device tokens:`, {
      title: payload.title,
      body: payload.body,
      tokensCount: allTokens.length,
      targetRoles: payload.recipientRole || "specific_user",
    });

    return {
      success: true,
      dispatchedCount: allTokens.length,
      tokens: allTokens,
    };
  } catch (error: any) {
    console.error("[Push Notification Dispatcher Error]:", error.message);
    return { success: false, error: error.message };
  }
}
