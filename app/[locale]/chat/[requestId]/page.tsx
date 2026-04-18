import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { User } from "@/models/User";
import { ChatContainer } from "@/components/Chat/ChatContainer";
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
  const partner = await User.findById(partnerId).select("_id name").lean();

  return (
    <main className="mx-auto max-w-lg px-3 pb-3 pt-3">
      <div className="card-surface sticky top-3 z-30 rounded-[30px] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
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
        </div>
      </div>
      <ChatContainer requestId={params.requestId} selfId={session.sub} partnerName={partner?.name} />
    </main>
  );
}
