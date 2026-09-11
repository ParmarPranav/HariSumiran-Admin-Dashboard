import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TravelRide, ActionableNotification } from "@/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      rideId,
      passengerMemberId = "MEM-NAD-001",
      passengerName,
      passengerPhone,
      pickupPoint,
      seatsRequested = 1,
      rideCode,
    } = body;
    const identifier = rideId || rideCode;

    if (!identifier || !passengerName || !pickupPoint) {
      return NextResponse.json(
        { success: false, error: "Ride ID/Code, Passenger Name, and Pickup Point are required." },
        { status: 400 }
      );
    }

    let ride = null;
    if (rideId && typeof rideId === "string" && rideId.match(/^[0-9a-fA-F]{24}$/)) {
      ride = await TravelRide.findById(rideId);
    }
    if (!ride) {
      ride = await TravelRide.findOne({
        $or: [{ rideCode: identifier }, { title: new RegExp(identifier, "i") }],
      });
    }
    if (!ride) {
      return NextResponse.json({ success: false, error: "Ride not found." }, { status: 404 });
    }

    if (ride.availableSeats < seatsRequested) {
      return NextResponse.json(
        { success: false, error: `Only ${ride.availableSeats} seats available on this vehicle.` },
        { status: 400 }
      );
    }

    const requestId = `REQ-${Date.now().toString().slice(-4)}`;

    ride.requests.push({
      requestId,
      passengerMemberId,
      passengerName,
      passengerPhone: passengerPhone || "9825000000",
      pickupPoint,
      seatsRequested: Number(seatsRequested),
      status: "Pending",
      requestedAt: new Date(),
    });

    await ride.save();

    // Create Actionable Notification for Driver / Car Owner
    await ActionableNotification.create({
      recipientRole: "car_owner",
      title: "Passenger Ride Request Received",
      gujaratiTitle: "મુસાફરે સીટ માટે વિનંતી કરી",
      message: `${passengerName} requested ${seatsRequested} seat(s) from "${pickupPoint}" for "${ride.title}".`,
      gujaratiMessage: `${passengerName} એ "${pickupPoint}" થી ${seatsRequested} સીટની વિનંતી કરી છે.`,
      category: "ride_request",
      actionType: "RIDE_APPROVE",
      actionPayload: { rideId: ride._id.toString(), requestId },
    });

    return NextResponse.json({
      success: true,
      message: `Ride request submitted to driver ${ride.driverName}. You will receive a confirmation once approved.`,
      requestId,
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
    const { rideId, requestId, action } = body; // action: "approve" | "reject"

    const ride = await TravelRide.findById(rideId);
    if (!ride) {
      return NextResponse.json({ success: false, error: "Ride not found." }, { status: 404 });
    }

    const request = (ride.requests || []).find((r: any) => r.requestId === requestId);
    if (!request) {
      return NextResponse.json({ success: false, error: "Seat request not found." }, { status: 404 });
    }

    if (action === "approve") {
      request.status = "Approved";
      request.decidedAt = new Date();
      ride.availableSeats = Math.max(0, ride.availableSeats - request.seatsRequested);
      if (ride.availableSeats === 0) {
        ride.status = "Full";
      }
      await ride.save();

      return NextResponse.json({
        success: true,
        message: `Approved seat for ${request.passengerName}. Remaining seats: ${ride.availableSeats}.`,
        ride,
      });
    }

    if (action === "reject") {
      request.status = "Rejected";
      request.decidedAt = new Date();
      await ride.save();

      return NextResponse.json({
        success: true,
        message: `Declined seat request for ${request.passengerName}.`,
        ride,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
