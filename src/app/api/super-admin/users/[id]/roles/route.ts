import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, AuditLog, ResponsibilityType } from "@/models";

const VALID_ROLE_TYPES: ResponsibilityType[] = [
  "regular_member",
  "thal_captain",
  "sabha_karyakarta",
  "main_cook",
  "sub_cook",
  "car_owner",
  "mandir_admin",
  "super_admin",
];

// Helper to get standard title
function getDefaultTitle(type: ResponsibilityType): { title: string; gujaratiTitle: string } {
  switch (type) {
    case "super_admin":
      return { title: "Super Administrator", gujaratiTitle: "મુખ્ય વહીવટકર્તા" };
    case "mandir_admin":
      return { title: "Mandir Administrator", gujaratiTitle: "મંદિર વહીવટકર્તા" };
    case "sabha_karyakarta":
      return { title: "Sabha Karyakarta", gujaratiTitle: "સભા કાર્યકર્તા" };
    case "thal_captain":
      return { title: "Family Thal Captain", gujaratiTitle: "પરિવાર થાળ કેપ્ટન" };
    case "main_cook":
      return { title: "Kitchen Lead Cook", gujaratiTitle: "રસોઈ સેવા પ્રમુખ" };
    case "sub_cook":
      return { title: "Kitchen Assistant Cook", gujaratiTitle: "રસોઈ સહાયક" };
    case "car_owner":
      return { title: "Mandir Transport Driver", gujaratiTitle: "વાહન સેવા (કાર માલિક)" };
    case "regular_member":
    default:
      return { title: "Mandir Member", gujaratiTitle: "મંદિર સભ્ય" };
  }
}

// GET /api/super-admin/users/[id]/roles
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const auditLogs = await AuditLog.find({
      $or: [
        { recordId: id },
        { description: { $regex: user.name, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      user,
      auditLogs,
    });
  } catch (error: any) {
    console.error("Fetch user roles error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/super-admin/users/[id]/roles -> Assign a new role
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const {
      type,
      title,
      gujaratiTitle,
      scope = {},
      permissions = [],
      actorId = "super_admin",
      actorName = "Super Admin",
    } = body;

    if (!type || !VALID_ROLE_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid role type: ${type}` },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (!user.responsibilities) {
      user.responsibilities = [];
    }

    // Check if role of this type already exists
    const existingIndex = user.responsibilities.findIndex((r: any) => r.type === type);
    if (existingIndex !== -1) {
      // Re-activate or update if it already existed
      user.responsibilities[existingIndex].active = true;
      if (title) user.responsibilities[existingIndex].title = title;
      if (gujaratiTitle) user.responsibilities[existingIndex].gujaratiTitle = gujaratiTitle;
      if (scope) user.responsibilities[existingIndex].scope = { ...user.responsibilities[existingIndex].scope, ...scope };
      if (permissions && permissions.length > 0) user.responsibilities[existingIndex].permissions = permissions;
    } else {
      const defaults = getDefaultTitle(type);
      user.responsibilities.push({
        type,
        title: title || defaults.title,
        gujaratiTitle: gujaratiTitle || defaults.gujaratiTitle,
        scope,
        permissions,
        active: true,
        assignedAt: new Date(),
      } as any);
    }

    // Sync captain flag
    if (type === "thal_captain") {
      user.isCaptain = true;
    }

    // Sync primary role if currently regular or not set
    if (!user.role || user.role === "regular_member") {
      user.role = type;
    }

    await user.save();

    // Log in AuditLog
    await AuditLog.create({
      actorId,
      actorName,
      actorRole: "super_admin",
      action: "ASSIGN_ROLE",
      module: "Access Control",
      recordId: user._id.toString(),
      description: `Assigned role '${type}' (${title || getDefaultTitle(type).title}) to ${user.name}`,
    });

    return NextResponse.json({
      success: true,
      message: `Role ${type} successfully assigned to ${user.name}`,
      user,
    });
  } catch (error: any) {
    console.error("Assign role error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/super-admin/users/[id]/roles -> Update an existing role or user primary role
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const {
      index,
      type,
      active,
      title,
      gujaratiTitle,
      scope,
      permissions,
      primaryRole,
      actorId = "super_admin",
      actorName = "Super Admin",
    } = body;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    let changeDescription = "";

    // If updating primary role
    if (primaryRole !== undefined) {
      user.role = primaryRole;
      changeDescription += `Primary role updated to '${primaryRole}'. `;
    }

    // If updating a specific responsibility
    let targetIndex = -1;
    if (typeof index === "number" && index >= 0 && index < user.responsibilities.length) {
      targetIndex = index;
    } else if (type) {
      targetIndex = user.responsibilities.findIndex((r: any) => r.type === type);
    }

    if (targetIndex !== -1) {
      const resp = user.responsibilities[targetIndex];

      if (typeof active === "boolean") {
        resp.active = active;
        changeDescription += `Role '${resp.type}' status set to ${active ? "Active" : "Inactive"}. `;
      }
      if (title !== undefined) resp.title = title;
      if (gujaratiTitle !== undefined) resp.gujaratiTitle = gujaratiTitle;
      if (scope !== undefined) resp.scope = { ...resp.scope, ...scope };
      if (permissions !== undefined) resp.permissions = permissions;

      // Sync captain flag if thal_captain was deactivated
      if (resp.type === "thal_captain") {
        user.isCaptain = resp.active;
      }
    }

    await user.save();

    // Log to AuditLog
    await AuditLog.create({
      actorId,
      actorName,
      actorRole: "super_admin",
      action: "UPDATE_ROLE",
      module: "Access Control",
      recordId: user._id.toString(),
      description: changeDescription || `Updated roles/permissions for ${user.name}`,
    });

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Update role error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/super-admin/users/[id]/roles -> Delete/revoke role
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const {
      index,
      type,
      actorId = "super_admin",
      actorName = "Super Admin",
    } = body;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    let targetIndex = -1;
    if (typeof index === "number" && index >= 0 && index < user.responsibilities.length) {
      targetIndex = index;
    } else if (type) {
      targetIndex = user.responsibilities.findIndex((r: any) => r.type === type);
    }

    if (targetIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Role to delete not found" },
        { status: 400 }
      );
    }

    const removed = user.responsibilities.splice(targetIndex, 1)[0];

    // If removed role was thal_captain, check if another active thal_captain exists
    if (removed.type === "thal_captain") {
      const hasOtherCaptain = user.responsibilities.some(
        (r: any) => r.type === "thal_captain" && r.active
      );
      user.isCaptain = hasOtherCaptain;
    }

    // If removed role was the primary role, fallback to next available responsibility or regular_member
    if (user.role === removed.type) {
      user.role = user.responsibilities[0]?.type || "regular_member";
    }

    await user.save();

    // Log to AuditLog
    await AuditLog.create({
      actorId,
      actorName,
      actorRole: "super_admin",
      action: "REVOKE_ROLE",
      module: "Access Control",
      recordId: user._id.toString(),
      description: `Revoked role '${removed.type}' (${removed.title}) from ${user.name}`,
    });

    return NextResponse.json({
      success: true,
      message: `Role '${removed.title || removed.type}' revoked successfully`,
      user,
    });
  } catch (error: any) {
    console.error("Delete role error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

