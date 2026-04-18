"use client";

import { AccessibleButton } from "@/components/Common/AccessibleButton";

export function CompleteButton({
  enabled,
  onComplete,
  distanceMetres,
}: {
  enabled: boolean;
  onComplete: () => Promise<void> | void;
  distanceMetres: number;
}) {
  return (
    <AccessibleButton
      className="w-full"
      tone={enabled ? "success" : "secondary"}
      onClick={enabled ? onComplete : undefined}
      disabled={!enabled}
      ariaLabel="Позначити допомогу завершеною"
    >
      {enabled ? "Позначити як завершено" : `Підійди ближче: ${Math.round(distanceMetres)} м`}
    </AccessibleButton>
  );
}
