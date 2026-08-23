import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Asset, AuditLog } from "@/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { assetId, action = "borrow", holderName, returnDate, conditionNotes } = body;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
    }

    if (action === "borrow") {
      if (asset.status !== "Available") {
        return NextResponse.json({ success: false, error: "Asset is currently " + asset.status }, { status: 400 });
      }
      asset.status = "In Use";
      asset.currentHolder = holderName || "Karyakarta";
      asset.expectedReturnDate = returnDate || new Date(Date.now() + 86400000).toISOString().split("T")[0];
    } else if (action === "return") {
      asset.status = "Available";
      asset.currentHolder = undefined;
      asset.expectedReturnDate = undefined;
      if (conditionNotes) asset.notes = conditionNotes;
    } else if (action === "report_maintenance") {
      asset.status = "Under Maintenance";
      asset.condition = "Needs Maintenance";
      if (conditionNotes) asset.notes = conditionNotes;
    }

    await asset.save();

    await AuditLog.create({
      actorId: "usr-current",
      actorName: holderName || "Active User",
      actorRole: "karyakarta",
      action: `ASSET_${action.toUpperCase()}`,
      module: "Assets",
      recordId: assetId,
      description: `Asset ${asset.name} (${asset.assetCode}) marked as ${asset.status}`,
    });

    return NextResponse.json({
      success: true,
      message: `Asset ${action} completed successfully`,
      asset,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
