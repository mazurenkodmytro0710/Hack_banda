import { NextRequest, NextResponse } from "next/server";
import { parseRequestIntent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();
    if (!transcript) {
      return NextResponse.json({ error: "transcript required" }, { status: 400 });
    }
    const intent = await parseRequestIntent(transcript);
    return NextResponse.json({ intent });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Parse failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
