"use client";
import { useRef, useState } from "react";
import AudioButton from "./AudioButton";
import { completeLesson } from "@/app/lesson/actions";
import { isCorrect, expectedText, type Exercise } from "@/lib/check";

type Example = { nl: string; note?: string; wrong?: string };
type Line = { speaker: string; voice: string; text: string };
type Expr = { nl: string; meaning_nl: string; register: string };
type Section =
  | { type: "text"; title: string; paragraphs: string[]; examples?: Example[] }
  | { type: "dialogue"; title: string; lines: Line[]; expressions?: Expr[] }
  | { type: "exercises"; items: Exercise[] };

export type LessonData = {
  id: string; title: string; kind: string;
  body: { intro: string; vocab: string[]; sections: Section[]; generated?: boolean };
};

type Result = { correct: boolean; given: string };

export default function LessonPlayer({ lesson }: { lesson: LessonData }) {
  const started = useRef(Date.now());
  const [showText, setShowText] = useState(true);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [saving, setSaving] = useState(false);

  const exercises: { key: string; ex: Exercise }[] = [];
  lesson.body.sections.forEach((s, si) => {
    if (s.type === "exercises") s.items.forEach((ex, i) => exercises.push({ key: `${si}-${i}`, ex }));
  });
  const done = exercises.every((e) => results[e.key]);
  const score = exercises.length ? exercises.filter((e) => results[e.key]?.correct).length / exercises.length : 1;

  async function finish() {
    setSaving(true);
    const wrong = exercises.filter((e) => results[e.key] && !results[e.key].correct).map((e) => ({
      tag: e.ex.tag,
      prompt: e.ex.kind === "dictation" ? "Dictee" : e.ex.prompt,
      given: results[e.key].given,
      expected: expectedText(e.ex),
      explanation: e.ex.explanation,
    }));
    await completeLesson({
      lessonId: lesson.id, score, wrong,
      seconds: Math.min(7200, Math.round((Date.now() - started.current) / 1000)),
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{lesson.title}</h1>
        <p className="text-sm text-neutral-500">{lesson.body.intro}</p>
        {lesson.body.generated && (
          <p className="text-xs mt-2 rounded border border-amber-500 p-2">Deze les is door AI gemaakt en nog niet door een docent gecontroleerd.</p>
        )}
      </div>

      {lesson.body.sections.map((s, si) => {
        if (s.type === "text")
          return (
            <section key={si} className="space-y-3">
              <h2 className="text-lg font-semibold">{s.title}</h2>
              {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              <ul className="space-y-2">
                {s.examples?.map((e, i) => (
                  <li key={i} className="rounded border border-neutral-200 dark:border-neutral-800 p-3 text-sm">
                    {e.wrong && <div className="text-red-600 line-through">{e.wrong}</div>}
                    <div className="font-medium flex items-center gap-2">{e.nl} <AudioButton text={e.nl} label="Luister" /></div>
                    {e.note && <div className="text-neutral-500">{e.note}</div>}
                  </li>
                ))}
              </ul>
            </section>
          );
        if (s.type === "dialogue")
          return (
            <section key={si} className="space-y-3">
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
                Toon ondertitels
              </label>
              <ul className="space-y-2">
                {s.lines.map((l, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <AudioButton text={l.text} voice={l.voice} label="Luister" showSpeed={i === 0} />
                    <span className="font-medium w-14">{l.speaker}</span>
                    <span>{showText ? l.text : "..."}</span>
                  </li>
                ))}
              </ul>
              {s.expressions && (
                <div className="rounded border border-neutral-200 dark:border-neutral-800 p-3 text-sm space-y-2">
                  <h3 className="font-semibold">Uitdrukkingen</h3>
                  {s.expressions.map((e, i) => (
                    <div key={i}>
                      <span className="font-medium">{e.nl}</span>: {e.meaning_nl}{" "}
                      <span className="text-neutral-500">({e.register})</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        return (
          <section key={si} className="space-y-4">
            <h2 className="text-lg font-semibold">Oefeningen</h2>
            {s.items.map((ex, i) => (
              <ExerciseCard key={i} ex={ex} result={results[`${si}-${i}`]}
                onAnswer={(given) =>
                  setResults((r) => ({ ...r, [`${si}-${i}`]: { given: String(given), correct: isCorrect(ex, given) } }))} />
            ))}
          </section>
        );
      })}

      <button disabled={!done || saving} onClick={finish}
        className="rounded bg-black text-white px-4 py-2 disabled:opacity-40 dark:bg-white dark:text-black">
        {saving ? "Opslaan..." : done ? `Les afronden (${Math.round(score * 100)}%)` : "Maak eerst alle oefeningen"}
      </button>
    </div>
  );
}

export function ExerciseCard({ ex, result, onAnswer }: { ex: Exercise; result?: Result; onAnswer: (g: string | number) => void }) {
  const [text, setText] = useState("");
  const box = "rounded border border-neutral-200 dark:border-neutral-800 p-4 space-y-2";
  return (
    <div className={box}>
      {ex.kind === "dictation" ? (
        <div className="flex items-center gap-3">
          <span>Luister en schrijf op wat je hoort.</span>
          <AudioButton text={ex.text} voice={ex.voice} label="Luister" showSpeed />
        </div>
      ) : (
        <p>{ex.prompt}</p>
      )}
      {ex.kind === "mcq" &&
        ex.options.map((o, i) => (
          <button key={i} disabled={!!result} onClick={() => onAnswer(i)}
            className={`block w-full text-left rounded border p-2 text-sm ${
              result && i === ex.answer ? "border-green-600" : result && result.given === String(i) ? "border-red-600" : "border-neutral-300 dark:border-neutral-700"}`}>
            {o}
          </button>
        ))}
      {ex.kind !== "mcq" && (
        <div className="flex gap-2">
          <input value={text} disabled={!!result} onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded border p-2 text-sm dark:bg-neutral-900" placeholder="Antwoord" />
          <button disabled={!!result || !text.trim()} onClick={() => onAnswer(text)}
            className="rounded border px-3 text-sm">Controleer</button>
        </div>
      )}
      {result && (
        <p className={`text-sm ${result.correct ? "text-green-700" : "text-red-600"}`}>
          {result.correct ? "Goed." : `Niet goed. Juist: ${expectedText(ex)}.`} {ex.explanation}
        </p>
      )}
    </div>
  );
}
