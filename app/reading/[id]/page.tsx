import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Shell from "@/components/Shell";
import ReadingPlayer, { type TextData } from "@/components/ReadingPlayer";
import { supabaseServer } from "@/lib/supabase/server";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Shell>
      <Suspense fallback={<p className="text-sm text-neutral-500">Laden...</p>}>
        <Content params={params} />
      </Suspense>
    </Shell>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data } = await sb.from("texts").select("id, title, genre, content, questions").eq("id", id).single();
  if (!data) notFound();
  return <ReadingPlayer text={data as TextData} />;
}
