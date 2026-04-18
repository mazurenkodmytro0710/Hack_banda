import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audio = formData.get("audio") as Blob;

    if (!audio) {
      return NextResponse.json({ error: "Audio file required" }, { status: 400 });
    }

    // Convert blob to buffer for OpenAI API
    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Whisper API for transcription
    const client = new OpenAI({ apiKey });
    const transcription = await client.audio.transcriptions.create({
      file: new File([buffer], "audio.webm", { type: "audio/webm" }),
      model: "whisper-1",
      language: "uk", // Ukrainian
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Transcription failed";
    console.error("[TRANSCRIBE_ERROR]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
