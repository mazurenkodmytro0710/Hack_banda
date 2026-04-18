import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED = ["/dashboard", "/profile"];

async function verify(token: string): Promise<{ role?: string; sub?: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
    const { payload } = await jwtVerify(token, secret);
    return payload as { role?: string; sub?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("openarm_session")?.value;
  const session = token ? await verify(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Role guard: /dashboard/requester only for REQUESTER, etc.
  if (pathname.startsWith("/dashboard/requester") && session.role !== "REQUESTER") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/helper";
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/dashboard/helper") && session.role !== "HELPER") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/requester";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
