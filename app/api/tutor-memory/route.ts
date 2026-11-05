import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { updateTutorMemory } from "@/lib/memory";

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { sessionId } = await req.json();
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId))
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  const next = await updateTutorMemory(sb, auth.user.id, sessionId);
  if (!next) return NextResponse.json({ error: "update failed" }, { status: 502 });
  return NextResponse.json(next);
}
