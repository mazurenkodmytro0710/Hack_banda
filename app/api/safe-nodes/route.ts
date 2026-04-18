import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SafeNode } from "@/models/SafeNode";
import { HelperStatus } from "@/models/Helper";
import { SAFE_NODE_RADIUS_METRES } from "@/lib/constants";
import { serializeSafeNode } from "@/lib/serializers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") ?? "48.7164");
    const lng = parseFloat(searchParams.get("lng") ?? "21.2611");
    const radius = parseFloat(searchParams.get("radius_m") ?? String(SAFE_NODE_RADIUS_METRES));

    await connectDB();

    const [helperNearby, nodes] = await Promise.all([
      HelperStatus.findOne({
        is_online: true,
        current_location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radius * 2,
          },
        },
      })
        .select("_id")
        .lean()
        .exec(),
      SafeNode.find({
        is_active: true,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radius,
          },
        },
      })
        .limit(10)
        .exec(),
    ]);

    return NextResponse.json({
      type: "safe_nodes",
      show_fallback: !helperNearby,
      message:
        !helperNearby
          ? "Немає волонтерів поруч, але ці місця готові допомогти"
          : "Поруч є партнерські безпечні точки",
      nodes: nodes.map(serializeSafeNode),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to load safe nodes";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
