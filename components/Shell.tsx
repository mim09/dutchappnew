import { Suspense } from "react";
import { Sidebar, BottomTabs } from "./Nav";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Suspense fallback={null}><Sidebar /></Suspense>

      <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--line)] bg-[var(--card)]/90 px-4 pb-2 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-extrabold text-white">NL</span>
        <span className="font-bold">Nederlands</span>
      </header>

      <main className="min-w-0 px-4 pb-28 pt-5 md:ml-64 md:px-8 md:pb-10">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>

      <Suspense fallback={null}><BottomTabs /></Suspense>
    </div>
  );
}
