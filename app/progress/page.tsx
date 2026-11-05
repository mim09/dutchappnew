import { Suspense } from "react";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
import { currentStreak } from "@/lib/streak";

export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<p className="text-sm text-neutral-500">Laden...</p>}>
        <Content />
      </Suspense>
    </Shell>
  );
}

const card = "rounded border border-neutral-200 dark:border-neutral-800 p-4";

async function Content() {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const since60 = new Date(Date.now() - 60 * 86400000).toISOString();

  const [{ data: logs }, { data: errs }, { data: vocab }, { count: lessons }, { data: last }] = await Promise.all([
    sb.from("study_log").select("skill, seconds, studied_on").gte("studied_on", since),
    sb.from("error_log").select("grammar_tag, category").gte("created_at", since60),
    sb.from("user_vocab").select("stage"),
    sb.from("lesson_progress").select("*", { count: "exact", head: true }).eq("status", "completed"),
    sb.from("assessment_results").select("estimated_level, skill_scores, created_at").order("created_at", { ascending: false }).limit(1),
  ]);

  const bySkill: Record<string, number> = {};
  (logs ?? []).forEach((l) => (bySkill[l.skill] = (bySkill[l.skill] ?? 0) + l.seconds));
  const maxSkill = Math.max(1, ...Object.values(bySkill));
  const totalMin = Math.round(Object.values(bySkill).reduce((a, b) => a + b, 0) / 60);
  const streak = currentStreak((logs ?? []).map((l) => l.studied_on));

  const tags: Record<string, number> = {};
  (errs ?? []).forEach((e) => { const k = e.grammar_tag ?? e.category; tags[k] = (tags[k] ?? 0) + 1; });
  const topTags = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const stages: Record<string, number> = {};
  (vocab ?? []).forEach((v) => (stages[v.stage] = (stages[v.stage] ?? 0) + 1));

  const res = last?.[0];
  const skillScores: Record<string, { correct: number; total: number }> = res?.skill_scores?.skills ?? {};

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">Voortgang</h1>
      <div className={card}>
        <h2 className="font-semibold mb-1">Geschat niveau</h2>
        {res ? (
          <>
            <p className="text-xl">{res.estimated_level}</p>
            <p className="text-sm text-neutral-500">
              Uit de toets van {new Date(res.created_at).toLocaleDateString("nl-NL")}. Betrouwbaarheid: {res.skill_scores?.confidence}.
              Dit is een schatting en geen officieel CEFR-certificaat. Doe regelmatig een toets om bewijs van vooruitgang te krijgen.
            </p>
            {Object.entries(skillScores).map(([k, v]) => (
              <div key={k} className="text-sm flex justify-between"><span>{k}</span><span>{v.correct} van {v.total}</span></div>
            ))}
          </>
        ) : <p className="text-sm text-neutral-500">Nog geen toets gemaakt. Doe de niveautoets onder Toetsen.</p>}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className={card}><div className="text-xs text-neutral-500">Studiereeks</div><div className="text-xl font-semibold">{streak} dagen</div></div>
        <div className={card}><div className="text-xs text-neutral-500">Gestudeerd (30 dagen)</div><div className="text-xl font-semibold">{totalMin} min</div></div>
        <div className={card}><div className="text-xs text-neutral-500">Lessen afgerond</div><div className="text-xl font-semibold">{lessons ?? 0}</div></div>
      </div>

      <div className={card}>
        <h2 className="font-semibold mb-2">Studietijd per vaardigheid (30 dagen)</h2>
        {Object.entries(bySkill).sort((a, b) => b[1] - a[1]).map(([k, s]) => (
          <div key={k} className="flex items-center gap-2 text-sm mb-1">
            <span className="w-24">{k}</span>
            <div className="h-2 bg-neutral-800 dark:bg-neutral-200 rounded" style={{ width: `${(s / maxSkill) * 60}%` }} />
            <span className="text-neutral-500">{Math.round(s / 60)} min</span>
          </div>
        ))}
        {!Object.keys(bySkill).length && <p className="text-sm text-neutral-500">Nog geen studietijd.</p>}
      </div>

      <div className={card}>
        <h2 className="font-semibold mb-2">Woordenschat</h2>
        <p className="text-sm">{Object.entries(stages).map(([k, v]) => `${k}: ${v}`).join(" · ") || "Nog geen woorden."}</p>
      </div>

      <div className={card}>
        <h2 className="font-semibold mb-2">Zwakke punten (60 dagen)</h2>
        {topTags.map(([k, n]) => <div key={k} className="text-sm flex justify-between"><span>{k}</span><span>{n} fouten</span></div>)}
        {!topTags.length && <p className="text-sm text-neutral-500">Nog geen fouten vastgelegd.</p>}
      </div>
    </div>
  );
}
