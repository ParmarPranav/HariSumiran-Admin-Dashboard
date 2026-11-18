import { connectDB } from "@/lib/db";
import { User, NotificationBroadcastLog } from "@/models";
import { getFCM, getFirebaseAdminStatus } from "@/lib/firebaseAdmin";
import { MulticastMessage } from "firebase-admin/messaging";

export interface PushNotificationPayload {
  recipientRole?: string;
  recipientPhone?: string;
  recipientUserId?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: "high" | "normal";
}

export interface BroadcastNotificationParams {
  title: string;
  gujaratiTitle?: string;
  body: string;
  gujaratiBody?: string;
  targetAudience?: "all" | "role" | "custom" | "single_user";
  targetRole?: string;
  targetUserId?: string;
  deepLinkRoute?: string;
  priority?: "high" | "normal";
  sentBy?: {
    name: string;
    phone: string;
    role: string;
  };
  customData?: Record<string, string>;
}

export interface BroadcastResult {
  success: boolean;
  totalUsersTargeted: number;
  totalTokensTargeted: number;
  successCount: number;
  failureCount: number;
  invalidTokensCleaned: number;
  errors: string[];
  logId?: string;
  message?: string;
}

/**
 * Remove invalid/unregistered FCM tokens from User documents
 */
async function cleanupDeadTokens(deadTokens: string[]): Promise<number> {
  if (!deadTokens || deadTokens.length === 0) return 0;
  try {
    const res = await User.updateMany(
      {
        $or: [
          { "deviceTokens.token": { $in: deadTokens } },
          { fcmToken: { $in: deadTokens } },
        ],
      },
      {
        $pull: {
          deviceTokens: { token: { $in: deadTokens } },
        },
      }
    );

    // Also unset single fcmToken if it matches
    await User.updateMany(
      { fcmToken: { $in: deadTokens } },
      { $unset: { fcmToken: 1 } }
    );

    console.log(`[FCM Token Hygiene] Cleaned up ${deadTokens.length} dead token(s) from database.`);
    return deadTokens.length;
  } catch (err: any) {
    console.error("[FCM Token Hygiene Error]:", err.message);
    return 0;
  }
}

/**
 * Broadcast FCM notification to all users who have tokens or filtered by role
 */
