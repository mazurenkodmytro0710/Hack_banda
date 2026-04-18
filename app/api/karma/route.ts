import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionFromRequest, unauthorized } from "@/lib/auth";
import { User } from "@/models/User";
import { KarmaLog } from "@/models/KarmaLog";
import { karmaAdjustSchema } from "@/lib/validators";
import { serializeKarmaLog, serializeUser } from "@/lib/serializers";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return unauthorized();

    await connectDB();
    const [user, logs] = await Promise.all([
      User.findById(session.sub).exec(),
      KarmaLog.find({ user_id: session.sub }).sort({ created_at: -1 }).limit(20).exec(),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      user: serializeUser(user),
      logs: logs.map(serializeKarmaLog),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to load karma";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = karmaAdjustSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    await Promise.all([
      User.findByIdAndUpdate(session.sub, {
        $inc: { karma_points: parsed.data.points_awarded },
      }),
      KarmaLog.create({
        user_id: session.sub,
        action: parsed.data.action,
        points_awarded: parsed.data.points_awarded,
        request_id: parsed.data.request_id,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to update karma";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
