import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SevaOpportunity, Member, ActionableNotification } from "@/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { sevaId, opportunityTitle, memberId, memberName, phone } = body;
    const identifier = sevaId || opportunityTitle;

    if (!identifier || !memberName) {
      return NextResponse.json(
        { success: false, error: "Seva ID/Title and Member Name are required to claim a slot." },
        { status: 400 }
      );
    }

    let seva = null;
    if (sevaId && typeof sevaId === "string" && sevaId.match(/^[0-9a-fA-F]{24}$/)) {
      seva = await SevaOpportunity.findById(sevaId);
    }
    if (!seva) {
      const orConditions: any[] = [
        { title: new RegExp(identifier, "i") },
        { gujaratiTitle: new RegExp(identifier, "i") },
      ];
      if (typeof identifier === "string" && identifier.match(/^[0-9a-fA-F]{24}$/)) {
        orConditions.push({ _id: identifier });
      }
      seva = await SevaOpportunity.findOne({ $or: orConditions });
    }
    if (!seva) {
      return NextResponse.json({ success: false, error: "Seva opportunity not found" }, { status: 404 });
    }

    if (seva.status === "Full" || seva.acceptedVolunteerCount >= seva.requiredVolunteerCount) {
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
      memberId: memberId || "unassigned",
      memberName,
      phone: phone || "9825000000",
      claimedAt: new Date(),
    });

    seva.acceptedVolunteerCount += 1;
    if (seva.acceptedVolunteerCount >= seva.requiredVolunteerCount) {
      seva.status = "Full";
    }

    await seva.save();

    return NextResponse.json({
      success: true,
      message: `Seva claimed successfully! (${seva.acceptedVolunteerCount}/${seva.requiredVolunteerCount} filled)`,
      seva,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
