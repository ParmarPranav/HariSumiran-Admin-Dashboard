import mongoose from "mongoose";
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
} from "../src/lib/seedData.ts";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://pranavparmar1809_db_user:2YdrU4GRDBbDc69Y@cluster0.icxn6gj.mongodb.net/harisumiran?retryWrites=true&w=majority";

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected! Populating HariSumiran database...");

  const db = mongoose.connection.db;

  // Clear existing collections
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
  }

  // Insert seed data
  await db.collection("users").insertMany(initialUsers);
  const families = await db.collection("families").insertMany(initialFamilies);
  await db.collection("members").insertMany(initialMembers);
  await db.collection("sabhas").insertMany(initialSabhas);
  await db.collection("followupcases").insertMany(initialFollowUpCases);
  await db.collection("seaopportunities").insertMany(initialSevaOpportunities);
  await db.collection("sevarosters").insertMany(initialSevaRosters);
  await db.collection("assets").insertMany(initialAssets);
  await db.collection("roombookings").insertMany(initialRoomBookings);
  await db.collection("events").insertMany(initialEvents);
  await db.collection("thalschedules").insertMany(initialThalSchedules);
  await db.collection("announcements").insertMany(initialAnnouncements);
  await db.collection("auditlogs").insertMany(initialAuditLogs);

  console.log("Database seeded successfully!");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
