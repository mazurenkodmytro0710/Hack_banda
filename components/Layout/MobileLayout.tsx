import type { ReactNode } from "react";

export function MobileLayout({
  children,
  className = "",
  appShell = false,
}: {
  children: ReactNode;
  className?: string;
  appShell?: boolean;
}) {
  return (
    <main
      className={`mx-auto flex w-full max-w-5xl flex-col px-3 pb-safe sm:px-6 ${
        appShell
          ? "h-[100svh] max-h-[100svh] overflow-hidden md:h-[100dvh] md:max-h-[100dvh]"
          : "min-h-[100svh] md:min-h-screen"
      }`}
    >
      <div
        className={`flex min-h-0 flex-1 flex-col gap-4 py-3 sm:py-4 ${
          appShell ? "overflow-y-auto overscroll-y-contain" : ""
        } ${className}`}
      >
        {children}
      </div>
    </main>
  );
}
