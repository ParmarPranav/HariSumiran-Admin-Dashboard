import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Family } from "@/models";
import { initialUsers } from "@/lib/seedData";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, name, phone, email, password, familyName, role } = body;

    await connectDB();

    if (action === "register") {
      if (!email || !password || !name) {
        return NextResponse.json({ success: false, error: "Name, email, and password are required." }, { status: 400 });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 400 });
      }

      const userPhone = phone || "98250" + Math.floor(10000 + Math.random() * 90000);
      const newUser = await User.create({
        name,
        email,
        phone: userPhone,
        role: "family_captain",
        mandir: "HariPrabodham, Nadiad",
        active: true,
      });

      const userFamilyName = familyName || `${name} Household`;

      return NextResponse.json({
        success: true,
        message: "Devotee account created successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: "family_captain",
          mandir: newUser.mandir,
          familyId: "FAM-" + Date.now().toString().slice(-4),
          familyName: userFamilyName,
        },
        token: "user_jwt_token_" + Date.now(),
      });
    }

    if (action === "login") {
      if (email === "harisumiran369@gmail.com" && password === "Atmiyata@3690") {
        let adminUser = await User.findOne({
          $or: [
            { email: "harisumiran369@gmail.com" },
            { phone: "9825023456" },
            { role: "mandir_admin" },
          ],
        });

        if (adminUser) {
          adminUser.email = "harisumiran369@gmail.com";
          adminUser.role = "mandir_admin";
          await adminUser.save();
        } else {
          adminUser = await User.create({
            name: "Mandir Administrator",
            email: "harisumiran369@gmail.com",
            phone: "9825023456",
            role: "mandir_admin",
            department: "Operations & Administration",
            mandir: "HariPrabodham, Nadiad",
            active: true,
          });
        }

        return NextResponse.json({
          success: true,
          isAdmin: true,
          message: "Authenticated as Mandir Administrator",
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            phone: adminUser.phone,
            role: "mandir_admin",
            mandir: adminUser.mandir,
          },
          token: "admin_jwt_token_" + Date.now(),
        });
      } else {
        // Devotee / Family User login (user369@gmail.com / User@3690 or any user)
        const devoteeEmail = email || "user369@gmail.com";
        let devoteeUser = await User.findOne({ email: devoteeEmail });

        if (!devoteeUser) {
          devoteeUser = await User.findOne({ role: "family_captain" });
        }

        if (devoteeUser) {
          if (email) devoteeUser.email = email;
          await devoteeUser.save();
        } else {
          const uniquePhone = "98250" + Math.floor(10000 + Math.random() * 90000);
          devoteeUser = await User.create({
            name: email ? email.split("@")[0] : "Rameshbhai Patel",
            email: devoteeEmail,
            phone: uniquePhone,
            role: "family_captain",
            mandir: "HariPrabodham, Nadiad",
            active: true,
          });
        }

        return NextResponse.json({
          success: true,
          isAdmin: false,
          message: "Authenticated as Devotee User",
          user: {
            id: devoteeUser._id,
            name: devoteeUser.name || "Rameshbhai Patel",
            email: devoteeUser.email,
            phone: devoteeUser.phone,
            role: "family_captain",
            mandir: devoteeUser.mandir,
            familyId: "FAM-101",
            familyName: "Patel Household (Rameshbhai)",
          },
          token: "user_jwt_token_" + Date.now(),
        });
      }
    }

    if (action === "switch_role") {
      const targetUser = (await User.findOne({ role })) || initialUsers.find((u) => u.role === role);
      if (!targetUser) {
        return NextResponse.json({ success: false, error: "Role not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: targetUser,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid auth action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({ active: true });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
