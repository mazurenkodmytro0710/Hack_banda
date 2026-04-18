import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { User } from "@/models/User";
import { Chat } from "@/models/Chat";
import { getSessionFromRequest, unauthorized } from "@/lib/auth";

// POST /api/phone/initiate { request_id }
// Mocked Twilio: returns the other party's phone number so the client can dial
// via the native tel: handler. No real call is placed.
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return unauthorized();

    const { request_id } = await req.json();
    if (!request_id) {
      return NextResponse.json({ error: "request_id required" }, { status: 400 });
    }

    await connectDB();
    const r = await HelpRequest.findById(request_id);
    if (!r) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const requesterId = r.requester_id.toString();
    const helperId = r.accepted_by?.toString();
    if (!helperId) {
      return NextResponse.json({ error: "No helper assigned yet" }, { status: 409 });
    }
    if (session.sub !== requesterId && session.sub !== helperId) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const otherId = session.sub === requesterId ? helperId : requesterId;
    const other = await User.findById(otherId).select("_id name phone").lean();
    if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await Chat.create({
      request_id: r._id,
      sender_id: session.sub,
      recipient_id: otherId,
      message: `${session.name} is calling you now.`,
      message_type: "system",
    });

    return NextResponse.json({
      name: other.name,
      phone: other.phone ?? null,
      mocked: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Phone init failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
