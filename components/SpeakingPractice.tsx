"use client";
import { useEffect, useRef, useState } from "react";
import AudioButton from "./AudioButton";
import FeedbackView, { type Feedback } from "./FeedbackView";
import { blobToWav16k } from "@/lib/wav";

const SCENARIOS: Record<string, string> = {
  "Koffie met een collega": "Een informeel gesprek met een collega in de koffiepauze over het weekend.",
  "Bij de gemeente": "Je bent bij de balie van de gemeente en meldt een verhuizing. Jij bent de ambtenaar.",
  "Sollicitatiegesprek": "Jij bent de interviewer bij een sollicitatiegesprek voor een IT-baan.",
  "Bij de huisarts": "Jij bent de assistent van de huisarts en maakt een afspraak met de leerling.",
};

type Turn = { role: "user" | "assistant"; content: string };

export default function SpeakingPractice() {
  const [scenario, setScenario] = useState(Object.keys(SCENARIOS)[0]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [fb, setFb] = useState<Feedback | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const t0 = useRef(0);
  const [canRecord, setCanRecord] = useState(false);
  useEffect(() => {
    t0.current = performance.now();
    setCanRecord(!!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined");
  }, []);

  async function start() {
    setStatus("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setStatus("Spraak wordt omgezet naar tekst...");
        try {
          const wav = await blobToWav16k(new Blob(chunks.current, { type: mr.mimeType }));
          const r = await fetch("/api/stt", { method: "POST", body: wav });
          if (!r.ok) throw new Error();
          const j = await r.json();
          setDraft(j.text ?? "");
          setStatus(j.text ? "Controleer de tekst en pas aan waar nodig." : "Ik heb niets verstaan. Probeer het opnieuw.");
        } catch {
          setStatus("Spraakherkenning mislukt. Typ je antwoord.");
        }
      };
      rec.current = mr; mr.start(); setRecording(true);
    } catch {
      setStatus("Geen toegang tot de microfoon. Typ je antwoord.");
    }
  }
  function stop() { rec.current?.stop(); setRecording(false); }

  async function send() {
    const next: Turn[] = [...turns, { role: "user", content: draft.trim() }];
    setTurns(next); setDraft(""); setStatus("De gesprekspartner denkt na...");
    const r = await fetch("/api/conversation", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next, scenario: SCENARIOS[scenario] }),
    });
    if (!r.ok) return setStatus("De gesprekspartner is nu niet bereikbaar.");
    const { reply } = await r.json();
    setTurns([...next, { role: "assistant", content: reply }]); setStatus("");
  }

  async function finish() {
    const learner = turns.filter((t) => t.role === "user").map((t) => t.content).join("\n");
    setStatus("Feedback wordt gemaakt...");
    const r = await fetch("/api/tutor", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "speaking", task: scenario, text: learner }),
    });
    setStatus("");
    if (!r.ok) return setStatus("De tutor kon het gesprek nu niet beoordelen.");
    setFb(await r.json());
    fetch("/api/log-time", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill: "speaking", seconds: (performance.now() - t0.current) / 1000 }) }).catch(() => {});
  }

  const learnerTurns = turns.filter((t) => t.role === "user").length;

  return (
    <div className="space-y-4 max-w-2xl">
      <select value={scenario} disabled={turns.length > 0} onChange={(e) => setScenario(e.target.value)}
        className="rounded border p-2 text-sm dark:bg-neutral-900">
        {Object.keys(SCENARIOS).map((k) => <option key={k}>{k}</option>)}
      </select>
      <p className="text-sm text-neutral-500">{SCENARIOS[scenario]} Je krijgt feedback aan het einde van het gesprek.</p>

      <ul className="space-y-2">
        {turns.map((t, i) => (
          <li key={i} className={`rounded p-3 text-sm ${t.role === "user" ? "bg-neutral-100 dark:bg-neutral-900" : "border border-neutral-200 dark:border-neutral-800"}`}>
            {t.content} {t.role === "assistant" && <AudioButton text={t.content} voice="colette" label="Luister" />}
          </li>
        ))}
      </ul>

      {!fb && (
        <div className="space-y-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3}
            className="w-full rounded border p-2 text-sm dark:bg-neutral-900" placeholder="Spreek of typ je antwoord" />
          <div className="flex gap-2 flex-wrap">
            {canRecord && (
              <button onClick={recording ? stop : start} className="rounded border px-3 py-2 text-sm">
                {recording ? "Stop opname" : "Neem op"}
              </button>
            )}
            <button disabled={!draft.trim()} onClick={send} className="rounded bg-black text-white px-3 py-2 text-sm disabled:opacity-40 dark:bg-white dark:text-black">Verstuur</button>
            <button disabled={learnerTurns < 3} onClick={finish} className="rounded border px-3 py-2 text-sm disabled:opacity-40">
              Rond af en krijg feedback {learnerTurns < 3 ? `(nog ${3 - learnerTurns} beurten)` : ""}
            </button>
          </div>
        </div>
      )}
      {status && <p className="text-sm text-neutral-500">{status}</p>}
      {fb && <FeedbackView fb={fb} />}
    </div>
  );
}
