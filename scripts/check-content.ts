// Validates every lesson, text and assessment item in supabase/*.sql. Run: npm run check:content
import { readFileSync, readdirSync } from "node:fs";
import { validateLessonBody, validateExercise } from "../lib/validate-lesson";

let bad = 0, lessons = 0, exercises = 0;
const lemmas = new Set<string>();
const needed: [string, string][] = [];
for (const f of readdirSync("supabase").filter((x) => x.endsWith(".sql"))) {
  const sql = readFileSync(`supabase/${f}`, "utf8");
  for (const m of sql.matchAll(/into vocab_items \(.*?values \('((?:[^']|'')*)'/g)) lemmas.add(m[1].replace(/''/g, "'"));
  for (const m of sql.matchAll(/\$j\$([\s\S]*?)\$j\$/g)) {
    const o = JSON.parse(m[1]);
    if (o.sections) {
      lessons++;
      (o.vocab ?? []).forEach((v: string) => needed.push([f, v]));
      const errs = validateLessonBody(o);
      if (errs.length) { bad++; console.log(`${f} lesson "${o.intro?.slice(0, 40)}":`, errs); }
      o.sections.filter((s: any) => s.type === "exercises").forEach((s: any) => (exercises += s.items.length));
    } else if (o.questions) {
      o.questions.forEach((q: any, i: number) => { exercises++; const e: string[] = []; validateExercise(q, `text.q[${i}]`, e); if (e.length) { bad++; console.log(f, e); } });
    } else if (Array.isArray(o) && o[0]?.skill) {
      o.forEach((q: any, i: number) => { exercises++; const e: string[] = []; validateExercise(q, `assessment[${i}]`, e); if (e.length) { bad++; console.log(f, e); } });
    }
  }
}
for (const [f, v] of needed) if (!lemmas.has(v)) { bad++; console.log(`${f}: lesson vocab "${v}" is not in any vocab_items insert`); }
console.log(`lessons ${lessons}, exercises ${exercises}, problems ${bad}`);
process.exit(bad ? 1 : 0);
