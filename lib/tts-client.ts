const cache = new Map<string, string>();

function speakBrowser(text: string, speed: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return reject(new Error("no speech support"));
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "nl-NL";
    u.rate = speed === "slow" ? 0.75 : speed === "fast" ? 1.2 : 1;
    const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("nl"));
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => reject(new Error("speech failed"));
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });
}

// Uses Azure through /api/tts when configured. Falls back to the free browser voice.
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
      return speakBrowser(text, speed);
    }
  }
  const audio = new Audio(url);
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("playback failed"));
    audio.play().catch(reject);
  });
}
