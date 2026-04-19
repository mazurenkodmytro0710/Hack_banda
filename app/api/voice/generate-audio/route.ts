import { NextRequest, NextResponse } from "next/server";
import { generateSpeech } from "@/lib/elevenlabs";

// POST /api/voice/generate-audio { text } -> audio/mpeg
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }

    console.log("[TTS_API] Generating speech for:", text.slice(0, 50));
    const audio = await generateSpeech(text);
    if (!audio || audio.byteLength === 0) {
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(audio, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "TTS failed";
    console.error("[TTS_API] Error:", msg);
    // Return 204 No Content instead of 500 to trigger browser fallback gracefully
    return new NextResponse(null, { status: 204 });
  }
}
