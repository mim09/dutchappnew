import { NextResponse, after } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { updateTutorMemory } from "@/lib/memory";

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = auth.user.id;

  const { sessionId, message } = await req.json();
  if (typeof sessionId !== "string" || !UUID.test(sessionId) || typeof message !== "string" || !message.trim() || message.length > 2000)
    return NextResponse.json({ error: "invalid input" }, { status: 400 });

  const [{ data: profile }, { data: mem }, { data: recent }, { data: history }] = await Promise.all([
    sb.from("profiles").select("native_language, current_level, goals").eq("id", uid).single(),
    sb.from("tutor_memory").select("summary, weaknesses, strengths").eq("user_id", uid).single(),
    sb.from("error_log").select("grammar_tag, learner_text, correction").eq("user_id", uid)
      .order("created_at", { ascending: false }).limit(15),
    sb.from("tutor_messages").select("role, content").eq("user_id", uid).eq("session_id", sessionId)
      .order("created_at", { ascending: true }).limit(40),
  ]);
  if ((history?.length ?? 0) >= 60) return NextResponse.json({ error: "session too long, start a new one" }, { status: 400 });

  const system = `Je bent de persoonlijke tutor Nederlands van een volwassen leerder (Nederlands van Nederland).
Niveau nu: ${profile?.current_level ?? "B1"}. Doel: ${profile?.goals || "vloeiend en natuurlijk Nederlands tot C1"}. Moedertaal: ${profile?.native_language || "onbekend"}.
Beantwoord vragen over Nederlands, leg grammatica uit, maak voorbeelden, simuleer gesprekken en maak extra oefeningen als de leerder erom vraagt.
Praat vooral Nederlands. Gebruik de moedertaal alleen voor lastige uitleg. Wees concreet en geef geen algemene feedback: verwijs naar de bekende fouten hieronder als dat helpt.
Leergeheugen: ${mem?.summary || "nog leeg"}
Zwakke punten: ${JSON.stringify(mem?.weaknesses ?? [])}. Sterke punten: ${JSON.stringify(mem?.strengths ?? [])}.
Recente fouten: ${JSON.stringify(recent ?? [])}.
Zeg eerlijk als je iets niet zeker weet. Beloof niet dat de leerder C1 haalt.`;

  const msgs = [...(history ?? []), { role: "user", content: message.trim() }] as { role: "user" | "assistant"; content: string }[];
  const res = await anthropic.messages.create({ model: MODEL, max_tokens: 1200, system, messages: msgs });
  const reply = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();

  await sb.from("tutor_messages").insert([
    { user_id: uid, session_id: sessionId, role: "user", content: message.trim() },
    { user_id: uid, session_id: sessionId, role: "assistant", content: reply },
  ]);

  const userCount = msgs.filter((m) => m.role === "user").length;
  if (userCount % 6 === 0) after(() => updateTutorMemory(sb, uid, sessionId).catch(() => null));

  return NextResponse.json({ reply });
}
