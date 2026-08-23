import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  User,
  Family,
  Member,
  Sabha,
  FollowUpCase,
  SevaOpportunity,
  SevaRoster,
  Asset,
  RoomBooking,
  Event,
  ThalSchedule,
  Announcement,
  AuditLog,
} from "@/models";
import {
  initialUsers,
  initialFamilies,
  initialMembers,
  initialSabhas,
  initialFollowUpCases,
  initialSevaOpportunities,
  initialSevaRosters,
  initialAssets,
  initialRoomBookings,
  initialEvents,
  initialThalSchedules,
  initialAnnouncements,
  initialAuditLogs,
} from "@/lib/seedData";

export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Family.deleteMany({}),
      Member.deleteMany({}),
      Sabha.deleteMany({}),
      FollowUpCase.deleteMany({}),
      SevaOpportunity.deleteMany({}),
      SevaRoster.deleteMany({}),
      Asset.deleteMany({}),
      RoomBooking.deleteMany({}),
      Event.deleteMany({}),
      ThalSchedule.deleteMany({}),
      Announcement.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // Insert seeded records
    const [users, families] = await Promise.all([
      User.insertMany(initialUsers),
      Family.insertMany(initialFamilies),
    ]);

    // Link members to families
    const familyMap = new Map(families.map((f) => [f.name, f._id.toString()]));
    const membersToInsert = initialMembers.map((m) => ({
      ...m,
      familyId: familyMap.get(m.familyName) || families[0]._id.toString(),
    }));
    const members = await Member.insertMany(membersToInsert);

    // Link Thal schedules
    const thalToInsert = initialThalSchedules.map((t) => {
      const matchedFam = families.find((f) => f.name === t.assignedFamilyName);
      return {
        ...t,
        assignedFamilyId: matchedFam ? matchedFam._id.toString() : families[0]._id.toString(),
      };
    });

    // Link Follow-up cases
    const followUpToInsert = initialFollowUpCases.map((c) => {
      const matchedFam = families.find((f) => f.name === c.familyName);
      return {
        ...c,
        familyId: matchedFam ? matchedFam._id.toString() : families[0]._id.toString(),
      };
    });

    const [sabhas, sevaOpps] = await Promise.all([
      Sabha.insertMany(initialSabhas),
      SevaOpportunity.insertMany(initialSevaOpportunities),
      ThalSchedule.insertMany(thalToInsert),
      FollowUpCase.insertMany(followUpToInsert),
      Asset.insertMany(initialAssets),
      RoomBooking.insertMany(initialRoomBookings),
      Event.insertMany(initialEvents),
      Announcement.insertMany(initialAnnouncements),
      AuditLog.insertMany(initialAuditLogs),
    ]);

    // Link Seva Rosters
    const oppMap = new Map(sevaOpps.map((o) => [o.title, o._id.toString()]));
    const memberMap = new Map(members.map((m) => [m.name, m._id.toString()]));
    const rostersToInsert = initialSevaRosters.map((r) => ({
      ...r,
      opportunityId: oppMap.get(r.opportunityTitle) || sevaOpps[0]._id.toString(),
      volunteerId: memberMap.get(r.volunteerName) || members[0]._id.toString(),
    }));
    await SevaRoster.insertMany(rostersToInsert);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with HariSumiran Nadiad operational data",
      counts: {
        users: users.length,
        families: families.length,
        members: members.length,
        sabhas: sabhas.length,
        followUpCases: followUpToInsert.length,
        sevaOpportunities: sevaOpps.length,
        assets: initialAssets.length,
        roomBookings: initialRoomBookings.length,
        events: initialEvents.length,
        thalSchedules: thalToInsert.length,
        announcements: initialAnnouncements.length,
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const [userCount, familyCount, memberCount, sabhaCount, followUpCount, sevaCount] =
      await Promise.all([
        User.countDocuments(),
        Family.countDocuments(),
        Member.countDocuments(),
        Sabha.countDocuments(),
        FollowUpCase.countDocuments(),
        SevaOpportunity.countDocuments(),
      ]);

    return NextResponse.json({
      status: "connected",
      database: "MongoDB Atlas (harisumiran)",
      counts: {
        users: userCount,
        families: familyCount,
        members: memberCount,
        sabhas: sabhaCount,
        followUpCases: followUpCount,
        sevaOpportunities: sevaCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", error: error.message },
      { status: 500 }
    );
  }
}
