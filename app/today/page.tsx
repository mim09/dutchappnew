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

  const [{ data: lessons }, { data: done }, { count: due }] = await Promise.all([
    sb.from("lessons").select("id, title, kind, est_minutes, position, units(position, title, modules(position, level_code))"),
    sb.from("lesson_progress").select("lesson_id").eq("status", "completed"),
    sb.from("user_vocab").select("*", { count: "exact", head: true }).lte("due_at", new Date().toISOString()),
  ]);
  const finished = new Set((done ?? []).map((d) => d.lesson_id));
  const order = (l: any) => [l.units?.modules?.level_code ?? "", l.units?.modules?.position ?? 0, l.units?.position ?? 0, l.position];
  const sorted = [...(lessons ?? [])].sort((a, b) => {
    const A = order(a), B = order(b);
    for (let i = 0; i < 4; i++) if (A[i] !== B[i]) return A[i] < B[i] ? -1 : 1;
    return 0;
  });
  const next = sorted.find((l) => !finished.has(l.id));

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">De les van vandaag</h1>
      {next ? (
        <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
          <div className="text-xs text-neutral-500">{(next as any).units?.title} · {next.est_minutes} min</div>
          <div className="text-lg font-medium mb-3">{next.title}</div>
          <Link href={`/lesson/${next.id}`} className="rounded bg-black text-white px-3 py-2 text-sm dark:bg-white dark:text-black">Start les</Link>
        </div>
      ) : (
        <p className="mb-6">Alle beschikbare lessen zijn afgerond. Er komt nieuwe inhoud in een volgende versie.</p>
      )}
      <Link href="/vocabulary" className="underline text-sm">Woorden herhalen ({due ?? 0} klaar)</Link>
      <h2 className="text-lg font-semibold mt-8 mb-2">Alle lessen</h2>
      <ul className="text-sm divide-y divide-neutral-200 dark:divide-neutral-800">
        {sorted.map((l) => (
          <li key={l.id} className="py-2 flex justify-between">
            <Link href={`/lesson/${l.id}`} className="underline">{l.title}</Link>
            <span className="text-neutral-500">{finished.has(l.id) ? "afgerond" : l.kind}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
