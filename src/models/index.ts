import mongoose, { Schema, Document, Model } from "mongoose";

// ==========================================
// 1. User Responsibility & Scope Types
// ==========================================
export type ResponsibilityType =
  | "regular_member"
  | "thal_captain"
  | "sabha_karyakarta"
  | "main_cook"
  | "sub_cook"
  | "car_owner"
  | "mandir_admin"
  | "super_admin";

export type SabhaCategoryType =
  | "Youth Male"
  | "Youth Female"
  | "Yuvati"
  | "Family Sabha"
  | "Morning Sabha"
  | "Evening Sabha"
  | "Special Mahotsav"
  | "Bal Sabha";

export interface IUserResponsibility {
  type: ResponsibilityType;
  title?: string;
  gujaratiTitle?: string;
  scope?: {
    sabhaType?: SabhaCategoryType;
    zone?: string; // e.g. "North Nadiad", "Central Nadiad", "South Nadiad", "East Nadiad", "West Nadiad"
    area?: string;
    familyId?: string;
    department?: string;
  };
  permissions?: string[];
  active: boolean;
  assignedAt: Date;
}

// ==========================================
// 2. User Model (Passcode & Biometrics)
// ==========================================
export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  role?: string; // Legacy fallback
  passcodeHash?: string; // 4 or 6 digit PIN (e.g. "3690" or hashed)
  biometricEnabled: boolean;
  biometricCredentialId?: string;
  memberId?: string; // Ref to canonical Member
  familyId?: string; // Ref to canonical Family
  familyName?: string;
  isCaptain?: boolean;
  responsibilities: IUserResponsibility[];
  department?: string;
  mandir: string;
  avatar?: string;
  active: boolean;
  deviceTokens?: {
    token: string;
    platform: "ios" | "android" | "web";
    updatedAt: Date;
  }[];
  lastLoginAt?: Date;
  createdAt: Date;
}

