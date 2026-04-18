"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import type { RequestUrgency } from "@/lib/types";
import { URGENCY_COLORS } from "@/lib/types";

export function UrgencySelector({
  value,
  onChange,
}: {
  value: RequestUrgency;
  onChange: (value: RequestUrgency) => void;
}) {
  const { t } = useTranslation();
  const options: { value: RequestUrgency; label: string }[] = [
    { value: "low", label: t("request.urgency.low") },
    { value: "medium", label: t("request.urgency.medium") },
    { value: "high", label: t("request.urgency.high") },
    { value: "critical", label: t("request.urgency.critical") || "🚨 Критично" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label={t("requester.urgencyLabel")}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              backgroundColor: active ? URGENCY_COLORS[option.value] : "white",
              color: active ? "white" : "black",
            }}
            className="touch-target rounded-2xl px-3 py-3 text-sm font-bold transition"
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
