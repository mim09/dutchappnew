"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function saveSettings(formData: FormData) {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/login");
  const minutes = Number(formData.get("daily_minutes"));
  await sb.from("profiles").update({
    display_name: String(formData.get("display_name") ?? "").slice(0, 80),
    native_language: String(formData.get("native_language") ?? "").slice(0, 80),
    goals: String(formData.get("goals") ?? "").slice(0, 500),
    daily_minutes: [30, 60, 90, 120].includes(minutes) ? minutes : 90,
  }).eq("id", data.user.id);
  redirect("/settings");
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/login");
}
