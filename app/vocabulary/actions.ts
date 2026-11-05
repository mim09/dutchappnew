"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { review } from "@/lib/srs";

export async function gradeVocab(vocabId: string, quality: 0 | 1 | 2 | 3, seconds: number) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("unauthorized");
  if (![0, 1, 2, 3].includes(quality)) throw new Error("invalid grade");

  const { data: row, error } = await sb.from("user_vocab").select("*")
    .eq("user_id", auth.user.id).eq("vocab_id", vocabId).single();
  if (error || !row) throw new Error("card not found");

  const next = review(row, quality);
  const { error: upErr } = await sb.from("user_vocab").update(next)
    .eq("user_id", auth.user.id).eq("vocab_id", vocabId);
  if (upErr) throw new Error(upErr.message);

  await sb.from("study_log").insert({
    user_id: auth.user.id, skill: "vocabulary", seconds: Math.min(120, Math.max(3, Math.round(seconds))),
  });
}
