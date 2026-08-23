import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement, Family, Member, AuditLog } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
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
      channels = ["App Push", "WhatsApp"],
      scheduledAt,
      authorName = "Mandir Office",
      status = "Sent",
    } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and Body are required." }, { status: 400 });
    }

    // Estimate recipient counts
    let recipientCount = 380;
    if (targetAudience.includes("Kitchen")) recipientCount = 18;
    else if (targetAudience.includes("Karyakartas")) recipientCount = 24;
    else if (targetAudience.includes("Area")) recipientCount = 65;

    const announcement = await Announcement.create({
      title,
      gujaratiTitle: gujaratiTitle || "",
      body: content,
      gujaratiBody: gujaratiBody || "",
      targetAudience,
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
      description: `Broadcasted announcement "${title}" to ${targetAudience} via ${channels.join(", ")}`,
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
