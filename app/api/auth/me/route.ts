import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSessionFromRequest } from "@/lib/auth";
import { serializeUser } from "@/lib/serializers";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ user: null });

    await connectDB();
    const user = await User.findById(session.sub);
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({ user: serializeUser(user) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to load profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
