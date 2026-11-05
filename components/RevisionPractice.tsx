"use client";
import { useRef, useState } from "react";
import { ExerciseCard } from "./LessonPlayer";
import { isCorrect, expectedText, type Exercise } from "@/lib/check";

export default function RevisionPractice() {
  const [ex, setEx] = useState<Exercise[]>([]);
  const [res, setRes] = useState<Record<number, { given: string; correct: boolean }>>({});
  const [focus, setFocus] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const t0 = useRef(0);

  async function generate() {
    setBusy(true); setMsg(""); setRes({}); setSaved(false); setEx([]);
    const r = await fetch("/api/revision", { method: "POST" });
    setBusy(false);
    if (!r.ok) return setMsg("Oefeningen maken is nu niet gelukt.");
    const j = await r.json();
    if (!j.exercises?.length) return setMsg(j.note ?? "Er zijn geen oefeningen gemaakt. Probeer opnieuw.");
    setEx(j.exercises); setFocus(j.focus ?? []); t0.current = performance.now();
  }

  const done = ex.length > 0 && ex.every((_, i) => res[i]);
  async function save() {
    setSaved(true);
    await fetch("/api/log-time", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skill: "revision", seconds: (performance.now() - t0.current) / 1000,
        wrong: ex.flatMap((e, i) => res[i] && !res[i].correct
          ? [{ tag: e.tag, given: res[i].given, expected: expectedText(e), explanation: e.explanation }] : []),
      }),
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <button onClick={generate} disabled={busy} className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-40 dark:bg-white dark:text-black">
        {busy ? "Oefeningen maken..." : "Maak oefeningen op mijn zwakke punten"}
      </button>
      {msg && <p className="text-sm text-neutral-500">{msg}</p>}
      {focus.length > 0 && <p className="text-sm text-neutral-500">Focus: {focus.join(", ")}</p>}
      {ex.map((e, i) => (
        <ExerciseCard key={i} ex={e} result={res[i]}
          onAnswer={(g) => setRes((r) => ({ ...r, [i]: { given: String(g), correct: isCorrect(e, g) } }))} />
      ))}
      {done && !saved && <button onClick={save} className="rounded border px-4 py-2 text-sm">Sla resultaat op</button>}
      {saved && <p className="text-sm">Opgeslagen.</p>}
    </div>
  );
}
