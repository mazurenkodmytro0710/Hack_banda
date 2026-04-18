import Link from "next/link";
import { CategoryIcon } from "@/components/Common/CategoryIcon";
import type { HelpRequestDTO } from "@/lib/types";

type RequestCardData = HelpRequestDTO & {
  counterparty_name?: string | null;
};

const statusLabel: Record<HelpRequestDTO["status"], string> = {
  pending: "Очікує",
  in_progress: "У процесі",
  completed: "Завершено",
  cancelled: "Скасовано",
};

export function RequestCard({ request }: { request: RequestCardData }) {
  return (
    <article className="card-surface rounded-[28px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CategoryIcon category={request.category} />
          <div>
            <h3 className="text-xl font-black">{request.title}</h3>
            <p className="text-sm text-black/65">{statusLabel[request.status]}</p>
          </div>
        </div>
        <span className="rounded-full bg-black px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
          {request.urgency}
        </span>
      </div>

      <p className="mt-3 text-black/78">{request.description}</p>
      <div className="mt-3 grid gap-2 text-sm text-black/65">
        <p>Тривалість: {request.estimated_duration ?? 30} хв</p>
        {request.counterparty_name ? <p>Контакт: {request.counterparty_name}</p> : null}
        {request.accessibility_notes ? <p>Доступність: {request.accessibility_notes}</p> : null}
      </div>
      {request.status === "in_progress" && request.accepted_by ? (
        <Link
          href={`/chat/${request._id}`}
          className="touch-target mt-4 inline-flex rounded-2xl bg-black px-4 py-3 text-base font-bold text-white"
        >
          💬 Chat
        </Link>
      ) : null}
    </article>
  );
}
