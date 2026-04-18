"use client";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { MobileLayout } from "@/components/Layout/MobileLayout";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MobileLayout className="items-center justify-center">
      <div className="card-surface w-full max-w-lg rounded-[32px] p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-black/55">500</p>
        <h1 className="mt-3 text-3xl font-black">Щось пішло не так</h1>
        <p className="mt-3 text-black/70">
          Демо не зупиняємо: можна швидко перезавантажити екран і продовжити.
        </p>
        <div className="mt-6">
          <AccessibleButton onClick={reset}>Спробувати ще раз</AccessibleButton>
        </div>
      </div>
    </MobileLayout>
  );
}
