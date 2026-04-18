"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_LOCALE, DICTIONARIES, LOCALES, LOCALE_COOKIE, type Locale } from "./dictionaries";
import { getLocaleFromPath, localizePath, stripLocaleFromPath } from "./locale";

const STORAGE_KEY = LOCALE_COOKIE;
const EVENT = "openarm:locale-change";

function readStored(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return (LOCALES.includes(raw as Locale) ? raw : DEFAULT_LOCALE) as Locale;
}

/** Client-only hook: returns `t(key, vars?)` and the current locale, plus a setter. */
export function useTranslation() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [storedLocale, setStoredLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const routeLocale = getLocaleFromPath(pathname);
  const locale = routeLocale ?? storedLocale;

  // Hydrate from localStorage on mount, and listen for cross-component updates.
  useEffect(() => {
    const next = readStored();
    setStoredLocaleState(next);
    const onChange = () => setStoredLocaleState(readStored());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, next);
    setStoredLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event(EVENT));
    void fetch("/api/auth/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language_preference: next }),
    }).catch(() => undefined);

    const targetPath = localizePath(next, stripLocaleFromPath(pathname));
    router.replace(targetPath);
    router.refresh();
  }, [pathname, router]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const raw =
        DICTIONARIES[locale]?.[key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_, name) =>
        vars[name] !== undefined ? String(vars[name]) : `{${name}}`
      );
    },
    [locale]
  );

  return { t, locale, setLocale };
}
