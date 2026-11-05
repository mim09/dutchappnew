import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return NextResponse.json({ error: "speech not configured" }, { status: 500 });

  const audio = await req.arrayBuffer();
  if (audio.byteLength < 2000 || audio.byteLength > 2_000_000)
    return NextResponse.json({ error: "audio must be between 0.1 and 60 seconds" }, { status: 400 });

  const r = await fetch(
    `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=nl-NL&format=detailed`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        Accept: "application/json",
      },
      body: audio,
    }
  );
  if (!r.ok) return NextResponse.json({ error: "stt failed", status: r.status }, { status: 502 });
  const j = await r.json();
  if (j.RecognitionStatus !== "Success") return NextResponse.json({ text: "", confidence: 0, status: j.RecognitionStatus });
  const best = j.NBest?.[0];
  return NextResponse.json({ text: best?.Display ?? j.DisplayText ?? "", confidence: best?.Confidence ?? null });
}
