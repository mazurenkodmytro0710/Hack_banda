import type { ReactNode } from "react";
import { Navbar } from "@/components/Common/Navbar";
import { MobileLayout } from "@/components/Layout/MobileLayout";
import { TopSafeArea } from "@/components/Layout/TopSafeArea";

export default function HelperLayout({ children }: { children: ReactNode }) {
  return (
    <MobileLayout>
      <TopSafeArea />
      <div className="flex flex-1 flex-col gap-4">{children}</div>
      <Navbar role="HELPER" />
    </MobileLayout>
  );
}
