import { Suspense } from "react";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import DashboardView from "@/components/DashboardView";
import { requireUser } from "@/lib/auth";
import { buildDailyPlan, type Skill } from "@/lib/plan";
import { currentStreak } from "@/lib/streak";
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

async function Content() {
  const { sb, uid } = await requireUser();
  const since = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
  const [{ data: profile }, { data: logs }, { count: due }, { data: errs }, { data: lessons }, { data: done }] = await Promise.all([
    sb.from("profiles").select("display_name, current_level, daily_minutes, onboarding_done").eq("id", uid).single(),
    sb.from("study_log").select("studied_on, seconds").gte("studied_on", since),
    sb.from("user_vocab").select("*", { count: "exact", head: true }).lte("due_at", new Date().toISOString()),
    sb.from("error_log").select("source").gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString()),
    sb.from("lessons").select(LESSON_SELECT),
    sb.from("lesson_progress").select("lesson_id").eq("status", "completed"),
  ]);
  if (!profile?.onboarding_done) redirect("/onboarding");

  const todayStr = new Date().toISOString().slice(0, 10);
  const minutesToday = Math.round((logs ?? []).filter((l) => l.studied_on === todayStr).reduce((a, l) => a + l.seconds, 0) / 60);
  const count = (src: string) => (errs ?? []).filter((e) => e.source === src).length;
  const total = Math.max(1, errs?.length ?? 0);
  const weakness: Partial<Record<Skill, number>> = {
    speaking: count("speaking") / total, reading_writing: count("writing") / total, grammar: count("exercise") / total,
  };
  const finished = new Set((done ?? []).map((d) => d.lesson_id));
  const nextRow = sortLessons((lessons ?? []) as unknown as LessonRow[]).find((l) => !finished.has(l.id));

  return (
    <DashboardView
      name={profile.display_name ?? ""} level={profile.current_level} streak={currentStreak((logs ?? []).map((l) => l.studied_on))}
      minutesToday={minutesToday} goalMinutes={profile.daily_minutes} due={due ?? 0}
      plan={buildDailyPlan(profile.daily_minutes, weakness, due ?? 0)}
      next={nextRow ? { id: nextRow.id, title: nextRow.title, unit: nextRow.units?.title ?? "", minutes: nextRow.est_minutes } : null}
    />
  );
}
