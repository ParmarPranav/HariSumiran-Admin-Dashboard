import mongoose from "mongoose";
import { User, IUser, IUserResponsibility, ResponsibilityType, SabhaCategoryType } from "@/models";
import { initialUsers } from "@/lib/seedData";

export interface ResolvedScope {
  userId: string;
  name: string;
  phone: string;
  memberId?: string;
  familyId?: string;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isKaryakarta: boolean;
  isThalCaptain: boolean;
  isMainCook: boolean;
  isCarOwner: boolean;
  responsibilities: IUserResponsibility[];
  // Allowed Scopes
  allowedZones: string[]; // e.g. ["North Nadiad"] or ["*"] for admin
  allowedSabhaTypes: SabhaCategoryType[]; // e.g. ["Youth Male"] or ["*"]
  allowedDepartments: string[];
}

/**
 * Safely resolves user from MongoDB by ID, phone, name, email, or seed fallback
 */
export async function findUserByIdentifier(identifier: string | null | undefined): Promise<any> {
  if (!identifier) return null;
  let user = null;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    user = await User.findById(identifier);
  }
  if (!user) {
    user = await User.findOne({
      $or: [
        { phone: identifier },
        { name: new RegExp(`^${identifier}$`, "i") },
        { email: identifier },
      ],
    });
  }
  if (!user) {
    const seed = initialUsers.find(
      (u: any) =>
        u.id === identifier ||
        (u as any)._id === identifier ||
        u.phone === identifier ||
        u.name.toLowerCase() === identifier.toLowerCase() ||
        u.email === identifier
    );
    if (seed) return seed as any;
  }
  return user;
}

/**
 * Resolves a User's aggregated capabilities, permissions, and database filter scopes.
 */
export function resolveUserScope(user: Partial<IUser> | null): ResolvedScope {
  if (!user) {
    return {
      userId: "",
      name: "Guest",
      phone: "",
      isSuperAdmin: false,
      isAdmin: false,
      isKaryakarta: false,
      isThalCaptain: false,
      isMainCook: false,
      isCarOwner: false,
      responsibilities: [],
      allowedZones: [],
      allowedSabhaTypes: [],
      allowedDepartments: [],
    };
  }

  const responsibilities = (user.responsibilities || []).filter((r) => r.active !== false);

  const isSuperAdmin = responsibilities.some((r) => r.type === "super_admin");
  const isAdmin = isSuperAdmin || responsibilities.some((r) => r.type === "mandir_admin");
  const isKaryakarta = responsibilities.some((r) => r.type === "sabha_karyakarta");
  const isThalCaptain = user.isCaptain || responsibilities.some((r) => r.type === "thal_captain");
  const isMainCook = responsibilities.some((r) => r.type === "main_cook");
  const isCarOwner = responsibilities.some((r) => r.type === "car_owner");

  const allowedZones = new Set<string>();
  const allowedSabhaTypes = new Set<SabhaCategoryType>();
  const allowedDepartments = new Set<string>();

  if (isAdmin) {
    // Admin has global access to all zones and sabhas
    return {
      userId: (user as any)._id?.toString() || (user as any).id || "",
      name: user.name || "Administrator",
      phone: user.phone || "",
      memberId: user.memberId,
      familyId: user.familyId,
      isSuperAdmin,
      isAdmin: true,
      isKaryakarta: true,
      isThalCaptain: true,
      isMainCook: true,
      isCarOwner: true,
      responsibilities,
      allowedZones: ["*"],
      allowedSabhaTypes: ["Youth Male", "Youth Female", "Yuvati", "Family Sabha", "Morning Sabha", "Evening Sabha", "Special Mahotsav", "Bal Sabha"],
      allowedDepartments: ["*"],
    };
  }

  for (const resp of responsibilities) {
    if (resp.scope?.zone) {
      allowedZones.add(resp.scope.zone);
    }
    if (resp.scope?.sabhaType) {
      allowedSabhaTypes.add(resp.scope.sabhaType);
    }
    if (resp.scope?.department) {
      allowedDepartments.add(resp.scope.department);
    }
  }

  return {
    userId: (user as any)._id?.toString() || (user as any).id || "",
    name: user.name || "",
    phone: user.phone || "",
    memberId: user.memberId,
    familyId: user.familyId,
    isSuperAdmin: false,
    isAdmin: false,
    isKaryakarta,
    isThalCaptain,
    isMainCook,
    isCarOwner,
    responsibilities,
    allowedZones: Array.from(allowedZones),
    allowedSabhaTypes: Array.from(allowedSabhaTypes),
    allowedDepartments: Array.from(allowedDepartments),
  };
}

/**
 * Builds a MongoDB query filter for Members based on the user's scope.
 * Youth Male Karyakarta Zone A can only query Youth Male Zone A members.
 */
export function buildMemberScopeFilter(scope: ResolvedScope, additionalQuery: Record<string, any> = {}) {
  if (scope.isAdmin || scope.allowedZones.includes("*")) {
    return additionalQuery;
  }

  const andConditions: any[] = [{ ...additionalQuery }];

  if (scope.isKaryakarta) {
    if (scope.allowedZones.length > 0) {
      andConditions.push({ zone: { $in: scope.allowedZones } });
    }
    if (scope.allowedSabhaTypes.length > 0) {
      andConditions.push({ sabhaCategory: { $in: scope.allowedSabhaTypes } });
    }
  } else {
    // Normal Member / Family Captain can only see their own family members
    if (scope.familyId) {
      andConditions.push({ $or: [{ familyId: scope.familyId }, { familyName: new RegExp(scope.familyId, "i") }] });
    } else if (scope.memberId) {
      andConditions.push({ memberCode: scope.memberId });
    } else {
      andConditions.push({ _id: new mongoose.Types.ObjectId() });
    }
  }

  return andConditions.length === 1 ? andConditions[0] : { $and: andConditions };
}

/**
 * Builds a MongoDB query filter for Sabha/Events based on the user's scope.
 */
export function buildSabhaScopeFilter(scope: ResolvedScope, additionalQuery: Record<string, any> = {}) {
  if (scope.isAdmin || scope.allowedZones.includes("*")) {
    return additionalQuery;
  }

  if (scope.allowedSabhaTypes.length > 0) {
    return {
      ...additionalQuery,
      type: { $in: [...scope.allowedSabhaTypes, "Evening Sabha", "Morning Sabha", "Special Mahotsav", "Family Sabha"] },
    };
  }

  return additionalQuery;
}

/**
 * Builds a MongoDB query filter for Follow-up Cases.
 */
export function buildFollowUpScopeFilter(scope: ResolvedScope, additionalQuery: Record<string, any> = {}) {
  if (scope.isAdmin || scope.allowedZones.includes("*")) {
    return additionalQuery;
  }

  if (scope.isKaryakarta) {
    const filters: any[] = [{ ...additionalQuery }];
    if (scope.allowedZones.length > 0) {
      filters.push({ zone: { $in: scope.allowedZones } });
    }
    return filters.length === 1 ? filters[0] : { $and: filters };
  }

  // Normal members cannot see follow-up records
  return { _id: new mongoose.Types.ObjectId() };
}

