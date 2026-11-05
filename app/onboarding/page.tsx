import { saveOnboarding } from "./actions";

export default function Onboarding() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <form action={saveOnboarding} className="w-full max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Welkom</h1>
        <input name="display_name" required placeholder="Naam" className="w-full rounded border p-2 dark:bg-neutral-900" />
        <input name="native_language" required placeholder="Moedertaal" className="w-full rounded border p-2 dark:bg-neutral-900" />
        <select name="daily_minutes" defaultValue="90" className="w-full rounded border p-2 dark:bg-neutral-900">
          <option value="30">30 minuten per dag</option>
          <option value="60">60 minuten per dag</option>
          <option value="90">90 minuten per dag</option>
          <option value="120">120 minuten per dag</option>
        </select>
        <textarea name="goals" placeholder="Wat wil je met Nederlands bereiken?" className="w-full rounded border p-2 dark:bg-neutral-900" />
        <button className="w-full rounded bg-black text-white p-2 dark:bg-white dark:text-black">Start op B1</button>
      </form>
    </main>
  );
}
