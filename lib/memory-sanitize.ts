export type TutorMemory = { summary: string; weaknesses: string[]; strengths: string[] };

const list = (v: unknown, max: number): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 120)).slice(0, max) : [];

export function sanitizeMemory(raw: any, fallback: TutorMemory): TutorMemory {
  if (!raw || typeof raw !== "object") return fallback;
  return {
    summary: typeof raw.summary === "string" ? raw.summary.slice(0, 1500) : fallback.summary,
    weaknesses: list(raw.weaknesses, 8),
    strengths: list(raw.strengths, 8),
  };
}

