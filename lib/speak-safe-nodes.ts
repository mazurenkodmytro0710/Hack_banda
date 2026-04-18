import type { SafeNodeDTO } from "./types";

/**
 * Generate audio description of nearby safe nodes for blind users
 * Speaks the name, phone, and basic accessibility info of each service
 */
export async function speakSafeNodesDescription(
  nodes: SafeNodeDTO[],
  language: string = "uk"
): Promise<void> {
  if (nodes.length === 0) return;

  const descriptions = nodes.slice(0, 3).map((node) => {
    let description = node.name;

    if (node.phone) {
      description += `, телефон ${node.phone}`;
    }

    // Add accessibility info for blind users
    const a11yFeatures = [];
    if (node.accessibility?.wheelchair_access) a11yFeatures.push("інвалідна коляска");
    if (node.accessibility?.ramp) a11yFeatures.push("пандус");
    if (node.accessibility?.elevator) a11yFeatures.push("ліфт");

    if (a11yFeatures.length > 0) {
      description += `. Доступність: ${a11yFeatures.join(", ")}`;
    }

    return description;
  });

  const fullText = `Поблизу знаходиться ${descriptions.length} закладів. ${descriptions.join(". ")}`;

  // Use browser speech synthesis to speak the description
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = language;

    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
      setTimeout(() => resolve(), 60000); // Max 60 seconds
    });
  } catch {
    return Promise.resolve();
  }
}
