import { NextRequest, NextResponse } from "next/server";
import { KOSICE_DEFAULT } from "@/lib/constants";

function parseNumberHeader(value: string | null): number | null {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function GET(req: NextRequest) {
  const lat =
    parseNumberHeader(req.headers.get("x-vercel-ip-latitude")) ??
    parseNumberHeader(req.headers.get("x-ip-latitude"));
  const lng =
    parseNumberHeader(req.headers.get("x-vercel-ip-longitude")) ??
    parseNumberHeader(req.headers.get("x-ip-longitude"));

  if (lat !== null && lng !== null) {
    return NextResponse.json({
      location: { lat, lng, accuracy: "ip" },
    });
  }

  return NextResponse.json({
    location: {
      lat: KOSICE_DEFAULT.lat,
      lng: KOSICE_DEFAULT.lng,
      accuracy: "default",
    },
  });
}
