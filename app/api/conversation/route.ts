import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/anthropic";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { messages, scenario } = (await req.json()) as { messages: Msg[]; scenario: string };
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40)
    return NextResponse.json({ error: "invalid messages" }, { status: 400 });

  const { data: profile } = await sb.from("profiles").select("current_level").eq("id", auth.user.id).single();

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: `Je bent een gesprekspartner voor een Nederlandse taalleerder op niveau ${profile?.current_level ?? "B1"}.
Scenario: ${String(scenario).slice(0, 300)}.
Praat natuurlijk Nederlands zoals mensen in Nederland spreken, in 1 tot 3 korte zinnen. Stel maximaal één vraag per beurt.
Corrigeer de leerling niet tijdens het gesprek. Blijf in de rol van het scenario.`,
    messages: messages.slice(-20).map((m) => ({ role: m.role, content: String(m.content).slice(0, 1000) })),
  });
  const reply = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
  return NextResponse.json({ reply });
}
