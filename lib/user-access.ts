import type { PublicUser } from "@/lib/types";

export type UserMode = "HELPER" | "REQUESTER" | "REQUESTER_BLIND";

const BLIND_NOTES_PATTERN = /(blind|сліп|незр|nevid|nevidi|nevidiaci)/i;

export function isBlindFromNotes(notes?: string | null) {
  return BLIND_NOTES_PATTERN.test(notes ?? "");
}

export function isBlindRequester(user?: Pick<PublicUser, "role" | "is_blind" | "accessibility_notes"> | null) {
  if (!user || user.role !== "REQUESTER") return false;
  return Boolean(user.is_blind) || isBlindFromNotes(user.accessibility_notes);
}

export function getUserMode(
  user?: Pick<PublicUser, "role" | "is_blind" | "accessibility_notes"> | null
): UserMode | null {
  if (!user) return null;
  if (user.role === "HELPER") return "HELPER";
  return isBlindRequester(user) ? "REQUESTER_BLIND" : "REQUESTER";
}
