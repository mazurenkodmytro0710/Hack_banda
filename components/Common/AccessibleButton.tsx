"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  ariaLabel?: string;
  children: ReactNode;
  tone?: "primary" | "secondary" | "danger" | "success";
};

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  primary: "bg-black text-white hover:bg-neutral-800",
  secondary: "bg-white text-black hover:bg-neutral-100 border-2 border-black/10",
  danger: "bg-accessible-red text-white hover:brightness-95",
  success: "bg-accessible-lime text-black hover:brightness-95",
};

export function AccessibleButton({
  ariaLabel,
  children,
  className = "",
  tone = "primary",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      aria-label={ariaLabel}
      type={type}
      className={`touch-target inline-flex min-h-[60px] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-lg font-bold transition duration-200 active:scale-[0.98] ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
