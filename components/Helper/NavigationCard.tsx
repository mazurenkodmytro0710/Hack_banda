export function NavigationCard({
  distanceMetres,
  etaMinutes,
}: {
  distanceMetres: number;
  etaMinutes: number;
}) {
  return (
    <div className="rounded-[28px] bg-black p-5 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">Route</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-4xl font-black">{Math.round(distanceMetres)} м</p>
          <p className="text-sm text-white/75">до людини, яка чекає на допомогу</p>
        </div>
        <span className="rounded-full bg-accessible-yellow px-4 py-2 text-sm font-bold text-black">
          ETA {etaMinutes} хв
        </span>
      </div>
    </div>
  );
}
