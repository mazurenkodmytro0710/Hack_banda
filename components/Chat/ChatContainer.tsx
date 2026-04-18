"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
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
}

export function ChatContainer({ requestId, selfId, partnerName }: Props) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load history once.
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

  // SSE subscription for incoming messages.
  useEffect(() => {
    const es = new EventSource(
      `/api/chat/stream?request_id=${encodeURIComponent(requestId)}`
    );
    es.onmessage = (evt) => {
      try {
        const batch: ChatMessage[] = JSON.parse(evt.data);
        if (!batch.length) return;
        setMessages((prev) => {
          const next = [...prev];
          for (const m of batch) {
            if (seenRef.current.has(m._id)) continue;
            seenRef.current.add(m._id);
            next.push(m);
            // Auto-read incoming text messages via TTS (silent-fallback server).
            if (m.sender_id !== selfId && m.message_type === "text") {
              navigator.vibrate?.(35);
              void speakViaElevenLabs(m.message);
            }
            if (m.sender_id !== selfId && m.message_type === "system") {
              navigator.vibrate?.([160, 80, 160]);
              notifyIncomingCall(m.message);
              playIncomingTone();
            }
          }
          return next;
        });
      } catch {
        /* ignore malformed frame */
      }
    };
    es.onerror = () => {
      // let browser retry
    };
    return () => es.close();
  }, [requestId, selfId]);

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

  return (
    <div className="flex h-[100dvh] flex-col gap-3 p-3">
      <header className="card-surface flex items-center justify-between gap-2 rounded-[30px] p-3">
        <div>
          <p className="text-xs uppercase text-black/50">{t("chat.title")}</p>
          <p className="text-base font-bold text-black">
            {partnerName ?? "—"}
          </p>
        </div>
        <PhoneCallButton requestId={requestId} />
      </header>

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

      <MessageInput onSend={send} />
    </div>
  );
}

async function speakViaElevenLabs(text: string) {
  try {
    const res = await fetch("/api/voice/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    if (!blob.size) return;
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play().catch(() => undefined);
  } catch {
    /* silent */
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
  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
    oscillator.onended = () => {
      void context.close();
    };
  } catch {
    /* silent */
  }
}
