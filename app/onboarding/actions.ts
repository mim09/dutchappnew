"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function saveOnboarding(formData: FormData) {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/login");

  const minutes = Number(formData.get("daily_minutes"));
  const { error } = await sb
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") ?? ""),
      native_language: String(formData.get("native_language") ?? ""),
      goals: String(formData.get("goals") ?? ""),
      daily_minutes: [30, 60, 90, 120].includes(minutes) ? minutes : 90,
      current_level: "B1",
      onboarding_done: true,
    })
    .eq("id", data.user.id);
  if (error) throw new Error(error.message);
  redirect("/");
}
