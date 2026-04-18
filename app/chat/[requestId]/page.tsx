import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { User } from "@/models/User";
import { ChatContainer } from "@/components/Chat/ChatContainer";

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
  const partner = await User.findById(partnerId).select("_id name").lean();

  return (
    <main className="mx-auto max-w-lg">
      <ChatContainer
        requestId={params.requestId}
        selfId={session.sub}
        partnerName={partner?.name}
      />
    </main>
  );
}
