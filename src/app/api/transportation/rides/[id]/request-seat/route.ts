import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TravelRide, ActionableNotification } from "@/models";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const {
      passengerMemberId = "MEM-NAD-001",
      passengerName,
      passengerPhone = "9825000000",
      pickupPoint,
      seatsRequested = 1,
    } = body;

    if (!passengerName || !pickupPoint) {
      return NextResponse.json(
        { success: false, error: "Passenger Name and Pickup Point are required." },
        { status: 400 }
      );
    }

    let ride = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      ride = await TravelRide.findById(id);
    }
    if (!ride) {
      ride = await TravelRide.findOne({
        $or: [{ rideCode: id }, { title: new RegExp(id, "i") }],
      });
    }

    if (!ride) {
      return NextResponse.json({ success: false, error: "Ride not found." }, { status: 404 });
    }

    const requestedCount = Number(seatsRequested);
    if (ride.availableSeats < requestedCount) {
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
      passengerPhone,
      pickupPoint,
      seatsRequested: requestedCount,
      status: "Pending",
      requestedAt: new Date(),
    });

    await ride.save();

    await ActionableNotification.create({
      recipientRole: "car_owner",
      title: "Passenger Ride Request Received",
      gujaratiTitle: "મુસાફરે સીટ માટે વિનંતી કરી",
      message: `${passengerName} requested ${requestedCount} seat(s) from "${pickupPoint}" for "${ride.title}".`,
      gujaratiMessage: `${passengerName} એ "${pickupPoint}" થી ${requestedCount} સીટની વિનંતી કરી છે.`,
      category: "ride_request",
      actionType: "RIDE_APPROVE",
      actionPayload: { rideId: ride._id.toString(), requestId },
    });

    return NextResponse.json({
      success: true,
      message: `Seat request submitted to ${ride.driverName}. You will receive a confirmation once approved.`,
      requestId,
      status: "Pending",
      ride,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
