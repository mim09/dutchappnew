import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/anthropic";

type Body = { mode: "speaking" | "writing"; text: string; task?: string };

const SYSTEM = `You are a Dutch tutor for an adult learner at CEFR B1 aiming for C1/C2.
Standard Netherlands Dutch. Reply with JSON only, no other text, in this shape:
{"original": string, "corrected": string, "natural": string,
 "mistakes": [{"category": string, "grammar_tag": string, "wrong": string, "right": string, "explanation": string}],
 "style_notes": string[], "useful_expressions": string[], "exercise": string,
 "scores": {"grammar": 0-10, "vocabulary": 0-10, "naturalness": 0-10}}
Separate grammatical mistakes (in "mistakes") from stylistic improvements (in "style_notes").
Explain mistakes in Dutch, and in the learner's native language only when the point is hard.
Use the learner's history below to point out repeated errors and to tailor the exercise.`;

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as Body;
  if (!body?.text || body.text.length > 5000)
    return NextResponse.json({ error: "invalid text" }, { status: 400 });

  const [{ data: profile }, { data: memory }, { data: recent }] = await Promise.all([
    sb.from("profiles").select("native_language, current_level, goals").eq("id", auth.user.id).single(),
    sb.from("tutor_memory").select("summary, weaknesses").eq("user_id", auth.user.id).single(),
    sb.from("error_log").select("category, grammar_tag, learner_text, correction")
      .eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(20),
  ]);

  const context = `Learner level: ${profile?.current_level}. Native language: ${profile?.native_language}.
Goals: ${profile?.goals ?? "none stated"}.
Memory summary: ${memory?.summary || "none yet"}.
Known weaknesses: ${JSON.stringify(memory?.weaknesses ?? [])}.
Recent errors: ${JSON.stringify(recent ?? [])}.`;

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `${SYSTEM}\n\n${context}`,
    messages: [{ role: "user", content: `Mode: ${body.mode}\nTask: ${body.task ?? "free"}\nText:\n${body.text}` }],
  });

  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  let fb;
  try {
    fb = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return NextResponse.json({ error: "tutor returned invalid JSON" }, { status: 502 });
  }

  if (body.mode === "speaking") {
    await sb.from("speaking_sessions").insert({
      user_id: auth.user.id, mode: body.task ?? "free", transcript: body.text,
      feedback: fb, scores: fb.scores ?? {},
    });
  } else {
    await sb.from("writing_submissions").insert({
      user_id: auth.user.id, task_type: body.task ?? "free", original: body.text,
      feedback: fb, scores: fb.scores ?? {},
    });
  }

  const errors = (fb.mistakes ?? []).map((m: any) => ({
    user_id: auth.user.id,
    source: body.mode,
    category: m.category ?? "other",
    grammar_tag: m.grammar_tag ?? null,
    learner_text: m.wrong ?? "",
    correction: m.right ?? "",
    explanation: m.explanation ?? null,
  }));
  if (errors.length) await sb.from("error_log").insert(errors);

  return NextResponse.json(fb);
}
