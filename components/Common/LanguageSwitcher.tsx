"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  LOCALES,
  LOCALE_LABELS,
  type Locale,
} from "@/lib/i18n/dictionaries";

interface Props {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: Props) {
  const { locale, setLocale, t } = useTranslation();
  return (
    <div
      role="radiogroup"
      aria-label={t("settings.select_language")}
      className={`flex ${compact ? "gap-1" : "gap-2"}`}
    >
      {LOCALES.map((code: Locale) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLocale(code)}
            className={`touch-target rounded-2xl px-3 py-2 text-sm font-bold transition ${
              active
                ? "bg-black text-white"
                : "bg-white/70 text-black hover:bg-white"
            }`}
          >
            {compact ? code.toUpperCase() : LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
