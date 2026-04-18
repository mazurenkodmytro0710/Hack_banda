import type { ReactNode } from "react";

export function MobileLayout({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-safe sm:px-6">
      <div className={`flex flex-1 flex-col gap-4 py-4 ${className}`}>{children}</div>
    </main>
  );
}
