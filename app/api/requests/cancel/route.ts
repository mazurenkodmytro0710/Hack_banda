import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";
import { HelperStatus } from "@/models/Helper";
import { HelpRequest } from "@/models/Request";
import { forbidden, getSessionFromRequest, unauthorized } from "@/lib/auth";
import { REQUEST_EXPIRY_MINUTES } from "@/lib/constants";
import { serializeRequest } from "@/lib/serializers";
import { requestIdSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = requestIdSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "request_id required" }, { status: 400 });
    }

    await connectDB();
    const request = await HelpRequest.findById(parsed.data.request_id);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status === "completed" || request.status === "cancelled") {
      return NextResponse.json({ request: serializeRequest(request) });
    }

    const requesterId = request.requester_id.toString();
    const helperId = request.accepted_by?.toString() ?? null;

    if (session.role === "REQUESTER") {
      if (requesterId !== session.sub) return forbidden();

      request.status = "cancelled";
      request.completed_at = new Date();
      await request.save();

      const ops: Promise<unknown>[] = [];
      if (helperId) {
        ops.push(
          HelperStatus.findOneAndUpdate({ user_id: helperId }, { current_request_id: null }),
          Chat.create({
            request_id: request._id,
            sender_id: request.requester_id,
            recipient_id: request.accepted_by,
            message: `${session.name} cancelled this help request.`,
            message_type: "system",
          })
        );
      }

      await Promise.all(ops);
      return NextResponse.json({ request: serializeRequest(request) });
    }

    if (session.role !== "HELPER") return forbidden();
    if (!helperId || helperId !== session.sub) return forbidden();

    request.status = "pending";
    request.accepted_by = null;
    request.started_at = undefined;
    request.expires_at = new Date(Date.now() + REQUEST_EXPIRY_MINUTES * 60_000);
    await request.save();

    await Promise.all([
      HelperStatus.findOneAndUpdate({ user_id: session.sub }, { current_request_id: null }),
      Chat.create({
        request_id: request._id,
        sender_id: session.sub,
        recipient_id: request.requester_id,
        message: `${session.name} released this request. It is open for another helper now.`,
        message_type: "system",
      }),
    ]);

    return NextResponse.json({ request: serializeRequest(request) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
