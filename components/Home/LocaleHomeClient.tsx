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
    <MobileLayout appShell className="justify-between overflow-hidden">
      <TopSafeArea />
      <section className="animate-rise overflow-hidden rounded-[40px] border border-black/8 bg-[linear-gradient(145deg,#111111_0%,#050505_60%,#171717_100%)] px-5 py-5 text-white shadow-[0_28px_72px_rgba(17,17,17,0.22)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/65">
            {t("app.name")}
          </p>
          <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">
            Mobile web app
          </span>
        </div>
        <h1 className="mt-4 max-w-[11ch] text-[2.95rem] font-black leading-[0.92] tracking-[-0.045em] sm:text-6xl">
          {t("landing.heroTitle")}
        </h1>
        <p className="mt-4 max-w-[24rem] text-[15px] leading-6 text-white/74 sm:text-base">
          {t("landing.heroBody")}
        </p>

        {user ? (
          <div className="mt-5 rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">
                  {user.role}
                </p>
                <p className="mt-2 text-2xl font-black">{user.name}</p>
                <p className="mt-1 text-sm text-white/70">{user.email}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/80">
                Signed in
              </span>
            </div>
            <Link href="/dashboard" className="mt-4 block">
              <AccessibleButton className="w-full bg-accessible-yellow text-black hover:brightness-95">
                Open live map
              </AccessibleButton>
            </Link>
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-2 text-sm text-white/65">
            <span className="rounded-full bg-white/10 px-3 py-1 font-bold">Map</span>
            <span className="rounded-full bg-white/10 px-3 py-1 font-bold">Chat</span>
            <span className="rounded-full bg-white/10 px-3 py-1 font-bold">Voice</span>
          </div>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Link href={`/${locale}/auth/register?role=REQUESTER`} className="block">
          <div className="card-surface rounded-[30px] p-4 transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">Requester</p>
              <span className="rounded-full bg-accessible-red/10 px-3 py-1 text-xs font-bold text-accessible-red">
                Need help
              </span>
            </div>
            <h2 className="mt-2 text-xl font-black">{t("auth.needHelpRole")}</h2>
            <p className="mt-2 text-sm text-black/70">{t("landing.requesterCard")}</p>
          </div>
        </Link>
        <Link href={`/${locale}/auth/register?role=HELPER`} className="block">
          <div className="card-surface rounded-[30px] p-4 transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">Helper</p>
              <span className="rounded-full bg-accessible-lime/15 px-3 py-1 text-xs font-bold text-[#0d7a3d]">
                Volunteer
              </span>
            </div>
            <h2 className="mt-2 text-xl font-black">{t("auth.wantHelpRole")}</h2>
            <p className="mt-2 text-sm text-black/70">{t("landing.helperCard")}</p>
          </div>
        </Link>
      </section>

      <section className="grid gap-3 pb-2">
        <Link href={`/${locale}/auth/register?role=REQUESTER`}>
          <AccessibleButton className="w-full">{t("common.createAccount")}</AccessibleButton>
        </Link>
        <Link href={`/${locale}/auth/login`}>
          <AccessibleButton tone="secondary" className="w-full">
            {t("common.login")}
          </AccessibleButton>
        </Link>
      </section>
    </MobileLayout>
  );
}
