"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { KarmaDisplay } from "@/components/Common/KarmaDisplay";
import { MobileLayout } from "@/components/Layout/MobileLayout";
import { SubpageHeader } from "@/components/Layout/SubpageHeader";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLocalePath } from "@/lib/i18n/useLocalePath";
import type { PublicUser } from "@/lib/types";

type KarmaLogItem = {
  _id: string;
  action: string;
  points_awarded: number;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { href } = useLocalePath();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [logs, setLogs] = useState<KarmaLogItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const [meRes, karmaRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/karma", { cache: "no-store" }),
      ]);

      const meData = await meRes.json();
      const karmaData = await karmaRes.json();

      if (!meRes.ok || !meData.user) {
        router.replace(href("/auth/login"));
        return;
      }

      setUser(meData.user as PublicUser);
      setLogs((karmaData.logs ?? []) as KarmaLogItem[]);
    };

    void load().catch(() => setError(t("profile.loadFailed")));
  }, [href, router, t]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(href("/"));
  };

  return (
    <MobileLayout>
      <SubpageHeader
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
        backHref={href("/dashboard")}
        backLabel={t("common.backToMap")}
      />

      {user ? (
        <section className="card-surface overflow-hidden rounded-[32px] p-0">
          <div className="bg-black px-5 py-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">
              {t("common.profile")}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accessible-yellow text-2xl font-black text-black">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-black">{user.name}</h2>
                <p className="truncate text-sm text-white/70">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            <div className="rounded-[24px] bg-white/85 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                {t("common.role")}
              </p>
              <p className="mt-2 text-xl font-black text-black">{user.role}</p>
            </div>
            <div className="rounded-[24px] bg-white/85 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                {t("common.language")}
              </p>
              <p className="mt-2 text-xl font-black text-black">
                {(user.language_preference ?? "en").toUpperCase()}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {user ? <KarmaDisplay points={user.karma_points} level={user.level} /> : null}

      {user ? (
        <section className="card-surface rounded-[30px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                {t("common.profile")}
              </p>
              <h2 className="mt-1 text-2xl font-black text-black">{t("common.settings")}</h2>
            </div>
            <AccessibleButton tone="secondary" className="min-w-[148px]" onClick={() => router.push(href("/settings"))}>
              {t("common.settings")}
            </AccessibleButton>
          </div>

          <div className="mt-4 grid gap-3 text-black/80">
            <div className="rounded-[24px] bg-white/78 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                {t("common.email")}
              </p>
              <p className="mt-1 text-lg font-bold text-black">{user.email}</p>
            </div>
            {user.phone ? (
              <div className="rounded-[24px] bg-white/78 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                  {t("common.phone")}
                </p>
                <p className="mt-1 text-lg font-bold text-black">{user.phone}</p>
              </div>
            ) : null}
            {user.accessibility_notes ? (
              <div className="rounded-[24px] bg-white/78 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                  {t("profile.accessibilityNotes")}
                </p>
                <p className="mt-1 text-base text-black">{user.accessibility_notes}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            <AccessibleButton tone="danger" className="w-full" onClick={logout}>
              {t("common.logout")}
            </AccessibleButton>
          </div>
        </section>
      ) : null}

      <section id="karma" className="card-surface rounded-[30px] p-5">
        <h2 className="text-2xl font-black">{t("profile.karmaHistory")}</h2>
        <div className="mt-4 grid gap-3">
          {logs.map((log) => (
            <div key={log._id} className="rounded-[22px] bg-white/80 p-4 shadow-sm">
              <p className="font-bold">{t(`karma.${log.action}`)}</p>
              <p className="text-sm text-black/70">
                {log.points_awarded > 0 ? "+" : ""}
                {log.points_awarded} {t("profile.pointsLabel")}
              </p>
              <p className="text-xs text-black/55">{new Date(log.created_at).toLocaleString()}</p>
            </div>
          ))}
          {logs.length === 0 ? <p className="text-sm text-black/60">{t("profile.noLogs")}</p> : null}
        </div>
      </section>

      {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
    </MobileLayout>
  );
}
