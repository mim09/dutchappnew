export const MINIMAL_PAIRS: [string, string][] = [
  ["man", "maan"], ["bos", "boos"], ["pen", "peen"], ["tak", "taak"], ["bed", "beet"],
];

export type Cloze = { prompt: string; answer: string };

// Blank one word of at least 4 letters. rand returns a number in [0, 1).
export function makeCloze(line: string, rand: () => number = Math.random): Cloze | null {
  const words = line.split(/\s+/);
  const idx = words.map((w, i) => ({ w: w.replace(/[.,!?;:]/g, ""), i })).filter((x) => x.w.length >= 4);
  if (!idx.length) return null;
  const pick = idx[Math.floor(rand() * idx.length)];
  const original = words[pick.i];
  const trailing = original.match(/[.,!?;:]+$/)?.[0] ?? "";
  words[pick.i] = "___" + trailing;
  return { prompt: words.join(" "), answer: pick.w };
}

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
