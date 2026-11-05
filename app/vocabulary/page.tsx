import { Suspense } from "react";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import VocabReview, { type Card } from "@/components/VocabReview";
import { supabaseServer } from "@/lib/supabase/server";

export default function Page() {
  return (
    <Shell>
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
  const { data } = await sb.from("user_vocab")
    .select("vocab_id, vocab_items(lemma, gloss_nl, example_nl, register, item_type)")
    .lte("due_at", new Date().toISOString()).order("due_at").limit(20);
  const cards: Card[] = (data ?? []).map((r: any) => ({ vocab_id: r.vocab_id, ...r.vocab_items }));
  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Woorden herhalen</h1>
      <VocabReview cards={cards} />
    </>
  );
}
