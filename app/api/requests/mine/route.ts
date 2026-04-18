import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionFromRequest, unauthorized } from "@/lib/auth";
import { HelpRequest } from "@/models/Request";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const statuses = (searchParams.get("status") ?? "pending,in_progress,completed")
      .split(",")
      .filter(Boolean);

    await connectDB();
    const filter =
      session.role === "REQUESTER"
        ? { requester_id: session.sub, status: { $in: statuses } }
        : { accepted_by: session.sub, status: { $in: statuses } };

    const requests = await HelpRequest.find(filter).sort({ created_at: -1 }).exec();
    const counterpartyIds = Array.from(
      new Set(
        requests.map((request) =>
          session.role === "REQUESTER"
            ? request.accepted_by?.toString()
            : request.requester_id.toString()
        )
      )
    ).filter((value): value is string => Boolean(value));

    const counterparties = await User.find({ _id: { $in: counterpartyIds } })
      .select("_id name")
      .exec();
    const counterpartyMap = new Map(counterparties.map((user) => [user._id.toString(), user.name]));

    return NextResponse.json({
      requests: requests.map((request) => ({
        _id: request._id.toString(),
        requester_id: request.requester_id.toString(),
        requester_name:
          counterpartyMap.get(request.requester_id.toString()) ??
          (session.role === "REQUESTER" ? session.name : "Requester"),
        requester_karma: 0,
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
        completed_at: request.completed_at ? request.completed_at.toISOString() : null,
        counterparty_name:
          session.role === "REQUESTER"
            ? request.accepted_by
              ? counterpartyMap.get(request.accepted_by.toString()) ?? "Helper"
              : null
            : counterpartyMap.get(request.requester_id.toString()) ?? "Requester",
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to load requests";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
