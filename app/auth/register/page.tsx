"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { AccessibleToggle } from "@/components/Common/AccessibleToggle";
import { MobileLayout } from "@/components/Layout/MobileLayout";
import { TopSafeArea } from "@/components/Layout/TopSafeArea";
import type { Role } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("REQUESTER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [accessibilityNotes, setAccessibilityNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

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
          accessibility_notes: accessibilityNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Не вдалося створити акаунт.");
        return;
      }

      router.push("/dashboard");
    });
  };

  return (
    <MobileLayout>
      <TopSafeArea />
      <section className="rounded-[36px] bg-black px-6 py-7 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">OpenArm</p>
        <h1 className="mt-3 text-3xl font-black">Створити акаунт</h1>
        <p className="mt-3 text-white/78">
          Обери роль і зайди у свій окремий сценарій: requester або helper.
        </p>
      </section>

      <section className="card-surface rounded-[32px] p-4">
        <AccessibleToggle
          value={role}
          onChange={setRole}
          label="Role selection"
          options={[
            { value: "REQUESTER", label: "Я шукаю допомогу" },
            { value: "HELPER", label: "Я хочу допомагати" },
          ]}
        />

        <div className="mt-4 grid gap-3">
          <input placeholder="Ім'я" value={name} onChange={(event) => setName(event.target.value)} />
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
          <input
            placeholder="Телефон"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          {role === "REQUESTER" ? (
            <textarea
              rows={3}
              placeholder="Особливі нотатки про доступність"
              value={accessibilityNotes}
              onChange={(event) => setAccessibilityNotes(event.target.value)}
            />
          ) : null}
          {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
          <AccessibleButton onClick={submit} disabled={pending} className="w-full">
            {pending ? "Створюю..." : "Створити акаунт"}
          </AccessibleButton>
        </div>
      </section>

      <p className="text-center text-sm text-black/70">
        Уже маєш акаунт?{" "}
        <Link href="/auth/login" className="font-bold underline">
          Увійти
        </Link>
      </p>
    </MobileLayout>
  );
}
