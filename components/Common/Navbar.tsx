"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
};

const requesterNav: NavItem[] = [
  { href: "/dashboard/requester", label: "Мапа" },
  { href: "/dashboard/requester/my-requests", label: "Мої запити" },
  { href: "/profile", label: "Профіль" },
];

const helperNav: NavItem[] = [
  { href: "/dashboard/helper", label: "Запити" },
  { href: "/dashboard/helper/active-help", label: "Активна допомога" },
  { href: "/dashboard/helper/my-completions", label: "Історія" },
  { href: "/profile", label: "Профіль" },
];

export function Navbar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = role === "REQUESTER" ? requesterNav : helperNav;

  return (
    <nav
      aria-label="Primary"
      className="card-surface sticky bottom-4 z-20 mt-auto rounded-[30px] p-2"
    >
      <div className={`grid gap-2 ${items.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`touch-target flex items-center justify-center rounded-2xl px-3 py-3 text-center text-sm font-bold transition ${
                active ? "bg-black text-white" : "bg-white/70 text-black"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
