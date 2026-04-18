import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { DEFAULT_LOCALE } from "@/lib/i18n/dictionaries";
import { getLocaleFromPath, localizePath } from "@/lib/i18n/locale";

const PROTECTED_PREFIXES = ["/profile", "/settings", "/chat"];

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname.includes(".")
  );
}

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

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const routeLocale = getLocaleFromPath(pathname);
  if (!routeLocale) {
    const url = req.nextUrl.clone();
    url.pathname = localizePath(DEFAULT_LOCALE, pathname);
    return NextResponse.redirect(url);
  }

  const localizedPath = pathname.slice(`/${routeLocale}`.length) || "/";
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => localizedPath === prefix || localizedPath.startsWith(`${prefix}/`)
  );
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("openarm_session")?.value;
  const session = token ? await verify(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = `/${routeLocale}/auth/login`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
