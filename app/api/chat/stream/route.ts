import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";
import { HelpRequest } from "@/models/Request";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// SSE: GET /api/chat/stream?request_id=...
// Pushes new chat messages (since last poll) every 2s.
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get("request_id");
  if (!requestId) {
    return new Response("request_id required", { status: 400 });
  }

  await connectDB();
  const r = await HelpRequest.findById(requestId);
  if (!r) return new Response("Request not found", { status: 404 });

  const requesterId = r.requester_id.toString();
  const helperId = r.accepted_by?.toString() ?? "";
  if (session.sub !== requesterId && session.sub !== helperId) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = async () => {
        try {
          // For MVP reliability, stream the full ordered history and let the client dedupe by id.
          // This avoids missing messages created within the same millisecond timestamp.
          const rows = await Chat.find({ request_id: requestId })
            .sort({ created_at: 1 })
            .lean();
          const payload = rows.map((m) => ({
            _id: m._id.toString(),
            request_id: m.request_id.toString(),
            sender_id: m.sender_id.toString(),
            recipient_id: m.recipient_id.toString(),
            message: m.message,
            message_type: m.message_type,
            created_at: m.created_at.toISOString(),
          }));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          // ignore transient errors, keep stream alive
        }
      };

      await push();
      const interval = setInterval(() => {
        void push();
      }, 2000);

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
