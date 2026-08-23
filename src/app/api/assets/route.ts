import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Asset, RoomBooking, AuditLog } from "@/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const query: any = {};
    if (category && category !== "All") query.category = category;
    if (status && status !== "All") query.status = status;

    const assets = await Asset.find(query).sort({ category: 1, name: 1 });
    const rooms = await RoomBooking.find({}).sort({ date: 1, startTime: 1 });

    return NextResponse.json({
      success: true,
      assets,
      roomBookings: rooms,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, category, location, condition = "Good", notes } = body;

    if (!name || !category) {
      return NextResponse.json({ success: false, error: "Name and Category are required." }, { status: 400 });
    }

    const count = await Asset.countDocuments();
    const assetCode = `AST-${category.slice(0, 3).toUpperCase()}-${String(count + 1).padStart(2, "0")}`;

    const asset = await Asset.create({
      assetCode,
      name,
      category,
      location: location || "Mandir Main Store",
      condition,
      status: "Available",
      notes: notes || "",
    });

    return NextResponse.json({ success: true, message: "Asset added to registry", asset });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
