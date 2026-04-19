import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";
import { HelpRequest } from "@/models/Request";
import { getSessionFromRequest, unauthorized } from "@/lib/auth";

// POST /api/chat/send { request_id, message }
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return unauthorized();

    const { request_id, message } = await req.json();
    if (!request_id || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "request_id and message required" }, { status: 400 });
    }

    await connectDB();
    const r = await HelpRequest.findById(request_id);
    if (!r) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const requesterId = r.requester_id.toString();
    const helperId = r.accepted_by?.toString();
    if (!helperId) {
      return NextResponse.json({ error: "No helper assigned yet" }, { status: 409 });
    }

    // Sender must be a party; recipient is the other party
    const senderId = session.sub;
    if (senderId !== requesterId && senderId !== helperId) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }
    const recipientId = senderId === requesterId ? helperId : requesterId;

    const doc = await Chat.create({
      request_id: r._id,
      sender_id: senderId,
      recipient_id: recipientId,
      message: message.trim(),
      message_type: "text",
    });

    return NextResponse.json({
      message: {
        _id: doc._id.toString(),
        request_id: doc.request_id.toString(),
        sender_id: doc.sender_id.toString(),
        recipient_id: doc.recipient_id.toString(),
        message: doc.message,
        message_type: doc.message_type,
        created_at: doc.created_at.toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Send failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/chat/send?request_id=...  —> full history (simple list view)
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("request_id");
    if (!requestId) return NextResponse.json({ error: "request_id required" }, { status: 400 });

    await connectDB();
    const request = await HelpRequest.findById(requestId);
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const requesterId = request.requester_id.toString();
    const helperId = request.accepted_by?.toString() ?? "";
    if (session.sub !== requesterId && session.sub !== helperId) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const rows = await Chat.find({ request_id: requestId }).sort({ created_at: 1 }).lean();
    return NextResponse.json({
      messages: rows.map((m) => ({
        _id: m._id.toString(),
        request_id: m.request_id.toString(),
        sender_id: m.sender_id.toString(),
        recipient_id: m.recipient_id.toString(),
        message: m.message,
        message_type: m.message_type,
        created_at: m.created_at.toISOString(),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Load failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
