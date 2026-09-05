import mongoose, { Schema, Document, Model } from "mongoose";

// 1. User Model
export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  role: "super_admin" | "mandir_admin" | "dept_head" | "karyakarta" | "family_captain" | "family_member";
  department?: string;
  mandir: string;
  avatar?: string;
  biometricEnabled: boolean;
  active: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  role: {
    type: String,
    enum: ["super_admin", "mandir_admin", "dept_head", "karyakarta", "family_captain", "family_member"],
    default: "karyakarta",
  },
  department: { type: String },
  mandir: { type: String, default: "HariPrabodham, Nadiad" },
  avatar: { type: String },
  biometricEnabled: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// 2. Family Model
export interface IFamily extends Document {
  familyCode: string;
  name: string;
  gujaratiName?: string;
  captainId?: string;
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
  zone: { type: String, default: "Central" },
  memberCount: { type: Number, default: 1 },
  engagementLevel: { type: String, enum: ["High", "Medium", "Low", "At-Risk"], default: "Medium" },
  status: { type: String, enum: ["Active", "Pending Review", "Duplicate Flagged", "Inactive"], default: "Active" },
  lastInteractionAt: { type: Date },
  notes: { type: String },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 3. Member Model
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
  attendanceStreak: number;
  verificationStatus: "Verified" | "Pending Verification" | "Rejected";
  photoUrl?: string;
  communicationConsent: boolean;
  photoConsent: boolean;
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
  attendanceStreak: { type: Number, default: 0 },
  verificationStatus: { type: String, enum: ["Verified", "Pending Verification", "Rejected"], default: "Pending Verification" },
  photoUrl: { type: String },
  communicationConsent: { type: Boolean, default: true },
  photoConsent: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// 4. Sabha Model
export interface ISabha extends Document {
  sabhaCode: string;
  title: string;
  gujaratiTitle?: string;
  type: "Morning Sabha" | "Evening Sabha" | "Youth Sabha" | "Special Mahotsav" | "Bal Sabha";
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
    enum: ["Morning Sabha", "Evening Sabha", "Youth Sabha", "Special Mahotsav", "Bal Sabha"],
    default: "Evening Sabha",
  },
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

// 5. Sabha Attendance Model
export interface ISabhaAttendance extends Document {
  sabhaId: string;
  memberId: string;
  memberName: string;
  familyId: string;
  mode: "QR" | "Search" | "List";
  status: "Present" | "Absent";
  markedAt: Date;
  markedBy: string;
}

const SabhaAttendanceSchema = new Schema<ISabhaAttendance>({
  sabhaId: { type: String, required: true, ref: "Sabha" },
  memberId: { type: String, required: true, ref: "Member" },
  memberName: { type: String, required: true },
  familyId: { type: String, required: true },
  mode: { type: String, enum: ["QR", "Search", "List"], default: "QR" },
  status: { type: String, enum: ["Present", "Absent"], default: "Present" },
  markedAt: { type: Date, default: Date.now },
  markedBy: { type: String, default: "Karyakarta" },
});

// 6. Follow-up Case Model
export interface IFollowUpCase extends Document {
  caseCode: string;
  familyId: string;
  familyName: string;
  memberId?: string;
  memberName?: string;
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

// 7. Seva Opportunity Model
export interface ISevaOpportunity extends Document {
  title: string;
  gujaratiTitle?: string;
  department: "Kitchen (Mahaprasad)" | "Sound & Broadcast" | "Security & Parking" | "Bal Mandal & Youth" | "Decoration & Rangoli" | "Medical & First Aid";
  description: string;
  skillsRequired: string[];
  timeCommitment: string;
  totalSlots: number;
  filledSlots: number;
  status: "Open" | "Full" | "Completed";
  leadName: string;
  createdAt: Date;
}

const SevaOpportunitySchema = new Schema<ISevaOpportunity>({
  title: { type: String, required: true },
  gujaratiTitle: { type: String },
  department: {
    type: String,
    enum: ["Kitchen (Mahaprasad)", "Sound & Broadcast", "Security & Parking", "Bal Mandal & Youth", "Decoration & Rangoli", "Medical & First Aid"],
    required: true,
  },
  description: { type: String, required: true },
  skillsRequired: [{ type: String }],
  timeCommitment: { type: String, required: true },
  totalSlots: { type: Number, default: 5 },
  filledSlots: { type: Number, default: 0 },
  status: { type: String, enum: ["Open", "Full", "Completed"], default: "Open" },
  leadName: { type: String, default: "Mandir Seva Lead" },
  createdAt: { type: Date, default: Date.now },
});

// 8. Seva Roster Model
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
  status: "Assigned" | "Checked In" | "Completed" | "Absent" | "Replacement Requested";
  checkInTime?: Date;
  checkOutTime?: Date;
  replacementNotes?: string;
  createdAt: Date;
}

const SevaRosterSchema = new Schema<ISevaRoster>({
  opportunityId: { type: String, required: true, ref: "SevaOpportunity" },
  opportunityTitle: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true },
  shiftStartTime: { type: String, required: true },
  shiftEndTime: { type: String, required: true },
  volunteerId: { type: String, required: true, ref: "Member" },
  volunteerName: { type: String, required: true },
  volunteerPhone: { type: String, required: true },
  status: {
    type: String,
    enum: ["Assigned", "Checked In", "Completed", "Absent", "Replacement Requested"],
    default: "Assigned",
  },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  replacementNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 9. Asset Model
export interface IAsset extends Document {
  assetCode: string;
  name: string;
  category: "Audio/Visual" | "Furniture & Shamiyana" | "Utensils & Kitchen" | "Electrical" | "Vehicle & Transport";
  location: string;
  condition: "Excellent" | "Good" | "Fair" | "Needs Maintenance" | "Damaged";
  status: "Available" | "In Use" | "Under Maintenance" | "Retired";
  currentHolder?: string;
  expectedReturnDate?: string;
  qrCode?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: Date;
}

const AssetSchema = new Schema<IAsset>({
  assetCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["Audio/Visual", "Furniture & Shamiyana", "Utensils & Kitchen", "Electrical", "Vehicle & Transport"],
    required: true,
  },
  location: { type: String, default: "Mandir Store Room A" },
  condition: {
    type: String,
    enum: ["Excellent", "Good", "Fair", "Needs Maintenance", "Damaged"],
    default: "Good",
  },
  status: {
    type: String,
    enum: ["Available", "In Use", "Under Maintenance", "Retired"],
    default: "Available",
  },
  currentHolder: { type: String },
  expectedReturnDate: { type: String },
  qrCode: { type: String },
  photoUrl: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 10. Room Booking Model
export interface IRoomBooking extends Document {
  roomName: string;
  purpose: string;
  bookedBy: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  status: "Confirmed" | "Pending Approval" | "Cancelled";
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
  status: { type: String, enum: ["Confirmed", "Pending Approval", "Cancelled"], default: "Confirmed" },
  createdAt: { type: Date, default: Date.now },
});

// 11. Event Model
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

// 12. Event Registration Model
export interface IEventRegistration extends Document {
  eventId: string;
  eventTitle: string;
  memberId: string;
  memberName: string;
  familyId: string;
  passCode: string;
  status: "Registered" | "Checked In" | "Waitlisted";
  checkedInAt?: Date;
  createdAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>({
  eventId: { type: String, required: true, ref: "Event" },
  eventTitle: { type: String, required: true },
  memberId: { type: String, required: true, ref: "Member" },
  memberName: { type: String, required: true },
  familyId: { type: String, required: true },
  passCode: { type: String, required: true, unique: true },
  status: { type: String, enum: ["Registered", "Checked In", "Waitlisted"], default: "Registered" },
  checkedInAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// 13. Thal Schedule Model
export interface IThalSchedule extends Document {
  scheduleCode: string;
  date: string; // YYYY-MM-DD
  monthPeriod: string; // YYYY-MM
  mealType: "Breakfast (Morning Thal)" | "Dinner (Evening Thal)" | "Special Thal";
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
    enum: ["Breakfast (Morning Thal)", "Dinner (Evening Thal)", "Special Thal"],
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

// 14. Thal Swap Request Model
export interface IThalSwapRequest extends Document {
  thalScheduleId: string;
  originalDate: string;
  mealType: string;
  requestingFamilyId: string;
  requestingFamilyName: string;
  swapType: "family_to_family" | "admin_open_swap";
  targetFamilyId?: string;
  targetFamilyName?: string;
  suggestedDate?: string;
  reason: string;
  status: "Pending Coordinator" | "Approved" | "Rejected";
  coordinatorNotes?: string;
  createdAt: Date;
}

const ThalSwapRequestSchema = new Schema<IThalSwapRequest>({
  thalScheduleId: { type: String, required: true, ref: "ThalSchedule" },
  originalDate: { type: String, required: true },
  mealType: { type: String, default: "Breakfast (Morning Thal)" },
  requestingFamilyId: { type: String, required: true },
  requestingFamilyName: { type: String, required: true },
  swapType: { type: String, enum: ["family_to_family", "admin_open_swap"], default: "admin_open_swap" },
  targetFamilyId: { type: String },
  targetFamilyName: { type: String },
  suggestedDate: { type: String },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending Coordinator", "Approved", "Rejected"], default: "Pending Coordinator" },
  coordinatorNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 15. Announcement Model
export interface IAnnouncement extends Document {
  title: string;
  gujaratiTitle?: string;
  body: string;
  gujaratiBody?: string;
  targetAudience: "Everyone" | "All Families" | "Karyakartas Only" | "Area: Santram Road" | "Area: Station Road" | "Kitchen Seva Volunteers";
  channels: ("App Push" | "WhatsApp" | "SMS")[];
  scheduledAt?: string;
  status: "Draft" | "Pending Approval" | "Sent" | "Cancelled";
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
  channels: [{ type: String, enum: ["App Push", "WhatsApp", "SMS"] }],
  scheduledAt: { type: String },
  status: { type: String, enum: ["Draft", "Pending Approval", "Sent", "Cancelled"], default: "Sent" },
  authorName: { type: String, default: "Mandir Office" },
  approvedBy: { type: String },
  stats: {
    sentCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

// 16. Audit Log Model
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

// Prevent Mongoose OverwriteModelError in Next.js hot reload
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const Family: Model<IFamily> = mongoose.models.Family || mongoose.model<IFamily>("Family", FamilySchema);
export const Member: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);
export const Sabha: Model<ISabha> = mongoose.models.Sabha || mongoose.model<ISabha>("Sabha", SabhaSchema);
export const SabhaAttendance: Model<ISabhaAttendance> = mongoose.models.SabhaAttendance || mongoose.model<ISabhaAttendance>("SabhaAttendance", SabhaAttendanceSchema);
export const FollowUpCase: Model<IFollowUpCase> = mongoose.models.FollowUpCase || mongoose.model<IFollowUpCase>("FollowUpCase", FollowUpCaseSchema);
export const SevaOpportunity: Model<ISevaOpportunity> = mongoose.models.SevaOpportunity || mongoose.model<ISevaOpportunity>("SevaOpportunity", SevaOpportunitySchema);
export const SevaRoster: Model<ISevaRoster> = mongoose.models.SevaRoster || mongoose.model<ISevaRoster>("SevaRoster", SevaRosterSchema);
export const Asset: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
export const RoomBooking: Model<IRoomBooking> = mongoose.models.RoomBooking || mongoose.model<IRoomBooking>("RoomBooking", RoomBookingSchema);
export const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
export const EventRegistration: Model<IEventRegistration> = mongoose.models.EventRegistration || mongoose.model<IEventRegistration>("EventRegistration", EventRegistrationSchema);
export const ThalSchedule: Model<IThalSchedule> = mongoose.models.ThalSchedule || mongoose.model<IThalSchedule>("ThalSchedule", ThalScheduleSchema);
export const ThalSwapRequest: Model<IThalSwapRequest> = mongoose.models.ThalSwapRequest || mongoose.model<IThalSwapRequest>("ThalSwapRequest", ThalSwapRequestSchema);
export const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
