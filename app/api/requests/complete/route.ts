import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { HelperStatus } from "@/models/Helper";
import { KarmaLog } from "@/models/KarmaLog";
import { User } from "@/models/User";
import { getSessionFromRequest, unauthorized } from "@/lib/auth";
import { KARMA_REWARDS } from "@/lib/types";
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
    const reqDoc = await HelpRequest.findById(parsed.data.request_id);
    if (!reqDoc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParty =
      reqDoc.requester_id.toString() === session.sub ||
      (reqDoc.accepted_by && reqDoc.accepted_by.toString() === session.sub);
    if (!isParty) return NextResponse.json({ error: "Not your request" }, { status: 403 });

    if (reqDoc.status === "completed") {
      return NextResponse.json({ request: serializeRequest(reqDoc) });
    }

    reqDoc.status = "completed";
    reqDoc.completed_at = new Date();
    await reqDoc.save();

    const operations: Promise<unknown>[] = [];
    if (reqDoc.accepted_by) {
      operations.push(
        HelperStatus.findOneAndUpdate({ user_id: reqDoc.accepted_by }, { current_request_id: null }),
        User.findByIdAndUpdate(reqDoc.accepted_by, {
          $inc: { karma_points: KARMA_REWARDS.helped },
        }),
        User.findByIdAndUpdate(reqDoc.requester_id, {
          $inc: { karma_points: KARMA_REWARDS.completed_request },
        }),
        KarmaLog.create({
          user_id: reqDoc.accepted_by,
          action: "helped",
          points_awarded: KARMA_REWARDS.helped,
          request_id: reqDoc._id,
        }),
        KarmaLog.create({
          user_id: reqDoc.requester_id,
          action: "completed_request",
          points_awarded: KARMA_REWARDS.completed_request,
          request_id: reqDoc._id,
        })
      );
    }

    await Promise.all(operations);

    return NextResponse.json({ request: serializeRequest(reqDoc) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Completion failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
