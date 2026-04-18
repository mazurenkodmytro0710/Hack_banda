import type { ReactNode } from "react";

// The main page (page.tsx) is a full-screen layout that manages its own chrome.
// Sub-pages (my-requests, etc.) use SubPageLayout directly.
export default function RequesterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
