export type Feedback = {
  original: string; corrected: string; natural: string;
  mistakes: { category: string; grammar_tag: string; wrong: string; right: string; explanation: string }[];
  style_notes: string[]; useful_expressions: string[]; exercise: string;
  scores: Record<string, number>;
};

const box = "rounded border border-neutral-200 dark:border-neutral-800 p-3 text-sm space-y-1";

export default function FeedbackView({ fb }: { fb: Feedback }) {
  return (
    <div className="space-y-3">
      <div className={box}><h3 className="font-semibold">Jouw tekst</h3><p>{fb.original}</p></div>
      <div className={box}><h3 className="font-semibold">Gecorrigeerd</h3><p>{fb.corrected}</p></div>
      <div className={box}><h3 className="font-semibold">Natuurlijker Nederlands</h3><p>{fb.natural}</p></div>
      <div className={box}>
        <h3 className="font-semibold">Fouten</h3>
        {fb.mistakes?.length ? fb.mistakes.map((m, i) => (
          <p key={i}><span className="line-through text-red-600">{m.wrong}</span> {m.right}. {m.explanation}</p>
        )) : <p>Geen grammaticale fouten gevonden.</p>}
      </div>
      {fb.style_notes?.length > 0 && (
        <div className={box}><h3 className="font-semibold">Stijl</h3>{fb.style_notes.map((s, i) => <p key={i}>{s}</p>)}</div>
      )}
      {fb.useful_expressions?.length > 0 && (
        <div className={box}><h3 className="font-semibold">Nuttige uitdrukkingen</h3>{fb.useful_expressions.map((s, i) => <p key={i}>{s}</p>)}</div>
      )}
      <div className={box}><h3 className="font-semibold">Oefening</h3><p>{fb.exercise}</p></div>
      <div className={box}>
        <h3 className="font-semibold">Scores (schatting door de AI-tutor)</h3>
        <p>{Object.entries(fb.scores ?? {}).map(([k, v]) => `${k}: ${v}/10`).join(" · ")}</p>
      </div>
    </div>
  );
}
