"use client";
import { useRef, useState } from "react";
import { ExerciseCard } from "./LessonPlayer";
import AudioButton from "./AudioButton";
import { completeReading } from "@/app/reading/actions";
import { isCorrect, expectedText, type Exercise } from "@/lib/check";

export type TextData = {
  id: string; title: string; genre: string; content: string;
  questions: { glossary?: { nl: string; meaning_nl: string }[]; questions: Exercise[] };
};

export default function ReadingPlayer({ text }: { text: TextData }) {
  const t0 = useRef(Date.now());
  const qs = text.questions.questions ?? [];
  const [res, setRes] = useState<Record<number, { given: string; correct: boolean }>>({});
  const [busy, setBusy] = useState(false);
  const done = qs.every((_, i) => res[i]);

  async function finish() {
    setBusy(true);
    await completeReading({
      textId: text.id,
      seconds: (Date.now() - t0.current) / 1000,
      wrong: qs.flatMap((q, i) =>
        res[i] && !res[i].correct
          ? [{ prompt: q.kind === "dictation" ? "Dictee" : q.prompt, given: res[i].given, expected: expectedText(q), explanation: q.explanation }]
          : []),
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="text-xs text-neutral-500">{text.genre}</div>
        <h1 className="text-2xl font-semibold">{text.title}</h1>
      </div>
      <article className="whitespace-pre-line leading-relaxed">{text.content}</article>
      <AudioButton text={text.content.replace(/\n+/g, " ").slice(0, 1000)} label="Lees voor" showSpeed />
      {text.questions.glossary?.length ? (
        <div className="rounded border border-neutral-200 dark:border-neutral-800 p-3 text-sm space-y-1">
          <h2 className="font-semibold">Belangrijke woorden</h2>
          {text.questions.glossary.map((g) => (
            <div key={g.nl}><span className="font-medium">{g.nl}</span>: {g.meaning_nl}</div>
          ))}
        </div>
      ) : null}
      <h2 className="text-lg font-semibold">Vragen</h2>
      {qs.map((q, i) => (
        <ExerciseCard key={i} ex={q} result={res[i]}
          onAnswer={(g) => setRes((r) => ({ ...r, [i]: { given: String(g), correct: isCorrect(q, g) } }))} />
      ))}
      <button disabled={!done || busy} onClick={finish}
        className="rounded bg-black text-white px-4 py-2 disabled:opacity-40 dark:bg-white dark:text-black">
        {done ? "Afronden" : "Beantwoord alle vragen"}
      </button>
    </div>
  );
}