export async function broadcastNotification(params: BroadcastNotificationParams): Promise<BroadcastResult> {
  try {
    await connectDB();
    const fcm = getFCM();
    const fcmStatus = getFirebaseAdminStatus();

    if (!fcm) {
      throw new Error(
        fcmStatus.error ||
          "Firebase Admin Messaging is not initialized. Please verify FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
      );
    }

    const {
      title,
      gujaratiTitle,
      body,
      gujaratiBody,
      targetAudience = "all",
      targetRole,
      deepLinkRoute = "/",
      priority = "high",
      sentBy = { name: "Super Admin", phone: "", role: "super_admin" },
      customData = {},
    } = params;

    // Build user query
    const query: any = { active: { $ne: false } };
    if (params.targetUserId) {
      query._id = params.targetUserId;
    } else if (targetAudience === "role" && targetRole && targetRole !== "all") {
      query.$or = [
        { role: targetRole },
        { "responsibilities.type": targetRole },
      ];
    }

    const matchedUsers = await User.find(query);

    // Extract all unique tokens along with recipient mapping
    const tokenSet = new Set<string>();
    const usersWithTokens: string[] = [];

    matchedUsers.forEach((user) => {
      let userHasToken = false;
      if (user.deviceTokens && Array.isArray(user.deviceTokens)) {
        user.deviceTokens.forEach((dt) => {
          if (dt.token && typeof dt.token === "string" && dt.token.trim().length > 10) {
            tokenSet.add(dt.token.trim());
            userHasToken = true;
          }
        });
      }
      if (user.fcmToken && typeof user.fcmToken === "string" && user.fcmToken.trim().length > 10) {
        tokenSet.add(user.fcmToken.trim());
        userHasToken = true;
      }
      if (userHasToken) {
        usersWithTokens.push(user._id.toString());
      }
    });

    const allTokens = Array.from(tokenSet);
    const totalTokens = allTokens.length;
    const totalUsers = usersWithTokens.length;

    console.log(
      `[FCM Broadcast] Found ${totalUsers} users with ${totalTokens} unique device token(s) for target "${targetAudience}" (${targetRole || "all"})`
    );

    if (totalTokens === 0) {
      const log = await NotificationBroadcastLog.create({
        title,
        gujaratiTitle,
        body,
        gujaratiBody,
        targetAudience,
        targetRole,
        totalTokensTargeted: 0,
        totalUsersTargeted: 0,
        successCount: 0,
        failureCount: 0,
        invalidTokensCleaned: 0,
        sentBy,
        deepLinkRoute,
        priority,
        status: "success",
        dispatchErrors: ["No active device tokens found for target audience"],
      });

      return {
        success: true,
        totalUsersTargeted: 0,
        totalTokensTargeted: 0,
        successCount: 0,
        failureCount: 0,
        invalidTokensCleaned: 0,
        errors: ["No active device tokens found in selected audience."],
        logId: log._id.toString(),
        message: "No registered device tokens found for the selected audience.",
      };
    }

    // Chunk tokens into batches of 500 (FCM sendEachForMulticast limit)
    const BATCH_SIZE = 500;
    const tokenBatches: string[][] = [];
    for (let i = 0; i < allTokens.length; i += BATCH_SIZE) {
      tokenBatches.push(allTokens.slice(i, i + BATCH_SIZE));
    }

    let overallSuccess = 0;
    let overallFailure = 0;
    const deadTokensToClean: string[] = [];
    const collectedErrors: string[] = [];

    // Common payload data strings
    const payloadData: Record<string, string> = {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      route: deepLinkRoute,
      priority: priority,
      timestamp: new Date().toISOString(),
      ...(gujaratiTitle ? { gujaratiTitle } : {}),
      ...(gujaratiBody ? { gujaratiBody } : {}),
      ...customData,
    };

    for (const batch of tokenBatches) {
      const multicastMessage: MulticastMessage = {
        tokens: batch,
        notification: {
          title: title,
          body: body,
        },
        data: payloadData,
        android: {
          priority: priority === "high" ? "high" : "normal",
          notification: {
            channelId: "harisumiran_announcements",
            sound: "default",
            defaultSound: true,
            defaultVibrateTimings: true,
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              contentAvailable: true,
            },
          },
        },
      };

      try {
        const batchResponse = await fcm.sendEachForMulticast(multicastMessage);
        overallSuccess += batchResponse.successCount;
        overallFailure += batchResponse.failureCount;

        batchResponse.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const token = batch[idx];
            const errorCode = resp.error.code;
            console.warn(`[FCM Send Error] Token ${token.slice(0, 10)}... failed with code: ${errorCode}`);

            if (
              errorCode === "messaging/invalid-registration-token" ||
              errorCode === "messaging/registration-token-not-registered"
            ) {
              deadTokensToClean.push(token);
            }

            if (!collectedErrors.includes(errorCode)) {
              collectedErrors.push(`${errorCode}: ${resp.error.message}`);
            }
          }
        });
      } catch (batchErr: any) {
        console.error("[FCM Batch Dispatch Error]:", batchErr.message);
        overallFailure += batch.length;
        collectedErrors.push(batchErr.message);
      }
    }

    // Auto-clean dead tokens from DB
    const cleanedCount = await cleanupDeadTokens(deadTokensToClean);

    // Save broadcast audit log
    const status =
      overallSuccess === totalTokens
        ? "success"
        : overallSuccess > 0
        ? "partial_failure"
        : "failed";

    const log = await NotificationBroadcastLog.create({
      title,
      gujaratiTitle,
      body,
      gujaratiBody,
      targetAudience,
      targetRole,
      totalTokensTargeted: totalTokens,
      totalUsersTargeted: totalUsers,
      successCount: overallSuccess,
      failureCount: overallFailure,
      invalidTokensCleaned: cleanedCount,
      sentBy,
      deepLinkRoute,
      priority,
      status,
      dispatchErrors: collectedErrors,
    });

    console.log(
      `[FCM Broadcast Complete] Sent to ${overallSuccess}/${totalTokens} devices. Failures: ${overallFailure}. Cleaned: ${cleanedCount}. Status: ${status}`
    );

    return {
      success: overallSuccess > 0,
      totalUsersTargeted: totalUsers,
      totalTokensTargeted: totalTokens,
      successCount: overallSuccess,
      failureCount: overallFailure,
      invalidTokensCleaned: cleanedCount,
      errors: collectedErrors,
      logId: log._id.toString(),
      message: `Successfully delivered to ${overallSuccess} device(s)${
        overallFailure > 0 ? `, ${overallFailure} failed` : ""
      }.`,
    };
  } catch (error: any) {
    console.error("[Broadcast Notification Error]:", error);
    return {
      success: false,
      totalUsersTargeted: 0,
      totalTokensTargeted: 0,
      successCount: 0,
      failureCount: 0,
      invalidTokensCleaned: 0,
      errors: [error.message],
      message: error.message,
    };
  }
}

/**
 * Legacy/Single recipient push dispatcher backward compatibility
 */
export async function sendPushNotificationPayload(payload: PushNotificationPayload) {
  try {
    await connectDB();
    const query: any = {};
    if (payload.recipientUserId) {
      query._id = payload.recipientUserId;
    } else if (payload.recipientRole) {
      query.$or = [{ role: payload.recipientRole }, { "responsibilities.type": payload.recipientRole }];
    } else if (payload.recipientPhone) {
      query.phone = payload.recipientPhone;
    }

    const targetUsers = await User.find(query);
    const tokens: string[] = [];

    targetUsers.forEach((u) => {
      if (u.deviceTokens && Array.isArray(u.deviceTokens)) {
        u.deviceTokens.forEach((dt) => {
          if (dt.token) tokens.push(dt.token);
        });
      }
      if (u.fcmToken) {
        tokens.push(u.fcmToken);
      }
    });

    if (tokens.length === 0) {
      return { success: true, dispatchedCount: 0, message: "No active device tokens found for recipient." };
    }

    const result = await broadcastNotification({
      title: payload.title,
      body: payload.body,
      targetAudience: payload.recipientRole ? "role" : "custom",
      targetRole: payload.recipientRole,
      customData: payload.data,
      priority: payload.priority || "high",
    });

    return {
      success: result.success,
      dispatchedCount: result.successCount,
      failureCount: result.failureCount,
    };
  } catch (error: any) {
    console.error("[Push Notification Dispatcher Error]:", error.message);
    return { success: false, error: error.message };
  }
}
