"use client";
import { useState } from "react";
import { playTts } from "@/lib/tts-client";

export default function AudioButton({
  text, voice = "fenna", label = "Afspelen", showSpeed = false,
}: { text: string; voice?: string; label?: string; showSpeed?: boolean }) {
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function play() {
    setState("loading");
    try {
      await playTts(text, voice, speed);
      setState("idle");
    } catch (e) {
      setMsg(e instanceof Error && e.message === "no-dutch-voice"
        ? "Geen Nederlandse stem op dit apparaat. Gebruik Microsoft Edge of voeg Nederlands toe in de taalinstellingen."
        : "Audio niet beschikbaar");
      setState("error");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={play} disabled={state === "loading"}
        className="btn btn-ghost !min-h-0 !px-3 !py-1.5 !text-xs">
        {state === "loading" ? "Laden..." : label}
      </button>
      {showSpeed && (
        <select value={speed} onChange={(e) => setSpeed(e.target.value as typeof speed)}
          className="field !w-auto !py-1 !text-xs">
          <option value="slow">Langzaam</option>
          <option value="normal">Normaal</option>
          <option value="fast">Snel</option>
        </select>
      )}
      {state === "error" && <span className="text-xs text-red-600">{msg}</span>}
    </span>
  );
}
