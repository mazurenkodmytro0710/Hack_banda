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
    <div className="card-surface rounded-[28px] p-2" role="group" aria-label={label}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`touch-target rounded-2xl px-4 py-4 text-base font-bold transition ${
                active ? "bg-black text-white" : "bg-white/70 text-black"
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
