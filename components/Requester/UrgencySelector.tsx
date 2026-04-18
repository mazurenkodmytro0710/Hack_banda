"use client";

import type { RequestUrgency } from "@/lib/types";

const options: { value: RequestUrgency; label: string }[] = [
  { value: "low", label: "Низька" },
  { value: "medium", label: "Середня" },
  { value: "high", label: "Висока" },
];

export function UrgencySelector({
  value,
  onChange,
}: {
  value: RequestUrgency;
  onChange: (value: RequestUrgency) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Рівень терміновості">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`touch-target rounded-2xl px-3 py-3 text-sm font-bold transition ${
              active ? "bg-black text-white" : "bg-white text-black"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
