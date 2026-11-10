import Link from "next/link";
import { Flame, Clock, Brain, ChevronRight, Play, Headphones, Mic, BookOpen, Puzzle, Layers, RefreshCw, type LucideIcon } from "lucide-react";
import type { PlanItem, Skill } from "@/lib/plan";

const META: Record<Skill, { href: string; icon: LucideIcon; tint: string }> = {
  input: { href: "/reading", icon: BookOpen, tint: "bg-amber-500/15 text-amber-600" },
  listening: { href: "/listening", icon: Headphones, tint: "bg-sky-500/15 text-sky-600" },
  vocabulary: { href: "/vocabulary", icon: Layers, tint: "bg-violet-500/15 text-violet-600" },
  grammar: { href: "/grammar", icon: Puzzle, tint: "bg-emerald-500/15 text-emerald-600" },
  speaking: { href: "/speaking", icon: Mic, tint: "bg-rose-500/15 text-rose-600" },
  reading_writing: { href: "/reading", icon: BookOpen, tint: "bg-orange-500/15 text-orange-600" },
  revision: { href: "/revision", icon: RefreshCw, tint: "bg-indigo-500/15 text-indigo-600" },
};

export type DashboardProps = {
  name: string; level: string; streak: number; minutesToday: number; goalMinutes: number; due: number;
  plan: PlanItem[]; next: { id: string; title: string; unit: string; minutes: number } | null;
};

export default function DashboardView(p: DashboardProps) {
  const pct = Math.min(100, Math.round((p.minutesToday / Math.max(1, p.goalMinutes)) * 100));
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-5 text-white shadow-[0_16px_40px_rgb(79_70_229/0.35)]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 right-10 h-28 w-28 rounded-full bg-orange-400/25" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Goedendag</p>
              <h1 className="text-2xl font-extrabold">{p.name || "leerling"}</h1>
            </div>
            <span className="chip">Niveau {p.level}</span>
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-xs text-white/85">
              <span>Vandaag {p.minutesToday} van {p.goalMinutes} min</span><span>{pct}%</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {p.next ? (
            <div className="mt-5 rounded-2xl bg-white/12 p-3.5 backdrop-blur-sm">
              <p className="text-xs text-white/75">{p.next.unit} · {p.next.minutes} min</p>
              <p className="mb-3 mt-0.5 font-semibold leading-snug">{p.next.title}</p>
              <Link href={`/lesson/${p.next.id}`} className="btn btn-light w-full"><Play size={18} fill="currentColor" /> Start les</Link>
            </div>
          ) : (
            <Link href="/today" className="btn btn-light mt-5 w-full">Bekijk alle lessen</Link>
          )}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Stat icon={Flame} tint="text-orange-500" value={`${p.streak}`} label="dagen reeks" />
        <Stat icon={Clock} tint="text-sky-500" value={`${p.minutesToday}`} label="min vandaag" />
        <Link href="/vocabulary"><Stat icon={Brain} tint="text-violet-500" value={`${p.due}`} label="woorden klaar" /></Link>
      </section>

      <section>
        <h2 className="mb-2 text-lg">Plan voor vandaag</h2>
        <ul className="card !p-0 divide-y divide-[var(--line)] overflow-hidden">
          {p.plan.map((i) => {
            const m = META[i.skill];
            return (
              <li key={i.skill}>
                <Link href={m.href} className="flex items-center gap-3 px-4 py-3 active:bg-[var(--bg)]">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${m.tint}`}><m.icon size={20} /></span>
                  <span className="flex-1 text-[0.95rem] font-medium">{i.label}</span>
                  <span className="text-sm text-[var(--muted)]">{i.minutes} min</span>
                  <ChevronRight size={18} className="text-[var(--muted)]" />
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-[var(--muted)]">Je niveau is een schatting en geen officieel CEFR-certificaat. Toetsen geven bewijs van vooruitgang.</p>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, tint, value, label }: { icon: LucideIcon; tint: string; value: string; label: string }) {
  return (
    <div className="card card-sm text-center">
      <Icon size={20} className={`mx-auto ${tint}`} />
      <div className="mt-1 text-xl font-extrabold leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-[var(--muted)]">{label}</div>
    </div>
  );
}
