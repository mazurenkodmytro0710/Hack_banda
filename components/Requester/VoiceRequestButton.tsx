"use client";

import { useRef, useState } from "react";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
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

export function VoiceRequestButton({
  onTranscript,
  disabled = false,
}: {
  onTranscript: (transcript: string) => Promise<void> | void;
  disabled?: boolean;
}) {
  const { t, locale } = useTranslation();
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const stopRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.stop();
    recognitionRef.current = null;
    setListening(false);
  };

  const startRecording = () => {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setUnsupported(true);
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = locale === "uk" ? "uk-UA" : locale === "sk" ? "sk-SK" : "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        await onTranscript(transcript);
      }
      recognition.stop();
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    setListening(true);
    safeVibrate(40);
    recognition.start();
  };

  return (
    <div className="grid gap-2">
      <AccessibleButton
        className="min-h-[72px] w-full rounded-[28px] text-xl"
        onClick={listening ? stopRecording : startRecording}
        disabled={disabled}
        ariaLabel={listening ? t("chat.stopVoice") : t("requester.voiceCta")}
      >
        {listening ? `⏹ ${t("requester.voiceListening")}` : `🎤 ${t("requester.voiceCta")}`}
      </AccessibleButton>
      {unsupported ? (
        <p className="text-sm text-black/65">
          {t("requester.voiceUnsupported")}
        </p>
      ) : null}
    </div>
  );
}
