export type Exercise =
  | { kind: "mcq"; tag: string; prompt: string; options: string[]; answer: number; explanation: string }
  | { kind: "gap"; tag: string; prompt: string; answers: string[]; explanation: string }
  | { kind: "dictation"; tag: string; text: string; voice: string; explanation: string };

export const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:"'`]/g, "").replace(/\s+/g, " ").trim();

export function isCorrect(ex: Exercise, given: string | number): boolean {
  if (ex.kind === "mcq") return Number(given) === ex.answer;
  if (ex.kind === "gap") return ex.answers.some((a) => normalize(a) === normalize(String(given)));
  return normalize(ex.text) === normalize(String(given));
}

export function expectedText(ex: Exercise): string {
  if (ex.kind === "mcq") return ex.options[ex.answer];
  if (ex.kind === "gap") return ex.answers[0];
  return ex.text;
}

export type AssessItem = Exercise & { skill: string; level: string };

export function scoreAssessment(items: AssessItem[], answers: (string | number | null)[]) {
  const skills: Record<string, { correct: number; total: number }> = {};
  const levels: Record<string, { correct: number; total: number }> = {};
  items.forEach((it, i) => {
    const a = answers[i];
    const ok = a !== null && a !== undefined && a !== "" && isCorrect(it, a);
    for (const [map, key] of [[skills, it.skill], [levels, it.level]] as const) {
      map[key] ??= { correct: 0, total: 0 };
      map[key].total += 1;
      if (ok) map[key].correct += 1;
    }
  });
  return { skills, levels };
}

export function sanitizeExercises(raw: unknown): Exercise[] {
  if (!Array.isArray(raw)) return [];
  const out: Exercise[] = [];
  for (const r of raw as any[]) {
    const tag = String(r?.tag ?? "oefening").slice(0, 60);
    const explanation = String(r?.explanation ?? "").slice(0, 400);
    if (r?.kind === "mcq" && typeof r.prompt === "string" && Array.isArray(r.options)
        && r.options.length >= 2 && r.options.length <= 4 && r.options.every((o: unknown) => typeof o === "string")
        && Number.isInteger(r.answer) && r.answer >= 0 && r.answer < r.options.length)
      out.push({ kind: "mcq", tag, prompt: r.prompt.slice(0, 300), options: r.options, answer: r.answer, explanation });
    else if (r?.kind === "gap" && typeof r.prompt === "string" && r.prompt.includes("___")
        && Array.isArray(r.answers) && r.answers.length > 0 && r.answers.every((a: unknown) => typeof a === "string"))
      out.push({ kind: "gap", tag, prompt: r.prompt.slice(0, 300), answers: r.answers, explanation });
  }
  return out.slice(0, 8);
}
