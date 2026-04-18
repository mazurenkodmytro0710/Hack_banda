"use client";

import { useState, useTransition } from "react";
import { AccessibleButton } from "./AccessibleButton";

export function RatingModal({
  open,
  title = "Оцініть допомогу",
  onClose,
  onSubmit,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSubmit: (payload: { rating: 1 | -1; comment: string }) => Promise<void>;
}) {
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  const submit = (rating: 1 | -1) => {
    startTransition(async () => {
      await onSubmit({ rating, comment });
      setComment("");
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <div className="card-surface w-full max-w-md rounded-[32px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-1 text-sm text-black/65">
              Короткий відгук допомагає зібрати довіру в спільноті.
            </p>
          </div>
          <button type="button" className="touch-target rounded-2xl px-4 py-2" onClick={onClose}>
            Закрити
          </button>
        </div>

        <textarea
          rows={4}
          className="mt-4"
          placeholder="Що було добре або що треба покращити?"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <AccessibleButton
            tone="success"
            onClick={() => submit(1)}
            disabled={pending}
            ariaLabel="Позитивна оцінка"
          >
            👍 Добре
          </AccessibleButton>
          <AccessibleButton
            tone="danger"
            onClick={() => submit(-1)}
            disabled={pending}
            ariaLabel="Негативна оцінка"
          >
            👎 Погано
          </AccessibleButton>
        </div>
      </div>
    </div>
  );
}
