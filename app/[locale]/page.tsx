import { notFound } from "next/navigation";
import { LocaleHomeClient } from "@/components/Home/LocaleHomeClient";
import type { Locale } from "@/lib/types";
import { isLocale } from "@/lib/i18n/locale";

export default async function LocaleHomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  return <LocaleHomeClient locale={params.locale as Locale} />;
}
