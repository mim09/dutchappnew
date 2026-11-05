import { Suspense } from "react";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import ThemeToggle from "@/components/ThemeToggle";
import { supabaseServer } from "@/lib/supabase/server";
import { saveSettings, signOut } from "./actions";

export default function Page() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold mb-4">Instellingen</h1>
      <Suspense fallback={<p className="text-sm text-neutral-500">Laden...</p>}>
        <Form />
      </Suspense>
      <h2 className="text-lg font-semibold mt-8 mb-2">Thema</h2>
      <ThemeToggle />
      <form action={signOut} className="mt-8"><button className="rounded border px-4 py-2 text-sm">Uitloggen</button></form>
    </Shell>
  );
}

async function Form() {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: p } = await sb.from("profiles").select("*").eq("id", auth.user.id).single();
  const f = "w-full rounded border p-2 text-sm dark:bg-neutral-900";
  return (
    <form action={saveSettings} className="space-y-3 max-w-md">
      <input name="display_name" defaultValue={p?.display_name ?? ""} className={f} placeholder="Naam" />
      <input name="native_language" defaultValue={p?.native_language ?? ""} className={f} placeholder="Moedertaal" />
      <select name="daily_minutes" defaultValue={String(p?.daily_minutes ?? 90)} className={f}>
        {[30, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minuten per dag</option>)}
      </select>
      <textarea name="goals" defaultValue={p?.goals ?? ""} className={f} placeholder="Doelen" />
      <button className="rounded bg-black text-white px-4 py-2 text-sm dark:bg-white dark:text-black">Opslaan</button>
    </form>
  );
}
