"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { MobileLayout } from "@/components/Layout/MobileLayout";
import { TopSafeArea } from "@/components/Layout/TopSafeArea";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import type { Locale, PublicUser } from "@/lib/types";

function tFor(locale: Locale, key: string) {
  return DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;
}

export function LocaleHomeClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const text = await res.text();
        const data = text ? (JSON.parse(text) as { user?: PublicUser | null }) : {};
        if (!cancelled) {
          setUser(data.user ?? null);
        }
      } catch {
        if (!cancelled) setUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const shouldRedirect = window.sessionStorage.getItem("openarm_post_auth_redirect");
    if (shouldRedirect !== "1") return;

    window.sessionStorage.removeItem("openarm_post_auth_redirect");
    router.replace("/dashboard");
  }, [router, user]);

  const t = (key: string) => tFor(locale, key);

  return (
    <MobileLayout appShell className="app-screen justify-between">
      <TopSafeArea />
      <section className="animate-rise overflow-hidden rounded-[30px] border border-black/8 bg-[linear-gradient(160deg,#111111_0%,#050505_58%,#1b1b1b_100%)] px-5 py-4 text-white shadow-[0_22px_48px_rgba(17,17,17,0.16)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/65">
            {t("app.name")}
          </p>
          <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
            {t("landing.appBadge")}
          </span>
        </div>
        <h1 className="mt-5 max-w-[8.5ch] text-[1.95rem] font-black leading-[0.92] tracking-[-0.055em] sm:text-6xl">
          {t("landing.heroTitle")}
        </h1>
        <p className="mt-3 max-w-[21rem] text-[13px] leading-6 text-white/70 sm:text-base">
          {t("landing.heroBody")}
        </p>

        {user ? (
          <div className="mt-5 rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">
                  {user.role}
                </p>
                <p className="mt-2 text-xl font-black">{user.name}</p>
                <p className="mt-1 truncate text-sm text-white/70">{user.email}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/80">
                {t("landing.signedIn")}
              </span>
            </div>
            <Link href="/dashboard" className="mt-4 block">
              <AccessibleButton className="w-full rounded-[22px] bg-accessible-yellow text-black hover:brightness-95">
                {t("landing.openMap")}
              </AccessibleButton>
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">{t("landing.quickMap")}</span>
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">{t("landing.quickChat")}</span>
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">{t("landing.quickVoice")}</span>
          </div>
        )}
      </section>

      <section className="grid min-h-0 gap-3">
        <Link href={`/${locale}/auth/register?role=REQUESTER`} className="block">
          <div className="card-surface rounded-[24px] p-4 transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">{t("landing.requesterLabel")}</p>
              <span className="rounded-full border border-accessible-red/10 bg-accessible-red/8 px-3 py-1 text-xs font-bold text-accessible-red">
                {t("landing.badgeNeedHelp")}
              </span>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-accessible-red/10 text-[1.45rem]">
                🆘
              </div>
              <div>
                <h2 className="text-[1.28rem] font-black leading-none tracking-tight">{t("auth.needHelpRole")}</h2>
                <p className="mt-2 text-[14px] leading-6 text-black/68">{t("landing.requesterCard")}</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href={`/${locale}/auth/register?role=HELPER`} className="block">
          <div className="card-surface rounded-[24px] p-4 transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">{t("landing.helperLabel")}</p>
              <span className="rounded-full border border-[#0d7a3d]/10 bg-accessible-lime/12 px-3 py-1 text-xs font-bold text-[#0d7a3d]">
                {t("landing.badgeVolunteer")}
              </span>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-accessible-lime/16 text-[1.45rem]">
                🤝
              </div>
              <div>
                <h2 className="text-[1.28rem] font-black leading-none tracking-tight">{t("auth.wantHelpRole")}</h2>
                <p className="mt-2 text-[14px] leading-6 text-black/68">{t("landing.helperCard")}</p>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="grid gap-3 pb-2 pt-0.5">
        <Link href={`/${locale}/auth/login`}>
          <AccessibleButton className="w-full rounded-[20px] shadow-[0_14px_28px_rgba(17,17,17,0.14)]">
            {t("common.login")}
          </AccessibleButton>
        </Link>
        <Link href={`/${locale}/auth/register?role=REQUESTER`}>
          <AccessibleButton tone="secondary" className="w-full rounded-[20px] bg-white/96">
            {t("common.createAccount")}
          </AccessibleButton>
        </Link>
      </section>
    </MobileLayout>
  );
}
