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
    setBusy(true);
    setError("");
    const sb = supabaseBrowser();
    const { error } =
      mode === "login"
        ? await sb.auth.signInWithPassword({ email, password })
        : await sb.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-semibold">
          {mode === "login" ? "Inloggen" : "Account maken"}
        </h1>
        <input className="w-full rounded border p-2 dark:bg-neutral-900" type="email" required
          placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-2 dark:bg-neutral-900" type="password" required minLength={8}
          placeholder="Wachtwoord (min. 8 tekens)" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-black text-white p-2 dark:bg-white dark:text-black">
          {busy ? "Bezig..." : mode === "login" ? "Inloggen" : "Registreren"}
        </button>
        <button type="button" className="text-sm underline"
          onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Nog geen account? Registreer" : "Al een account? Log in"}
        </button>
      </form>
    </main>
  );
}
