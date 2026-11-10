import { Suspense } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import RevisionPractice from "@/components/RevisionPractice";
import { requireUser } from "@/lib/auth";

export default function Page() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold mb-4">Herhalen</h1>
      <Suspense fallback={<Skeleton />}>
        <Due />
      </Suspense>
      <h2 className="text-lg font-semibold mt-8 mb-3">Oefeningen op maat</h2>
      <RevisionPractice />
    </Shell>
  );
}

async function Due() {
  const { sb } = await requireUser();
  const { count } = await sb.from("user_vocab").select("*", { count: "exact", head: true }).lte("due_at", new Date().toISOString());
  return <Link href="/vocabulary" className="underline text-sm">Woorden herhalen ({count ?? 0} klaar)</Link>;
}
