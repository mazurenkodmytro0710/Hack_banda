import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { HelperStatus } from "@/models/Helper";
import { Chat } from "@/models/Chat";
import { forbidden, getSessionFromRequest, unauthorized } from "@/lib/auth";
import { serializeRequest } from "@/lib/serializers";
import { requestIdSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return unauthorized();
    if (session.role !== "HELPER") return forbidden();

    const body = await req.json();
    const parsed = requestIdSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "request_id required" }, { status: 400 });
    }

    await connectDB();

    const busyHelper = await HelperStatus.findOne({
      user_id: session.sub,
      current_request_id: { $ne: null },
    });
    if (busyHelper) {
      return NextResponse.json({ error: "Finish the active help first" }, { status: 409 });
    }

    const updated = await HelpRequest.findOneAndUpdate(
      { _id: parsed.data.request_id, status: "pending" },
      { status: "in_progress", accepted_by: session.sub, started_at: new Date() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Request no longer available" }, { status: 409 });
    }

    await HelperStatus.findOneAndUpdate(
      { user_id: session.sub },
      {
        user_id: session.sub,
        current_request_id: updated._id,
        is_online: true,
        updated_at: new Date(),
        current_location: updated.location,
      },
      { upsert: true, new: true }
    );

    await Chat.create({
      request_id: updated._id,
      sender_id: session.sub,
      recipient_id: updated.requester_id,
      message: `${session.name} accepted your request. Chat is now open.`,
      message_type: "system",
    });

    return NextResponse.json({ request: serializeRequest(updated) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Accept failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
