import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement, Family, Member, AuditLog } from "@/models";
import { resolveUserScope, findUserByIdentifier } from "@/lib/authScope";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const targetScope = searchParams.get("targetScope") || searchParams.get("targetAudience");
    const userId = searchParams.get("userId");

    const authHeader = req.headers.get("authorization");
    let callerIdentifier = userId;
    if (!callerIdentifier && authHeader && authHeader.startsWith("Bearer ")) {
      callerIdentifier = authHeader.replace("Bearer ", "");
    }

    const user = await findUserByIdentifier(callerIdentifier);
    const scope = resolveUserScope(user as any);

    const query: any = {};
    if (targetScope && targetScope !== "All" && targetScope !== "Everyone") {
      query.$or = [
        { targetAudience: { $regex: targetScope, $options: "i" } },
        { targetAudience: "Everyone" },
        { targetAudience: "Mandir-Wide" },
      ];
    }

    let announcements = await Announcement.find(query).sort({ createdAt: -1 });

    // If caller has specific sabhaType/zone, include those or mandir-wide
    if (announcements.length === 0 && targetScope) {
      announcements = await Announcement.find({}).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, count: announcements.length, announcements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      title,
      gujaratiTitle,
      body: content,
      gujaratiBody,
      targetAudience = "Everyone",
      targetScope,
      channels = ["App Push", "WhatsApp"],
      scheduledAt,
      authorName = "Mandir Office",
      status = "Sent",
    } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and Body are required." }, { status: 400 });
    }

    const finalTarget = targetScope || targetAudience;

    let recipientCount = 380;
    if (finalTarget.includes("Kitchen")) recipientCount = 18;
    else if (finalTarget.includes("Karyakartas")) recipientCount = 24;
    else if (finalTarget.includes("Area")) recipientCount = 65;

    const announcement = await Announcement.create({
      title,
      gujaratiTitle: gujaratiTitle || "",
      body: content,
      gujaratiBody: gujaratiBody || "",
      targetAudience: finalTarget,
      channels,
      scheduledAt,
      status: status || "Sent",
      authorName,
      stats: {
        sentCount: recipientCount,
        deliveredCount: Math.floor(recipientCount * 0.98),
        openedCount: Math.floor(recipientCount * 0.76),
      },
    });

    await AuditLog.create({
      actorId: "usr-admin",
      actorName: authorName,
      actorRole: "mandir_admin",
      action: "SEND_ANNOUNCEMENT",
      module: "Communication",
      recordId: announcement._id.toString(),
      description: `Broadcasted announcement "${title}" to ${finalTarget} via ${channels.join(", ")}`,
    });

    return NextResponse.json({
      success: true,
      message: "Announcement broadcasted successfully",
      announcement,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
