"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { MobileLayout } from "@/components/Layout/MobileLayout";
import { TopSafeArea } from "@/components/Layout/TopSafeArea";

export default function LoginPage() {
  const router = useRouter();
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
        setError(data.error ?? "Не вдалося увійти.");
        return;
      }

      router.push("/dashboard");
    });
  };

  return (
    <MobileLayout className="justify-center">
      <TopSafeArea />
      <section className="rounded-[36px] bg-black px-6 py-7 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">OpenArm</p>
        <h1 className="mt-3 text-3xl font-black">Увійти</h1>
        <p className="mt-3 text-white/78">
          Увійди у свій потік допомоги. Роль визначиться автоматично.
        </p>
      </section>

      <section className="card-surface rounded-[32px] p-4">
        <div className="grid gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
          <AccessibleButton onClick={submit} disabled={pending} className="w-full">
            {pending ? "Входимо..." : "Увійти"}
          </AccessibleButton>
        </div>
      </section>

      <p className="text-center text-sm text-black/70">
        Ще нема акаунта?{" "}
        <Link href="/auth/register" className="font-bold underline">
          Реєстрація
        </Link>
      </p>
    </MobileLayout>
  );
}
