"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function TutorChat() {
  const [sid, setSid] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { setSid(crypto.randomUUID()); }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    const m = text.trim();
    if (!m || !sid) return;
    setText(""); setBusy(true); setNote("");
    setMsgs((x) => [...x, { role: "user", content: m }]);
    const r = await fetch("/api/tutor-chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid, message: m }),
    });
    setBusy(false);
    if (!r.ok) return setNote("De tutor is nu niet bereikbaar. Probeer het opnieuw of start een nieuwe sessie.");
    const { reply } = await r.json();
    setMsgs((x) => [...x, { role: "assistant", content: reply }]);
  }

  async function remember() {
    setNote("Geheugen wordt bijgewerkt...");
    const r = await fetch("/api/tutor-memory", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: sid }),
    });
    setNote(r.ok ? "De tutor heeft dit gesprek opgeslagen in je leergeheugen." : "Bijwerken is niet gelukt.");
  }

  function fresh() { setMsgs([]); setSid(crypto.randomUUID()); setNote(""); }

  return (
    <div className="max-w-2xl space-y-3">
      <div className="space-y-2 min-h-40">
        {msgs.length === 0 && (
          <p className="text-sm text-neutral-500">Stel een vraag over Nederlands, vraag om uitleg of start een gesprek.</p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`rounded p-3 text-sm whitespace-pre-line ${m.role === "user" ? "bg-neutral-100 dark:bg-neutral-900" : "border border-neutral-200 dark:border-neutral-800"}`}>
            {m.content}
          </div>
        ))}
        <div ref={end} />
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        className="w-full rounded border p-2 text-sm dark:bg-neutral-900" placeholder="Typ je vraag" />
      <div className="flex gap-2 flex-wrap">
        <button disabled={busy || !text.trim()} onClick={send} className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-40 dark:bg-white dark:text-black">
          {busy ? "Even denken..." : "Verstuur"}
        </button>
        <button disabled={msgs.length < 2} onClick={remember} className="rounded border px-4 py-2 text-sm disabled:opacity-40">Onthoud dit gesprek</button>
        <button onClick={fresh} className="rounded border px-4 py-2 text-sm">Nieuwe sessie</button>
      </div>
      {note && <p className="text-sm text-neutral-500">{note}</p>}
    </div>
  );
}
