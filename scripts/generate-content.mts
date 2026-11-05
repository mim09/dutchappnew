// Generates one lesson with Claude, validates it, and inserts it into Supabase.
// Usage: npm run generate -- --level B2 --module "Complexe zinnen" --unit "Lijdende vorm" --kind grammar --topic "lijdende vorm met worden en zijn" [--dry]
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { validateGenerated } from "../lib/validate-lesson";

const args = Object.fromEntries(
  process.argv.slice(2).reduce<string[][]>((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]?.startsWith("--") || all[i + 1] === undefined ? "true" : all[i + 1]]] : acc), [])
);
for (const k of ["level", "module", "unit", "kind", "topic"]) if (!args[k]) { console.error(`Missing --${k}`); process.exit(1); }
const dry = args.dry === "true";
const need = (k: string) => { if (!process.env[k]) { console.error(`Missing env ${k}`); process.exit(1); } return process.env[k]!; };

const anthropic = new Anthropic({ apiKey: need("ANTHROPIC_API_KEY") });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";

const SPEC = `Maak één les Nederlands (Nederlands van Nederland) als JSON, zonder extra tekst:
{"title": string, "kind": "${args.kind}", "est_minutes": 8-20,
 "body": {"intro": string,
  "vocab": [lemma, ...],   // elk lemma staat ook in vocab_items
  "sections": [
   {"type":"text","title":string,"paragraphs":[string],"examples":[{"nl":string,"note":string,"wrong":string optioneel}]},
   {"type":"dialogue","title":string,"lines":[{"speaker":string,"voice":"fenna"|"colette"|"maarten","text":string}],"expressions":[{"nl":string,"meaning_nl":string,"register":string}]},
   {"type":"exercises","items":[
     {"kind":"mcq","tag":string,"prompt":string,"options":[2 tot 4 strings],"answer":index,"explanation":string},
     {"kind":"gap","tag":string,"prompt":"zin met precies één ___","answers":[string],"explanation":string},
     {"kind":"dictation","tag":string,"text":string,"voice":"fenna"|"colette"|"maarten","explanation":string}]}]},
 "vocab_items": [{"lemma":string,"pos":string,"gloss_nl":string,"example_nl":string,"register":"informal"|"standard"|"formal","item_type":"word"|"collocation"|"idiom"|"expression"}]}
Regels: leg uit in het Nederlands op het opgegeven niveau, gebruik natuurlijke en correcte zinnen, minstens 5 oefeningen met één duidelijk juist antwoord, geen dubbelzinnige gap-antwoorden (zet alle goede varianten in answers).`;

async function ask(extra = ""): Promise<any> {
  const res = await anthropic.messages.create({
    model: MODEL, max_tokens: 7000, system: SPEC,
    messages: [{ role: "user", content: `Niveau: ${args.level}. Soort les: ${args.kind}. Onderwerp: ${args.topic}.${extra}` }],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

let lesson = await ask();
let errors = validateGenerated(lesson);
if (errors.length) {
  console.log("First attempt invalid, retrying with the errors:", errors);
  lesson = await ask(`\nDe vorige versie had deze fouten, herstel ze: ${errors.join("; ")}`);
  errors = validateGenerated(lesson);
}
if (errors.length) { console.error("Still invalid:", errors); process.exit(1); }
lesson.body.generated = true;

if (dry) { console.log(JSON.stringify(lesson, null, 2)); process.exit(0); }

const sb = createClient(need("NEXT_PUBLIC_SUPABASE_URL"), need("SUPABASE_SERVICE_ROLE_KEY"));
const one = async (q: any) => { const { data, error } = await q; if (error) throw new Error(error.message); return data; };

let mod = (await one(sb.from("modules").select("id").eq("level_code", args.level).eq("title", args.module).maybeSingle()));
if (!mod) {
  const max = await one(sb.from("modules").select("position").eq("level_code", args.level).order("position", { ascending: false }).limit(1));
  mod = await one(sb.from("modules").insert({ level_code: args.level, position: (max[0]?.position ?? 0) + 1, title: args.module }).select("id").single());
}
let unit = await one(sb.from("units").select("id").eq("module_id", mod.id).eq("title", args.unit).maybeSingle());
if (!unit) {
  const max = await one(sb.from("units").select("position").eq("module_id", mod.id).order("position", { ascending: false }).limit(1));
  unit = await one(sb.from("units").insert({ module_id: mod.id, position: (max[0]?.position ?? 0) + 1, title: args.unit }).select("id").single());
}
const maxL = await one(sb.from("lessons").select("position").eq("unit_id", unit.id).order("position", { ascending: false }).limit(1));

await one(sb.from("vocab_items").upsert(
  lesson.vocab_items.map((v: any) => ({ ...v, level_code: args.level, family: null })),
  { onConflict: "lemma,item_type", ignoreDuplicates: true }));
await one(sb.from("lessons").insert({
  unit_id: unit.id, position: (maxL[0]?.position ?? 0) + 1, title: lesson.title, kind: lesson.kind,
  body: lesson.body, est_minutes: lesson.est_minutes,
}));
console.log(`Inserted "${lesson.title}" into ${args.level} / ${args.module} / ${args.unit}`);
