import { CATEGORY_ICONS } from "@/lib/types";
import type { RequestCategory } from "@/lib/types";

export function CategoryIcon({ category }: { category: RequestCategory }) {
  return (
    <span aria-hidden="true" className="text-2xl">
      {CATEGORY_ICONS[category]}
    </span>
  );
}
