import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, AuditLog, Family, Member, Sabha, FollowUpCase } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const [users, auditLogs] = await Promise.all([
      User.find({}),
      AuditLog.find({}).sort({ createdAt: -1 }).limit(50),
    ]);

    const systemInfo = {
      mandirName: "HariPrabodham, Nadiad",
      version: "2.4.0 (Production)",
      database: "MongoDB Atlas (harisumiran)",
      syncStatus: "Operational / Synced",
      backupSchedule: "Daily at 02:00 AM IST",
      lastBackupAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    };

    const rolePermissionsMatrix = [
      {
        module: "Families",
        super_admin: "Full",
        mandir_admin: "Full",
        dept_head: "Scoped",
        karyakarta: "Full",
        family_captain: "Own Family",
        family_member: "Own Profile",
      },
      {
        module: "Members",
        super_admin: "Full",
        mandir_admin: "Full",
        dept_head: "Scoped",
        karyakarta: "Full",
        family_captain: "Own Dependents",
        family_member: "Own Profile",
      },
      {
        module: "Sabha & Attendance",
        super_admin: "Full",
        mandir_admin: "Full",
        dept_head: "View",
        karyakarta: "Live Attendance",
        family_captain: "RSVP & View",
        family_member: "RSVP & View",
      },
      {
        module: "Follow-Up Cases",
        super_admin: "Full",
        mandir_admin: "Oversight",
        dept_head: "Supervisor",
        karyakarta: "Assigned Cases",
        family_captain: "No Access",
        family_member: "No Access",
      },
      {
        module: "Seva & Rosters",
        super_admin: "Full",
        mandir_admin: "Full",
        dept_head: "Dept Manage",
        karyakarta: "Coordinate",
        family_captain: "Enroll",
        family_member: "My Duties & QR",
      },
      {
        module: "Thal Rotation",
        super_admin: "Full",
        mandir_admin: "Coordinator",
        dept_head: "View",
        karyakarta: "View",
        family_captain: "Confirm / Swap",
        family_member: "View Turn",
      },
      {
        module: "Assets & Facilities",
        super_admin: "Full",
        mandir_admin: "Full",
        dept_head: "Dept Assets",
        karyakarta: "Borrow / Scan",
        family_captain: "Hall Booking",
        family_member: "No Access",
      },
      {
        module: "Communication",
        super_admin: "Full",
        mandir_admin: "Approve / Broadcast",
        dept_head: "Dept Notices",
        karyakarta: "Draft",
        family_captain: "Receive Updates",
        family_member: "Receive Updates",
      },
      {
        module: "System Admin & Audit",
        super_admin: "Full",
        mandir_admin: "Restricted",
        dept_head: "No Access",
        karyakarta: "No Access",
        family_captain: "No Access",
        family_member: "No Access",
      },
    ];

    return NextResponse.json({
      success: true,
      systemInfo,
      users,
      auditLogs,
      rolePermissionsMatrix,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
