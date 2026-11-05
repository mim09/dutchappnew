const VOICES = ["fenna", "colette", "maarten"];
const REGISTERS = ["informal", "standard", "formal"];
const ITEM_TYPES = ["word", "collocation", "idiom", "expression"];
const KINDS = ["input", "listening", "grammar", "vocabulary", "speaking", "reading", "writing", "revision"];

const str = (v: unknown, max = 600): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= max;

export function validateExercise(r: any, path: string, errors: string[]) {
  if (!r || typeof r !== "object") return errors.push(`${path}: not an object`);
  if (!str(r.tag, 60)) errors.push(`${path}: missing tag`);
  if (!str(r.explanation, 500)) errors.push(`${path}: missing explanation`);
  if (r.kind === "mcq") {
    if (!str(r.prompt, 400)) errors.push(`${path}: prompt`);
    if (!Array.isArray(r.options) || r.options.length < 2 || r.options.length > 4 || !r.options.every((o: unknown) => str(o, 200)))
      errors.push(`${path}: options must be 2 to 4 strings`);
    else if (new Set(r.options).size !== r.options.length) errors.push(`${path}: duplicate options`);
    if (!Number.isInteger(r.answer) || r.answer < 0 || r.answer >= (r.options?.length ?? 0)) errors.push(`${path}: answer index out of range`);
  } else if (r.kind === "gap") {
    if (!str(r.prompt, 400) || (r.prompt.match(/___/g) ?? []).length !== 1) errors.push(`${path}: prompt needs exactly one ___`);
    if (!Array.isArray(r.answers) || !r.answers.length || !r.answers.every((a: unknown) => str(a, 100))) errors.push(`${path}: answers`);
  } else if (r.kind === "dictation") {
    if (!str(r.text, 200)) errors.push(`${path}: text`);
    if (!VOICES.includes(r.voice)) errors.push(`${path}: voice`);
  } else errors.push(`${path}: unknown kind`);
}

export function validateLessonBody(body: any): string[] {
  const errors: string[] = [];
  if (!body || typeof body !== "object") return ["body is not an object"];
  if (!str(body.intro, 400)) errors.push("intro missing");
  if (!Array.isArray(body.vocab) || body.vocab.length > 30 || !body.vocab.every((v: unknown) => str(v, 100))) errors.push("vocab must be a list of strings");
  if (!Array.isArray(body.sections) || body.sections.length < 1 || body.sections.length > 8) return [...errors, "sections must hold 1 to 8 items"];
  let exerciseSections = 0;
  body.sections.forEach((s: any, i: number) => {
    const p = `sections[${i}]`;
    if (s?.type === "text") {
      if (!str(s.title, 150)) errors.push(`${p}: title`);
      if (!Array.isArray(s.paragraphs) || !s.paragraphs.length || !s.paragraphs.every((x: unknown) => str(x, 1200))) errors.push(`${p}: paragraphs`);
      (s.examples ?? []).forEach((e: any, k: number) => {
        if (!str(e?.nl, 300)) errors.push(`${p}.examples[${k}]: nl`);
        if (e?.wrong !== undefined && e.wrong === e.nl) errors.push(`${p}.examples[${k}]: wrong equals nl`);
      });
    } else if (s?.type === "dialogue") {
      if (!str(s.title, 150)) errors.push(`${p}: title`);
      if (!Array.isArray(s.lines) || s.lines.length < 2) errors.push(`${p}: needs at least 2 lines`);
      else s.lines.forEach((l: any, k: number) => {
        if (!str(l?.speaker, 40) || !str(l?.text, 300) || !VOICES.includes(l?.voice)) errors.push(`${p}.lines[${k}]: speaker, text or voice`);
      });
      (s.expressions ?? []).forEach((e: any, k: number) => {
        if (!str(e?.nl, 150) || !str(e?.meaning_nl, 300) || !str(e?.register, 60)) errors.push(`${p}.expressions[${k}]`);
      });
    } else if (s?.type === "exercises") {
      exerciseSections++;
      if (!Array.isArray(s.items) || s.items.length < 3 || s.items.length > 10) errors.push(`${p}: needs 3 to 10 exercises`);
      else s.items.forEach((x: any, k: number) => validateExercise(x, `${p}.items[${k}]`, errors));
    } else errors.push(`${p}: unknown type`);
  });
  if (exerciseSections < 1) errors.push("at least one exercises section is required");
  return errors;
}

export function validateVocabItem(v: any): string[] {
  const e: string[] = [];
  if (!str(v?.lemma, 100)) e.push("lemma");
  if (!str(v?.gloss_nl, 300)) e.push("gloss_nl");
  if (!str(v?.example_nl, 300)) e.push("example_nl");
  if (!REGISTERS.includes(v?.register)) e.push("register");
  if (!ITEM_TYPES.includes(v?.item_type)) e.push("item_type");
  return e;
}

export function validateGenerated(g: any): string[] {
  const e: string[] = [];
  if (!str(g?.title, 150)) e.push("title missing");
  if (!KINDS.includes(g?.kind)) e.push("kind invalid");
  if (!Number.isInteger(g?.est_minutes) || g.est_minutes < 5 || g.est_minutes > 30) e.push("est_minutes must be 5 to 30");
  e.push(...validateLessonBody(g?.body));
  if (!Array.isArray(g?.vocab_items)) e.push("vocab_items missing");
  else {
    g.vocab_items.forEach((v: any, i: number) => validateVocabItem(v).forEach((m) => e.push(`vocab_items[${i}]: ${m}`)));
    const lemmas = new Set(g.vocab_items.map((v: any) => v?.lemma));
    (g.body?.vocab ?? []).forEach((l: string) => { if (!lemmas.has(l)) e.push(`body.vocab "${l}" has no matching vocab_items entry`); });
  }
  return e;
}
