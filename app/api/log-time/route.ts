import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const SKILLS = ["input", "listening", "vocabulary", "grammar", "speaking", "reading", "writing", "revision"];

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { skill, seconds, wrong } = await req.json();
  if (!SKILLS.includes(skill) || typeof seconds !== "number")
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  await sb.from("study_log").insert({
    user_id: auth.user.id, skill, seconds: Math.min(7200, Math.max(10, Math.round(seconds))),
  });
  if (Array.isArray(wrong) && wrong.length) {
    await sb.from("error_log").insert(wrong.slice(0, 20).map((w: any) => ({
      user_id: auth.user.id, source: "exercise", category: "grammar", grammar_tag: String(w.tag ?? "oefening").slice(0, 60),
      learner_text: String(w.given ?? "").slice(0, 500), correction: String(w.expected ?? "").slice(0, 500),
      explanation: String(w.explanation ?? "").slice(0, 800),
    })));
  }
  return NextResponse.json({ ok: true });
}
