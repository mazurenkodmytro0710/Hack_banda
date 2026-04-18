import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { applySessionCookie, signSession } from "@/lib/auth";
import { serializeUser } from "@/lib/serializers";
import { loginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const password = parsed.data.password;
    const email = parsed.data.email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    user.last_login = new Date();
    await user.save();

    const token = await signSession({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const response = NextResponse.json({ user: serializeUser(user) });
    applySessionCookie(response, token);
    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
