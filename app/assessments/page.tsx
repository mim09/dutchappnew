import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";

export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<p className="text-sm text-neutral-500">Laden...</p>}>
        <Content />
      </Suspense>
    </Shell>
  );
}

async function Content() {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const [{ data: list }, { data: results }] = await Promise.all([
    sb.from("assessments").select("id, kind, level_code, items"),
    sb.from("assessment_results").select("assessment_id, estimated_level, created_at").order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Toetsen</h1>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded mb-6">
        {(list ?? []).map((a: any) => (
          <li key={a.id} className="p-3 flex justify-between text-sm">
            <Link href={`/assessments/${a.id}`} className="underline">{a.kind === "placement" ? "Niveautoets" : a.kind}</Link>
            <span className="text-neutral-500">{a.items.length} vragen</span>
          </li>
        ))}
        {!list?.length && <li className="p-3 text-sm">Nog geen toetsen. Voer 004_seed_assessment.sql uit.</li>}
      </ul>
      <h2 className="text-lg font-semibold mb-2">Eerdere resultaten</h2>
      <ul className="text-sm space-y-1">
        {(results ?? []).map((r, i) => (
          <li key={i}>{new Date(r.created_at).toLocaleDateString("nl-NL")}: geschat niveau {r.estimated_level}</li>
        ))}
        {!results?.length && <li className="text-neutral-500">Nog geen resultaten.</li>}
      </ul>
    </>
  );
}
