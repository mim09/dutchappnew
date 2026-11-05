import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Shell from "@/components/Shell";
import AssessmentRunner, { type Item } from "@/components/AssessmentRunner";
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
  const { data } = await sb.from("assessments").select("id, items").eq("id", id).single();
  if (!data) notFound();
  // answers and explanations stay on the server
  const items = (data.items as any[]).map((it): Item =>
    it.kind === "mcq" ? { kind: "mcq", prompt: it.prompt, options: it.options }
    : it.kind === "gap" ? { kind: "gap", prompt: it.prompt }
    : { kind: "dictation", text: it.text, voice: it.voice });
  return (
    <>
      <h1 className="text-2xl font-semibold mb-1">Niveautoets</h1>
      <p className="text-sm text-neutral-500 mb-4">Je ziet de antwoorden pas na het inleveren. Gebruik geen hulpmiddelen.</p>
      <AssessmentRunner id={data.id} items={items} />
    </>
  );
}
