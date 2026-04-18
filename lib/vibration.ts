"use client";

type NavigatorWithUserActivation = Navigator & {
  userActivation?: {
    hasBeenActive?: boolean;
    isActive?: boolean;
  };
};

export function safeVibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return false;

  const nav = navigator as NavigatorWithUserActivation;
  if (typeof nav.vibrate !== "function") return false;

  const hasUserActivation =
    nav.userActivation === undefined ||
    nav.userActivation.hasBeenActive === true ||
    nav.userActivation.isActive === true;

  if (!hasUserActivation) return false;

  try {
    return nav.vibrate(pattern);
  } catch {
    return false;
  }
}
