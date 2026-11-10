import { Suspense } from "react";
import Link from "next/link";
import { Check, Play, ChevronRight } from "lucide-react";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import { requireUser } from "@/lib/auth";
import { LESSON_SELECT, sortLessons, type LessonRow } from "@/lib/next-lesson";

export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </Shell>
  );
}

const KIND: Record<string, string> = { grammar: "Grammatica", listening: "Luisteren", vocabulary: "Woordenschat", input: "Input", reading: "Lezen", speaking: "Spreken", writing: "Schrijven", revision: "Herhalen" };

async function Content() {
  const { sb } = await requireUser();
  const [{ data: lessons }, { data: done }, { count: due }] = await Promise.all([
    sb.from("lessons").select(LESSON_SELECT),
    sb.from("lesson_progress").select("lesson_id").eq("status", "completed"),
    sb.from("user_vocab").select("*", { count: "exact", head: true }).lte("due_at", new Date().toISOString()),
  ]);
  const finished = new Set((done ?? []).map((d) => d.lesson_id));
  const sorted = sortLessons((lessons ?? []) as unknown as LessonRow[]);
  const next = sorted.find((l) => !finished.has(l.id));

  return (
    <div className="space-y-5">
      <h1>De les van vandaag</h1>
      {next ? (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-[0_16px_40px_rgb(79_70_229/0.3)]">
          <p className="text-xs text-white/80">{next.units?.title} · {next.est_minutes} min · {KIND[next.kind] ?? next.kind}</p>
          <p className="mb-4 mt-1 text-xl font-bold leading-snug">{next.title}</p>
          <Link href={`/lesson/${next.id}`} className="btn btn-light w-full"><Play size={18} fill="currentColor" /> Start les</Link>
        </div>
      ) : (
        <div className="card">Alle beschikbare lessen zijn afgerond. Nieuwe lessen komen in een volgende versie.</div>
      )}
      <Link href="/vocabulary" className="card flex items-center justify-between">
        <span className="font-medium">Woorden herhalen</span>
        <span className="text-sm text-[var(--muted)]">{due ?? 0} klaar</span>
      </Link>
      <h2 className="text-lg">Alle lessen</h2>
      <ul className="card !p-0 divide-y divide-[var(--line)] overflow-hidden">
        {sorted.map((l, i) => {
          const isDone = finished.has(l.id);
          return (
            <li key={l.id}>
              <Link href={`/lesson/${l.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-[var(--bg)]">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${isDone ? "bg-emerald-500/15 text-emerald-600" : "bg-indigo-500/10 text-[var(--brand)]"}`}>
                  {isDone ? <Check size={18} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.95rem] font-medium">{l.title}</span>
                  <span className="text-xs text-[var(--muted)]">{KIND[l.kind] ?? l.kind} · {l.est_minutes} min</span>
                </span>
                <ChevronRight size={18} className="text-[var(--muted)]" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
