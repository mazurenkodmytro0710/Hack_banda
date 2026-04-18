import { NextRequest, NextResponse } from "next/server";
import { generateSpeech } from "@/lib/elevenlabs";

// POST /api/voice/generate-audio { text } -> audio/mpeg (or 204 if disabled)
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

    const audio = await generateSpeech(text);
    if (!audio) return new NextResponse(null, { status: 204 });

    return new NextResponse(audio, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
