"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { KarmaDisplay } from "@/components/Common/KarmaDisplay";
import type { PublicUser } from "@/lib/types";

type KarmaLogItem = {
  _id: string;
  action: string;
  points_awarded: number;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();
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
        router.replace("/auth/login");
        return;
      }

      setUser(meData.user as PublicUser);
      setLogs((karmaData.logs ?? []) as KarmaLogItem[]);
    };

    void load().catch(() => setError("Не вдалося завантажити профіль."));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <>
      <section className="card-surface rounded-[32px] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">Profile</p>
        <h1 className="mt-2 text-3xl font-black">Мій профіль</h1>
      </section>

      {user ? <KarmaDisplay points={user.karma_points} level={user.level} /> : null}

      {user ? (
        <section className="card-surface rounded-[30px] p-5">
          <div className="grid gap-2 text-black/75">
            <p>
              <span className="font-bold text-black">Ім’я:</span> {user.name}
            </p>
            <p>
              <span className="font-bold text-black">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-bold text-black">Роль:</span> {user.role}
            </p>
            {user.phone ? (
              <p>
                <span className="font-bold text-black">Телефон:</span> {user.phone}
              </p>
            ) : null}
            {user.accessibility_notes ? (
              <p>
                <span className="font-bold text-black">Нотатки:</span> {user.accessibility_notes}
              </p>
            ) : null}
          </div>
          <div className="mt-4">
            <AccessibleButton tone="secondary" onClick={logout}>
              Вийти
            </AccessibleButton>
          </div>
        </section>
      ) : null}

      <section className="card-surface rounded-[30px] p-5">
        <h2 className="text-2xl font-black">Історія карми</h2>
        <div className="mt-4 grid gap-3">
          {logs.map((log) => (
            <div key={log._id} className="rounded-[22px] bg-white/80 p-4">
              <p className="font-bold">{log.action}</p>
              <p className="text-sm text-black/70">
                {log.points_awarded > 0 ? "+" : ""}
                {log.points_awarded} points
              </p>
              <p className="text-xs text-black/55">{new Date(log.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
    </>
  );
}
