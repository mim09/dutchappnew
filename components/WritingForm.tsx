"use client";
import { useEffect, useRef, useState } from "react";
import FeedbackView, { type Feedback } from "./FeedbackView";

const TASKS: Record<string, string> = {
  email: "Schrijf een e-mail aan een collega om een vergadering te verplaatsen.",
  whatsapp: "Schrijf een WhatsApp-bericht aan een vriend om af te spreken voor zaterdag.",
  brief: "Schrijf een formele brief aan de gemeente over een verhuizing.",
  mening: "Schrijf je mening: is thuiswerken beter dan werken op kantoor?",
  verhaal: "Vertel over een dag waarop er iets onverwachts gebeurde.",
};

export default function WritingForm() {
  const [task, setTask] = useState("email");
  const [text, setText] = useState("");
  const [fb, setFb] = useState<Feedback | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const t0 = useRef(0);
  useEffect(() => { t0.current = performance.now(); }, []);

  async function submit() {
    setBusy(true); setErr(""); setFb(null);
    const r = await fetch("/api/tutor", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "writing", task, text }),
    });
    setBusy(false);
    if (!r.ok) return setErr("De tutor kon je tekst nu niet beoordelen. Probeer het later opnieuw.");
    setFb(await r.json());
    fetch("/api/log-time", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill: "writing", seconds: (performance.now() - t0.current) / 1000 }) }).catch(() => {});
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <select value={task} onChange={(e) => setTask(e.target.value)} className="rounded border p-2 text-sm dark:bg-neutral-900">
        {Object.keys(TASKS).map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
      <p className="text-sm text-neutral-500">{TASKS[task]}</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} maxLength={5000}
        className="w-full rounded border p-3 text-sm dark:bg-neutral-900" placeholder="Schrijf hier in het Nederlands" />
      <button disabled={busy || text.trim().length < 20} onClick={submit}
        className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-40 dark:bg-white dark:text-black">
        {busy ? "Beoordelen..." : "Laat beoordelen"}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {fb && <FeedbackView fb={fb} />}
    </div>
  );
}
