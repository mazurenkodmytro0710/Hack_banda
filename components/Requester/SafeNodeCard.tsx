import type { SafeNodeDTO } from "@/lib/types";

export function SafeNodeCard({ node }: { node: SafeNodeDTO }) {
  return (
    <article className="rounded-[28px] border border-accessible-blue/20 bg-accessible-blue/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accessible-blue">
            Safe Node
          </p>
          <h3 className="mt-2 text-xl font-black">{node.name}</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-accessible-blue">
          {node.category}
        </span>
      </div>
      <div className="mt-3 grid gap-1 text-sm text-black/70">
        {node.phone ? <p>Телефон: {node.phone}</p> : null}
        {node.hours ? <p>Години: {node.hours}</p> : null}
        <p>
          Доступність:{" "}
          {[
            node.accessibility.wheelchair_access ? "wheelchair" : null,
            node.accessibility.ramp ? "ramp" : null,
            node.accessibility.elevator ? "elevator" : null,
          ]
            .filter(Boolean)
            .join(", ") || "basic"}
        </p>
      </div>
    </article>
  );
}
