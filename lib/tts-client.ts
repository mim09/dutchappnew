const cache = new Map<string, string>();

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const now = speechSynthesis.getVoices();
    if (now.length) return resolve(now);
    const t = setTimeout(() => resolve(speechSynthesis.getVoices()), 1500);
    speechSynthesis.addEventListener("voiceschanged", () => { clearTimeout(t); resolve(speechSynthesis.getVoices()); }, { once: true });
  });
}

// Only nl-NL voices count. Belgian voices have the wrong accent for Netherlands Dutch.
export function pickDutchVoice(voices: { name: string; lang: string }[], hint: string) {
  const nl = voices.filter((v) => v.lang.replace("_", "-").toLowerCase() === "nl-nl");
  if (!nl.length) return null;
  const byName = nl.find((v) => v.name.toLowerCase().includes(hint.toLowerCase()));
  if (byName) return byName;
  const good = nl.filter((v) => /natural|online|neural|google/i.test(v.name));
  return good[0] ?? nl[0];
}

async function speakBrowser(text: string, speed: string, voiceHint: string): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) throw new Error("no-speech-support");
  const voice = pickDutchVoice(await loadVoices(), voiceHint);
  if (!voice) throw new Error("no-dutch-voice");
  await new Promise<void>((resolve, reject) => {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice as SpeechSynthesisVoice;
    u.lang = "nl-NL";
    u.rate = speed === "slow" ? 0.75 : speed === "fast" ? 1.2 : 1;
    u.onend = () => resolve();
    u.onerror = () => reject(new Error("speech-failed"));
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });
}

// Uses Azure through /api/tts when configured. Falls back to a Dutch (nl-NL) browser voice.
export async function playTts(text: string, voice = "fenna", speed = "normal"): Promise<void> {
  const key = `${voice}|${speed}|${text}`;
  let url = cache.get(key);
  if (!url) {
    try {
      const r = await fetch("/api/tts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, speed }),
      });
      if (!r.ok) throw new Error(`tts ${r.status}`);
      url = URL.createObjectURL(await r.blob());
      cache.set(key, url);
    } catch {
      return speakBrowser(text, speed, voice);
    }
  }
  const audio = new Audio(url);
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("playback-failed"));
    audio.play().catch(reject);
  });
}
