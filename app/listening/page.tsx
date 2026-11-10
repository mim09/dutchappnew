import { Suspense } from "react";
import Shell from "@/components/Shell";
import Skeleton from "@/components/Skeleton";
import ListeningLab, { type Line } from "@/components/ListeningLab";
import { requireUser } from "@/lib/auth";

export default function Page() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold mb-4">Luisteren</h1>
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </Shell>
  );
}

async function Content() {
  const { sb } = await requireUser();
  const { data } = await sb.from("lessons").select("title, body").eq("kind", "listening");
  const lines: Line[] = (data ?? []).flatMap((l: any) =>
    (l.body?.sections ?? []).filter((s: any) => s.type === "dialogue")
      .flatMap((s: any) => s.lines.map((x: any) => ({ speaker: x.speaker, voice: x.voice, text: x.text, lesson: l.title }))));
  return <ListeningLab lines={lines} />;
}
