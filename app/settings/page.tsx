"use client";

import { MobileLayout } from "@/components/Layout/MobileLayout";
import { SubpageHeader } from "@/components/Layout/SubpageHeader";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/components/Common/LanguageSwitcher";
import { useLocalePath } from "@/lib/i18n/useLocalePath";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { href } = useLocalePath();
  return (
    <MobileLayout>
      <SubpageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        backHref={href("/dashboard")}
        backLabel={t("common.backToMap")}
      />

      <section className="card-surface flex flex-col gap-3 rounded-[30px] p-4">
        <h2 className="text-lg font-black">{t("settings.language")}</h2>
        <LanguageSwitcher />
        <p className="text-sm text-black/60">{t("settings.instantApply")}</p>
      </section>

      <section className="card-surface rounded-[30px] p-5">
        <h2 className="text-lg font-black">{t("settings.about")}</h2>
        <p className="mt-2 text-sm text-black/70">
          {t("settings.aboutMeta")}
        </p>
        <p className="mt-3 text-sm text-black/60">
          {t("settings.aboutBody")}
        </p>
      </section>
    </MobileLayout>
  );
}
