import Link from "next/link";

const NAV: { href: string; label: string; built: boolean }[] = [
  { href: "/", label: "Dashboard", built: true },
  { href: "/today", label: "Today's lesson", built: true },
  { href: "/path", label: "My learning path", built: true },
  { href: "/listening", label: "Listening", built: true },
  { href: "/speaking", label: "Speaking", built: true },
  { href: "/reading", label: "Reading", built: true },
  { href: "/writing", label: "Writing", built: true },
  { href: "/grammar", label: "Grammar", built: true },
  { href: "/vocabulary", label: "Vocabulary", built: true },
  { href: "/tutor", label: "AI tutor", built: true },
  { href: "/revision", label: "Revision", built: true },
  { href: "/assessments", label: "Assessments", built: true },
  { href: "/progress", label: "Progress", built: true },
  { href: "/settings", label: "Settings", built: true },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <nav className="md:w-56 md:min-h-screen border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 p-3">
        <ul className="flex md:block gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <li key={n.href} className="shrink-0">
              {n.built ? (
                <Link href={n.href} className="block rounded px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900">
                  {n.label}
                </Link>
              ) : (
                <span className="block rounded px-3 py-2 text-sm text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
                  {n.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-6 max-w-4xl">{children}</main>
    </div>
  );
}
