import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, type Locale } from "./dictionaries";

export { LOCALE_COOKIE };

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : null;
}

export function stripLocaleFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && isLocale(parts[0])) {
    parts.shift();
  }

  return `/${parts.join("/")}`.replace(/\/+/g, "/") || "/";
}

export function localizePath(locale: Locale, pathname: string) {
  const cleanPath = stripLocaleFromPath(pathname);
  if (cleanPath.startsWith("/dashboard")) {
    return cleanPath;
  }
  return cleanPath === "/" ? `/${locale}` : `/${locale}${cleanPath}`;
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}
