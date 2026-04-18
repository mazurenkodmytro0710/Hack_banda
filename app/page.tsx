import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/dictionaries";

export default async function HomePage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
