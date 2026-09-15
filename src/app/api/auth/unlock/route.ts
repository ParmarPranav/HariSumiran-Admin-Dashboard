import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { initialUsers } from "@/lib/seedData";
import { resolveUserScope, findUserByIdentifier } from "@/lib/authScope";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { userId, pin, phone, email } = body;

    let matchedUser = null;
    if (userId) {
      matchedUser = await findUserByIdentifier(userId);
    } else if (phone) {
      matchedUser = await findUserByIdentifier(phone);
    } else if (email) {
      matchedUser = await findUserByIdentifier(email);
    }

    if (!matchedUser) {
      // Default to Rameshbhai Patel (Super Admin) or first available user
      matchedUser = (await User.findOne({ "responsibilities.type": "super_admin" })) ||
                    (await User.findOne({ "responsibilities.type": "mandir_admin" })) ||
                    initialUsers[0];
    }

    const scope = resolveUserScope(matchedUser as any);

    return NextResponse.json({
      success: true,
      message: "App unlocked successfully",
      token: "jwt_token_" + Date.now(),
      user: {
        id: (matchedUser as any)._id?.toString() || (matchedUser as any).id || "USR-001",
        name: matchedUser.name,
        phone: matchedUser.phone,
        email: matchedUser.email,
        familyId: matchedUser.familyId,
        familyName: matchedUser.familyName,
        responsibilities: matchedUser.responsibilities || [],
        scope: {
          isAdmin: scope.isAdmin,
          isSuperAdmin: scope.isSuperAdmin,
          isThalCaptain: scope.isThalCaptain,
          isKaryakarta: scope.isKaryakarta,
          isMainCook: scope.isMainCook,
          isCarOwner: scope.isCarOwner,
          zone: scope.allowedZones.length > 0 ? scope.allowedZones[0] : "Zone A",
          sabhaType: scope.allowedSabhaTypes.length > 0 ? scope.allowedSabhaTypes[0] : "Family Sabha",
        },
      },
      resolvedScope: scope,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
