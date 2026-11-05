import { Suspense } from "react";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
import { buildDailyPlan, type Skill } from "@/lib/plan";
import { currentStreak } from "@/lib/streak";

export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<p className="text-sm text-neutral-500">Laden...</p>}>
        <DashboardContent />
      </Suspense>
    </Shell>
  );
}

async function DashboardContent() {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile } = await sb
    .from("profiles").select("*").eq("id", auth.user.id).single();
  if (!profile?.onboarding_done) redirect("/onboarding");

  const since = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
  const [{ data: logs }, { count: due }, { data: errs }] = await Promise.all([
    sb.from("study_log").select("studied_on, seconds").gte("studied_on", since),
    sb.from("user_vocab").select("*", { count: "exact", head: true }).lte("due_at", new Date().toISOString()),
    sb.from("error_log").select("source").gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString()),
  ]);

  const streak = currentStreak((logs ?? []).map((l) => l.studied_on));
  const todayStr = new Date().toISOString().slice(0, 10);
  const minutesToday = Math.round(
    (logs ?? []).filter((l) => l.studied_on === todayStr).reduce((a, l) => a + l.seconds, 0) / 60
  );

  // weakness: share of recent errors from each source, mapped to skills
  const count = (src: string) => (errs ?? []).filter((e) => e.source === src).length;
  const total = Math.max(1, errs?.length ?? 0);
  const weakness: Partial<Record<Skill, number>> = {
    speaking: count("speaking") / total,
    reading_writing: count("writing") / total,
    grammar: count("exercise") / total,
  };
  const plan = buildDailyPlan(profile.daily_minutes, weakness, due ?? 0);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-1">Hallo, {profile.display_name}</h1>
      <p className="text-sm text-neutral-500 mb-6">Niveau {profile.current_level}. Dit niveau is een schatting en geen officieel CEFR-certificaat.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Studiereeks" value={`${streak} dagen`} />
        <Stat label="Vandaag gestudeerd" value={`${minutesToday} min`} />
        <Stat label="Woorden te herhalen" value={String(due ?? 0)} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Plan voor vandaag ({profile.daily_minutes} min)</h2>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded">
        {plan.map((p) => (
          <li key={p.skill} className="flex justify-between p-3 text-sm">
            <span>{p.label}</span>
            <span className="text-neutral-500">{p.minutes} min</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
