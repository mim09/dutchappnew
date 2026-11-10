import { saveOnboarding } from "./actions";

export default function Onboarding() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <form action={saveOnboarding} className="card w-full max-w-md space-y-4 !p-5">
        <div>
          <h1>Welkom</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Een paar vragen, dan maken we je dagplan. Je start op niveau B1.</p>
        </div>
        <label className="block space-y-1.5 text-sm font-medium">Naam
          <input name="display_name" required className="field" placeholder="Hoe moeten we je noemen?" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">Moedertaal
          <input name="native_language" required className="field" placeholder="Bijvoorbeeld Engels of Turks" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">Studietijd per dag
          <select name="daily_minutes" defaultValue="90" className="field">
            <option value="30">30 minuten</option>
            <option value="60">60 minuten</option>
            <option value="90">90 minuten</option>
            <option value="120">120 minuten</option>
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-medium">Doel
          <textarea name="goals" rows={3} className="field" placeholder="Wat wil je met Nederlands bereiken?" />
        </label>
        <button className="btn btn-primary w-full">Start op B1</button>
      </form>
    </main>
  );
}
