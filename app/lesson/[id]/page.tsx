import { Suspense } from "react";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import LessonPlayer, { type LessonData } from "@/components/LessonPlayer";
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
  const { data } = await sb.from("lessons").select("id, title, kind, body").eq("id", id).single();
  if (!data) notFound();
  return <LessonPlayer lesson={data as LessonData} />;
}
