"use client";
import { useRef, useState } from "react";
import AudioButton from "./AudioButton";
import { gradeVocab } from "@/app/vocabulary/actions";

export type Card = { vocab_id: string; lemma: string; gloss_nl: string; example_nl: string; register: string; item_type: string };

export default function VocabReview({ cards }: { cards: Card[] }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const t0 = useRef(Date.now());
  const card = cards[i];

  if (!card) return <p>Klaar voor nu. Kom later terug voor de volgende herhaling.</p>;

  async function grade(q: 0 | 1 | 2 | 3) {
    setBusy(true);
    await gradeVocab(card.vocab_id, q, (Date.now() - t0.current) / 1000);
    setBusy(false); setShown(false); setI(i + 1); t0.current = Date.now();
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="text-xs text-neutral-500">{i + 1} van {cards.length} · {card.item_type} · {card.register}</div>
      <div className="rounded border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
        <div className="text-2xl font-semibold flex items-center gap-3">{card.lemma} <AudioButton text={card.lemma} label="Luister" /></div>
        {shown ? (
          <>
            <p>{card.gloss_nl}</p>
            <p className="text-sm text-neutral-500 flex items-center gap-2">{card.example_nl} <AudioButton text={card.example_nl} label="Luister" /></p>
          </>
        ) : (
          <button onClick={() => setShown(true)} className="rounded border px-3 py-1 text-sm">Toon betekenis</button>
        )}
      </div>
      {shown && (
        <div className="grid grid-cols-4 gap-2 text-sm">
          {([["Weet ik niet", 0], ["Moeilijk", 1], ["Goed", 2], ["Makkelijk", 3]] as const).map(([l, q]) => (
            <button key={q} disabled={busy} onClick={() => grade(q)} className="rounded border p-2 disabled:opacity-40">{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}
