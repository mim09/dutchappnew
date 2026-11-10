import { Suspense } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import { requireUser } from "@/lib/auth";

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
  const { sb } = await requireUser();
  const { data } = await sb.from("texts").select("id, title, genre, level_code, register").order("level_code");
  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Lezen</h1>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded">
        {(data ?? []).map((t) => (
          <li key={t.id} className="p-3 flex justify-between text-sm">
            <Link href={`/reading/${t.id}`} className="underline">{t.title}</Link>
            <span className="text-neutral-500">{t.level_code} · {t.genre} · {t.register}</span>
          </li>
        ))}
        {!data?.length && <li className="p-3 text-sm">Nog geen teksten. Voer 003_seed_reading.sql uit.</li>}
      </ul>
    </>
  );
}
