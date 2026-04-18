import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { User } from "@/models/User";
import { NEARBY_RADIUS_METRES } from "@/lib/constants";

// GET /api/requests/nearby?lat=&lng=&radius_m=2000&status=pending
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "48.7164");
  const lng = parseFloat(searchParams.get("lng") ?? "21.2611");
  const radius = parseFloat(searchParams.get("radius_m") ?? String(NEARBY_RADIUS_METRES));
  const statuses = (searchParams.get("status") ?? "pending,in_progress").split(",");

  await connectDB();

  const now = new Date();
  const rows = await HelpRequest.find({
    status: { $in: statuses },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radius,
      },
    },
  })
    .sort({ created_at: -1 })
    .limit(50)
    .exec();

  // Hydrate requester info
  const requesterIds = Array.from(new Set(rows.map((r) => r.requester_id.toString())));
  const users = await User.find({ _id: { $in: requesterIds } })
    .select("_id name karma_points level")
    .exec();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const dto = rows
    .filter((r) => !(r.status === "pending" && r.expires_at <= now))
    .map((r) => {
    const requester = userMap.get(r.requester_id.toString());
    return {
      _id: r._id.toString(),
      requester_id: r.requester_id.toString(),
      requester_name: requester?.name ?? "Anonymous",
      requester_karma: requester?.karma_points ?? 0,
      title: r.title,
      description: r.description,
      category: r.category,
      urgency: r.urgency,
      status: r.status,
      location: r.location,
      estimated_duration: r.estimated_duration,
      accessibility_notes: r.accessibility_notes,
      accepted_by: r.accepted_by ? r.accepted_by.toString() : null,
      created_at: r.created_at.toISOString(),
      completed_at: r.completed_at ? r.completed_at.toISOString() : null,
    };
  });

  return NextResponse.json({ requests: dto });
}
