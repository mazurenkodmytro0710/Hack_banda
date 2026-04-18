"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { safeVibrate } from "@/lib/vibration";

interface Props {
  requestId: string;
}

export function PhoneCallButton({ requestId }: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const call = async () => {
    if (busy) return;
    setBusy(true);
    try {
      safeVibrate(25);
      const res = await fetch("/api/phone/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Call failed");
        return;
      }
      if (data.phone) {
        window.location.href = `tel:${data.phone}`;
      } else {
        alert(t("chat.callUnavailable", { name: data.name }));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={call}
      disabled={busy}
      aria-label={t("chat.call_button")}
      className="touch-target rounded-2xl bg-lime-400 px-4 py-2 text-base font-bold text-black shadow-sm disabled:opacity-40"
    >
      📞 {t("chat.call_button")}
    </button>
  );
}
