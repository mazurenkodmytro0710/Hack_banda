import type { HelpRequestDTO } from "@/lib/types";

export function ActiveHelpStatus({
  request,
}: {
  request: HelpRequestDTO & { counterparty_name?: string | null };
}) {
  return (
    <section className="card-surface rounded-[30px] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">
        Active Help
      </p>
      <h2 className="mt-2 text-2xl font-black">{request.title}</h2>
      <p className="mt-2 text-black/75">{request.description}</p>
      <div className="mt-3 grid gap-1 text-sm text-black/65">
        <p>Requester: {request.counterparty_name ?? request.requester_name}</p>
        <p>Статус: {request.status}</p>
        <p>Орієнтовно: {request.estimated_duration ?? 30} хв</p>
      </div>
    </section>
  );
}
