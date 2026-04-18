"use client";

import { useState, FormEvent } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Props {
  onSend: (text: string) => Promise<void> | void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onSend(trimmed);
      setValue("");
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(15);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="card-surface sticky bottom-0 flex items-center gap-2 rounded-[30px] p-2.5"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("chat.placeholder")}
        disabled={disabled || busy}
        aria-label={t("chat.placeholder")}
        className="touch-target flex-1 rounded-[24px] bg-white/80 px-4 py-3 text-base text-black outline-none placeholder:text-black/40 focus:ring-2 focus:ring-black"
      />
      <button
        type="submit"
        disabled={disabled || busy || !value.trim()}
        className="touch-target rounded-[24px] bg-black px-6 py-3 text-base font-black text-white shadow-[0_12px_24px_rgba(17,17,17,0.18)] disabled:opacity-40"
      >
        {t("chat.send")}
      </button>
    </form>
  );
}
