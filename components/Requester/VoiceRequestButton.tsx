"use client";

import { useState } from "react";
import { AccessibleButton } from "@/components/Common/AccessibleButton";

type SpeechRecognitionResultLike = {
  transcript: string;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
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
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  const startRecording = () => {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setUnsupported(true);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "uk-UA";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        await onTranscript(transcript);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  return (
    <div className="grid gap-2">
      <AccessibleButton
        className="min-h-[72px] w-full rounded-[28px] text-xl"
        onClick={startRecording}
        disabled={disabled || listening}
        ariaLabel="Записати голосовий запит"
      >
        {listening ? "Слухаю..." : "🎤 Записати голосом"}
      </AccessibleButton>
      {unsupported ? (
        <p className="text-sm text-black/65">
          У цьому браузері немає Web Speech API. Можна ввести текст вручну.
        </p>
      ) : null}
    </div>
  );
}
