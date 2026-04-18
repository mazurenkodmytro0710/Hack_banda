"use client";

import Link from "next/link";

export function SubpageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <header className="card-surface sticky top-0 z-30 rounded-[30px] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={backHref}
            className="inline-flex min-h-[48px] items-center rounded-2xl bg-black px-4 py-2 text-sm font-bold text-white shadow-sm"
          >
            ← {backLabel}
          </Link>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-black">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-black/65">{subtitle}</p> : null}
        </div>
      </div>
    </header>
  );
}
