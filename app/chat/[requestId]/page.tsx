import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { User } from "@/models/User";
import { ChatContainer } from "@/components/Chat/ChatContainer";
import { PhoneCallButton } from "@/components/Chat/PhoneCallButton";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: { requestId: string };
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  await connectDB();
  const r = await HelpRequest.findById(params.requestId).lean();
  if (!r) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-6">
        <p className="text-lg font-bold">Request not found.</p>
        <Link href="/" className="mt-4 underline">
          ← Home
        </Link>
      </main>
    );
  }

  const requesterId = r.requester_id.toString();
  const helperId = r.accepted_by?.toString();
  if (!helperId) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-6">
        <p className="text-lg font-bold">Чат буде доступний після прийняття запиту волонтером.</p>
        <Link href="/" className="mt-4 underline">
          ← Назад
        </Link>
      </main>
    );
  }
  if (session.sub !== requesterId && session.sub !== helperId) {
    redirect("/");
  }

  const partnerId = session.sub === requesterId ? helperId : requesterId;
  const isCurrentUserRequester = session.sub === requesterId;

  const [partner, currentUser, requester] = await Promise.all([
    User.findById(partnerId).select("_id name is_blind accessibility_notes").lean(),
    User.findById(session.sub).select("_id is_blind accessibility_notes").lean(),
    isCurrentUserRequester
      ? null
      : User.findById(requesterId).select("_id name is_blind accessibility_notes").lean(),
  ]);

  const userToReadFor = isCurrentUserRequester ? currentUser : requester;

  const accessibilityNotes =
    typeof userToReadFor?.accessibility_notes === "string"
      ? userToReadFor.accessibility_notes.toLowerCase()
      : "";
  const shouldAutoRead =
    Boolean(userToReadFor?.is_blind) ||
    /(blind|сліп|незр|nevid)/.test(accessibilityNotes);

  // Determine if the current user is blind for UI adaptation
  const currentUserAccessibilityNotes =
    typeof currentUser?.accessibility_notes === "string"
      ? currentUser.accessibility_notes.toLowerCase()
      : "";
  const isCurrentUserBlind =
    Boolean(currentUser?.is_blind) ||
    /(blind|сліп|незр|nevid)/.test(currentUserAccessibilityNotes);

  // Determine if requester is blind (for sighted helpers to know)
  const requesterAccessibilityNotes =
    typeof requester?.accessibility_notes === "string"
      ? requester.accessibility_notes.toLowerCase()
      : "";
  const requesterIsBlind = isCurrentUserRequester
    ? isCurrentUserBlind // if current user is requester, use their blindness status
    : (Boolean(requester?.is_blind) || /(blind|сліп|незр|nevid)/.test(requesterAccessibilityNotes)); // if helper, check requester data

  if (isCurrentUserRequester && requesterIsBlind) {
    redirect("/dashboard/requester");
  }

  return (
    <main className="mx-auto flex h-[100dvh] max-w-lg flex-col px-3 pb-3 pt-3">
      <div className="card-surface sticky top-3 z-30 mb-3 rounded-[30px] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex min-h-[48px] items-center rounded-2xl bg-black px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              ← Home
            </Link>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              Chat
            </p>
            <p className="truncate text-xl font-black text-black">{partner?.name ?? "OpenArm"}</p>
          </div>
          <PhoneCallButton requestId={params.requestId} />
        </div>
      </div>
      <ChatContainer
        requestId={params.requestId}
        selfId={session.sub}
        partnerName={partner?.name}
        autoReadIncomingText={shouldAutoRead}
        showHeader={false}
        isCurrentUserRequester={isCurrentUserRequester}
        requesterIsBlind={requesterIsBlind}
      />
    </main>
  );
}
