"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const sb = supabaseBrowser();
    const { error } = mode === "login"
      ? await sb.auth.signInWithPassword({ email, password })
      : await sb.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-b from-indigo-600 via-indigo-600 to-violet-700 px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-extrabold backdrop-blur">NL</div>
          <h1 className="text-3xl">Nederlands</h1>
          <p className="mt-1 text-sm text-white/80">Van B1 naar C1, elke dag een stap</p>
        </div>
        <form onSubmit={submit} className="card space-y-3 !p-5">
          <h2 className="text-lg">{mode === "login" ? "Inloggen" : "Account maken"}</h2>
          <input className="field" type="email" required autoComplete="email" placeholder="E-mailadres" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="field" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="Wachtwoord (minimaal 8 tekens)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="rounded-xl bg-red-500/10 p-2.5 text-sm text-red-600">{error}</p>}
          <button disabled={busy} className="btn btn-primary w-full">{busy ? "Bezig..." : mode === "login" ? "Inloggen" : "Registreren"}</button>
          <button type="button" className="w-full py-1 text-sm font-medium text-[var(--brand)]" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Nog geen account? Registreer" : "Al een account? Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
