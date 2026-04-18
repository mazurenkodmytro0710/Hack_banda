import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { KarmaLog } from "@/models/KarmaLog";
import { User } from "@/models/User";
import { forbidden, getSessionFromRequest, unauthorized } from "@/lib/auth";
import { serializeRequest } from "@/lib/serializers";
import { createRequestSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return unauthorized();
    if (session.role !== "REQUESTER") return forbidden();

    const body = await req.json();
    const parsed = createRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();
    const { title, description, category, urgency, lat, lng, estimated_duration, accessibility_notes } =
      parsed.data;

    const doc = await HelpRequest.create({
      requester_id: session.sub,
      title,
      description,
      category,
      urgency,
      location: { type: "Point", coordinates: [lng, lat] },
      estimated_duration,
      accessibility_notes,
    });

    await Promise.all([
      KarmaLog.create({
        user_id: session.sub,
        action: "requested",
        points_awarded: 0,
        request_id: doc._id,
      }),
      User.findByIdAndUpdate(session.sub, {
        location: { type: "Point", coordinates: [lng, lat] },
      }),
    ]);

    return NextResponse.json(
      {
        request: {
          ...serializeRequest(doc),
          requester_name: session.name,
          requester_karma: 0,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request creation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
