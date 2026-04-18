"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/components/Common/LanguageSwitcher";
import { useLocalePath } from "@/lib/i18n/useLocalePath";

export default function LanguagePage() {
  const { t } = useTranslation();
  const { href } = useLocalePath();
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 p-6">
      <Link href={href("/settings")} className="text-sm underline">
        ← {t("common.back")}
      </Link>
      <h1 className="text-3xl font-black">{t("settings.select_language")}</h1>
      <section className="card-surface rounded-[30px] p-4">
        <LanguageSwitcher />
      </section>
    </main>
  );
}
