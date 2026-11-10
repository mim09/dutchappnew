"use client";
import { useEffect, useRef, useState } from "react";
import AudioButton from "./AudioButton";
import { gradeVocab } from "@/app/vocabulary/actions";

export type Card = { vocab_id: string; lemma: string; gloss_nl: string; example_nl: string; register: string; item_type: string };

export default function VocabReview({ cards }: { cards: Card[] }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const t0 = useRef(0);
  useEffect(() => { t0.current = performance.now(); }, []);
  const card = cards[i];

  if (!card) return <p>Klaar voor nu. Kom later terug voor de volgende herhaling.</p>;

  async function grade(q: 0 | 1 | 2 | 3) {
    setBusy(true);
    await gradeVocab(card.vocab_id, q, (performance.now() - t0.current) / 1000);
    setBusy(false); setShown(false); setI(i + 1); t0.current = performance.now();
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="text-xs text-neutral-500">{i + 1} van {cards.length} · {card.item_type} · {card.register}</div>
      <div className="card grid min-h-64 content-center space-y-4 !p-6 text-center">
        <div className="flex flex-col items-center gap-3 text-3xl font-extrabold">{card.lemma} <AudioButton text={card.lemma} label="Luister" /></div>
        {shown ? (
          <>
            <p>{card.gloss_nl}</p>
            <p className="flex flex-col items-center gap-2 text-sm text-[var(--muted)]">{card.example_nl} <AudioButton text={card.example_nl} label="Luister" /></p>
          </>
        ) : (
          <button onClick={() => setShown(true)} className="btn btn-ghost">Toon betekenis</button>
        )}
      </div>
      {shown && (
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {([["Weet ik niet", 0], ["Moeilijk", 1], ["Goed", 2], ["Makkelijk", 3]] as const).map(([l, q]) => (
            <button key={q} disabled={busy} onClick={() => grade(q)} className="btn btn-ghost !px-2">{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}
