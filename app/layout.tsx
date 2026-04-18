import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "OpenArm",
  description: "Mobile-first volunteer matching for people with disabilities.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
