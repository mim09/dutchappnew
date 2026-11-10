import { Suspense } from "react";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import ThemeToggle from "@/components/ThemeToggle";
import DeleteAccount from "@/components/DeleteAccount";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { saveSettings, signOut } from "./actions";

export default function Page() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold mb-4">Instellingen</h1>
      <Suspense fallback={<Skeleton />}>
        <Form />
      </Suspense>
      <h2 className="text-lg font-semibold mt-8 mb-2">Thema</h2>
      <ThemeToggle />
      <form action={signOut} className="mt-8"><button className="btn btn-ghost">Uitloggen</button></form>
      <p className="mt-6 text-sm"><Link href="/privacy" className="underline">Privacyverklaring</Link></p>
      <DeleteAccount />
    </Shell>
  );
}

async function Form() {
  const { sb, uid } = await requireUser();
  const { data: p } = await sb.from("profiles").select("*").eq("id", uid).single();
  const f = "w-full field";
  return (
    <form action={saveSettings} className="space-y-3 max-w-md">
      <input name="display_name" defaultValue={p?.display_name ?? ""} className={f} placeholder="Naam" />
      <input name="native_language" defaultValue={p?.native_language ?? ""} className={f} placeholder="Moedertaal" />
      <select name="daily_minutes" defaultValue={String(p?.daily_minutes ?? 90)} className={f}>
        {[30, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minuten per dag</option>)}
      </select>
      <textarea name="goals" defaultValue={p?.goals ?? ""} className={f} placeholder="Doelen" />
      <button className="btn btn-primary">Opslaan</button>
    </form>
  );
}