const UserResponsibilitySchema = new Schema<IUserResponsibility>(
  {
    type: {
      type: String,
      enum: [
        "regular_member",
        "thal_captain",
        "sabha_karyakarta",
        "main_cook",
        "sub_cook",
        "car_owner",
        "mandir_admin",
        "super_admin",
      ],
      required: true,
    },
    title: { type: String },
    gujaratiTitle: { type: String },
    scope: {
      sabhaType: { type: String },
      zone: { type: String },
      area: { type: String },
      familyId: { type: String },
      department: { type: String },
    },
    permissions: [{ type: String }],
    active: { type: Boolean, default: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  role: { type: String, default: "karyakarta" },
  passcodeHash: { type: String, default: "3690" },
  biometricEnabled: { type: Boolean, default: true },
  biometricCredentialId: { type: String },
  memberId: { type: String },
  familyId: { type: String },
  familyName: { type: String },
  isCaptain: { type: Boolean, default: false },
  responsibilities: [UserResponsibilitySchema],
  department: { type: String },
  mandir: { type: String, default: "HariPrabodham, Nadiad" },
  avatar: { type: String },
  active: { type: Boolean, default: true },
  deviceTokens: [
    {
      token: { type: String },
      platform: { type: String, enum: ["ios", "android", "web"] },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 3. Canonical Family Model
// ==========================================
export interface IFamily extends Document {
  familyCode: string;
  name: string;
  gujaratiName?: string;
  captainId?: string; // Ref to canonical Member
  captainName: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  area: string;
  zone: string;
  memberCount: number;
  engagementLevel: "High" | "Medium" | "Low" | "At-Risk";
  status: "Active" | "Pending Review" | "Duplicate Flagged" | "Inactive";
  lastInteractionAt?: Date;
  notes?: string;
  qrCode?: string;
  createdAt: Date;
}

const FamilySchema = new Schema<IFamily>({
  familyCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gujaratiName: { type: String },
  captainId: { type: String },
  captainName: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  address: { type: String, required: true },
  area: { type: String, required: true },
  zone: { type: String, default: "Central Nadiad" },
  memberCount: { type: Number, default: 1 },
  engagementLevel: { type: String, enum: ["High", "Medium", "Low", "At-Risk"], default: "Medium" },
  status: { type: String, enum: ["Active", "Pending Review", "Duplicate Flagged", "Inactive"], default: "Active" },
  lastInteractionAt: { type: Date },
  notes: { type: String },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 4. Canonical Member Model
// ==========================================
export interface IMember extends Document {
  memberCode: string;
  familyId: string;
  familyName: string;
  name: string;
  gujaratiName?: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email?: string;
  relationship: string;
  sevaSkills: string[];
  zone: string;
  area: string;
  sabhaCategory: SabhaCategoryType;
  attendanceStreak: number;
  verificationStatus: "Verified" | "Pending Verification" | "Rejected";
  photoUrl?: string;
  communicationConsent: boolean;
  photoConsent: boolean;
  qrCode: string;
  createdAt: Date;
}

const MemberSchema = new Schema<IMember>({
  memberCode: { type: String, required: true, unique: true },
  familyId: { type: String, required: true, ref: "Family" },
  familyName: { type: String, required: true },
  name: { type: String, required: true },
  gujaratiName: { type: String },
  dob: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  phone: { type: String, required: true },
  email: { type: String },
  relationship: { type: String, default: "Self" },
  sevaSkills: [{ type: String }],
  zone: { type: String, default: "Central Nadiad" },
  area: { type: String, default: "Station Road" },
  sabhaCategory: {
    type: String,
    enum: ["Youth Male", "Youth Female", "Yuvati", "Family Sabha", "Morning Sabha", "Evening Sabha", "Special Mahotsav", "Bal Sabha"],
    default: "Family Sabha",
  },
  attendanceStreak: { type: Number, default: 0 },
  verificationStatus: { type: String, enum: ["Verified", "Pending Verification", "Rejected"], default: "Pending Verification" },
  photoUrl: { type: String },
  communicationConsent: { type: Boolean, default: true },
  photoConsent: { type: Boolean, default: true },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 5. Sabha & Event Model
// ==========================================
export interface ISabha extends Document {
  sabhaCode: string;
  title: string;
  gujaratiTitle?: string;
  type: SabhaCategoryType;
  zone?: string;
  targetGender?: "Male" | "Female" | "All";
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: "Scheduled" | "Live" | "Completed" | "Cancelled";
  expectedCount: number;
  presentCount: number;
  checklist: { item: string; completed: boolean }[];
  notes?: string;
  createdAt: Date;
}

const SabhaSchema = new Schema<ISabha>({
  sabhaCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  gujaratiTitle: { type: String },
  type: {
    type: String,
    enum: ["Youth Male", "Youth Female", "Yuvati", "Family Sabha", "Morning Sabha", "Evening Sabha", "Special Mahotsav", "Bal Sabha"],
    default: "Evening Sabha",
  },
  zone: { type: String, default: "All Nadiad" },
  targetGender: { type: String, enum: ["Male", "Female", "All"], default: "All" },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, default: "Main Satsang Hall, Nadiad" },
  status: { type: String, enum: ["Scheduled", "Live", "Completed", "Cancelled"], default: "Scheduled" },
  expectedCount: { type: Number, default: 120 },
  presentCount: { type: Number, default: 0 },
  checklist: [
    {
      item: { type: String },
      completed: { type: Boolean, default: false },
    },
  ],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 6. Sabha Attendance Model
// ==========================================
export interface ISabhaAttendance extends Document {
  sabhaId: string;
  memberId: string;
  memberName: string;
  familyId: string;
  zone: string;
  sabhaType: string;
  mode: "QR" | "Search" | "List";
  status: "Present" | "Absent";
  markedAt: Date;
  markedBy: string;
  markedByUserId?: string;
}

const SabhaAttendanceSchema = new Schema<ISabhaAttendance>({
  sabhaId: { type: String, required: true, ref: "Sabha" },
  memberId: { type: String, required: true, ref: "Member" },
  memberName: { type: String, required: true },
  familyId: { type: String, required: true },
  zone: { type: String, default: "Central Nadiad" },
  sabhaType: { type: String, default: "Family Sabha" },
  mode: { type: String, enum: ["QR", "Search", "List"], default: "QR" },
  status: { type: String, enum: ["Present", "Absent"], default: "Present" },
  markedAt: { type: Date, default: Date.now },
  markedBy: { type: String, default: "Karyakarta" },
  markedByUserId: { type: String },
});

// ==========================================
// 7. Follow-up Case Model (Scoped)
// ==========================================
export interface IFollowUpCase extends Document {
  caseCode: string;
  familyId: string;
  familyName: string;
  memberId?: string;
  memberName?: string;
  zone: string;
  sabhaType?: string;
  category: "Extended Absence" | "Health & Wellbeing" | "Family Milestone" | "Special Seva Care" | "New Family Onboarding";
  urgency: "Overdue" | "Due Today" | "Upcoming";
  dueDate: string;
  assignedKaryakartaId: string;
  assignedKaryakartaName: string;
  status: "Open" | "Visit Planned" | "Pending Approval" | "Closed";
  confidentialNotes: {
    authorName: string;
    note: string;
    createdAt: Date;
  }[];
  visitPlan?: {
    date: string;
    time: string;
    coVisitor?: string;
  };
  closureReason?: string;
  closureApprovedBy?: string;
  createdAt: Date;
}

const FollowUpCaseSchema = new Schema<IFollowUpCase>({
  caseCode: { type: String, required: true, unique: true },
  familyId: { type: String, required: true, ref: "Family" },
  familyName: { type: String, required: true },
  memberId: { type: String },
  memberName: { type: String },
  zone: { type: String, default: "Central Nadiad" },
  sabhaType: { type: String, default: "Family Sabha" },
  category: {
    type: String,
    enum: ["Extended Absence", "Health & Wellbeing", "Family Milestone", "Special Seva Care", "New Family Onboarding"],
    default: "Extended Absence",
  },
  urgency: { type: String, enum: ["Overdue", "Due Today", "Upcoming"], default: "Due Today" },
  dueDate: { type: String, required: true },
  assignedKaryakartaId: { type: String, required: true },
  assignedKaryakartaName: { type: String, required: true },
  status: { type: String, enum: ["Open", "Visit Planned", "Pending Approval", "Closed"], default: "Open" },
  confidentialNotes: [
    {
      authorName: { type: String },
      note: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  visitPlan: {
    date: { type: String },
    time: { type: String },
    coVisitor: { type: String },
  },
  closureReason: { type: String },
  closureApprovedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 8. Common Seva Request System
// ==========================================
export interface ISevaOpportunity extends Document {
  title: string;
  gujaratiTitle?: string;
  category: "Kitchen" | "Event Setup" | "Sabha Assistance" | "Thal Emergency" | "Transportation" | "Mandir Service";
  department: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  requiredVolunteerCount: number;
  acceptedVolunteerCount: number;
  totalSlots: number;
  filledSlots: number;
  timeCommitment?: string;
  skillsRequired?: string[];
  targetRecipients?: string;
  genderEligibility?: "Male" | "Female" | "All";
  zoneEligibility?: string;
  status: "Open" | "Full" | "Completed" | "Cancelled";
  leadName: string;
  leadPhone?: string;
  volunteers: {
    memberId: string;
    memberName: string;
    phone: string;
    claimedAt: Date;
  }[];
  createdAt: Date;
}

const SevaOpportunitySchema = new Schema<ISevaOpportunity>({
  title: { type: String, required: true },
  gujaratiTitle: { type: String },
  category: {
    type: String,
    enum: ["Kitchen", "Event Setup", "Sabha Assistance", "Thal Emergency", "Transportation", "Mandir Service"],
    default: "Mandir Service",
  },
  department: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, default: "HariPrabodham Mandir, Nadiad" },
  requiredVolunteerCount: { type: Number, default: 5 },
  acceptedVolunteerCount: { type: Number, default: 0 },
  totalSlots: { type: Number, default: 5 },
  filledSlots: { type: Number, default: 0 },
  timeCommitment: { type: String },
  skillsRequired: [{ type: String }],
  targetRecipients: { type: String },
  genderEligibility: { type: String, enum: ["Male", "Female", "All"], default: "All" },
  zoneEligibility: { type: String, default: "All Nadiad" },
  status: { type: String, enum: ["Open", "Full", "Completed", "Cancelled"], default: "Open" },
  leadName: { type: String, default: "Mandir Seva Lead" },
  leadPhone: { type: String },
  volunteers: [
    {
      memberId: { type: String, required: true },
      memberName: { type: String, required: true },
      phone: { type: String, required: true },
      claimedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Legacy Seva Roster Interface for backward compatibility
export interface ISevaRoster extends Document {
  opportunityId: string;
  opportunityTitle: string;
  department: string;
  date: string;
  shiftStartTime: string;
  shiftEndTime: string;
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  status: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  replacementNotes?: string;
  createdAt: Date;
}

const SevaRosterSchema = new Schema<ISevaRoster>({
  opportunityId: { type: String, required: true },
  opportunityTitle: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true },
  shiftStartTime: { type: String, required: true },
  shiftEndTime: { type: String, required: true },
  volunteerId: { type: String, required: true },
  volunteerName: { type: String, required: true },
  volunteerPhone: { type: String, required: true },
  status: { type: String, default: "Assigned" },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  replacementNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 9. Kitchen Management (Bhojanshala)
// ==========================================
export interface IKitchenIngredient {
  name: string;
  gujaratiName?: string;
  quantityPer10People: number;
  unit: "kg" | "g" | "liter" | "ml" | "pieces" | "packets";
  notes?: string;
}

export interface IKitchenRecipe extends Document {
  recipeCode: string;
  name: string;
  gujaratiName?: string;
  category: "Main Course" | "Dal/Curry" | "Sweets" | "Snacks" | "Rice";
  description: string;
  prepTimeMinutes: number;
  ingredients: IKitchenIngredient[];
  preparationInstructions: string[];
  notes?: string;
  createdAt: Date;
}

const KitchenRecipeSchema = new Schema<IKitchenRecipe>({
  recipeCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gujaratiName: { type: String },
  category: {
    type: String,
    enum: ["Main Course", "Dal/Curry", "Sweets", "Snacks", "Rice"],
    default: "Main Course",
  },
  description: { type: String, required: true },
  prepTimeMinutes: { type: Number, default: 60 },
  ingredients: [
    {
      name: { type: String, required: true },
      gujaratiName: { type: String },
      quantityPer10People: { type: Number, required: true },
      unit: { type: String, enum: ["kg", "g", "liter", "ml", "pieces", "packets"], required: true },
      notes: { type: String },
    },
  ],
  preparationInstructions: [{ type: String }],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 10. Transportation & Car Pooling Model
// ==========================================
export interface ITravelRideRequest {
  requestId: string;
  passengerMemberId: string;
  passengerName: string;
  passengerPhone: string;
  pickupPoint: string;
  seatsRequested: number;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  requestedAt: Date;
  decidedAt?: Date;
}

export interface ITravelRide extends Document {
  rideCode: string;
  title: string;
  gujaratiTitle?: string;
  eventOrSabhaId?: string;
  driverMemberId: string;
  driverUserId?: string;
  driverName: string;
  driverPhone: string;
  vehicleModel: string;
  vehicleNumber: string;
  totalSeats: number;
  availableSeats: number;
  departureTime: string;
  departureLocation: string;
  destination: string;
  routeNotes?: string;
  status: "Scheduled" | "Full" | "Departed" | "Completed" | "Cancelled";
  requests: ITravelRideRequest[];
  createdAt: Date;
}

const TravelRideSchema = new Schema<ITravelRide>({
  rideCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  gujaratiTitle: { type: String },
  eventOrSabhaId: { type: String },
  driverMemberId: { type: String, required: true },
  driverUserId: { type: String },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  totalSeats: { type: Number, default: 4 },
  availableSeats: { type: Number, default: 4 },
  departureTime: { type: String, required: true },
  departureLocation: { type: String, required: true },
  destination: { type: String, default: "HariPrabodham Mandir, Nadiad" },
  routeNotes: { type: String },
  status: {
    type: String,
    enum: ["Scheduled", "Full", "Departed", "Completed", "Cancelled"],
    default: "Scheduled",
  },
  requests: [
    {
      requestId: { type: String, required: true },
      passengerMemberId: { type: String, required: true },
      passengerName: { type: String, required: true },
      passengerPhone: { type: String, required: true },
      pickupPoint: { type: String, required: true },
      seatsRequested: { type: Number, default: 1 },
      status: { type: String, enum: ["Pending", "Approved", "Rejected", "Cancelled"], default: "Pending" },
      requestedAt: { type: Date, default: Date.now },
      decidedAt: { type: Date },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 11. Thal Schedule & Swap Model
// ==========================================
export interface IThalSchedule extends Document {
  scheduleCode: string;
  date: string;
  monthPeriod: string;
  mealType: "Breakfast (Morning Thal)" | "Lunch (Afternoon Thal)" | "Snack" | "Dinner (Evening Thal)" | "Special Thal";
  assignedFamilyId: string;
  assignedFamilyName: string;
  assignedPhone: string;
  captainId?: string;
  captainName?: string;
  headcount: number;
  status: "Assigned" | "Confirmed" | "Declined" | "Completed";
  specialInstructions?: string;
  declineReason?: string;
  swapRequested?: boolean;
  notificationSent?: boolean;
  completedAt?: Date;
  createdAt: Date;
}

const ThalScheduleSchema = new Schema<IThalSchedule>({
  scheduleCode: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  monthPeriod: { type: String, required: true, default: "2026-09" },
  mealType: {
    type: String,
    enum: ["Breakfast (Morning Thal)", "Lunch (Afternoon Thal)", "Snack", "Dinner (Evening Thal)", "Special Thal"],
    default: "Breakfast (Morning Thal)",
  },
  assignedFamilyId: { type: String, required: true, ref: "Family" },
  assignedFamilyName: { type: String, required: true },
  assignedPhone: { type: String, required: true },
  captainId: { type: String },
  captainName: { type: String },
  headcount: { type: Number, default: 50 },
  status: { type: String, enum: ["Assigned", "Confirmed", "Declined", "Completed"], default: "Assigned" },
  specialInstructions: { type: String },
  declineReason: { type: String },
  swapRequested: { type: Boolean, default: false },
  notificationSent: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// 4-Step Thal Swap Model
export interface IThalSwapRequest extends Document {
  thalScheduleId: string;
  originalDate: string;
  mealType: string;
  requestingFamilyId: string;
  requestingFamilyName: string;
  requestingCaptainName: string;
  swapType: "family_to_family" | "admin_open_swap";
  targetFamilyId?: string;
  targetFamilyName?: string;
  targetCaptainName?: string;
  targetCaptainDecision: "Pending" | "Accepted" | "Rejected";
  targetCaptainDecidedAt?: Date;
  suggestedDate?: string;
  reason: string;
  status: "Pending Target Captain" | "Pending Admin Approval" | "Approved" | "Rejected" | "Overridden";
  adminNotes?: string;
  approvedBy?: string;
  createdAt: Date;
}

const ThalSwapRequestSchema = new Schema<IThalSwapRequest>({
  thalScheduleId: { type: String, required: true, ref: "ThalSchedule" },
  originalDate: { type: String, required: true },
  mealType: { type: String, default: "Breakfast (Morning Thal)" },
  requestingFamilyId: { type: String, required: true },
  requestingFamilyName: { type: String, required: true },
  requestingCaptainName: { type: String, required: true },
  swapType: { type: String, enum: ["family_to_family", "admin_open_swap"], default: "family_to_family" },
  targetFamilyId: { type: String },
  targetFamilyName: { type: String },
  targetCaptainName: { type: String },
  targetCaptainDecision: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  targetCaptainDecidedAt: { type: Date },
  suggestedDate: { type: String },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending Target Captain", "Pending Admin Approval", "Approved", "Rejected", "Overridden"],
    default: "Pending Target Captain",
  },
  adminNotes: { type: String },
  approvedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 12. Actionable Notifications Model
// ==========================================
export interface IActionableNotification extends Document {
  recipientUserId?: string;
  recipientPhone?: string;
  recipientRole?: string;
  title: string;
  gujaratiTitle?: string;
  message: string;
  gujaratiMessage?: string;
  category: "thal_assignment" | "thal_swap" | "sabha_reminder" | "seva_alert" | "ride_request" | "followup_due" | "announcement";
  actionType?: "SWAP_ACCEPT_REJECT" | "SEVA_CLAIM" | "RIDE_APPROVE" | "CONFIRM_THAL" | "VIEW_LINK";
  actionPayload?: Record<string, any>;
  actionTaken?: boolean;
  actionTakenLabel?: string;
  read: boolean;
  createdAt: Date;
}

const ActionableNotificationSchema = new Schema<IActionableNotification>({
  recipientUserId: { type: String },
  recipientPhone: { type: String },
  recipientRole: { type: String },
  title: { type: String, required: true },
  gujaratiTitle: { type: String },
  message: { type: String, required: true },
  gujaratiMessage: { type: String },
  category: {
    type: String,
    enum: ["thal_assignment", "thal_swap", "sabha_reminder", "seva_alert", "ride_request", "followup_due", "announcement"],
    required: true,
  },
  actionType: {
    type: String,
    enum: ["SWAP_ACCEPT_REJECT", "SEVA_CLAIM", "RIDE_APPROVE", "CONFIRM_THAL", "VIEW_LINK"],
  },
  actionPayload: { type: Schema.Types.Mixed },
  actionTaken: { type: Boolean, default: false },
  actionTakenLabel: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 13. Events & Registrations
// ==========================================
export interface IEvent extends Document {
  eventCode: string;
  title: string;
  gujaratiTitle?: string;
  date: string;
  endDate?: string;
  location: string;
  description: string;
  capacity: number;
  registeredCount: number;
  status: "Planning" | "Live" | "Completed" | "Archived";
  committeeLeads: { department: string; leadName: string }[];
  tasks: { id: string; title: string; assignedTo: string; completed: boolean; dueDate: string }[];
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  eventCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  gujaratiTitle: { type: String },
  date: { type: String, required: true },
  endDate: { type: String },
  location: { type: String, default: "HariPrabodham Mandir Ground, Nadiad" },
  description: { type: String, required: true },
  capacity: { type: Number, default: 500 },
  registeredCount: { type: Number, default: 0 },
  status: { type: String, enum: ["Planning", "Live", "Completed", "Archived"], default: "Planning" },
  committeeLeads: [
    {
      department: { type: String },
      leadName: { type: String },
    },
  ],
  tasks: [
    {
      id: { type: String },
      title: { type: String },
      assignedTo: { type: String },
      completed: { type: Boolean, default: false },
      dueDate: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export interface IEventRegistration extends Document {
  eventId: string;
  eventTitle: string;
  memberId: string;
  memberName: string;
  familyId: string;
  passCode: string;
  status: string;
  createdAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>({
  eventId: { type: String, required: true },
  eventTitle: { type: String, required: true },
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  familyId: { type: String, required: true },
  passCode: { type: String, required: true },
  status: { type: String, default: "Registered" },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 14. Asset & Room Booking Models (Compatibility)
// ==========================================
export interface IAsset extends Document {
  assetCode: string;
  name: string;
  category: string;
  location: string;
  condition: string;
  status: string;
  currentHolder?: string;
  expectedReturnDate?: string;
  qrCode?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: Date;
}

const AssetSchema = new Schema<IAsset>({
  assetCode: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, default: "General" },
  location: { type: String, default: "Mandir Store Room" },
  condition: { type: String, default: "Good" },
  status: { type: String, default: "Available" },
  currentHolder: { type: String },
  expectedReturnDate: { type: String },
  qrCode: { type: String },
  photoUrl: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export interface IRoomBooking extends Document {
  roomName: string;
  purpose: string;
  bookedBy: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  status: string;
  createdAt: Date;
}

const RoomBookingSchema = new Schema<IRoomBooking>({
  roomName: { type: String, required: true },
  purpose: { type: String, required: true },
  bookedBy: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  attendees: { type: Number, default: 25 },
  status: { type: String, default: "Confirmed" },
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// 15. Announcements & Audit Log
// ==========================================
export interface IAnnouncement extends Document {
  title: string;
  gujaratiTitle?: string;
  body: string;
  gujaratiBody?: string;
  targetAudience: string;
  channels: string[];
  scheduledAt?: string;
  status: string;
  authorName: string;
  approvedBy?: string;
  stats: { sentCount: number; deliveredCount: number; openedCount: number };
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  gujaratiTitle: { type: String },
  body: { type: String, required: true },
  gujaratiBody: { type: String },
  targetAudience: { type: String, default: "Everyone" },
  channels: [{ type: String }],
  scheduledAt: { type: String },
  status: { type: String, default: "Sent" },
  authorName: { type: String, default: "Mandir Office" },
  approvedBy: { type: String },
  stats: {
    sentCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

export interface IAuditLog extends Document {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  module: string;
  recordId?: string;
  description: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorId: { type: String, required: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  recordId: { type: String },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export all Mongoose Models
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const Family: Model<IFamily> = mongoose.models.Family || mongoose.model<IFamily>("Family", FamilySchema);
export const Member: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);
export const Sabha: Model<ISabha> = mongoose.models.Sabha || mongoose.model<ISabha>("Sabha", SabhaSchema);
export const SabhaAttendance: Model<ISabhaAttendance> = mongoose.models.SabhaAttendance || mongoose.model<ISabhaAttendance>("SabhaAttendance", SabhaAttendanceSchema);
export const FollowUpCase: Model<IFollowUpCase> = mongoose.models.FollowUpCase || mongoose.model<IFollowUpCase>("FollowUpCase", FollowUpCaseSchema);
export const SevaOpportunity: Model<ISevaOpportunity> = mongoose.models.SevaOpportunity || mongoose.model<ISevaOpportunity>("SevaOpportunity", SevaOpportunitySchema);
export const SevaRoster: Model<ISevaRoster> = mongoose.models.SevaRoster || mongoose.model<ISevaRoster>("SevaRoster", SevaRosterSchema);
export const KitchenRecipe: Model<IKitchenRecipe> = mongoose.models.KitchenRecipe || mongoose.model<IKitchenRecipe>("KitchenRecipe", KitchenRecipeSchema);
export const TravelRide: Model<ITravelRide> = mongoose.models.TravelRide || mongoose.model<ITravelRide>("TravelRide", TravelRideSchema);
export const ThalSchedule: Model<IThalSchedule> = mongoose.models.ThalSchedule || mongoose.model<IThalSchedule>("ThalSchedule", ThalScheduleSchema);
export const ThalSwapRequest: Model<IThalSwapRequest> = mongoose.models.ThalSwapRequest || mongoose.model<IThalSwapRequest>("ThalSwapRequest", ThalSwapRequestSchema);
export const ActionableNotification: Model<IActionableNotification> = mongoose.models.ActionableNotification || mongoose.model<IActionableNotification>("ActionableNotification", ActionableNotificationSchema);
export const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
export const EventRegistration: Model<IEventRegistration> = mongoose.models.EventRegistration || mongoose.model<IEventRegistration>("EventRegistration", EventRegistrationSchema);
export const Asset: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
export const RoomBooking: Model<IRoomBooking> = mongoose.models.RoomBooking || mongoose.model<IRoomBooking>("RoomBooking", RoomBookingSchema);
export const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
