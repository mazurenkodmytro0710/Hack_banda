"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { CategoryIcon } from "@/components/Common/CategoryIcon";
import { useLocalePath } from "@/lib/i18n/useLocalePath";
import { safeVibrate } from "@/lib/vibration";
import type { HelpRequestDTO } from "@/lib/types";

/* ─── IDLE: toggle + scrollable request list ─── */
function IdleSheet({
  isOnline,
  onToggle,
  requests,
  onAccept,
  busy,
}: {
  isOnline: boolean;
  onToggle: () => void;
  requests: HelpRequestDTO[];
  onAccept: (id: string) => Promise<void>;
  busy: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      {/* Ready-to-help toggle */}
      <button
        type="button"
        onClick={() => { onToggle(); safeVibrate(20); }}
        className={`touch-target flex w-full items-center justify-between rounded-[24px] px-5 py-4 text-xl font-black transition ${
          isOnline ? "bg-accessible-lime text-black" : "bg-black/10 text-black"
        }`}
        aria-label={t("helper.toggle_online")}
        aria-pressed={isOnline}
      >
        <span>{isOnline ? "🟢 " + t("helper.toggle_online") : "⚪ " + t("helper.toggle_online")}</span>
        <span className="text-base">{isOnline ? "ON" : "OFF"}</span>
      </button>

      {/* Nearby requests list */}
      {isOnline && (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {requests.length === 0 ? (
            <p className="p-3 text-center text-sm text-black/60">
              {t("helper.noRequests")}
            </p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="flex items-center gap-3 rounded-[20px] bg-white/80 p-3 shadow-sm">
                <CategoryIcon category={req.category} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold">{req.title}</p>
                  <p className="text-xs text-black/60">{req.requester_name} · {req.urgency}</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { void onAccept(req._id); safeVibrate(25); }}
                  className="touch-target rounded-2xl bg-black px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                  aria-label={`${t("helper.accept_help")} – ${req.title}`}
                >
                  {t("helper.accept_help")}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── ACTIVE (in_progress) ─── */
function ActiveSheet({
  request,
  distanceMetres,
  canComplete,
  onComplete,
  onRelease,
  busy,
}: {
  request: HelpRequestDTO;
  distanceMetres: number;
  canComplete: boolean;
  onComplete: () => Promise<void>;
  onRelease: () => Promise<void>;
  busy: boolean;
}) {
  const { t } = useTranslation();
  const { href } = useLocalePath();
  const eta = Math.ceil(distanceMetres / 70);

  return (
    <div className="flex flex-col gap-3">
      {/* Request info */}
      <div className="rounded-[20px] bg-white/80 p-3 shadow-sm">
        <p className="text-xs font-bold uppercase text-black/50">{t("helper.active")}</p>
        <p className="mt-1 text-lg font-black">{request.title}</p>
        <p className="mt-1 text-sm text-black/70">{request.description}</p>
      </div>

      {/* Distance + ETA */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-2xl bg-accessible-yellow p-3 text-center">
          <p className="text-xs font-bold text-black/60">{t("helper.distance").replace("{distance}", "")}</p>
          <p className="text-2xl font-black">{Math.round(distanceMetres)}м</p>
        </div>
        <div className="flex-1 rounded-2xl bg-white/80 p-3 text-center">
          <p className="text-xs font-bold text-black/60">{t("helper.etaLabel")}</p>
          <p className="text-2xl font-black">{eta} хв</p>
        </div>
      </div>

      {/* Chat button */}
      <Link
        href={href(`/chat/${request._id}`)}
        className="touch-target flex items-center justify-center gap-2 rounded-[24px] bg-black text-xl font-black text-white"
        onClick={() => safeVibrate(20)}
      >
        💬 {t("common.chat")}
      </Link>

      {/* Complete button */}
      <button
        type="button"
        onClick={() => { void onComplete(); safeVibrate(40); }}
        disabled={!canComplete || busy}
        className={`touch-target rounded-[24px] text-xl font-black transition ${
          canComplete
            ? "bg-accessible-lime text-black shadow-lg"
            : "bg-black/10 text-black/40 cursor-not-allowed"
        }`}
      >
        {canComplete
          ? busy ? "Working..." : "✅ " + t("helper.complete")
          : t("helper.moveCloser", { distance: Math.round(distanceMetres) })}
      </button>
      <button
        type="button"
        onClick={() => { void onRelease(); safeVibrate(25); }}
        disabled={busy}
        className="touch-target rounded-[24px] bg-black/10 px-4 py-3 text-base font-black text-black disabled:opacity-50"
      >
        Release request
      </button>
    </div>
  );
}

/* ─── MAIN EXPORT ─── */
export function HelperBottomSheet({
  isOnline,
  onToggleOnline,
  requests,
  activeRequest,
  distanceMetres,
  canComplete,
  onAccept,
  onComplete,
  onRelease,
  busy,
}: {
  isOnline: boolean;
  onToggleOnline: () => void;
  requests: HelpRequestDTO[];
  activeRequest: HelpRequestDTO | null;
  distanceMetres: number;
  canComplete: boolean;
  onAccept: (id: string) => Promise<void>;
  onComplete: () => Promise<void>;
  onRelease: () => Promise<void>;
  busy: boolean;
}) {
  return (
    <div className="overflow-y-auto px-4 pb-safe pt-3">
      {activeRequest ? (
        <ActiveSheet
          request={activeRequest}
          distanceMetres={distanceMetres}
          canComplete={canComplete}
          onComplete={onComplete}
          onRelease={onRelease}
          busy={busy}
        />
      ) : (
        <IdleSheet
          isOnline={isOnline}
          onToggle={onToggleOnline}
          requests={requests}
          onAccept={onAccept}
          busy={false}
        />
      )}
    </div>
  );
}
