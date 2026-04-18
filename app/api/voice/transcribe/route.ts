import { NextResponse } from "next/server";

// In this MVP the browser handles speech-to-text via Web Speech API,
// so this endpoint is a thin echo used as a single place for future
// server-side Whisper/Gemini audio support.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transcript = String(body.transcript ?? "").trim();
    if (!transcript) {
      return NextResponse.json({ error: "transcript required" }, { status: 400 });
    }
    return NextResponse.json({ transcript });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
