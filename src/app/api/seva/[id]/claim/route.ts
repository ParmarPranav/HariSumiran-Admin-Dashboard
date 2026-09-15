import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SevaOpportunity, Member, ActionableNotification } from "@/models";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { memberId = "MEM-NAD-001", memberName = "Devotee", phone = "9825000000" } = body;

    let seva = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      seva = await SevaOpportunity.findById(id);
    }
    if (!seva) {
      seva = await SevaOpportunity.findOne({
        $or: [
          { _id: id },
          { title: new RegExp(id, "i") },
          { gujaratiTitle: new RegExp(id, "i") },
        ],
      });
    }

    if (!seva) {
      return NextResponse.json({ success: false, error: "Seva opportunity not found" }, { status: 404 });
    }

    const currentFilled = seva.acceptedVolunteerCount || seva.filledSlots || 0;
    const totalRequired = seva.requiredVolunteerCount || seva.totalSlots || 5;

    if (seva.status === "Full" || currentFilled >= totalRequired) {
      return NextResponse.json(
        { success: false, error: "This seva opportunity has already reached full capacity." },
        { status: 400 }
      );
    }

    // Check if already registered
    const alreadyRegistered = (seva.volunteers || []).some(
      (v) => v.memberId === memberId || (phone && v.phone === phone)
    );
    if (alreadyRegistered) {
      return NextResponse.json(
        { success: false, error: "You are already registered for this seva opportunity." },
        { status: 400 }
      );
    }

    seva.volunteers.push({
      memberId,
      memberName,
      phone,
      claimedAt: new Date(),
    });

    seva.acceptedVolunteerCount = currentFilled + 1;
    seva.filledSlots = seva.acceptedVolunteerCount;
    const isFull = seva.acceptedVolunteerCount >= totalRequired;

    if (isFull) {
      seva.status = "Full";
    }

    await seva.save();

    return NextResponse.json({
      success: true,
      message: `Seva claimed successfully! (${seva.acceptedVolunteerCount}/${totalRequired} filled)`,
      filledVolunteers: seva.acceptedVolunteerCount,
      requiredVolunteers: totalRequired,
      isFull,
      status: isFull ? "Filled" : "Open",
      opportunityId: seva._id.toString(),
      seva,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
