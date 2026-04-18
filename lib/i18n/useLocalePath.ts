"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, type Locale } from "./dictionaries";
import { getLocaleFromPath, localizePath } from "./locale";

const EVENT = "openarm:locale-change";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const raw = window.localStorage.getItem(LOCALE_COOKIE);
  return (LOCALES.includes(raw as Locale) ? raw : DEFAULT_LOCALE) as Locale;
}

export function useLocalePath() {
  const pathname = usePathname() ?? "/";
  const routeLocale = getLocaleFromPath(pathname);
  const [storedLocale, setStoredLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const onChange = () => setStoredLocale(readStoredLocale());
    onChange();
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const locale = routeLocale ?? storedLocale;
  const href = useCallback((path: string) => localizePath(locale, path), [locale]);

  return {
    locale,
    href,
  };
}
