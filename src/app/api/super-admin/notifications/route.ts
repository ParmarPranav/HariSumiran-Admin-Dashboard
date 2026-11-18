import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, NotificationBroadcastLog } from "@/models";
import { broadcastNotification } from "@/lib/notifications";
import { getFirebaseAdminApp, getFirebaseAdminStatus } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find(
      {},
      "name phone role responsibilities deviceTokens fcmToken active avatar"
    );

    let usersWithTokensCount = 0;
    let totalTokensCount = 0;
    const platformBreakdown = { android: 0, ios: 0, web: 0, other: 0 };
    const roleTokenCounts: Record<string, number> = {
      super_admin: 0,
      mandir_admin: 0,
      sabha_karyakarta: 0,
      thal_captain: 0,
      main_cook: 0,
      car_owner: 0,
      regular_member: 0,
    };

    const tokenDevotees: {
      id: string;
      name: string;
      phone: string;
      role: string;
      tokensCount: number;
      platforms: string[];
    }[] = [];

    users.forEach((user) => {
      const userTokens: string[] = [];
      const userPlatforms: string[] = [];

      if (user.deviceTokens && Array.isArray(user.deviceTokens)) {
        user.deviceTokens.forEach((dt) => {
          if (dt.token && dt.token.trim().length > 10) {
            userTokens.push(dt.token);
            const p = (dt.platform || "android").toLowerCase();
            if (p in platformBreakdown) {
              platformBreakdown[p as keyof typeof platformBreakdown]++;
            } else {
              platformBreakdown.other++;
            }
            if (!userPlatforms.includes(p)) userPlatforms.push(p);
          }
        });
      }

      if (user.fcmToken && user.fcmToken.trim().length > 10) {
        if (!userTokens.includes(user.fcmToken)) {
          userTokens.push(user.fcmToken);
          platformBreakdown.android++;
          if (!userPlatforms.includes("android")) userPlatforms.push("android");
        }
      }

      if (userTokens.length > 0) {
        usersWithTokensCount++;
        totalTokensCount += userTokens.length;

        // Categorize role
        const role = user.role || "regular_member";
        if (role in roleTokenCounts) {
          roleTokenCounts[role]++;
        } else {
          roleTokenCounts.regular_member++;
        }

        tokenDevotees.push({
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          role: role,
          tokensCount: userTokens.length,
          platforms: userPlatforms,
        });
      }
    });

    const fcmStatus = getFirebaseAdminStatus();

    // Fetch past broadcasts
    const history = await NotificationBroadcastLog.find()
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        usersWithTokens: usersWithTokensCount,
        totalTokens: totalTokensCount,
        platformBreakdown,
        roleBreakdown: roleTokenCounts,
        firebaseConnected: fcmStatus.connected,
        firebaseStatus: fcmStatus,
      },
      devotees: tokenDevotees,
      history,
    });
  } catch (error: any) {
    console.error("[SuperAdmin Notification GET Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      gujaratiTitle,
      body: messageBody,
      gujaratiBody,
      targetAudience = "all",
      targetRole,
      deepLinkRoute = "/",
      priority = "high",
      sentBy,
      customData,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Notification title is required." },
        { status: 400 }
      );
    }

    if (!messageBody || !messageBody.trim()) {
      return NextResponse.json(
        { success: false, error: "Notification message body is required." },
        { status: 400 }
      );
    }

    const result = await broadcastNotification({
      title: title.trim(),
      gujaratiTitle: gujaratiTitle?.trim() || undefined,
      body: messageBody.trim(),
      gujaratiBody: gujaratiBody?.trim() || undefined,
      targetAudience,
      targetRole: targetRole || undefined,
      deepLinkRoute: deepLinkRoute?.trim() || "/",
      priority,
      sentBy: sentBy || {
        name: "Super Admin",
        phone: "",
        role: "super_admin",
      },
      customData,
    });

    return NextResponse.json({
      ...result,
    });
  } catch (error: any) {
    console.error("[SuperAdmin Notification POST Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
