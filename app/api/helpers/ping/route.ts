import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession, forbidden, unauthorized } from "@/lib/auth";
import { HelperStatus } from "@/models/Helper";
import { User } from "@/models/User";
import { helperPingSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (session.role !== "HELPER") return forbidden();

    const body = await req.json();
    const parsed = helperPingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();
    const { lat, lng, is_online, current_request_id } = parsed.data;
    const point = { type: "Point" as const, coordinates: [lng, lat] as [number, number] };

    await Promise.all([
      HelperStatus.findOneAndUpdate(
        { user_id: session.sub },
        {
          user_id: session.sub,
          current_location: point,
          is_online: is_online ?? true,
          current_request_id: current_request_id ?? null,
          updated_at: new Date(),
        },
        { upsert: true, new: true }
      ),
      User.findByIdAndUpdate(session.sub, { location: point }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Location update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
