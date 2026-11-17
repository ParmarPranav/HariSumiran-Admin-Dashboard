import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alertId, action, category, timestamp = new Date().toISOString() } = body;

    await connectDB();

    console.log(`[Notification ACK] Alert "${alertId}" responded with action "${action}" (${category}) at ${timestamp}`);

    try {
      await AuditLog.create({
        action: `NOTIFICATION_ALERT_${(action || "ACK").toUpperCase()}`,
        details: `Devotee responded to alert ${alertId} with action ${action}`,
        timestamp: new Date(timestamp),
        category: category || "Alert",
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Alert acknowledgement recorded successfully",
      alertId,
      action,
    });
  } catch (error: any) {
    console.error("[Notification ACK Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
