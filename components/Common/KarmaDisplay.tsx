import type { UserLevel } from "@/lib/types";

export function KarmaDisplay({
  points,
  level,
}: {
  points: number;
  level: UserLevel;
}) {
  return (
    <div className="card-surface rounded-[28px] p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/60">Karma</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-4xl font-black">{points}</p>
          <p className="text-sm text-black/70">points earned for safe, local help</p>
        </div>
        <span className="rounded-full bg-accessible-yellow px-4 py-2 text-sm font-bold text-black">
          {level}
        </span>
      </div>
    </div>
  );
}
