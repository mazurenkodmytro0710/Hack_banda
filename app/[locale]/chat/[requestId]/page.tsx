import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { User } from "@/models/User";
import { ChatContainer } from "@/components/Chat/ChatContainer";
import { PhoneCallButton } from "@/components/Chat/PhoneCallButton";
import { isLocale } from "@/lib/i18n/locale";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LocalizedChatPage({
  params,
}: {
  params: { locale: string; requestId: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as Locale;

  const t = (key: string) => DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;
  const session = await getSession();
  if (!session) redirect(`/${locale}/auth/login`);

  await connectDB();
  const request = await HelpRequest.findById(params.requestId).lean();
  if (!request) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-6">
        <p className="text-lg font-bold">Request not found.</p>
        <Link href={`/${locale}`} className="mt-4 underline">
          ← {t("common.backToMap")}
        </Link>
      </main>
    );
  }

  const requesterId = request.requester_id.toString();
  const helperId = request.accepted_by?.toString();
  if (!helperId) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-6">
        <p className="text-lg font-bold">Chat becomes available after a helper accepts the request.</p>
        <Link href={`/${locale}`} className="mt-4 underline">
          ← {t("common.backToMap")}
        </Link>
      </main>
    );
  }

  if (session.sub !== requesterId && session.sub !== helperId) {
    redirect(`/${locale}`);
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

  const currentUserAccessibilityNotes =
    typeof currentUser?.accessibility_notes === "string"
      ? currentUser.accessibility_notes.toLowerCase()
      : "";
  const isCurrentUserBlind =
    Boolean(currentUser?.is_blind) ||
    /(blind|сліп|незр|nevid)/.test(currentUserAccessibilityNotes);

  const requesterAccessibilityNotes =
    typeof requester?.accessibility_notes === "string"
      ? requester.accessibility_notes.toLowerCase()
      : "";
  const requesterIsBlind = isCurrentUserRequester
    ? isCurrentUserBlind
    : Boolean(requester?.is_blind) || /(blind|сліп|незр|nevid)/.test(requesterAccessibilityNotes);

  return (
    <main className="mx-auto flex h-[100dvh] max-w-lg flex-col px-3 pb-3 pt-3">
      <div className="card-surface sticky top-3 z-30 mb-3 rounded-[30px] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/${locale}`}
              className="inline-flex min-h-[48px] items-center rounded-2xl bg-black px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              ← {t("common.backToMap")}
            </Link>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              {t("chat.title")}
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
