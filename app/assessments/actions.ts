"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { scoreAssessment, type AssessItem } from "@/lib/check";
import { estimateLevel } from "@/lib/level";

export async function submitAssessment(assessmentId: string, answers: (string | number | null)[]) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: a, error } = await sb.from("assessments").select("items").eq("id", assessmentId).single();
  if (error || !a) throw new Error("assessment not found");
  const items = a.items as AssessItem[];
  if (!Array.isArray(answers) || answers.length !== items.length) throw new Error("invalid answers");

  const { skills, levels } = scoreAssessment(items, answers);
  const { estimate, confidence } = estimateLevel(levels, items.length);
  await sb.from("assessment_results").insert({
    user_id: auth.user.id, assessment_id: assessmentId,
    skill_scores: { skills, levels, confidence }, estimated_level: estimate,
  });
  return { skills, levels, estimate, confidence };
}
