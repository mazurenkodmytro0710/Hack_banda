import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { CategoryIcon } from "@/components/Common/CategoryIcon";
import type { HelpRequestDTO } from "@/lib/types";

export function RequestAcceptCard({
  request,
  onAccept,
  busy,
}: {
  request: HelpRequestDTO;
  onAccept: (requestId: string) => Promise<void> | void;
  busy: boolean;
}) {
  return (
    <article className="card-surface rounded-[28px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CategoryIcon category={request.category} />
          <div>
            <h3 className="text-xl font-black">{request.title}</h3>
            <p className="text-sm text-black/65">Терміновість: {request.urgency}</p>
          </div>
        </div>
        <span className="rounded-full bg-accessible-red px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
          {request.status}
        </span>
      </div>

      <p className="mt-3 text-black/78">{request.description}</p>
      <div className="mt-3 text-sm text-black/65">
        <p>Requester: {request.requester_name}</p>
        <p>Estimated: {request.estimated_duration ?? 30} хв</p>
      </div>

      <div className="mt-4">
        <AccessibleButton
          className="w-full"
          onClick={() => onAccept(request._id)}
          disabled={busy}
          ariaLabel={`Прийняти запит ${request.title}`}
        >
          {busy ? "Уже в роботі" : "Допомогти"}
        </AccessibleButton>
      </div>
    </article>
  );
}
