import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession, unauthorized } from "@/lib/auth";
import { ratingSchema } from "@/lib/validators";
import { HelpRequest } from "@/models/Request";
import { Rating } from "@/models/Rating";
import { User } from "@/models/User";
import { KarmaLog } from "@/models/KarmaLog";
import { KARMA_REWARDS } from "@/lib/types";
import { serializeRating } from "@/lib/serializers";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();
    const request = await HelpRequest.findById(parsed.data.request_id).exec();
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const isRequester = request.requester_id.toString() === session.sub;
    const isAssignedHelper = request.accepted_by?.toString() === parsed.data.to_user_id;
    if (!isRequester || !isAssignedHelper || request.status !== "completed") {
      return NextResponse.json({ error: "Rating is not allowed for this request" }, { status: 403 });
    }

    const existing = await Rating.findOne({
      from_user_id: session.sub,
      request_id: parsed.data.request_id,
    }).exec();
    if (existing) {
      return NextResponse.json({ error: "Rating already submitted" }, { status: 409 });
    }

    const rating = await Rating.create({
      from_user_id: session.sub,
      to_user_id: parsed.data.to_user_id,
      request_id: parsed.data.request_id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    const points =
      parsed.data.rating === 1 ? KARMA_REWARDS.positive_rating : KARMA_REWARDS.negative_rating;
    await Promise.all([
      User.findByIdAndUpdate(parsed.data.to_user_id, { $inc: { karma_points: points } }),
      KarmaLog.create({
        user_id: parsed.data.to_user_id,
        action: parsed.data.rating === 1 ? "positive_rating" : "negative_rating",
        points_awarded: points,
        request_id: parsed.data.request_id,
      }),
    ]);

    return NextResponse.json({ rating: serializeRating(rating) }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Rating failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
