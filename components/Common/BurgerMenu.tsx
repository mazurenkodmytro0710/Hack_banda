"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocalePath } from "@/lib/i18n/useLocalePath";

export function BurgerMenu() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { href } = useLocalePath();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(href("/auth/login"));
    router.refresh();
  };

  return (
    <div ref={rootRef} className="relative z-[80]">
      <button
        type="button"
        aria-label={t("common.menu")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative z-[60] inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-black/10 bg-white/94 text-black shadow-[0_14px_32px_rgba(17,17,17,0.16)] backdrop-blur transition hover:scale-[1.01]"
      >
        <span className="flex flex-col gap-[5px]" aria-hidden>
          <span className="block h-[3px] w-6 rounded-full bg-black" />
          <span className="block h-[3px] w-6 rounded-full bg-black" />
          <span className="block h-[3px] w-4 rounded-full bg-black" />
        </span>
      </button>

      {mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("common.menu")}
              className={`fixed inset-0 z-[9999] transition-opacity duration-200 ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <button
                type="button"
                aria-label={t("common.close")}
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
              />
              <aside
                className={`absolute left-4 right-4 top-[max(1rem,env(safe-area-inset-top))] max-w-[320px] rounded-[30px] border border-black/10 bg-white/98 p-4 text-black shadow-[0_28px_80px_rgba(17,17,17,0.22)] transition-all duration-200 ${
                  open ? "translate-y-0 scale-100" : "-translate-y-2 scale-95"
                }`}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-black/40">OpenArm</p>
                    <p className="mt-2 text-xl font-black leading-none">{t("common.menu")}</p>
                    <p className="mt-1 text-sm leading-5 text-black/55">
                      {t("common.quickLinks")}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={t("common.close")}
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-black/6 text-xl font-bold text-black transition hover:bg-black/10"
                  >
                    ✕
                  </button>
                </div>

                <nav className="mt-4 flex flex-col gap-2">
                  <MenuLink href={href("/profile")} label={t("common.profile")} onClick={() => setOpen(false)} />
                  <MenuLink href={href("/profile#karma")} label={t("common.karma")} onClick={() => setOpen(false)} />
                  <MenuLink href={href("/settings")} label={t("common.settings")} onClick={() => setOpen(false)} />
                  <MenuLink href={href("/settings/language")} label={t("common.language")} onClick={() => setOpen(false)} />
                  <MenuLink href={href("/help")} label={t("common.helpFaq")} onClick={() => setOpen(false)} />
                </nav>

                <div className="mt-3 rounded-[20px] border border-black/8 bg-black/[0.03] p-3">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
                    {t("common.language")}
                  </p>
                  <LanguageSwitcher compact />
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="mt-3 w-full rounded-[20px] bg-black px-4 py-3 text-base font-black text-white shadow-[0_12px_28px_rgba(17,17,17,0.18)] transition hover:brightness-95"
                >
                  {t("common.logout")}
                </button>

                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-black/28">{locale.toUpperCase()}</p>
              </aside>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

function MenuLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-[18px] border border-black/8 bg-white px-4 py-3 text-base font-black text-black shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition hover:bg-accessible-yellow hover:text-black"
    >
      {label}
    </Link>
  );
}
