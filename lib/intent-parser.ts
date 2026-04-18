import OpenAI from "openai";
import type { ParsedIntent, RequestCategory, RequestUrgency } from "./types";

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({ apiKey: key });
}

const PROMPT = (transcript: string) => `
You are an accessibility assistant. Parse this help request (may be Ukrainian, Slovak, or English).

CRITICAL URGENCY if ANY of these apply:
- User says: "dying", "can't breathe", "unconscious", "bleeding", "chest pain"
- OR: "помираю", "не можу дихати", "без тями", "кровотеча", "біль в грудях"
- OR: "zomieram", "nemôžem dýchať", "bez vedomia"
- Person reports: stroke, poisoning, severe allergic reaction, fire, attack, inability to move

HIGH URGENCY if:
- Severe pain or injury: "broken leg", "deep cut", "lost", "can't get up"
- OR: "сильний біль", "зламалось", "заблукав", "не можу встати"

MEDIUM URGENCY if:
- Help needed within hours: shopping, navigation, document reading
- OR: "потрібна допомога з покупками", "як дістатись до..."

LOW URGENCY if:
- Conversation, advice, general questions

Request: "${transcript}"

Return ONLY valid JSON matching this exact schema:
{
  "category": "transport" | "shopping" | "stairs" | "medical" | "other",
  "urgency": "critical" | "high" | "medium" | "low",
  "title": "short title, max 8 words, same language as input",
  "description": "cleaned description of what's needed",
  "estimated_duration": number (minutes),
  "accessibility_notes": "any special needs mentioned (e.g. wheelchair, blind) or empty string"
}

IMPORTANT: When in doubt, err on the side of CRITICAL. Better to over-prioritize than under-prioritize life-safety requests.
`;

export async function parseRequestIntent(transcript: string): Promise<ParsedIntent> {
  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an accessibility assistant that parses help requests. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: PROMPT(transcript),
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "{}";
    console.log(`[OPENAI] Transcript: "${transcript}"`);
    console.log(`[OPENAI] Response: ${raw}`);
    const parsed = JSON.parse(raw);
    console.log(`[OPENAI] Parsed urgency: ${parsed.urgency}`);

    return {
      category: (parsed.category ?? "other") as RequestCategory,
      urgency: (parsed.urgency ?? "medium") as RequestUrgency,
      title: String(parsed.title ?? transcript.slice(0, 60)),
      description: String(parsed.description ?? transcript),
      estimated_duration: Number(parsed.estimated_duration ?? 30),
      accessibility_notes: parsed.accessibility_notes ?? "",
    };
  } catch (err) {
    console.error(`[OPENAI_ERROR] ${err instanceof Error ? err.message : "Unknown error"}`);
    console.log(`[FALLBACK] Using fallback for: "${transcript}"`);
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

  const criticalKeywords = [
    'помираю', 'дихат', 'без тями', 'кровотеча', 'невідкладна',
    'інфаркт', 'інсульт', 'біль в грудях', 'удар', 'падіння',
    'ударен', 'травма', 'отрута', 'алергія', 'пожежа', 'нападають', 'крадій',
    'dying', 'breathe', 'unconscious', 'bleeding', 'emergency', 'heart attack',
    'stroke', 'chest pain', 'not moving', 'fire', 'attacked', 'poisoned',
    'zomieram', 'nemôžem', 'bezvedomie', 'krvácanie', 'infarkt', 'mozgová príhoda'
  ];

  if (criticalKeywords.some(kw => t.includes(kw))) {
    const matchedKeyword = criticalKeywords.find(kw => t.includes(kw));
    console.log(`[FALLBACK_CRITICAL] Matched keyword: "${matchedKeyword}" in "${transcript}"`);
    return {
      category: category === "medical" ? "medical" : "other",
      urgency: "critical",
      title: transcript.slice(0, 60),
      description: transcript,
      estimated_duration: 5,
      accessibility_notes: "",
    };
  }
  console.log(`[FALLBACK_MEDIUM] No critical keywords, returning medium for: "${transcript}"`);

  let urgency: RequestUrgency = "medium";
  if (/(urgent|terms|терміново|швидко|rýchlo|súrne)/.test(t)) urgency = "high";
  else if (/(someday|когда|kedysi|низь|поради|совет|совіт|порекомендувати|книжк|фільм|пісн|рецепт|як готувати|думка|питаю|розповід|joke|recommend|book|film|song|recipe|how to cook|advice|joke|funny|chat|talk|recommend)/.test(t)) urgency = "low";

  return {
    category,
    urgency,
    title: transcript.slice(0, 60),
    description: transcript,
    estimated_duration: 30,
    accessibility_notes: "",
  };
}
