import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { MobileLayout } from "@/components/Layout/MobileLayout";
import { TopSafeArea } from "@/components/Layout/TopSafeArea";
import { AccessibleButton } from "@/components/Common/AccessibleButton";

export default async function HomePage() {
  const session = await getSession();
  if (session?.role === "REQUESTER") {
    redirect("/dashboard/requester");
  }
  if (session?.role === "HELPER") {
    redirect("/dashboard/helper");
  }

  return (
    <MobileLayout className="justify-between">
      <TopSafeArea />
      <section className="animate-rise overflow-hidden rounded-[36px] bg-black px-6 py-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">OpenArm</p>
        <h1 className="mt-3 text-4xl font-black leading-tight">
          One person needs help.
          <br />
          One person can help.
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/82">
          Мобільний сервіс швидкого локального матчингу для людей з інвалідністю та волонтерів у
          Кошицях.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card-surface rounded-[32px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">
            Requester
          </p>
          <h2 className="mt-2 text-2xl font-black">Я шукаю допомогу</h2>
          <p className="mt-2 text-black/70">
            Голосовий запит, карта з волонтерами, безпечні точки поруч і проста оцінка допомоги.
          </p>
        </div>
        <div className="card-surface rounded-[32px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">Helper</p>
          <h2 className="mt-2 text-2xl font-black">Я хочу допомагати</h2>
          <p className="mt-2 text-black/70">
            Живі запити, маршрут до людини, статус активної допомоги та система карми.
          </p>
        </div>
      </section>

      <section className="grid gap-3 pb-4">
        <Link href="/auth/register">
          <AccessibleButton className="w-full">Створити акаунт</AccessibleButton>
        </Link>
        <Link href="/auth/login">
          <AccessibleButton tone="secondary" className="w-full">
            Увійти
          </AccessibleButton>
        </Link>
      </section>
    </MobileLayout>
  );
}
