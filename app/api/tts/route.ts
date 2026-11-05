import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const VOICES: Record<string, string> = {
  fenna: "nl-NL-FennaNeural",
  colette: "nl-NL-ColetteNeural",
  maarten: "nl-NL-MaartenNeural",
};
const RATES: Record<string, string> = { slow: "-25%", normal: "0%", fast: "+20%" };

const esc = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { text, voice = "fenna", speed = "normal" } = await req.json();
  if (typeof text !== "string" || !text || text.length > 1000)
    return NextResponse.json({ error: "invalid text" }, { status: 400 });

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return NextResponse.json({ error: "speech not configured" }, { status: 500 });

  const ssml = `<speak version="1.0" xml:lang="nl-NL"><voice name="${VOICES[voice] ?? VOICES.fenna}"><prosody rate="${RATES[speed] ?? "0%"}">${esc(text)}</prosody></voice></speak>`;
  const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    body: ssml,
  });
  if (!r.ok) return NextResponse.json({ error: "tts failed", status: r.status }, { status: 502 });
  return new Response(r.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=86400" } });
}
