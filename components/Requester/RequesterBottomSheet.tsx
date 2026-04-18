"use client";

import Link from "next/link";
import { useState } from "react";
import { VoiceRequestButton } from "./VoiceRequestButton";
import { UrgencySelector } from "./UrgencySelector";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLocalePath } from "@/lib/i18n/useLocalePath";
import type { HelpRequestDTO, ParsedIntent, RequestCategory, RequestUrgency, SafeNodeDTO } from "@/lib/types";

/* ─── IDLE STATE: big red CALL FOR HELP button + optional type-form ─── */
function IdleSheet({
  coords,
  onCreated,
}: {
  coords: { lat: number; lng: number };
  onCreated: (r: HelpRequestDTO) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RequestCategory>("other");
  const [urgency, setUrgency] = useState<RequestUrgency>("medium");
  const [duration, setDuration] = useState("30");
  const [a11yNotes, setA11yNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  const applyIntent = (intent: ParsedIntent) => {
    setTitle(intent.title);
    setDescription(intent.description);
    setCategory(intent.category);
    setUrgency(intent.urgency);
    setDuration(String(intent.estimated_duration));
    setA11yNotes(intent.accessibility_notes ?? "");
    setExpanded(true);
    setFeedback(t("requester.autoFilled"));
  };

  const parseTranscript = async (transcript: string) => {
    setFeedback(t("requester.parsePending"));
    const res = await fetch("/api/voice/parse-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    const data = await res.json();
    if (!res.ok) {
      setDescription(transcript);
      setTitle(transcript.slice(0, 48));
      setExpanded(true);
      setFeedback(data.error ?? "Не вдалося розібрати. Відредагуй вручну.");
      return;
    }
    applyIntent(data.intent as ParsedIntent);
  };

  const submit = async () => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || description.trim().slice(0, 48) || "Потрібна допомога",
          description,
          category,
          urgency,
          estimated_duration: Number(duration || "30"),
          accessibility_notes: a11yNotes,
          lat: coords.lat,
          lng: coords.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFeedback(data.error ?? "Помилка"); return; }
      onCreated(data.request as HelpRequestDTO);
      // Reset
      setTitle(""); setDescription(""); setCategory("other"); setUrgency("medium");
      setDuration("30"); setA11yNotes(""); setExpanded(false);
      setFeedback(t("requester.requestPublished"));
      if (navigator.vibrate) navigator.vibrate(30);
    } finally {
      setBusy(false);
    }
  };

  const categories: { value: RequestCategory; label: string }[] = [
    { value: "shopping", label: "Покупки" },
    { value: "stairs", label: "Сходи" },
    { value: "transport", label: "Транспорт" },
    { value: "medical", label: "Медичне" },
    { value: "other", label: "Інше" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Big red call button */}
      <button
        type="button"
        onClick={() => { setExpanded(true); if (navigator.vibrate) navigator.vibrate(20); }}
        className="flex min-h-[72px] w-full items-center justify-center gap-3 rounded-[28px] bg-accessible-red text-white shadow-lg active:scale-[0.97]"
        aria-label={t("requester.button_help")}
      >
        <span className="text-3xl" aria-hidden>🆘</span>
        <span className="text-2xl font-black tracking-tight">{t("requester.button_help")}</span>
      </button>

      {/* Voice button always visible */}
      <VoiceRequestButton onTranscript={parseTranscript} disabled={busy} />

      {/* Expandable form */}
      {expanded && (
        <div className="flex flex-col gap-2">
          <input
            className="rounded-2xl border-2 border-black/10 bg-white/90 px-4 py-3 text-base outline-none"
            placeholder={t("requester.shortTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            rows={3}
            className="rounded-2xl border-2 border-black/10 bg-white/90 px-4 py-3 text-base outline-none"
            placeholder={t("requester.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RequestCategory)}
              className="rounded-2xl border-2 border-black/10 bg-white/90 px-4 py-3 text-base"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <input
              type="number" min={5} step={5} value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="rounded-2xl border-2 border-black/10 bg-white/90 px-4 py-3 text-base"
              placeholder={t("requester.duration")}
            />
          </div>
          <UrgencySelector value={urgency} onChange={setUrgency} />
          <input
            className="rounded-2xl border-2 border-black/10 bg-white/90 px-4 py-3 text-base"
            placeholder={t("requester.a11yNotes")}
            value={a11yNotes}
            onChange={(e) => setA11yNotes(e.target.value)}
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="touch-target rounded-[24px] bg-black py-3 text-xl font-black text-white disabled:opacity-50"
          >
            {busy ? `${t("common.publish")}...` : `📍 ${t("common.publish")}`}
          </button>
        </div>
      )}

      {feedback && <p className="text-center text-sm text-black/70">{feedback}</p>}
    </div>
  );
}

/* ─── PENDING STATE ─── */
function PendingSheet({ request }: { request: HelpRequestDTO }) {
  const { t } = useTranslation();
  const { href } = useLocalePath();
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-black border-t-transparent" aria-hidden />
      <p className="text-xl font-black">{t("requester.waiting")}</p>
      <div className="w-full rounded-2xl bg-white/70 p-3">
        <p className="text-sm font-bold text-black/60">{t("requester.pendingTitle")}</p>
        <p className="mt-1 text-base font-bold">{request.title}</p>
        <span className="mt-2 inline-block rounded-full bg-accessible-yellow px-3 py-1 text-xs font-bold uppercase text-black">
          {request.urgency}
        </span>
      </div>
      <Link href={href("/profile")} className="text-sm underline text-black/60">
        {t("common.history")}
      </Link>
    </div>
  );
}

/* ─── ACTIVE (in_progress) STATE ─── */
function ActiveSheet({ request }: { request: HelpRequestDTO }) {
  const { t } = useTranslation();
  const { href } = useLocalePath();
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-accessible-lime/20 p-3">
        <p className="text-sm font-bold text-accessible-lime">✅ Волонтер прийняв запит!</p>
        <p className="mt-1 text-lg font-black">{request.title}</p>
      </div>
      <Link
        href={href(`/chat/${request._id}`)}
        className="touch-target flex items-center justify-center gap-2 rounded-[24px] bg-black text-xl font-black text-white"
        onClick={() => navigator.vibrate?.(20)}
      >
        💬 {t("common.chat")}
      </Link>
      <Link href={href("/profile")} className="text-center text-sm underline text-black/60">
        {t("common.history")}
      </Link>
    </div>
  );
}

/* ─── SAFE NODES FALLBACK ─── */
function SafeNodesSheet({ nodes }: { nodes: SafeNodeDTO[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-black/60">📍 {t("requester.safeNodesNearby")}</p>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {nodes.slice(0, 3).map((node) => (
          <div key={node._id} className="rounded-2xl bg-white/70 p-3">
            <p className="font-bold">{node.name}</p>
            {node.phone && (
              <a href={`tel:${node.phone}`} className="text-sm text-accessible-blue underline">
                {node.phone}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN EXPORT ─── */
export function RequesterBottomSheet({
  coords,
  activeRequest,
  safeNodes,
  onCreated,
}: {
  coords: { lat: number; lng: number };
  activeRequest: HelpRequestDTO | null;
  safeNodes: SafeNodeDTO[];
  onCreated: (r: HelpRequestDTO) => void;
}) {
  return (
    <div className="overflow-y-auto px-4 pb-safe pt-3">
      {activeRequest?.status === "in_progress" ? (
        <ActiveSheet request={activeRequest} />
      ) : activeRequest?.status === "pending" ? (
        <PendingSheet request={activeRequest} />
      ) : (
        <>
          <IdleSheet coords={coords} onCreated={onCreated} />
          {safeNodes.length > 0 && <SafeNodesSheet nodes={safeNodes} />}
        </>
      )}
    </div>
  );
}
