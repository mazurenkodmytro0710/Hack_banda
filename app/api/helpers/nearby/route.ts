import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { HelperStatus } from "@/models/Helper";
import { User } from "@/models/User";
import { NEARBY_RADIUS_METRES } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") ?? "48.7164");
    const lng = parseFloat(searchParams.get("lng") ?? "21.2611");
    const radius = parseFloat(searchParams.get("radius_m") ?? String(NEARBY_RADIUS_METRES));

    await connectDB();
    const helpers = await HelperStatus.find({
      is_online: true,
      current_location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    })
      .sort({ updated_at: -1 })
      .limit(50)
      .exec();

    const userIds = Array.from(new Set(helpers.map((helper) => helper.user_id.toString())));
    const users = await User.find({ _id: { $in: userIds } }).select("_id name").exec();
    const userMap = new Map(users.map((user) => [user._id.toString(), user.name]));

    return NextResponse.json({
      helpers: helpers.map((helper) => ({
        _id: helper._id.toString(),
        user_id: helper.user_id.toString(),
        name: userMap.get(helper.user_id.toString()) ?? "Volunteer",
        current_location: helper.current_location,
        is_online: helper.is_online,
        current_request_id: helper.current_request_id?.toString() ?? null,
        updated_at: helper.updated_at.toISOString(),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to load helpers";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
