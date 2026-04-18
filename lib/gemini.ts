import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ParsedIntent, RequestCategory, RequestUrgency } from "./types";

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenerativeAI(key);
}

const PROMPT = (transcript: string) => `
You are an accessibility assistant. Parse this help request (may be Ukrainian, Slovak, or English).

Request: "${transcript}"

Return ONLY valid JSON matching this exact schema:
{
  "category": "transport" | "shopping" | "stairs" | "medical" | "other",
  "urgency": "low" | "medium" | "high",
  "title": "short title, max 8 words, same language as input",
  "description": "cleaned description of what's needed",
  "estimated_duration": number (minutes),
  "accessibility_notes": "any special needs mentioned (e.g. wheelchair, blind) or empty string"
}
`;

export async function parseRequestIntent(transcript: string): Promise<ParsedIntent> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(PROMPT(transcript));
    const raw = result.response.text();
    const parsed = JSON.parse(raw);
    return {
      category: (parsed.category ?? "other") as RequestCategory,
      urgency: (parsed.urgency ?? "medium") as RequestUrgency,
      title: String(parsed.title ?? transcript.slice(0, 60)),
      description: String(parsed.description ?? transcript),
      estimated_duration: Number(parsed.estimated_duration ?? 30),
      accessibility_notes: parsed.accessibility_notes ?? "",
    };
  } catch (err) {
    return fallbackParse(transcript);
  }
}

function fallbackParse(transcript: string): ParsedIntent {
  const t = transcript.toLowerCase();
  let category: RequestCategory = "other";
  if (/(groc|shop|магазин|shopping|покуп|nákup)/.test(t)) category = "shopping";
  else if (/(stair|сход|schody|floor|поверх)/.test(t)) category = "stairs";
  else if (/(car|ride|таксі|transport|поїзд|доїх)/.test(t)) category = "transport";
  else if (/(medic|doctor|pharm|лік|аптек|doktor|lekár)/.test(t)) category = "medical";

  let urgency: RequestUrgency = "medium";
  if (/(urgent|terms|терміново|швидко|rýchlo|súrne)/.test(t)) urgency = "high";
  else if (/(someday|когда|kedysi|low)/.test(t)) urgency = "low";

  return {
    category,
    urgency,
    title: transcript.slice(0, 60),
    description: transcript,
    estimated_duration: 30,
    accessibility_notes: "",
  };
}
