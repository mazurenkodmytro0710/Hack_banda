"use client";

import { useRef, useState, FormEvent } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { safeVibrate } from "@/lib/vibration";

type SpeechRecognitionResultLike = {
  transcript: string;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous?: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };

interface Props {
  onSend: (text: string) => Promise<void> | void;
  disabled?: boolean;
  isBlind?: boolean;
}

export function MessageInput({ onSend, disabled, isBlind = false }: Props) {
  const { t, locale } = useTranslation();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const localeCode = locale === "uk" ? "uk-UA" : locale === "sk" ? "sk-SK" : "en-US";

  const submitText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onSend(trimmed);
      setValue("");
      safeVibrate(15);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await submitText(value);
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.stop();
    recognitionRef.current = null;
    setListening(false);
  };

  const startListening = () => {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition || listening || busy) {
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = localeCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (!transcript) return;

      if (isBlind) {
        await submitText(transcript);
      } else {
        setValue(transcript);
      }

      recognition.stop();
    };

    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    setListening(true);
    safeVibrate(40);
    recognition.start();
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
      safeVibrate(60);
      return;
    }
    startListening();
  };

  if (isBlind) {
    return (
      <form className="card-surface sticky bottom-0 flex flex-col items-center justify-center gap-4 rounded-[30px] px-4 py-5">
        <div className="relative flex items-center justify-center">
          {listening ? (
            <>
              <span className="absolute h-[132px] w-[132px] animate-ping rounded-full bg-accessible-red/18" />
              <span className="absolute h-[156px] w-[156px] rounded-full border border-accessible-red/20" />
            </>
          ) : (
            <span className="absolute h-[156px] w-[156px] rounded-full border border-black/8" />
          )}

          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled || busy}
            className={`touch-target relative flex h-[120px] w-[120px] items-center justify-center rounded-full text-5xl font-black shadow-[0_18px_40px_rgba(17,17,17,0.18)] transition ${
              listening ? "bg-accessible-red text-white" : "bg-accessible-yellow text-black"
            }`}
            aria-label={listening ? t("chat.stopVoice") : t("chat.voice")}
            aria-pressed={listening}
          >
            {listening ? "⏹" : "🎤"}
          </button>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-lg font-black text-black">
            {listening ? t("requester.voiceListening") : t("chat.voice")}
          </p>
          <p className="text-sm text-black/55">
            {listening ? t("chat.stopVoice") : t("requester.voiceCta")}
          </p>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="card-surface sticky bottom-0 flex items-center gap-2 rounded-[30px] p-2.5"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("chat.placeholder")}
        disabled={disabled || busy || listening}
        aria-label={t("chat.placeholder")}
        className="touch-target flex-1 rounded-[24px] bg-white/80 px-4 py-3 text-base text-black outline-none placeholder:text-black/40 focus:ring-2 focus:ring-black"
      />
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || busy}
        className={`touch-target rounded-[24px] px-4 py-3 text-lg font-black transition ${
          listening ? "animate-pulse bg-accessible-red text-white" : "bg-accessible-yellow text-black"
        }`}
        aria-label={listening ? t("chat.stopVoice") : t("chat.voice")}
        aria-pressed={listening}
      >
        {listening ? "⏹" : "🎤"}
      </button>
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
