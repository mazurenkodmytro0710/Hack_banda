import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

async function getPayload(lat: number, lng: number) {
  await connectDB();
  const requests = await HelpRequest.find({
    status: "pending",
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: 2000,
      },
    },
  })
    .sort({ created_at: -1 })
    .limit(50)
    .exec();

  const requesterIds = Array.from(new Set(requests.map((request) => request.requester_id.toString())));
  const users = await User.find({ _id: { $in: requesterIds } })
    .select("_id name karma_points")
    .exec();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return requests.map((request) => ({
    _id: request._id.toString(),
    requester_id: request.requester_id.toString(),
    requester_name: userMap.get(request.requester_id.toString())?.name ?? "Requester",
    requester_karma: userMap.get(request.requester_id.toString())?.karma_points ?? 0,
    title: request.title,
    description: request.description,
    category: request.category,
    urgency: request.urgency,
    status: request.status,
    location: request.location,
    estimated_duration: request.estimated_duration,
    accessibility_notes: request.accessibility_notes,
    accepted_by: request.accepted_by ? request.accepted_by.toString() : null,
    created_at: request.created_at.toISOString(),
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "48.7164");
  const lng = parseFloat(searchParams.get("lng") ?? "21.2611");
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = async () => {
        const payload = await getPayload(lat, lng);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      await push();
      const interval = setInterval(() => {
        void push();
      }, 3000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
