"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { VoiceRequestButton } from "./VoiceRequestButton";
import { UrgencySelector } from "./UrgencySelector";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLocalePath } from "@/lib/i18n/useLocalePath";
import { speakSafeNodesDescription } from "@/lib/speak-safe-nodes";
import { safeVibrate } from "@/lib/vibration";
import type {
  HelpRequestDTO,
  ParsedIntent,
  RequestCategory,
  RequestUrgency,
  SafeNodeDTO,
} from "@/lib/types";

async function readJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  if (!text || !contentType.includes("application/json")) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

type ComposerState = {
  title: string;
  description: string;
  category: RequestCategory;
  urgency: RequestUrgency;
  duration: string;
  a11yNotes: string;
};

const EMPTY_COMPOSER: ComposerState = {
  title: "",
  description: "",
  category: "other",
  urgency: "medium",
  duration: "30",
  a11yNotes: "",
};

const VALID_CATEGORIES: RequestCategory[] = ["shopping", "stairs", "transport", "medical", "other"];
const VALID_URGENCIES: RequestUrgency[] = ["low", "medium", "high", "critical"];

function ComposerModal({
  open,
  state,
  busy,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  state: ComposerState;
  busy: boolean;
  onClose: () => void;
  onChange: (patch: Partial<ComposerState>) => void;
  onSubmit: () => Promise<void>;
}) {
  const { t } = useTranslation();

  const categories: { value: RequestCategory; label: string }[] = useMemo(
    () => [
      { value: "shopping", label: t("request.category.shopping") },
      { value: "stairs", label: t("request.category.stairs") },
      { value: "transport", label: t("request.category.transport") },
      { value: "medical", label: t("request.category.medical") },
      { value: "other", label: t("request.category.other") },
    ],
    [t]
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm">
      <div className="flex h-full items-end justify-center p-3 sm:items-center">
        <div className="card-surface max-h-[92dvh] w-full max-w-md overflow-hidden rounded-[34px] shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
          <div className="flex items-start justify-between gap-4 border-b border-black/8 px-5 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-black/45">OpenArm</p>
              <h3 className="mt-2 text-2xl font-black text-black">{t("requester.modalTitle")}</h3>
              <p className="mt-2 text-sm text-black/60">{t("requester.modalBody")}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="touch-target inline-flex h-[52px] w-[52px] items-center justify-center rounded-[20px] bg-black text-2xl text-white"
              aria-label={t("requester.closeComposer")}
            >
              ×
            </button>
          </div>

        <div className="flex max-h-[calc(92dvh-110px)] flex-col gap-3 overflow-y-auto px-5 py-5">
            <input
              className="rounded-[22px] border-2 border-black/10 bg-white px-4 py-4 text-base outline-none transition focus:border-black/20"
              placeholder={t("requester.shortTitle")}
              value={state.title}
              onChange={(event) => onChange({ title: event.target.value })}
            />

            <textarea
              rows={4}
              className="rounded-[22px] border-2 border-black/10 bg-white px-4 py-4 text-base outline-none transition focus:border-black/20"
              placeholder={t("requester.problemLabel")}
              value={state.description}
              onChange={(event) => onChange({ description: event.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-black/60">{t("requester.categoryLabel")}</span>
                <select
                  value={state.category}
                  onChange={(event) => onChange({ category: event.target.value as RequestCategory })}
                  className="rounded-[22px] border-2 border-black/10 bg-white px-4 py-4 text-base"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-black/60">{t("requester.duration")}</span>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={state.duration}
                  onChange={(event) => onChange({ duration: event.target.value })}
                  className="rounded-[22px] border-2 border-black/10 bg-white px-4 py-4 text-base"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-black/60">{t("requester.urgencyLabel")}</span>
              <UrgencySelector value={state.urgency} onChange={(urgency) => onChange({ urgency })} />
            </div>

            <input
              className="rounded-[22px] border-2 border-black/10 bg-white px-4 py-4 text-base outline-none transition focus:border-black/20"
              placeholder={t("requester.a11yNotes")}
              value={state.a11yNotes}
              onChange={(event) => onChange({ a11yNotes: event.target.value })}
            />

            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="touch-target rounded-[24px] bg-black/8 px-4 py-4 text-base font-black text-black disabled:opacity-50"
              >
                {t("common.back")}
              </button>
              <button
                type="button"
                onClick={() => void onSubmit()}
                disabled={busy}
                className="touch-target rounded-[24px] bg-black px-4 py-4 text-xl font-black text-white disabled:opacity-50"
              >
                {busy ? t("common.working") : `📍 ${t("common.publish")}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── IDLE STATE: big red CALL FOR HELP button + voice request ─── */
function IdleSheet({
  coords,
  onCreated,
}: {
  coords: { lat: number; lng: number };
  onCreated: (r: HelpRequestDTO) => void;
}) {
  const { t } = useTranslation();
  const [composerOpen, setComposerOpen] = useState(false);
  const [composer, setComposer] = useState<ComposerState>(EMPTY_COMPOSER);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  const updateComposer = (patch: Partial<ComposerState>) => {
    setComposer((current) => ({ ...current, ...patch }));
  };

  const resetComposer = () => {
    setComposer(EMPTY_COMPOSER);
    setComposerOpen(false);
  };

  const submitRequest = async (payload?: Partial<ParsedIntent>) => {
    const nextTitle = String(payload?.title ?? composer.title ?? "").trim();
    const nextDescription = String(payload?.description ?? composer.description ?? "").trim();
    const nextCategory = VALID_CATEGORIES.includes((payload?.category ?? composer.category) as RequestCategory)
      ? ((payload?.category ?? composer.category) as RequestCategory)
      : "other";
    const nextUrgency = VALID_URGENCIES.includes((payload?.urgency ?? composer.urgency) as RequestUrgency)
      ? ((payload?.urgency ?? composer.urgency) as RequestUrgency)
      : "medium";
    const rawDuration = Number(payload?.estimated_duration ?? composer.duration ?? 30);
    const nextDuration = Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : 30;
    const nextA11yNotes = String(payload?.accessibility_notes ?? composer.a11yNotes ?? "").trim();

    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: nextTitle || nextDescription.slice(0, 48) || "Need help",
          description: nextDescription,
          category: nextCategory,
          urgency: nextUrgency,
          estimated_duration: nextDuration,
          accessibility_notes: nextA11yNotes,
          lat: coords.lat,
          lng: coords.lng,
        }),
      });
      const data = await readJson<{ error?: string; request?: HelpRequestDTO }>(response);
      if (!response.ok || !data?.request) {
        setFeedback(data?.error ?? t("requester.createFailed"));
        return false;
      }

      onCreated(data.request);
      resetComposer();
      setFeedback(t("requester.requestPublished"));
      safeVibrate(30);
      return true;
    } finally {
      setBusy(false);
    }
  };

  const parseTranscript = async (transcript: string) => {
    setFeedback(t("requester.parsePending"));
    const response = await fetch("/api/voice/parse-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    const data = await readJson<{ error?: string; intent?: ParsedIntent }>(response);

    if (!response.ok || !data?.intent) {
      setComposer({
        ...EMPTY_COMPOSER,
        title: transcript.slice(0, 48),
        description: transcript,
      });
      setComposerOpen(true);
      setFeedback(data?.error ?? t("requester.parseFailed"));
      return;
    }

    const intent = data.intent;
    setComposer({
      title: intent.title,
      description: intent.description,
      category: intent.category,
      urgency: intent.urgency,
      duration: String(intent.estimated_duration),
      a11yNotes: intent.accessibility_notes ?? "",
    });
    setFeedback(t("requester.submitting"));
    const created = await submitRequest(intent);
    if (created) {
      setFeedback(t("requester.voiceAutoSent"));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => {
          setComposerOpen(true);
          safeVibrate(20);
        }}
        className="flex min-h-[72px] w-full items-center justify-center gap-3 rounded-[28px] bg-accessible-red px-5 text-white shadow-lg active:scale-[0.97]"
        aria-label={t("requester.button_help")}
      >
        <span className="text-3xl" aria-hidden>
          🆘
        </span>
        <span className="text-2xl font-black tracking-tight">{t("requester.button_help")}</span>
      </button>

      <VoiceRequestButton onTranscript={parseTranscript} disabled={busy} />

      <ComposerModal
        open={composerOpen}
        state={composer}
        busy={busy}
        onClose={() => setComposerOpen(false)}
        onChange={updateComposer}
        onSubmit={async () => {
          await submitRequest();
        }}
      />

      {feedback ? <p className="text-center text-sm text-black/70">{feedback}</p> : null}
    </div>
  );
}

/* ─── PENDING STATE ─── */
function PendingSheet({
  request,
  safeNodes = [],
}: {
  request: HelpRequestDTO;
  safeNodes?: SafeNodeDTO[];
}) {
  const { t } = useTranslation();
  const hasNearbyServices = safeNodes.length > 0;

  // Speak safe nodes description when they're available (helps blind users)
  useEffect(() => {
    if (hasNearbyServices) {
      void speakSafeNodesDescription(safeNodes, "uk");
    }
  }, [safeNodes, hasNearbyServices]);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-black border-t-transparent"
        aria-hidden
      />
      <p className="text-xl font-black">{t("requester.waiting")}</p>
      <div className="w-full rounded-2xl bg-white/70 p-3">
        <p className="text-sm font-bold text-black/60">{t("requester.pendingTitle")}</p>
        <p className="mt-1 text-base font-bold">{request.title}</p>
        <span className="mt-2 inline-block rounded-full bg-accessible-yellow px-3 py-1 text-xs font-bold uppercase text-black">
          {request.urgency}
        </span>
      </div>
      {hasNearbyServices && (
        <div className="mt-3 w-full rounded-2xl bg-blue-50 p-3">
          <p className="text-xs font-bold text-blue-600">📍 {t("requester.safeNodesNearby")}</p>
          <div className="mt-2 flex flex-col gap-2">
            {safeNodes.slice(0, 3).map((node) => (
              <div key={node._id} className="rounded-lg bg-white p-2 text-left text-xs">
                <p className="font-bold text-blue-900">{node.name}</p>
                {node.phone && (
                  <p className="text-blue-700">{node.phone}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ACTIVE (in_progress) STATE ─── */
function ActiveSheet({
  request,
  onComplete,
  onCancel,
  busy,
  showChat,
}: {
  request: HelpRequestDTO;
  onComplete: () => Promise<void>;
  onCancel: () => Promise<void>;
  busy: boolean;
  showChat: boolean;
}) {
  const { t } = useTranslation();
  const { href } = useLocalePath();
  const requestLooksBlind =
    typeof request.accessibility_notes === "string" &&
    /(blind|сліп|незр|nevid)/i.test(request.accessibility_notes);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-accessible-lime/20 p-3">
        <p className="text-sm font-bold text-accessible-lime">✅ {t("requester.acceptedTitle")}</p>
        <p className="mt-1 text-lg font-black">{request.title}</p>
      </div>
      {showChat ? (
        <Link
          href={href(`/chat/${request._id}`)}
          className="touch-target flex items-center justify-center gap-2 rounded-[24px] bg-black text-xl font-black text-white"
          onClick={() => safeVibrate(20)}
        >
          💬 {t("common.chat")}
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => void onComplete()}
        disabled={busy}
        className="touch-target rounded-[24px] bg-accessible-lime px-4 py-3 text-lg font-black text-black disabled:opacity-50"
      >
        {busy ? t("common.working") : t("requester.markDone")}
      </button>
      <button
        type="button"
        onClick={() => void onCancel()}
        disabled={busy}
        className="touch-target rounded-[24px] bg-black/10 px-4 py-3 text-base font-black text-black disabled:opacity-50"
      >
        {t("requester.cancelRequest")}
      </button>
      <Link href={href("/dashboard/requester/my-requests")} className="text-center text-sm underline text-black/60">
        {t("common.history")}
      </Link>
    </div>
  );
}

function PendingSheetActions({
  onCancel,
  busy,
}: {
  onCancel: () => Promise<void>;
  busy: boolean;
}) {
  const { t } = useTranslation();
  const { href } = useLocalePath();

  return (
    <div className="mt-3 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => void onCancel()}
        disabled={busy}
        className="touch-target rounded-[24px] bg-black px-4 py-3 text-lg font-black text-white disabled:opacity-50"
      >
        {busy ? t("common.working") : t("requester.cancelRequest")}
      </button>
      <Link href={href("/dashboard/requester/my-requests")} className="text-center text-sm underline text-black/60">
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
            {node.phone ? (
              <a href={`tel:${node.phone}`} className="text-sm text-accessible-blue underline">
                {node.phone}
              </a>
            ) : null}
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
  onComplete,
  onCancel,
  isBlindRequester = false,
}: {
  coords: { lat: number; lng: number };
  activeRequest: HelpRequestDTO | null;
  safeNodes: SafeNodeDTO[];
  onCreated: (r: HelpRequestDTO) => void;
  onComplete: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  isBlindRequester?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  const wrap = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 pb-safe pt-3">
      {activeRequest?.status === "in_progress" ? (
        <ActiveSheet
          request={activeRequest}
          busy={busy}
          showChat={true}
          onComplete={() => wrap(() => onComplete(activeRequest._id))}
          onCancel={() => wrap(() => onCancel(activeRequest._id))}
        />
      ) : activeRequest?.status === "pending" ? (
        <>
          <PendingSheet request={activeRequest} safeNodes={safeNodes} />
          <PendingSheetActions busy={busy} onCancel={() => wrap(() => onCancel(activeRequest._id))} />
        </>
      ) : (
        <>
          <IdleSheet coords={coords} onCreated={onCreated} />
          {safeNodes.length > 0 ? <SafeNodesSheet nodes={safeNodes} /> : null}
        </>
      )}
    </div>
  );
}
