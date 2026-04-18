"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { MobileLayout } from "@/components/Layout/MobileLayout";
import { TopSafeArea } from "@/components/Layout/TopSafeArea";
import { DEFAULT_LOCALE } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/locale";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLocalePath } from "@/lib/i18n/useLocalePath";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { href } = useLocalePath();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      setError("");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to log in.");
        return;
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("openarm_post_auth_redirect", "1");
      }
      router.replace("/dashboard");
    });
  };

  return (
    <MobileLayout appShell className="justify-between overflow-hidden">
      <TopSafeArea />
      <Link
        href={localizePath(DEFAULT_LOCALE, "/")}
        className="inline-flex min-h-[48px] items-center rounded-full bg-black/6 px-4 text-sm font-bold text-black transition hover:bg-black/10"
      >
        ← {t("common.back")}
      </Link>
      <section className="rounded-[36px] bg-black px-5 py-6 text-white shadow-[0_24px_60px_rgba(17,17,17,0.22)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">OpenArm</p>
        <h1 className="mt-3 text-[2.15rem] font-black leading-none">{t("auth.loginTitle")}</h1>
        <p className="mt-3 max-w-[24rem] text-sm leading-6 text-white/78">{t("auth.loginSubtitle")}</p>
      </section>

      <section className="card-surface rounded-[32px] p-5">
        <div className="grid gap-3">
          <input
            type="email"
            placeholder={t("common.email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            placeholder={t("common.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
          <AccessibleButton onClick={submit} disabled={pending} className="w-full">
            {pending ? t("auth.loginLoading") : t("common.login")}
          </AccessibleButton>
        </div>
      </section>

      <p className="pb-2 text-center text-sm text-black/70">
        {t("auth.noAccount")}{" "}
        <Link href={href("/auth/register")} className="font-bold underline">
          {t("common.signup")}
        </Link>
      </p>
    </MobileLayout>
  );
}
