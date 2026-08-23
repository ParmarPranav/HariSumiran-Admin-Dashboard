import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Sabha, SabhaAttendance, Member, AuditLog } from "@/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const sabha = await Sabha.findById(id);
    if (!sabha) {
      return NextResponse.json({ success: false, error: "Sabha session not found" }, { status: 404 });
    }

    const attendanceRecords = await SabhaAttendance.find({ sabhaId: id }).sort({ markedAt: -1 });

    return NextResponse.json({
      success: true,
      sabha,
      attendanceRecords,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await Sabha.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Sabha not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, sabha: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
