"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { safeVibrate } from "@/lib/vibration";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { PhoneCallButton } from "./PhoneCallButton";

interface ChatMessage {
  _id: string;
  request_id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  message_type: "text" | "voice" | "system";
  created_at: string;
}

interface Props {
  requestId: string;
  selfId: string;
  partnerName?: string;
  autoReadIncomingText?: boolean;
  showHeader?: boolean;
  isCurrentUserRequester?: boolean;
  requesterIsBlind?: boolean;
}

export function ChatContainer({
  requestId,
  selfId,
  partnerName,
  autoReadIncomingText = false,
  showHeader = true,
  isCurrentUserRequester = false,
  requesterIsBlind = false,
}: Props) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const ttsQueueRef = useRef<string[]>([]);
  const ttsPlayingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (ttsPlayingRef.current || ttsQueueRef.current.length === 0) return;

    ttsPlayingRef.current = true;
    const text = ttsQueueRef.current.shift()!;
    console.log("[QUEUE] Speaking:", text.slice(0, 50));

    try {
      await speakViaElevenLabs(text);
    } finally {
      ttsPlayingRef.current = false;
      if (ttsQueueRef.current.length > 0) {
        void processQueue();
      }
    }
  }, []);

  const enqueueTTS = useCallback((text: string) => {
    console.log("[ENQUEUE] Adding to TTS queue:", text.slice(0, 50));
    ttsQueueRef.current.push(text);
    void processQueue();
  }, [processQueue]);

  const mergeIncomingMessages = useCallback(
    (batch: ChatMessage[]) => {
      if (!batch.length) return;
      console.log("[MSG] Received batch:", batch.length, "messages");
      setMessages((prev) => {
        const next = [...prev];
        for (const m of batch) {
          if (seenRef.current.has(m._id)) continue;
          seenRef.current.add(m._id);
          next.push(m);
          console.log("[MSG] Checking:", { type: m.message_type, from: m.sender_id, self: selfId, autoRead: autoReadIncomingText });
          if (autoReadIncomingText && m.sender_id !== selfId && m.message_type === "text") {
            console.log("[MSG] Adding to TTS:", m.message.slice(0, 50));
            safeVibrate(35);
            enqueueTTS(m.message);
          }
          if (m.sender_id !== selfId && m.message_type === "system") {
            safeVibrate([160, 80, 160]);
            notifyIncomingCall(m.message);
            playIncomingTone();
          }
        }
        return next;
      });
    },
    [autoReadIncomingText, enqueueTTS, selfId]
  );

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/chat/send?request_id=${encodeURIComponent(requestId)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Load failed");
        if (cancelled) return;
        const initial: ChatMessage[] = data.messages ?? [];
        initial.forEach((m) => seenRef.current.add(m._id));
        setMessages(initial);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Load failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  // Reliable polling for incoming messages.
  useEffect(() => {
    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/chat/send?request_id=${encodeURIComponent(requestId)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Load failed");
        if (stopped) return;
        mergeIncomingMessages((data.messages ?? []) as ChatMessage[]);
        setError(null);
      } catch (e) {
        if (!stopped) {
          setError(e instanceof Error ? e.message : "Load failed");
        }
      }
    };

    const intervalId = window.setInterval(() => {
      void poll();
    }, 1500);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
    };
  }, [mergeIncomingMessages, requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (text: string) => {
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId, message: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Send failed");
      return;
    }
    const m: ChatMessage = data.message;
    if (!seenRef.current.has(m._id)) {
      seenRef.current.add(m._id);
      setMessages((prev) => [...prev, m]);
    }
  };

  const voiceOnlyInput = isCurrentUserRequester && requesterIsBlind;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {showHeader ? (
        <header className="card-surface sticky top-0 z-20 flex items-center justify-between gap-2 rounded-[30px] p-3">
          <div>
            <p className="text-xs uppercase text-black/50">{t("chat.title")}</p>
            <p className="text-base font-bold text-black">
              {partnerName ?? "—"}
            </p>
          </div>
          <PhoneCallButton requestId={requestId} />
        </header>
      ) : null}

      <div className="flex-1 overflow-y-auto rounded-[30px] bg-white/40 p-3">
        {error && (
          <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {!error && messages.length === 0 && (
          <p className="p-6 text-center text-sm text-black/60">
            {t("chat.empty")}
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            mine={m.sender_id === selfId}
            text={m.message}
            time={m.created_at}
            type={m.message_type}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput
        onSend={send}
        isBlind={voiceOnlyInput}
      />
    </div>
  );
}

async function speakViaElevenLabs(text: string): Promise<void> {
  try {
    console.log("[TTS] Trying ElevenLabs...");
    const res = await fetch("/api/voice/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.log("[TTS] ElevenLabs failed:", res.status, "- falling back to browser");
      await speakViaBrowser(text);
      return;
    }
    const blob = await res.blob();
    console.log("[TTS] Got blob:", blob.size, "bytes");
    if (!blob.size) {
      console.log("[TTS] Empty blob - falling back to browser");
      await speakViaBrowser(text);
      return;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return new Promise<void>((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        void speakViaBrowser(text).then(() => resolve());
      };
      audio.play().catch(() => {
        URL.revokeObjectURL(url);
        void speakViaBrowser(text).then(() => resolve());
      });
    });
  } catch {
    await speakViaBrowser(text);
  }
}

function speakViaBrowser(text: string): Promise<void> {
  if (typeof window === "undefined") {
    console.log("[TTS] No window object");
    return Promise.resolve();
  }
  if (!("speechSynthesis" in window)) {
    console.log("[TTS] speechSynthesis not available");
    return Promise.resolve();
  }

  try {
    console.log("[TTS] Using browser speechSynthesis");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "uk"; // Ukrainian

    return new Promise<void>((resolve) => {
      utterance.onstart = () => console.log("[TTS] Speech started");
      utterance.onend = () => {
        console.log("[TTS] Speech ended");
        resolve();
      };
      utterance.onerror = (evt) => {
        console.error("[TTS] Error:", evt.error);
        resolve();
      };
      window.speechSynthesis.speak(utterance);
      setTimeout(() => {
        console.log("[TTS] Timeout");
        resolve();
      }, 30000);
    });
  } catch (err) {
    console.error("[TTS] Exception:", err);
    return Promise.resolve();
  }
}

function notifyIncomingCall(message: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification("OpenArm", { body: message });
    return;
  }
  if (Notification.permission === "default") {
    void Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("OpenArm", { body: message });
      }
    });
  }
}

function playIncomingTone() {
  if (typeof window === "undefined") return;

  // Skip tone - AudioContext requires user gesture
  // Just use visual/haptic feedback instead
  safeVibrate([50, 30, 50]);
}
