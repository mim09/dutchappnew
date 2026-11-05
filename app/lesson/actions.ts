"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type Wrong = { tag: string; prompt: string; given: string; expected: string; explanation: string };

const SKILL: Record<string, string> = {
  input: "input", listening: "listening", grammar: "grammar", vocabulary: "vocabulary",
  speaking: "speaking", reading: "reading", writing: "writing", revision: "revision", assessment: "revision",
};

export async function completeLesson(p: { lessonId: string; score: number; wrong: Wrong[]; seconds: number }) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const uid = auth.user.id;

  const { data: lesson, error } = await sb.from("lessons").select("kind, body").eq("id", p.lessonId).single();
  if (error || !lesson) throw new Error("lesson not found");

  const score = Math.min(1, Math.max(0, p.score));
  await sb.from("lesson_progress").upsert({
    user_id: uid, lesson_id: p.lessonId, status: "completed", score, completed_at: new Date().toISOString(),
  });

  await sb.from("study_log").insert({
    user_id: uid, skill: SKILL[lesson.kind] ?? "input", seconds: Math.max(30, Math.round(p.seconds)),
  });

  if (p.wrong.length) {
    await sb.from("error_log").insert(
      p.wrong.slice(0, 30).map((w) => ({
        user_id: uid, source: "exercise", category: "grammar", grammar_tag: w.tag,
        learner_text: String(w.given).slice(0, 500), correction: String(w.expected).slice(0, 500),
        explanation: `${w.prompt} ${w.explanation}`.slice(0, 800),
      }))
    );
  }

  const lemmas: string[] = Array.isArray(lesson.body?.vocab) ? lesson.body.vocab : [];
  if (lemmas.length) {
    const { data: items } = await sb.from("vocab_items").select("id").in("lemma", lemmas);
    if (items?.length) {
      await sb.from("user_vocab").upsert(
        items.map((i) => ({ user_id: uid, vocab_id: i.id })),
        { onConflict: "user_id,vocab_id", ignoreDuplicates: true }
      );
    }
  }
  redirect("/today");
}
