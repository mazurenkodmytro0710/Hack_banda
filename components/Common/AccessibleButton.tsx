"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  ariaLabel?: string;
  children: ReactNode;
  tone?: "primary" | "secondary" | "danger" | "success";
};

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  primary: "bg-black text-white shadow-[0_14px_30px_rgba(17,17,17,0.18)] hover:bg-neutral-800",
  secondary:
    "border-2 border-black/10 bg-white text-black shadow-[0_12px_26px_rgba(17,17,17,0.08)] hover:bg-neutral-100",
  danger: "bg-accessible-red text-white shadow-[0_14px_30px_rgba(230,0,0,0.22)] hover:brightness-95",
  success: "bg-accessible-lime text-black shadow-[0_14px_30px_rgba(0,255,0,0.18)] hover:brightness-95",
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
      className={`touch-target inline-flex min-h-[64px] items-center justify-center gap-2 rounded-[24px] px-5 py-3 text-lg font-black tracking-tight transition duration-200 active:scale-[0.98] ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
