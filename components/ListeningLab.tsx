"use client";
import { useEffect, useRef, useState } from "react";
import { playTts } from "@/lib/tts-client";
import { makeCloze, shuffle, MINIMAL_PAIRS, type Cloze } from "@/lib/listening";
import { normalize } from "@/lib/check";

export type Line = { speaker: string; voice: string; text: string; lesson: string };
type Mode = "luisteren" | "dictee" | "invul" | "paren";
type Speed = "slow" | "normal" | "fast";

export default function ListeningLab({ lines }: { lines: Line[] }) {
  const [mode, setMode] = useState<Mode>("luisteren");
  const [speed, setSpeed] = useState<Speed>("normal");
  const [subs, setSubs] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const stop = useRef(false);

  const [cur, setCur] = useState<Line | null>(null);
  const [cloze, setCloze] = useState<Cloze | null>(null);
  const [pair, setPair] = useState<{ a: string; b: string; heard: string } | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; expected: string }>(null);
  const t0 = useRef(0);

  useEffect(() => { t0.current = performance.now(); }, []);
  useEffect(() => () => { stop.current = true; }, []);

  async function play(l: Line) {
    try { await playTts(l.text, l.voice, speed); } catch { setErr("Audio niet beschikbaar. Controleer de spraakinstellingen."); throw new Error("audio"); }
  }

  async function playAll() {
    stop.current = false; setErr("");
    for (let i = 0; i < lines.length; i++) {
      if (stop.current) break;
      setPlaying(i);
      try { await play(lines[i]); } catch { break; }
    }
    setPlaying(null);
  }

  function next() {
    setAnswer(""); setResult(null); setErr("");
    if (mode === "paren") {
      const [a, b] = MINIMAL_PAIRS[Math.floor(Math.random() * MINIMAL_PAIRS.length)];
      const heard = Math.random() < 0.5 ? a : b;
      setPair({ a, b, heard });
      return;
    }
    const l = lines[Math.floor(Math.random() * lines.length)];
    setCur(l);
    setCloze(mode === "invul" ? makeCloze(l.text) : null);
  }

  useEffect(() => { if (mode !== "luisteren") next(); /* eslint-disable-next-line */ }, [mode]);

  async function report(ok: boolean, tag: string, given: string, expected: string, prompt: string) {
    const seconds = (performance.now() - t0.current) / 1000;
    t0.current = performance.now();
    fetch("/api/log-time", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill: "listening", seconds: Math.min(120, seconds),
        wrong: ok ? [] : [{ tag, given, expected, explanation: prompt }] }),
    }).catch(() => {});
  }

  function checkText() {
    if (!cur) return;
    const expected = mode === "invul" && cloze ? cloze.answer : cur.text;
    const ok = normalize(answer) === normalize(expected);
    setResult({ ok, expected });
    report(ok, mode === "dictee" ? "dictee" : "invulzin", answer, expected, "Luisteroefening");
  }

  function checkPair(choice: string) {
    if (!pair) return;
    const ok = choice === pair.heard;
    setResult({ ok, expected: pair.heard });
    report(ok, "klankonderscheid", choice, pair.heard, `${pair.a} of ${pair.b}`);
  }

  const btn = "rounded border px-3 py-1 text-sm";
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex gap-2 flex-wrap">
        {([["luisteren", "Luisteren"], ["dictee", "Dictee"], ["invul", "Ontbrekend woord"], ["paren", "Klankparen"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className={`${btn} ${mode === k ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}>{l}</button>
        ))}
        <select value={speed} onChange={(e) => setSpeed(e.target.value as Speed)} className="rounded border bg-transparent text-sm p-1">
          <option value="slow">Langzaam</option><option value="normal">Normaal</option><option value="fast">Snel</option>
        </select>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}

      {mode === "luisteren" && (
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <button className={btn} onClick={playing === null ? playAll : () => { stop.current = true; }}>{playing === null ? "Speel alles af" : "Stop"}</button>
            <label className="text-sm flex gap-2"><input type="checkbox" checked={subs} onChange={(e) => setSubs(e.target.checked)} />Toon ondertitels</label>
          </div>
          <ul className="space-y-2">
            {lines.map((l, i) => (
              <li key={i} className={`flex gap-3 items-center text-sm ${playing === i ? "font-semibold" : ""}`}>
                <button className={btn} onClick={() => { setErr(""); play(l).catch(() => {}); }}>Luister</button>
                <span className="w-14">{l.speaker}</span>
                <span>{subs ? l.text : "..."}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(mode === "dictee" || mode === "invul") && cur && (
        <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
          <button className={btn} onClick={() => { setErr(""); play(cur).catch(() => {}); }}>Luister</button>
          {mode === "invul" && (cloze ? <p className="text-sm">{cloze.prompt}</p> : <p className="text-sm">Deze zin is te kort. Kies een nieuwe.</p>)}
          {mode === "dictee" && <p className="text-sm">Schrijf de hele zin op.</p>}
          <input value={answer} disabled={!!result} onChange={(e) => setAnswer(e.target.value)} className="w-full rounded border p-2 text-sm dark:bg-neutral-900" />
          <div className="flex gap-2">
            {!result && <button className={btn} disabled={!answer.trim()} onClick={checkText}>Controleer</button>}
            {result && <button className={btn} onClick={next}>Volgende</button>}
            {!result && <button className={btn} onClick={next}>Andere zin</button>}
          </div>
          {result && <p className={`text-sm ${result.ok ? "text-green-700" : "text-red-600"}`}>{result.ok ? "Goed." : `Niet goed. Juist: ${result.expected}`}</p>}
        </div>
      )}

      {mode === "paren" && pair && (
        <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
          <button className={btn} onClick={() => { setErr(""); playTts(pair.heard, "fenna", speed).catch(() => setErr("Audio niet beschikbaar.")); }}>Luister</button>
          <p className="text-sm">Welk woord hoor je?</p>
          <div className="flex gap-2">
            {shuffle([pair.a, pair.b], () => 0.3).map((w) => (
              <button key={w} className={btn} disabled={!!result} onClick={() => checkPair(w)}>{w}</button>
            ))}
          </div>
          {result && (
            <>
              <p className={`text-sm ${result.ok ? "text-green-700" : "text-red-600"}`}>{result.ok ? "Goed." : `Niet goed. Je hoorde: ${result.expected}`}</p>
              <button className={btn} onClick={next}>Volgende</button>
            </>
          )}
        </div>
      )}
      {lines.length === 0 && mode !== "paren" && <p className="text-sm text-neutral-500">Nog geen luisterlessen. Voer 002_seed_b1.sql uit.</p>}
    </div>
  );
}
