import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://pranavparmar1809_db_user:2YdrU4GRDBbDc69Y@cluster0.icxn6gj.mongodb.net/harisumiran?retryWrites=true&w=majority";

const rawMembersData = [
  // 1-28 Group 1
  { name: "Jay Ashokbhai Khapre", gender: "Male", age: 22, sabhaCategory: "Youth Male", family: "Khapre Parivar (Ashokbhai)" },
  { name: "Nikeshbhai Nayak", gender: "Male", age: 48, sabhaCategory: "Family Sabha", family: "Nayak Parivar (Nikeshbhai)" },
  { name: "Rajubhai Dey", gender: "Male", age: 49, sabhaCategory: "Family Sabha", family: "Dey Parivar (Rajubhai)" },
  { name: "Sarjanbhai Patel", gender: "Male", age: 24, sabhaCategory: "Youth Male", family: "Patel Household (Sarjanbhai)" },
  { name: "Vikrambhai Bhagubhai Patel", gender: "Male", age: 28, sabhaCategory: "Youth Male", family: "Patel Household (Vikrambhai)" },
  { name: "Ashokbhai Prahaladbhai Khapre", gender: "Male", age: 52, sabhaCategory: "Family Sabha", family: "Khapre Parivar (Ashokbhai)" },
  { name: "Sunilbhai Rambhai Patel", gender: "Male", age: 26, sabhaCategory: "Youth Male", family: "Patel Household (Sunilbhai)" },
  { name: "Kashyapbhai Narendrabhai Parikh", gender: "Male", age: 23, sabhaCategory: "Youth Male", family: "Parikh Household (Kashyapbhai)" },
  { name: "Jal Dineshbhai Parekh", gender: "Male", age: 21, sabhaCategory: "Youth Male", family: "Parekh Parivar (Dineshbhai)" },
  { name: "Meet Dharmeshbhai Parmar", gender: "Male", age: 22, sabhaCategory: "Youth Male", family: "Parmar Parivar (Dharmeshbhai)" },
  { name: "Milap Ashishkumar Chokshi", gender: "Male", age: 24, sabhaCategory: "Youth Male", family: "Chokshi Parivar (Milap)" },
  { name: "Ronit Vipul bhai Parmar", gender: "Male", age: 20, sabhaCategory: "Youth Male", family: "Parmar Household (Vipulbhai)" },
  { name: "Rutansh Dehulbhai Patel", gender: "Male", age: 19, sabhaCategory: "Youth Male", family: "Patel Parivar (Dehulbhai)" },
  { name: "Shubham Jigneshbhai Chauhan", gender: "Male", age: 22, sabhaCategory: "Youth Male", family: "Chauhan Parivar (Jigneshbhai)" },
  { name: "Tanmay Tapasbhai Paul", gender: "Male", age: 21, sabhaCategory: "Youth Male", family: "Paul Parivar (Tapasbhai)" },
  { name: "Vaibhavbhai Dharmeshbhai Parmar", gender: "Male", age: 24, sabhaCategory: "Youth Male", family: "Parmar Parivar (Dharmeshbhai)" },
  { name: "Pratikbhai Jadav", gender: "Male", age: 25, sabhaCategory: "Youth Male", family: "Jadav Household (Pratikbhai)" },
  { name: "Prerakbhai Praneshkumar Soni", gender: "Male", age: 23, sabhaCategory: "Youth Male", family: "Soni Parivar (Prerakbhai)" },
  { name: "Suresh Shivabhai Bhil", gender: "Male", age: 26, sabhaCategory: "Youth Male", family: "Bhil Household (Sureshbhai)" },
  { name: "Vikeshbhai Patel", gender: "Male", age: 27, sabhaCategory: "Youth Male", family: "Patel Household (Vikeshbhai)" },
  { name: "Ansh", gender: "Male", age: 18, sabhaCategory: "Youth Male", family: "City Yuvak Mandal" },
  { name: "Apurv Bhoi", gender: "Male", age: 21, sabhaCategory: "Youth Male", family: "Bhoi Household (Apurv)" },
  { name: "Apurv Dey", gender: "Male", age: 20, sabhaCategory: "Youth Male", family: "Dey Parivar (Rajubhai)" },
  { name: "Ayush Parmar", gender: "Male", age: 19, sabhaCategory: "Youth Male", family: "Parmar Parivar (Ayush)" },
  { name: "Kapilbhai Kansara", gender: "Male", age: 25, sabhaCategory: "Youth Male", family: "Kansara Household (Kapilbhai)" },
  { name: "Parth Barot", gender: "Male", age: 22, sabhaCategory: "Youth Male", family: "Barot Parivar (Parth)" },
  { name: "Rudra Patel", gender: "Male", age: 19, sabhaCategory: "Youth Male", family: "Patel Parivar (Rudra)" },
  { name: "Kalpbhai", gender: "Male", age: 23, sabhaCategory: "Youth Male", family: "City Yuvak Mandal" },

  // 29-45 Group 2
  { name: "Jainambhai", gender: "Male", age: 22, sabhaCategory: "Youth Male", family: "City Yuvak Mandal" },
  { name: "Priyankbhai Parekh", gender: "Male", age: 24, sabhaCategory: "Youth Male", family: "Parekh Parivar (Dineshbhai)" },
  { name: "Bhavya Saraiya", gender: "Male", age: 21, sabhaCategory: "Youth Male", family: "Saraiya Household (Bhavya)" },
  { name: "Harshitbhai Bhavikbhai Patel", gender: "Male", age: 23, sabhaCategory: "Youth Male", family: "Patel Parivar (Bhavikbhai)" },
  { name: "Bhargav patel", gender: "Male", age: 24, sabhaCategory: "Youth Male", family: "Patel Household (Bhargav)" },
  { name: "Viswaroop Dhananjay Malik", gender: "Male", age: 22, sabhaCategory: "Youth Male", family: "Malik Parivar (Dhananjay)" },
  { name: "Shubhojit Shishir Manik", gender: "Male", age: 23, sabhaCategory: "Youth Male", family: "Manik Parivar (Shishir)" },
  { name: "Nishit Mistry", gender: "Male", age: 24, sabhaCategory: "Youth Male", family: "Mistry Parivar (Nishit)" },
  { name: "Anshu Arup Laha", gender: "Male", age: 21, sabhaCategory: "Youth Male", family: "Laha Parivar (Arup)" },
  { name: "Bapibhai Tarakbhai Dey", gender: "Male", age: 46, sabhaCategory: "Family Sabha", family: "Dey Parivar (Bapibhai)" },
  { name: "Dehulbhai Purshottambhai Patel", gender: "Male", age: 48, sabhaCategory: "Family Sabha", family: "Patel Parivar (Dehulbhai)" },
  { name: "Dhvirbhai Anantbhai Patel", gender: "Male", age: 21, sabhaCategory: "Youth Male", family: "Patel Parivar (Anantbhai)" },
  { name: "Gopal Shaktipada Adhikari", gender: "Male", age: 26, sabhaCategory: "Youth Male", family: "Adhikari Parivar (Gopal)" },
  { name: "Hare Krishna Pal", gender: "Male", age: 27, sabhaCategory: "Youth Male", family: "Pal Parivar (Hare Krishna)" },
  { name: "Jigneshbhai Arunkumar Shah", gender: "Male", age: 50, sabhaCategory: "Family Sabha", family: "Shah Parivar (Jigneshbhai)" },
  { name: "Ketankumar Natavarlal Gohel", gender: "Male", age: 47, sabhaCategory: "Family Sabha", family: "Gohel Parivar (Ketankumar)" },
  { name: "Tapasbhai Nemai Paul", gender: "Male", age: 51, sabhaCategory: "Family Sabha", family: "Paul Parivar (Tapasbhai)" },

  // 46-68 Group 3
  { name: "Hiteshbhai Ka.Patel", gender: "Male", age: 52, sabhaCategory: "Family Sabha", family: "Patel Parivar (Hiteshbhai)" },
  { name: "Namanbhai Darji", gender: "Male", age: 26, sabhaCategory: "Youth Male", family: "Darji Parivar (Namanbhai)" },
  { name: "C.J. Patel", gender: "Male", age: 57, sabhaCategory: "Family Sabha", family: "Patel Parivar (C.J.)" },
  { name: "N.Z. Patel", gender: "Male", age: 59, sabhaCategory: "Family Sabha", family: "Patel Parivar (N.Z.)" },
  { name: "Dineshbhai Parekh", gender: "Male", age: 53, sabhaCategory: "Family Sabha", family: "Parekh Parivar (Dineshbhai)" },
  { name: "Shubhashchandra Nayak", gender: "Male", age: 56, sabhaCategory: "Family Sabha", family: "Nayak Parivar (Nikeshbhai)" },
  { name: "Jugalbhai", gender: "Male", age: 29, sabhaCategory: "Youth Male", family: "City Yuvak Mandal" },
  { name: "Hiteshbhai Shedani", gender: "Male", age: 47, sabhaCategory: "Family Sabha", family: "Shedani Parivar (Hiteshbhai)" },
  { name: "Bhaveshbhai Darji", gender: "Male", age: 46, sabhaCategory: "Family Sabha", family: "Darji Parivar (Bhaveshbhai)" },
  { name: "Dilipbhai", gender: "Male", age: 54, sabhaCategory: "Family Sabha", family: "City Senior Mandal" },
  { name: "B.K. Desai (Baa)", gender: "Female", age: 74, sabhaCategory: "Family Sabha", family: "Desai Parivar (Baa)" },
  { name: "Akshar na Masi", gender: "Female", age: 69, sabhaCategory: "Family Sabha", family: "City Mahila Mandal" },
  { name: "Yugbhai Jatinkumar Patel", gender: "Male", age: 12, sabhaCategory: "Bal Sabha", family: "Patel Parivar (Jatinkumar)" },
  { name: "Reyansh Patel", gender: "Male", age: 9, sabhaCategory: "Bal Sabha", family: "Patel Parivar (Reyansh)" },
  { name: "Dhwani Nikeshbhai Nayak", gender: "Female", age: 21, sabhaCategory: "Yuvati", family: "Nayak Parivar (Nikeshbhai)" },
  { name: "Prarthana Ashokbhai Khapre", gender: "Female", age: 20, sabhaCategory: "Yuvati", family: "Khapre Parivar (Ashokbhai)" },
  { name: "Tapasya Rajubhai Dey", gender: "Female", age: 19, sabhaCategory: "Yuvati", family: "Dey Parivar (Rajubhai)" },
  { name: "Rahi Dehulbhai Patel", gender: "Female", age: 21, sabhaCategory: "Yuvati", family: "Patel Parivar (Dehulbhai)" },
  { name: "Krina Harshal Patel", gender: "Female", age: 22, sabhaCategory: "Yuvati", family: "Patel Parivar (Harshalbhai)" },
  { name: "Dia Vijaybhai Bhojani", gender: "Female", age: 18, sabhaCategory: "Yuvati", family: "Bhojani Parivar (Vijaybhai)" },
  { name: "Navya Vijaybhai Bhojani", gender: "Female", age: 17, sabhaCategory: "Yuvati", family: "Bhojani Parivar (Vijaybhai)" },
  { name: "Anjanli Balvantsingh Darbar", gender: "Female", age: 23, sabhaCategory: "Yuvati", family: "Darbar Parivar (Balvantsingh)" },
  { name: "Moksha Harshkumar Shah", gender: "Female", age: 20, sabhaCategory: "Yuvati", family: "Shah Parivar (Harshkumar)" },
];

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas!");

  const db = mongoose.connection.db;

  // 1. Group members by Family
  const familyMap = new Map();
  let famCounter = 1;

  for (const m of rawMembersData) {
    if (!familyMap.has(m.family)) {
      const famCode = `FAM-NAD-CTY-${String(famCounter).padStart(3, "0")}`;
      familyMap.set(m.family, {
        familyCode: famCode,
        name: m.family,
        captainName: m.name,
        phone: `98250${String(10000 + famCounter).padStart(5, "0")}`,
        address: "City Area, Nadiad, Gujarat 387001",
        area: "City Area",
        zone: "City Area Zone",
        memberCount: 0,
        engagementLevel: "High",
        status: "Active",
        createdAt: new Date(),
      });
      famCounter++;
    }
    familyMap.get(m.family).memberCount++;
  }

  const familiesToInsert = Array.from(familyMap.values());
  console.log(`Prepared ${familiesToInsert.length} City Area Zone families.`);

  // Upsert families
  for (const f of familiesToInsert) {
    await db.collection("families").updateOne(
      { familyCode: f.familyCode },
      { $set: f },
      { upsert: true }
    );
  }
  console.log("Families updated in MongoDB Atlas.");

  // 2. Prepare Members
  const membersToInsert = rawMembersData.map((m, idx) => {
    const memCode = `MEM-NAD-CTY-${String(idx + 1).padStart(3, "0")}`;
    const famObj = familyMap.get(m.family);

    return {
      memberCode: memCode,
      name: m.name,
      familyId: famObj.familyCode,
      familyName: famObj.name,
      age: m.age,
      gender: m.gender,
      phone: `98250${String(20000 + idx + 1).padStart(5, "0")}`,
      relationship: m.gender === "Female" ? (m.age > 60 ? "Mother / Elder" : "Daughter") : (m.age > 45 ? "Self / Father" : "Son"),
      sevaSkills: m.sabhaCategory === "Youth Male" ? ["Sabha Setup", "Stage Management", "Transportation"] : ["Bhojanshala", "Prasad Seva"],
      zone: "City Area Zone",
      area: "City Area",
      sabhaCategory: m.sabhaCategory,
      attendanceStreak: Math.floor(Math.random() * 5) + 1,
      verificationStatus: "Verified",
      active: true,
      createdAt: new Date(),
    };
  });

  console.log(`Upserting ${membersToInsert.length} City Area Zone members...`);
  for (const mem of membersToInsert) {
    await db.collection("members").updateOne(
      { name: mem.name, zone: "City Area Zone" },
      { $set: mem },
      { upsert: true }
    );
  }
  console.log(`Successfully ingested all ${membersToInsert.length} members into MongoDB Atlas!`);

  // 3. Register Key Yuvak Karyakartas as User accounts in MongoDB
  const yuvakKaryakartas = [
    { name: "Jay Ashokbhai Khapre", phone: "9825020001", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
    { name: "Nikeshbhai Nayak", phone: "9825020002", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80" },
    { name: "Sarjanbhai Patel", phone: "9825020004", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=200&auto=format&fit=crop&q=80" },
    { name: "Meet Dharmeshbhai Parmar", phone: "9825020010", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&auto=format&fit=crop&q=80" },
    { name: "Milap Ashishkumar Chokshi", phone: "9825020011", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80" },
    { name: "Rutansh Dehulbhai Patel", phone: "9825020013", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80" },
    { name: "Shubham Jigneshbhai Chauhan", phone: "9825020014", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80" },
    { name: "Tanmay Tapasbhai Paul", phone: "9825020015", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80" },
    { name: "Pratikbhai Jadav", phone: "9825020017", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80" },
    { name: "Gopal Shaktipada Adhikari", phone: "9825020041", role: "karyakarta", avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&auto=format&fit=crop&q=80" },
  ];

  for (const y of yuvakKaryakartas) {
    const existing = await db.collection("users").findOne({ name: y.name });
    if (!existing) {
      await db.collection("users").insertOne({
        name: y.name,
        phone: y.phone,
        email: `${y.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@harisumiran.org`,
        role: y.role,
        passcodeHash: "3690",
        mandir: "HariPrabodham, Nadiad",
        avatar: y.avatar,
        biometricEnabled: true,
        active: true,
        responsibilities: [
          {
            type: "sabha_karyakarta",
            title: "City Area Yuvak Sabha Karyakarta",
            gujaratiTitle: "સિટી એરિયા યુવા સભા કાર્યકર્તા",
            scope: {
              zone: "City Area Zone",
              area: "City Area",
              sabhaType: "Youth Male",
            },
            active: true,
            assignedAt: new Date(),
          },
        ],
        createdAt: new Date(),
      });
    }
  }

  console.log("Successfully seeded City Area Zone Yuvak Karyakartas into users collection!");
  await mongoose.disconnect();
  console.log("MongoDB connection closed.");
}

main().catch((err) => {
  console.error("Error seeding City Area Zone data:", err);
  process.exit(1);
});
