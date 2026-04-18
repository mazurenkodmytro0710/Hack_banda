import type { ReactNode } from "react";

// The main page (page.tsx) is a full-screen layout that manages its own chrome.
// Sub-pages (active-help, my-completions, etc.) use SubPageLayout directly.
export default function HelperLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
