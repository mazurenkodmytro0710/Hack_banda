"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { AccessibleToggle } from "@/components/Common/AccessibleToggle";
import { MobileLayout } from "@/components/Layout/MobileLayout";
import { TopSafeArea } from "@/components/Layout/TopSafeArea";
import { DEFAULT_LOCALE } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/locale";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLocalePath } from "@/lib/i18n/useLocalePath";
import type { Role } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { href } = useLocalePath();
  const [role, setRole] = useState<Role>("REQUESTER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [accessibilityNotes, setAccessibilityNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextRole = new URLSearchParams(window.location.search).get("role");
    if (nextRole === "REQUESTER" || nextRole === "HELPER") setRole(nextRole);
  }, []);

  const submit = () => {
    startTransition(async () => {
      setError("");
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name,
          email,
          password,
          phone,
          language_preference: locale,
          accessibility_notes: accessibilityNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to create account.");
        return;
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("openarm_post_auth_redirect", "1");
      }
      router.replace("/dashboard");
    });
  };

  return (
    <MobileLayout>
      <TopSafeArea />
      <Link
        href={localizePath(DEFAULT_LOCALE, "/")}
        className="inline-flex min-h-[48px] items-center rounded-full bg-black/6 px-4 text-sm font-bold text-black transition hover:bg-black/10"
      >
        ← {t("common.back")}
      </Link>
      <section className="rounded-[40px] bg-black px-6 py-8 text-white shadow-[0_24px_60px_rgba(17,17,17,0.22)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">OpenArm</p>
        <h1 className="mt-3 text-3xl font-black">{t("auth.registerTitle")}</h1>
        <p className="mt-3 text-white/78">{t("auth.registerSubtitle")}</p>
      </section>

      <section className="card-surface rounded-[34px] p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-black/45">
            {t("common.role")}
          </p>
          <h2 className="mt-2 text-2xl font-black text-black">
            {role === "REQUESTER" ? t("auth.needHelpRole") : t("auth.wantHelpRole")}
          </h2>
        </div>
        <AccessibleToggle
          value={role}
          onChange={setRole}
          label="Role selection"
          options={[
            { value: "REQUESTER", label: t("auth.needHelpRole") },
            { value: "HELPER", label: t("auth.wantHelpRole") },
          ]}
        />

        <div className="mt-4 grid gap-3">
          <input placeholder={t("common.name")} value={name} onChange={(event) => setName(event.target.value)} />
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
          <input
            placeholder={t("common.phone")}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          {role === "REQUESTER" ? (
            <textarea
              rows={3}
              placeholder={t("auth.accessibility")}
              value={accessibilityNotes}
              onChange={(event) => setAccessibilityNotes(event.target.value)}
            />
          ) : null}
          {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
          <AccessibleButton onClick={submit} disabled={pending} className="w-full">
            {pending ? t("auth.createLoading") : t("common.createAccount")}
          </AccessibleButton>
        </div>
      </section>

      <p className="text-center text-sm text-black/70">
        {t("auth.haveAccount")}{" "}
        <Link href={href("/auth/login")} className="font-bold underline">
          {t("common.login")}
        </Link>
      </p>
    </MobileLayout>
  );
}
