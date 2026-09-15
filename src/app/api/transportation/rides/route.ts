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
      eventId,
      title,
      gujaratiTitle,
      driverMemberId = "MEM-NAD-001",
      driverName,
      driverPhone = "9825000000",
      vehicleModel,
      vehicleNumber = "GJ-07-HS-3690",
      totalSeats = 4,
      availableSeats,
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
    const tSeats = Number(totalSeats);
    const aSeats = availableSeats !== undefined ? Number(availableSeats) : tSeats;

    const ride = await TravelRide.create({
      rideCode,
      title,
      gujaratiTitle: gujaratiTitle || "",
      eventOrSabhaId: eventId,
      driverMemberId,
      driverName,
      driverPhone,
      vehicleModel,
      vehicleNumber,
      totalSeats: tSeats,
      availableSeats: aSeats,
      departureTime,
      departureLocation: departureLocation || "Station Road, Nadiad",
      destination,
      routeNotes: routeNotes || "",
      status: "Scheduled",
      requests: [],
    });

    return NextResponse.json({
      success: true,
      message: "Ride registered successfully!",
      rideId: ride._id.toString(),
      ride,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { rideId, status, availableSeats } = body;

    if (!rideId) {
      return NextResponse.json({ success: false, error: "rideId is required." }, { status: 400 });
    }

    const ride = await TravelRide.findById(rideId);
    if (!ride) {
      return NextResponse.json({ success: false, error: "Ride not found." }, { status: 404 });
    }

    if (status) ride.status = status;
    if (availableSeats !== undefined) ride.availableSeats = Number(availableSeats);

    await ride.save();

    return NextResponse.json({
      success: true,
      message: "Ride updated successfully",
      rideStatus: ride.status,
      ride,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
