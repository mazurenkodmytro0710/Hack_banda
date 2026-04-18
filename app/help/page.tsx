"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLocalePath } from "@/lib/i18n/useLocalePath";

export default function HelpPage() {
  const { t } = useTranslation();
  const { href } = useLocalePath();
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 p-6">
      <Link href={href("/")} className="text-sm underline">
        ← {t("common.back")}
      </Link>
      <h1 className="text-3xl font-black">{t("help.title")}</h1>
      <section className="card-surface rounded-[30px] p-5">
        <p className="text-base leading-relaxed text-black/80">
          {t("help.intro")}
        </p>
      </section>
    </main>
  );
}
