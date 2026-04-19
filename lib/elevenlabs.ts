// Text-to-Speech via ElevenLabs. Falls back to browser speechSynthesis if unavailable.
export async function generateSpeech(text: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    console.log("[ELEVENLABS] Credentials missing - using browser TTS fallback");
    return null;
  }

  try {
    console.log("[ELEVENLABS] Calling API with voice:", voiceId);
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("[ELEVENLABS] API error:", res.status, error);
      return null;
    }

    const buffer = await res.arrayBuffer();
    console.log("[ELEVENLABS] Got audio:", buffer.byteLength, "bytes");
    return buffer;
  } catch (err) {
    console.error("[ELEVENLABS] Error:", err instanceof Error ? err.message : String(err));
    return null;
  }
}
