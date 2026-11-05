import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { sanitizeExercises } from "@/lib/check";

export async function POST() {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const since = new Date(Date.now() - 60 * 86400000).toISOString();
  const [{ data: errs }, { data: profile }] = await Promise.all([
    sb.from("error_log").select("grammar_tag, category, learner_text, correction").gte("created_at", since)
      .order("created_at", { ascending: false }).limit(60),
    sb.from("profiles").select("current_level, native_language").eq("id", auth.user.id).single(),
  ]);
  if (!errs?.length) return NextResponse.json({ exercises: [], note: "Nog geen fouten om te oefenen." });

  const counts: Record<string, number> = {};
  errs.forEach((e) => { const k = e.grammar_tag ?? e.category; counts[k] = (counts[k] ?? 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
  const examples = errs.filter((e) => top.includes(e.grammar_tag ?? e.category)).slice(0, 12);

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: `Je maakt oefeningen Nederlands voor een leerder op niveau ${profile?.current_level ?? "B1"}.
Antwoord alleen met een JSON-array van 6 oefeningen. Elke oefening heeft een van deze vormen:
{"kind":"mcq","tag":string,"prompt":string,"options":[string,string,string],"answer":number,"explanation":string}
{"kind":"gap","tag":string,"prompt":string met precies één ___,"answers":[string],"explanation":string}
Gebruik de tag van het zwakke punt. Elke gap heeft precies één juist antwoord. Gebruik natuurlijk Nederlands van Nederland en leg de regel kort uit in het Nederlands.`,
    messages: [{ role: "user", content: `Zwakke punten: ${top.join(", ")}.\nVoorbeelden van fouten: ${JSON.stringify(examples)}` }],
  });
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("").replace(/```json|```/g, "").trim();
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return NextResponse.json({ error: "invalid output" }, { status: 502 }); }
  return NextResponse.json({ exercises: sanitizeExercises(parsed), focus: top });
}
