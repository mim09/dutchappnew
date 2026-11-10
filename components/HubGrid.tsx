import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type HubItem = { href: string; label: string; hint: string; icon: LucideIcon; tint: string };

export default function HubGrid({ title, items, list = false }: { title: string; items: HubItem[]; list?: boolean }) {
  return (
    <div className="space-y-4">
      <h1>{title}</h1>
      <div className={list ? "space-y-3" : "grid grid-cols-2 gap-3"}>
        {items.map(({ href, label, hint, icon: Icon, tint }) => (
          <Link key={href} href={href}
            className={`card active:scale-[0.98] transition-transform ${list ? "flex items-center gap-4" : "block"}`}>
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tint} ${list ? "" : "mb-3"}`}><Icon size={24} /></span>
            <span>
              <span className="block font-semibold">{label}</span>
              <span className="mt-0.5 block text-xs leading-snug text-[var(--muted)]">{hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
