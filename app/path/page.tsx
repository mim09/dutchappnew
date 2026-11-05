import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";

export default function Page() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold mb-4">Mijn leerpad</h1>
      <Suspense fallback={<p className="text-sm text-neutral-500">Laden...</p>}>
        <Content />
      </Suspense>
    </Shell>
  );
}

async function Content() {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const [{ data: levels }, { data: mods }, { data: done }, { data: profile }] = await Promise.all([
    sb.from("levels").select("code, position, objectives").order("position"),
    sb.from("modules").select("id, level_code, position, title, description, units(id, position, title, lessons(id, position, title, kind))").order("position"),
    sb.from("lesson_progress").select("lesson_id, score").eq("status", "completed"),
    sb.from("profiles").select("current_level").eq("id", auth.user.id).single(),
  ]);
  const score = new Map((done ?? []).map((d) => [d.lesson_id, d.score as number | null]));

  return (
    <div className="space-y-6 max-w-3xl">
      <p className="text-sm text-neutral-500">
        Je start op {profile?.current_level ?? "B1"}. Je gaat pas naar een hoger niveau na bewijs uit toetsen, niet na het afronden van lessen.
      </p>
      {(levels ?? []).map((lv: any) => {
        const m = (mods ?? []).filter((x: any) => x.level_code === lv.code);
        return (
          <section key={lv.code} className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
            <h2 className="text-lg font-semibold">{lv.code}</h2>
            <ul className="text-sm text-neutral-500 list-disc pl-5 mb-2">
              {(lv.objectives ?? []).map((o: string, i: number) => <li key={i}>{o}</li>)}
            </ul>
            {!m.length && <p className="text-sm text-neutral-500">Nog geen modules in deze versie.</p>}
            {m.map((mod: any) => (
              <div key={mod.id} className="mt-3">
                <h3 className="font-medium">{mod.title}</h3>
                {[...(mod.units ?? [])].sort((a: any, b: any) => a.position - b.position).map((u: any) => (
                  <div key={u.id} className="ml-3 mt-1">
                    <div className="text-sm text-neutral-500">{u.title}</div>
                    <ul className="ml-3 text-sm">
                      {[...(u.lessons ?? [])].sort((a: any, b: any) => a.position - b.position).map((l: any) => (
                        <li key={l.id} className="flex justify-between">
                          <Link href={`/lesson/${l.id}`} className="underline">{l.title}</Link>
                          <span className="text-neutral-500">
                            {score.has(l.id) ? `afgerond${score.get(l.id) != null ? ` (${Math.round((score.get(l.id) as number) * 100)}%)` : ""}` : l.kind}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
