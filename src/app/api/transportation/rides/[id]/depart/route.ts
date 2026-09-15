import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TravelRide, ActionableNotification } from "@/models";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

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

    ride.status = "Departed";
    await ride.save();

    // Notify approved passengers that ride has departed
    for (const req of (ride.requests || []).filter((r: any) => r.status === "Approved")) {
      await ActionableNotification.create({
        recipientRole: "regular_member",
        title: "Your Ride Has Departed",
        gujaratiTitle: "તમારી રાઈડ રવાના થઈ ગઈ છે",
        message: `${ride.driverName} has departed towards ${ride.destination}.`,
        category: "ride_request",
        actionType: "VIEW_LINK",
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      message: `Ride marked as Departed.`,
      rideStatus: "Departed",
      ride,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
