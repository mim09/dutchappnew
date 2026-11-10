import { Suspense } from "react";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import VocabReview, { type Card } from "@/components/VocabReview";
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
