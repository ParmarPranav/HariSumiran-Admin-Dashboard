import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TravelRide, ActionableNotification } from "@/models";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; reqId: string }> }
) {
  try {
    await connectDB();
    const { id, reqId } = await params;
    const body = await req.json();
    const { action, driverNotes } = body; // action: "APPROVE" | "REJECT" | "approve" | "reject"

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

    const request = (ride.requests || []).find((r: any) => r.requestId === reqId);
    if (!request) {
      return NextResponse.json({ success: false, error: "Seat request not found." }, { status: 404 });
    }

    const normalizedAction = (action || "").toUpperCase();

    if (normalizedAction === "APPROVE") {
      request.status = "Approved";
      request.decidedAt = new Date();
      ride.availableSeats = Math.max(0, ride.availableSeats - (request.seatsRequested || 1));
      if (ride.availableSeats === 0) {
        ride.status = "Full";
      }
      await ride.save();

      return NextResponse.json({
        success: true,
        message: `Approved seat for ${request.passengerName}. Remaining seats: ${ride.availableSeats}.`,
        newAvailableSeats: ride.availableSeats,
        status: "Approved",
        driverNotes: driverNotes || "Seat confirmed.",
        ride,
      });
    }

    if (normalizedAction === "REJECT") {
      request.status = "Rejected";
      request.decidedAt = new Date();
      await ride.save();

      return NextResponse.json({
        success: true,
        message: `Declined seat request for ${request.passengerName}.`,
        newAvailableSeats: ride.availableSeats,
        status: "Rejected",
        driverNotes: driverNotes || "Declined by driver.",
        ride,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action. Use 'APPROVE' or 'REJECT'." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
