import type { HelpRequestDTO } from "@/lib/types";
import { RequestAcceptCard } from "./RequestAcceptCard";

export function RequestsList({
  requests,
  onAccept,
  busy,
}: {
  requests: HelpRequestDTO[];
  onAccept: (requestId: string) => Promise<void> | void;
  busy: boolean;
}) {
  if (requests.length === 0) {
    return (
      <div className="card-surface rounded-[28px] p-5 text-black/70">
        Поруч поки немає нових запитів. Залишайся онлайн, і ми одразу покажемо наступний.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {requests.map((request) => (
        <RequestAcceptCard key={request._id} request={request} onAccept={onAccept} busy={busy} />
      ))}
    </div>
  );
}
