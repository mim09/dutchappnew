import { Suspense } from "react";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import ListeningLab, { type Line } from "@/components/ListeningLab";
import { supabaseServer } from "@/lib/supabase/server";

export default function Page() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold mb-4">Luisteren</h1>
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
  const { data } = await sb.from("lessons").select("title, body").eq("kind", "listening");
  const lines: Line[] = (data ?? []).flatMap((l: any) =>
    (l.body?.sections ?? []).filter((s: any) => s.type === "dialogue")
      .flatMap((s: any) => s.lines.map((x: any) => ({ speaker: x.speaker, voice: x.voice, text: x.text, lesson: l.title }))));
  return <ListeningLab lines={lines} />;
}
