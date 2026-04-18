import Link from "next/link";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { MobileLayout } from "@/components/Layout/MobileLayout";

export default function NotFound() {
  return (
    <MobileLayout className="items-center justify-center">
      <div className="card-surface w-full max-w-lg rounded-[32px] p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-black/55">404</p>
        <h1 className="mt-3 text-3xl font-black">Сторінку не знайдено</h1>
        <p className="mt-3 text-black/70">
          Можливо, маршрут змінився або сторінка ще не готова для демо.
        </p>
        <div className="mt-6">
          <Link href="/">
            <AccessibleButton>На головну</AccessibleButton>
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
}
