import type { ReactNode } from "react";
import Link from "next/link";

export function SubPageLayout({
  children,
  backHref,
  backLabel = "← Назад",
}: {
  children: ReactNode;
  backHref: string;
  backLabel?: string;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-8 pt-4">
      <Link
        href={backHref}
        className="touch-target mb-4 inline-flex items-center rounded-2xl bg-white/80 px-4 py-3 text-base font-bold text-black shadow-sm backdrop-blur"
      >
        {backLabel}
      </Link>
      <div className="flex flex-1 flex-col gap-4">{children}</div>
    </main>
  );
}
