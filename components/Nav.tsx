"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House, GraduationCap, Layers, Sparkles, LayoutGrid, Headphones, Mic, BookOpen, PenLine, Puzzle,
  RefreshCw, Route, ClipboardCheck, TrendingUp, Settings, type LucideIcon,
} from "lucide-react";

type Item = { href: string; label: string; icon: LucideIcon };

const SIDEBAR: { title: string; items: Item[] }[] = [
  { title: "Leren", items: [
    { href: "/", label: "Start", icon: House },
    { href: "/today", label: "Les van vandaag", icon: GraduationCap },
    { href: "/path", label: "Leerpad", icon: Route },
  ]},
  { title: "Oefenen", items: [
    { href: "/listening", label: "Luisteren", icon: Headphones },
    { href: "/speaking", label: "Spreken", icon: Mic },
    { href: "/reading", label: "Lezen", icon: BookOpen },
    { href: "/writing", label: "Schrijven", icon: PenLine },
    { href: "/grammar", label: "Grammatica", icon: Puzzle },
    { href: "/vocabulary", label: "Woordenschat", icon: Layers },
    { href: "/revision", label: "Herhalen", icon: RefreshCw },
  ]},
  { title: "Hulp en voortgang", items: [
    { href: "/tutor", label: "AI-tutor", icon: Sparkles },
    { href: "/assessments", label: "Toetsen", icon: ClipboardCheck },
    { href: "/progress", label: "Voortgang", icon: TrendingUp },
    { href: "/settings", label: "Instellingen", icon: Settings },
  ]},
];

const PRACTICE = ["/practice", "/listening", "/speaking", "/reading", "/writing", "/grammar", "/vocabulary", "/revision"];
const MORE = ["/more", "/path", "/assessments", "/progress", "/settings", "/privacy"];
const LESSON = ["/today", "/lesson"];

const TABS: { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { href: "/", label: "Start", icon: House, match: (p) => p === "/" },
  { href: "/today", label: "Les", icon: GraduationCap, match: (p) => LESSON.some((x) => p.startsWith(x)) },
  { href: "/practice", label: "Oefenen", icon: Layers, match: (p) => PRACTICE.some((x) => p.startsWith(x)) },
  { href: "/tutor", label: "Tutor", icon: Sparkles, match: (p) => p.startsWith("/tutor") },
  { href: "/more", label: "Meer", icon: LayoutGrid, match: (p) => MORE.some((x) => p.startsWith(x)) },
];

export function Sidebar() {
  const path = usePathname() ?? "/";
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col gap-5 overflow-y-auto border-r border-[var(--line)] bg-[var(--card)] p-4">
      <Link href="/" className="flex items-center gap-3 px-2 py-1">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 font-extrabold text-white">NL</span>
        <span className="font-bold leading-tight">Nederlands<br /><span className="text-xs font-medium text-[var(--muted)]">B1 naar C1</span></span>
      </Link>
      {SIDEBAR.map((g) => (
        <div key={g.title}>
          <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{g.title}</div>
          {g.items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active(href) ? "bg-indigo-500/10 text-[var(--brand)]" : "hover:bg-[var(--bg)]"}`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  );
}

export function BottomTabs() {
  const path = usePathname() ?? "/";
  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--card)]/95 backdrop-blur pb-safe">
      <ul className="grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const on = match(path);
          return (
            <li key={href}>
              <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${on ? "text-[var(--brand)]" : "text-[var(--muted)]"}`}>
                <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${on ? "bg-indigo-500/12" : ""}`}><Icon size={22} strokeWidth={on ? 2.4 : 2} /></span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
