"use client";

interface Props {
  mine: boolean;
  text: string;
  time: string;
  type?: "text" | "voice" | "system";
}

export function MessageBubble({ mine, text, time, type = "text" }: Props) {
  if (type === "system") {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-black/10 px-3 py-1 text-xs text-black/70">
          {text}
        </span>
      </div>
    );
  }
  return (
    <div className={`my-1 flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-3xl px-4 py-3 text-base shadow-sm ${
          mine ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <p className="whitespace-pre-wrap break-words leading-snug">{text}</p>
        <p
          className={`mt-1 text-[10px] ${
            mine ? "text-white/60" : "text-black/50"
          }`}
        >
          {new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
