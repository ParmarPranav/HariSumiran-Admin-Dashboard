import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TravelRide, User } from "@/models";
import { initialTravelRides } from "@/lib/seedData";

export async function GET() {
  try {
    await connectDB();
    let rides = await TravelRide.find({}).sort({ departureTime: 1 });
    if (!rides || rides.length === 0) {
      rides = initialTravelRides as any;
    }
    return NextResponse.json({ success: true, count: rides.length, rides });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      title,
      gujaratiTitle,
      driverMemberId = "MEM-NAD-001",
      driverName,
      driverPhone,
      vehicleModel,
      vehicleNumber,
      totalSeats = 4,
      departureTime,
      departureLocation,
      destination = "HariPrabodham Mandir, Nadiad",
      routeNotes,
    } = body;

    if (!title || !driverName || !vehicleModel || !departureTime) {
      return NextResponse.json(
        { success: false, error: "Title, Driver Name, Vehicle, and Departure Time are required." },
        { status: 400 }
      );
    }

    const count = await TravelRide.countDocuments();
    const rideCode = `RIDE-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const ride = await TravelRide.create({
      rideCode,
      title,
      gujaratiTitle: gujaratiTitle || "",
      driverMemberId,
      driverName,
      driverPhone,
      vehicleModel,
      vehicleNumber,
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      departureTime,
      departureLocation,
      destination,
      routeNotes: routeNotes || "",
      status: "Scheduled",
      requests: [],
    });

    return NextResponse.json({ success: true, message: "Ride registered successfully!", ride });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
