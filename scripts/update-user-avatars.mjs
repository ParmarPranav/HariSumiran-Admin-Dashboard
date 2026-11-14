import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://pranavparmar1809_db_user:2YdrU4GRDBbDc69Y@cluster0.icxn6gj.mongodb.net/harisumiran?retryWrites=true&w=majority";

const userAvatars = {
  "Pooja Swarupji": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  "Nitinbhai Patel": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
  "Jaimin Trivedi": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
  "Devansh Patel": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  "Rameshbhai Patel": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
  "Dipakbhai Shah": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "Kevin Bhai Patel": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
  "HP Super Admin": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "Jay Ashokbhai Khapre": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "Nikeshbhai Nayak": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
  "Sarjanbhai Patel": "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=200&auto=format&fit=crop&q=80",
  "Meet Dharmeshbhai Parmar": "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&auto=format&fit=crop&q=80",
  "Milap Ashishkumar Chokshi": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",
  "Rutansh Dehulbhai Patel": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
  "Shubham Jigneshbhai Chauhan": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80",
  "Tanmay Tapasbhai Paul": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80",
  "Pratikbhai Jadav": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80",
  "Gopal Shaktipada Adhikari": "https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&auto=format&fit=crop&q=80",
};

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  for (const [name, avatarUrl] of Object.entries(userAvatars)) {
    const res = await db.collection("users").updateOne(
      { name },
      { $set: { avatar: avatarUrl } }
    );
    console.log(`Updated ${name}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  console.log("\nAll 18 user avatars updated to unique high-res portraits successfully!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error updating user avatars:", err);
  process.exit(1);
});
