"use client";
import { useState } from "react";
import AudioButton from "./AudioButton";
import { submitAssessment } from "@/app/assessments/actions";

export type Item =
  | { kind: "mcq"; prompt: string; options: string[] }
  | { kind: "gap"; prompt: string }
  | { kind: "dictation"; text: string; voice: string };

type Result = {
  skills: Record<string, { correct: number; total: number }>;
  levels: Record<string, { correct: number; total: number }>;
  estimate: string; confidence: string;
};

export default function AssessmentRunner({ id, items }: { id: string; items: Item[] }) {
  const [answers, setAnswers] = useState<(string | number | null)[]>(items.map(() => null));
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (i: number, v: string | number) => setAnswers((a) => a.map((x, j) => (j === i ? v : x)));
  const answered = answers.filter((a) => a !== null && a !== "").length;

  async function submit() {
    setBusy(true); setErr("");
    try { setRes(await submitAssessment(id, answers)); } catch { setErr("Opslaan mislukt. Probeer het opnieuw."); }
    setBusy(false);
  }

  if (res)
    return (
      <div className="space-y-4 max-w-xl">
        <h2 className="text-xl font-semibold">Geschat niveau: {res.estimate}</h2>
        <p className="text-sm text-neutral-500">
          Betrouwbaarheid: {res.confidence}. Deze toets meet geen schrijven en spreken en is geen officieel CEFR-resultaat.
          Een niveau telt als aangetoond bij minstens 70 procent goed op minstens twee vragen van dat niveau.
        </p>
        <Table title="Per vaardigheid" data={res.skills} />
        <Table title="Per niveau" data={res.levels} />
      </div>
    );

  return (
    <div className="space-y-4 max-w-2xl">
      {items.map((it, i) => (
        <div key={i} className="rounded border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
          <div className="text-xs text-neutral-500">Vraag {i + 1} van {items.length}</div>
          {it.kind === "dictation" ? (
            <div className="flex items-center gap-3 text-sm">Luister en schrijf op wat je hoort. <AudioButton text={it.text} voice={it.voice} label="Luister" /></div>
          ) : <p className="text-sm">{it.prompt}</p>}
          {it.kind === "mcq" && it.options.map((o, k) => (
            <label key={k} className="flex gap-2 text-sm">
              <input type="radio" name={`q${i}`} checked={answers[i] === k} onChange={() => set(i, k)} /> {o}
            </label>
          ))}
          {it.kind !== "mcq" && (
            <input value={String(answers[i] ?? "")} onChange={(e) => set(i, e.target.value)}
              className="w-full rounded border p-2 text-sm dark:bg-neutral-900" placeholder="Antwoord" />
          )}
        </div>
      ))}
      <button disabled={busy || answered < items.length} onClick={submit}
        className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-40 dark:bg-white dark:text-black">
        {busy ? "Beoordelen..." : answered < items.length ? `Nog ${items.length - answered} vragen` : "Lever in"}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}

function Table({ title, data }: { title: string; data: Result["skills"] }) {
  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-3 text-sm">
      <h3 className="font-semibold mb-1">{title}</h3>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex justify-between"><span>{k}</span><span>{v.correct} van {v.total}</span></div>
      ))}
    </div>
  );
}
