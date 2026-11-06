"use client";
import { useState } from "react";
import { deleteAccount } from "@/app/settings/actions";

export default function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true); setErr("");
    const r = await deleteAccount(text);
    if (r?.error) { setErr(r.error); setBusy(false); }
  }

  return (
    <div className="mt-10 max-w-md rounded border border-red-300 p-4 space-y-3">
      <h2 className="text-lg font-semibold">Account verwijderen</h2>
      <p className="text-sm">Hiermee verwijder je je account en al je gegevens definitief: profiel, lesvoortgang, woordenschat, schrijfteksten, gesprekken en tutorgeheugen. Dit kan niet ongedaan worden gemaakt.</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="rounded border border-red-600 text-red-700 px-4 py-2 text-sm">Account verwijderen</button>
      ) : (
        <div className="space-y-2">
          <label className="text-sm block">Typ VERWIJDER om te bevestigen</label>
          <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded border p-2 text-sm dark:bg-neutral-900" />
          <div className="flex gap-2">
            <button disabled={busy || !text.trim()} onClick={go} className="rounded bg-red-700 text-white px-4 py-2 text-sm disabled:opacity-40">
              {busy ? "Bezig..." : "Definitief verwijderen"}
            </button>
            <button onClick={() => { setOpen(false); setText(""); setErr(""); }} className="rounded border px-4 py-2 text-sm">Annuleren</button>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
      )}
    </div>
  );
}
