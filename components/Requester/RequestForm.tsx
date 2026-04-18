"use client";

import { useState, useTransition } from "react";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { VoiceRequestButton } from "./VoiceRequestButton";
import { UrgencySelector } from "./UrgencySelector";
import type { HelpRequestDTO, ParsedIntent, RequestCategory, RequestUrgency } from "@/lib/types";

const categories: { value: RequestCategory; label: string }[] = [
  { value: "shopping", label: "Покупки" },
  { value: "stairs", label: "Сходи" },
  { value: "transport", label: "Транспорт" },
  { value: "medical", label: "Медичне" },
  { value: "other", label: "Інше" },
];

export function RequestForm({
  coords,
  onCreated,
}: {
  coords: { lat: number; lng: number };
  onCreated: (request: HelpRequestDTO) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RequestCategory>("other");
  const [urgency, setUrgency] = useState<RequestUrgency>("medium");
  const [estimatedDuration, setEstimatedDuration] = useState("30");
  const [accessibilityNotes, setAccessibilityNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, startTransition] = useTransition();

  const applyIntent = (intent: ParsedIntent) => {
    setTitle(intent.title);
    setDescription(intent.description);
    setCategory(intent.category);
    setUrgency(intent.urgency);
    setEstimatedDuration(String(intent.estimated_duration));
    setAccessibilityNotes(intent.accessibility_notes ?? "");
  };

  const parseTranscript = async (transcript: string) => {
    setFeedback("Розпізнаю намір через Gemini...");
    const response = await fetch("/api/voice/parse-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const data = await response.json();
    if (!response.ok) {
      setDescription(transcript);
      setTitle(transcript.slice(0, 48));
      setFeedback(data.error ?? "Не вдалося розібрати голосовий запит.");
      return;
    }

    applyIntent(data.intent as ParsedIntent);
    setFeedback("Готово: форма заповнена автоматично.");
  };

  const submit = () => {
    startTransition(async () => {
      setFeedback("");

      const response = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || description.trim().slice(0, 48) || "Потрібна допомога",
          description,
          category,
          urgency,
          estimated_duration: Number(estimatedDuration || "30"),
          accessibility_notes: accessibilityNotes,
          lat: coords.lat,
          lng: coords.lng,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.error ?? "Не вдалося створити запит.");
        return;
      }

      onCreated(data.request as HelpRequestDTO);
      setTitle("");
      setDescription("");
      setCategory("other");
      setUrgency("medium");
      setEstimatedDuration("30");
      setAccessibilityNotes("");
      setFeedback("Запит опубліковано на мапі.");
    });
  };

  return (
    <section className="card-surface rounded-[32px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">
            New Request
          </p>
          <h2 className="mt-2 text-2xl font-black">Створити запит</h2>
        </div>
        <div className="rounded-full bg-accessible-yellow px-3 py-2 text-sm font-bold text-black">
          GPS {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <VoiceRequestButton onTranscript={parseTranscript} disabled={pending} />
        <input
          placeholder="Короткий заголовок"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          rows={4}
          placeholder="Опишіть, яка допомога потрібна"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={category} onChange={(event) => setCategory(event.target.value as RequestCategory)}>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={5}
            step={5}
            value={estimatedDuration}
            onChange={(event) => setEstimatedDuration(event.target.value)}
            placeholder="Тривалість, хв"
          />
        </div>
        <UrgencySelector value={urgency} onChange={setUrgency} />
        <input
          placeholder="Нотатки про доступність або особливі потреби"
          value={accessibilityNotes}
          onChange={(event) => setAccessibilityNotes(event.target.value)}
        />
        {feedback ? <p className="text-sm text-black/70">{feedback}</p> : null}
        <AccessibleButton onClick={submit} disabled={pending} className="w-full">
          {pending ? "Надсилаю..." : "Опублікувати запит"}
        </AccessibleButton>
      </div>
    </section>
  );
}
