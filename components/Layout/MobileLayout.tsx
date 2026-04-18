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
      className={`mx-auto flex w-full max-w-5xl flex-col px-4 pb-safe sm:px-6 ${
        appShell ? "h-[100dvh] max-h-[100dvh] overflow-hidden" : "min-h-screen"
      }`}
    >
      <div className={`flex min-h-0 flex-1 flex-col gap-4 py-4 ${className}`}>{children}</div>
    </main>
  );
}
