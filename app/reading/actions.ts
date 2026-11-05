"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type Wrong = { prompt: string; given: string; expected: string; explanation: string };

export async function completeReading(p: { textId: string; wrong: Wrong[]; seconds: number }) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const uid = auth.user.id;
  await sb.from("study_log").insert({
    user_id: uid, skill: "reading", seconds: Math.min(7200, Math.max(30, Math.round(p.seconds))),
  });
  if (p.wrong.length) {
    await sb.from("error_log").insert(p.wrong.slice(0, 20).map((w) => ({
      user_id: uid, source: "exercise", category: "reading", grammar_tag: "leesbegrip",
      learner_text: String(w.given).slice(0, 500), correction: String(w.expected).slice(0, 500),
      explanation: `${w.prompt} ${w.explanation}`.slice(0, 800),
    })));
  }
  redirect("/reading");
}
