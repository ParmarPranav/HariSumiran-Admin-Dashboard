import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://pranavparmar1809_db_user:2YdrU4GRDBbDc69Y@cluster0.icxn6gj.mongodb.net/harisumiran?retryWrites=true&w=majority";

const assetsData = [
  // 1. Shure Cordless Mic Kit (In Custody - from mockup)
  {
    assetCode: "HS-AST-SND-01",
    name: "Shure QLXD24 Dual Cordless Mic Kit",
    gujaratiName: "શ્યોર ક્યુએલ કોર્ડલેસ માઈક કિટ",
    category: "Sound & AV",
    subcategory: "Microphone",
    iconType: "mic",
    location: "Audio Booth Locker 01",
    condition: "Excellent",
    status: "In Custody",
    currentHolder: "Rahul Patel",
    holderRole: "Sound Lead",
    holderPhone: "9825010001",
    dueTime: "Today, 9:30 PM • Sunday Evening Sabha",
    expectedReturnDate: new Date().toISOString().split("T")[0],
    qrCode: "HS-AST-SND-01",
    notes: "Paired with frequency band G50. Handled exclusively by Sound & AV Mandal.",
  },
  // 2. Epson Laser Full HD Projector (In Custody - from mockup)
  {
    assetCode: "HS-AST-SND-03",
    name: "Epson Laser Full HD Projector & Motorized Screen",
    gujaratiName: "એપ્સન લેસર પ્રોજેક્ટર અને સ્ક્રીન",
    category: "Sound & AV",
    subcategory: "Projector",
    iconType: "projector",
    location: "AV Store Room Rack 2",
    condition: "Good",
    status: "In Custody",
    currentHolder: "Amit Shah",
    holderRole: "Youth Media Team",
    holderPhone: "9825010002",
    dueTime: "Tomorrow, 8:00 AM • Yuvak Sabha Presentation",
    expectedReturnDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    qrCode: "HS-AST-SND-03",
    notes: "6000 Lumens laser projector with 150-inch portable screen.",
  },
  // 3. Yamaha TF5 32-Channel Digital Mixer (Available)
  {
    assetCode: "HS-AST-SND-02",
    name: "Yamaha TF5 32-Channel Digital Audio Mixer",
    gujaratiName: "યામાહા 32-ચેનલ ડિજિટલ મિક્સર",
    category: "Sound & AV",
    subcategory: "Mixer",
    iconType: "mixer",
    location: "Main Sabha Audio Control Booth",
    condition: "Excellent",
    status: "Available",
    qrCode: "HS-AST-SND-02",
    notes: "Calibrated for Mandir acoustics and live streaming audio line out.",
  },
  // 4. Sony FX3 4K Live Broadcast Cinema Camera Kit (Available)
  {
    assetCode: "HS-AST-SND-04",
    name: "Sony FX3 4K Live Broadcast Camera Kit",
    gujaratiName: "સોની 4K લાઈવ બ્રોડકાસ્ટ કેમેરા",
    category: "Sound & AV",
    subcategory: "Camera",
    iconType: "camera",
    location: "Video Broadcast Rig Room",
    condition: "Excellent",
    status: "Available",
    qrCode: "HS-AST-SND-04",
    notes: "24-70mm GM lens included with heavy tripod and HDMI broadcast encoder.",
  },
  // 5. JBL PRX915 Powered PA Speakers Pair (Available)
  {
    assetCode: "HS-AST-SND-05",
    name: "JBL PRX915 2000W Powered PA Speakers Pair",
    gujaratiName: "જેબીએલ 2000W પાવર્ડ સ્પીકર્સ જોડી",
    category: "Sound & AV",
    subcategory: "Speaker",
    iconType: "speaker",
    location: "Mandir Hall Pillar Storage",
    condition: "Good",
    status: "Available",
    qrCode: "HS-AST-SND-05",
    notes: "Main hall acoustics amplification.",
  },
  // 6. Sennheiser Wireless IEM In-Ear Monitor (Available)
  {
    assetCode: "HS-AST-SND-06",
    name: "Sennheiser Wireless IEM Stage Monitor Kit",
    gujaratiName: "સેનહાઈઝર સ્ટેજ મોનિટર કિટ",
    category: "Sound & AV",
    subcategory: "Audio",
    iconType: "mic",
    location: "Audio Booth Locker 02",
    condition: "Good",
    status: "Available",
    qrCode: "HS-AST-SND-06",
    notes: "Used for kirtan singers and stage speakers.",
  },
  // 7. Commercial Heavy Brass Thal Cooking Handi (In Custody)
  {
    assetCode: "HS-AST-KIT-01",
    name: "Pure Brass Large Thal Cooking Handi (100L)",
    gujaratiName: "પિત્તળની મોટી થાળ રાંધવાની હાંડી",
    category: "Kitchen",
    subcategory: "Utensil",
    iconType: "cauldron",
    location: "Bhojanshala Mahaprasad Store",
    condition: "Excellent",
    status: "In Custody",
    currentHolder: "Dipakbhai Shah",
    holderRole: "Head Chef / Kitchen In-Charge",
    holderPhone: "9825034567",
    dueTime: "Today, 10:00 PM • Annakut Preparation",
    expectedReturnDate: new Date().toISOString().split("T")[0],
    qrCode: "HS-AST-KIT-01",
    notes: "Traditional brass handi with tin coating for mahaprasad preparation.",
  },
  // 8. SS Large Mahaprasad Rice Cauldron 150L (Available)
  {
    assetCode: "HS-AST-KIT-02",
    name: "Stainless Steel Mahaprasad Cauldron (150L)",
    gujaratiName: "સ્ટેનલેસ સ્ટીલ મહાપ્રસાદ તપેલું",
    category: "Kitchen",
    subcategory: "Utensil",
    iconType: "cauldron",
    location: "Kitchen Gas Stove Station A",
    condition: "Good",
    status: "Available",
    qrCode: "HS-AST-KIT-02",
    notes: "Used for large festival cooking.",
  },
  // 9. Industrial Automatic Roti Puffer & Maker (Available)
  {
    assetCode: "HS-AST-KIT-03",
    name: "Industrial Automatic Roti Puffer Station",
    gujaratiName: "ઓટોમેટિક રોટલી બનાવવાનું મશીન",
    category: "Kitchen",
    subcategory: "Appliance",
    iconType: "utensils",
    location: "Bhojanshala Roti Dept",
    condition: "Good",
    status: "Available",
    qrCode: "HS-AST-KIT-03",
    notes: "Capacity 800 rotis/hour with automatic temperature regulation.",
  },
  // 10. SS Multi-Tier Food Serving Trolley (Available)
  {
    assetCode: "HS-AST-KIT-04",
    name: "Stainless Steel 3-Tier Mahaprasad Serving Trolley",
    gujaratiName: "એસએસ ૩-ટાયર પ્રસાદ સર્વિંગ ટ્રોલી",
    category: "Kitchen",
    subcategory: "Trolley",
    iconType: "utensils",
    location: "Dining Hall Store",
    condition: "Excellent",
    status: "Available",
    qrCode: "HS-AST-KIT-04",
    notes: "Smooth rubber casters for noise-free prasadam distribution.",
  },
  // 11. Honda 7.5 kVA Silent Portable Generator (In Custody)
  {
    assetCode: "HS-AST-FAC-01",
    name: "Honda 7.5 kVA Super Silent Generator",
    gujaratiName: "હોન્ડા ૭.૫ કેવીએ સાયલન્ટ જનરેટર",
    category: "Utility & Facilities",
    subcategory: "Power",
    iconType: "generator",
    location: "Mandir Utility Shed Bay 1",
    condition: "Good",
    status: "In Custody",
    currentHolder: "Vikram Patel",
    holderRole: "Outdoor Sabha Coordinator",
    holderPhone: "9825010005",
    dueTime: "Tonight, 11:00 PM • Outdoor Village Sabha",
    expectedReturnDate: new Date().toISOString().split("T")[0],
    qrCode: "HS-AST-FAC-01",
    notes: "Supplies power for outdoor sound setup and emergency backup.",
  },
  // 12. Kärcher Wet & Dry Industrial Floor Scrubber (Available)
  {
    assetCode: "HS-AST-FAC-02",
    name: "Kärcher Industrial Wet & Dry Floor Scrubber",
    gujaratiName: "કાર્ચર ઇન્ડસ્ટ્રીયલ ફ્લોર સ્ક્રબર",
    category: "Utility & Facilities",
    subcategory: "Sanitation",
    iconType: "facility",
    location: "Sanitation & Cleaning Store",
    condition: "Excellent",
    status: "Available",
    qrCode: "HS-AST-FAC-02",
    notes: "Used for polishing and sanitizing marble flooring before sabha.",
  },
  // 13. High-Power LED Flood Lighting Truss Kit (Under Maintenance)
  {
    assetCode: "HS-AST-LGT-01",
    name: "Godox 300W LED Sabha Stage Flood Light Kit",
    gujaratiName: "ગોડોક્સ ૩૦૦ વોટ સ્ટેજ ફ્લડ લાઈટ",
    category: "Utility & Facilities",
    subcategory: "Lighting",
    iconType: "light",
    location: "Stage Lighting Truss Loft",
    condition: "Needs Service",
    status: "Maintenance",
    qrCode: "HS-AST-LGT-01",
    notes: "Power adapter capacitor replacement in progress with authorized service centre.",
  },
  // 14. Deluxe Folding Banquet Chairs (Set of 100) (Available)
  {
    assetCode: "HS-AST-FRN-01",
    name: "Steel Padded Banquet Chairs (Batch of 100)",
    gujaratiName: "સ્ટીલ પેડેડ બેન્ક્વેટ ખુરશીઓ (૧૦૦ નંગ)",
    category: "Furniture",
    subcategory: "Chairs",
    iconType: "chair",
    location: "Basement Store Bay 3",
    condition: "Good",
    status: "Available",
    qrCode: "HS-AST-FRN-01",
    notes: "Comfortable cushioned chairs for elder devotees during sabha.",
  },
  // 15. Heavy Duty Folding Tables (Set of 20) (Available)
  {
    assetCode: "HS-AST-FRN-02",
    name: "Heavy-Duty 6-Foot Folding Buffet Tables (Set of 20)",
    gujaratiName: "હેવી-ડ્યુટી ૬-ફૂટ ફોલ્ડિંગ ટેબલ (૨૦ નંગ)",
    category: "Furniture",
    subcategory: "Tables",
    iconType: "chair",
    location: "Basement Store Bay 4",
    condition: "Good",
    status: "Available",
    qrCode: "HS-AST-FRN-02",
    notes: "Quick-fold tables for book stalls and registration counters.",
  },
  // 16. Mandir Multi-Utility Cargo Van (In Custody)
  {
    assetCode: "HS-AST-VEH-01",
    name: "Mandir Multi-Utility Cargo Van (GJ-07-HP-1809)",
    gujaratiName: "મંદિર મલ્ટી-યુટિલિટી વાન",
    category: "Vehicles",
    subcategory: "Van",
    iconType: "vehicle",
    location: "Mandir Parking Bay 1",
    condition: "Excellent",
    status: "In Custody",
    currentHolder: "Sarjanbhai Patel",
    holderRole: "Logistics & Seva Lead",
    holderPhone: "9825010008",
    dueTime: "Today, 7:00 PM • Sabha Logistics Transport",
    expectedReturnDate: new Date().toISOString().split("T")[0],
    qrCode: "HS-AST-VEH-01",
    notes: "Reserved for vegetable procurement and elderly devotee pick-and-drop.",
  },
  // 17. Automated External Defibrillator & Emergency Trauma Kit (Available)
  {
    assetCode: "HS-AST-MED-01",
    name: "Philips HeartStart AED & Emergency First-Aid Kit",
    gujaratiName: "ફિલિપ્સ ઇમરજન્સી એઈડી અને ફર્સ્ટ-એઇડ કિટ",
    category: "Utility & Facilities",
    subcategory: "Medical",
    iconType: "facility",
    location: "Admin Office Main Reception",
    condition: "Excellent",
    status: "Available",
    qrCode: "HS-AST-MED-01",
    notes: "Life-saving AED system inspected monthly. Battery valid through 2028.",
  },
];

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log("Connected successfully.");

  // Clear existing assets to ensure clean match with the design
  await db.collection("assets").deleteMany({});
  console.log("Cleared existing assets collection.");

  const result = await db.collection("assets").insertMany(
    assetsData.map((a) => ({
      ...a,
      createdAt: new Date(),
    }))
  );

  console.log(`Successfully ingested ${result.insertedCount} assets into MongoDB Atlas!`);

  // Count summary
  const total = await db.collection("assets").countDocuments();
  const available = await db.collection("assets").countDocuments({ status: "Available" });
  const inCustody = await db.collection("assets").countDocuments({ status: "In Custody" });
  const maintenance = await db.collection("assets").countDocuments({ status: "Maintenance" });

  console.log("\n--- Verification Summary ---");
  console.log(`Total Assets:     ${total}`);
  console.log(`Available:        ${available}`);
  console.log(`In Custody:       ${inCustody}`);
  console.log(`Maintenance:      ${maintenance}`);
}

main()
  .then(() => {
    console.log("Asset seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Asset seeding failed:", err);
    process.exit(1);
  });

