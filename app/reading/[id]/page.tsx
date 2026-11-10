import { Suspense } from "react";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import ReadingPlayer, { type TextData } from "@/components/ReadingPlayer";
import { requireUser } from "@/lib/auth";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Shell>
      <Suspense fallback={<Skeleton />}>
        <Content params={params} />
      </Suspense>
    </Shell>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireUser();
  const { data } = await sb.from("texts").select("id, title, genre, content, questions").eq("id", id).single();
  if (!data) notFound();
  return <ReadingPlayer text={data as TextData} />;
}
