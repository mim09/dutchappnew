import { Suspense } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import { requireUser } from "@/lib/auth";

export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </Shell>
  );
}

async function Content() {
  const { sb } = await requireUser();
  const [{ data: lessons }, { data: errs }] = await Promise.all([
    sb.from("lessons").select("id, title, est_minutes").eq("kind", "grammar").order("position"),
    sb.from("error_log").select("grammar_tag, learner_text, correction, explanation, created_at")
      .not("grammar_tag", "is", null).order("created_at", { ascending: false }).limit(60),
  ]);
  const groups: Record<string, typeof errs> = {};
  (errs ?? []).forEach((e) => { (groups[e.grammar_tag!] ??= []).push(e); });
  const sorted = Object.entries(groups).sort((a, b) => b[1]!.length - a[1]!.length).slice(0, 6);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">Grammatica</h1>
      <div>
        <h2 className="text-lg font-semibold mb-2">Grammaticalessen</h2>
        <ul className="text-sm divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded">
          {(lessons ?? []).map((l) => (
            <li key={l.id} className="p-3 flex justify-between">
              <Link href={`/lesson/${l.id}`} className="underline">{l.title}</Link>
              <span className="text-neutral-500">{l.est_minutes} min</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Jouw terugkerende fouten</h2>
        {sorted.map(([tag, list]) => (
          <div key={tag} className="card card-sm mb-3 text-sm">
            <div className="font-semibold">{tag} ({list!.length}x)</div>
            {list!.slice(0, 2).map((e, i) => (
              <p key={i}><span className="line-through text-red-600">{e.learner_text}</span> {e.correction}</p>
            ))}
          </div>
        ))}
        {!sorted.length && <p className="text-sm text-neutral-500">Nog geen fouten vastgelegd.</p>}
        <Link href="/revision" className="underline text-sm">Oefen deze punten</Link>
      </div>
    </div>
  );
}
