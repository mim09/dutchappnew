import { anthropic, MODEL } from "@/lib/anthropic";

import { sanitizeMemory, type TutorMemory } from "@/lib/memory-sanitize";

export async function updateTutorMemory(sb: any, userId: string, sessionId: string) {
  const [{ data: mem }, { data: msgs }] = await Promise.all([
    sb.from("tutor_memory").select("summary, weaknesses, strengths").eq("user_id", userId).single(),
    sb.from("tutor_messages").select("role, content").eq("user_id", userId).eq("session_id", sessionId)
      .order("created_at", { ascending: true }).limit(60),
  ]);
  if (!msgs?.length) return null;
  const current: TutorMemory = {
    summary: mem?.summary ?? "",
    weaknesses: Array.isArray(mem?.weaknesses) ? mem.weaknesses : [],
    strengths: Array.isArray(mem?.strengths) ? mem.strengths : [],
  };

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 900,
    system: `Je onderhoudt het leergeheugen van een Nederlandse taaltutor. Combineer het bestaande geheugen met het nieuwe gesprek.
Noteer alleen taalleerfeiten: terugkerende fouten, onderwerpen die de leerder moeilijk vindt, sterke punten, leerdoelen en wat al is uitgelegd.
Noteer geen gezondheids-, financiële of andere gevoelige persoonlijke gegevens.
Antwoord alleen met JSON: {"summary": string van maximaal 1200 tekens, "weaknesses": string[] maximaal 8, "strengths": string[] maximaal 8}.`,
    messages: [{ role: "user", content: `Bestaand geheugen: ${JSON.stringify(current)}\n\nNieuw gesprek:\n${msgs.map((m: any) => `${m.role}: ${m.content}`).join("\n")}` }],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").replace(/```json|```/g, "").trim();
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { return null; }
  const next = sanitizeMemory(parsed, current);
  await sb.from("tutor_memory").update({ ...next, updated_at: new Date().toISOString() }).eq("user_id", userId);
  return next;
}
