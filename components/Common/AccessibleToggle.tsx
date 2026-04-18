"use client";

type Option<T extends string> = {
  label: string;
  value: T;
};

export function AccessibleToggle<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (next: T) => void;
  options: Option<T>[];
  label: string;
}) {
  return (
    <div className="rounded-[28px] bg-black/[0.04] p-2" role="group" aria-label={label}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`touch-target rounded-[24px] px-4 py-4 text-base font-black tracking-tight transition ${
                active
                  ? "bg-black text-white shadow-[0_14px_28px_rgba(17,17,17,0.18)]"
                  : "bg-white/88 text-black"
              }`}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
