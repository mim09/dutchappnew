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
    <div className="mt-10 max-w-md card !border-red-300 space-y-3">
      <h2 className="text-lg font-semibold">Account verwijderen</h2>
      <p className="text-sm">Hiermee verwijder je je account en al je gegevens definitief: profiel, lesvoortgang, woordenschat, schrijfteksten, gesprekken en tutorgeheugen. Dit kan niet ongedaan worden gemaakt.</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn btn-ghost !border-red-600 !text-red-700">Account verwijderen</button>
      ) : (
        <div className="space-y-2">
          <label className="text-sm block">Typ VERWIJDER om te bevestigen</label>
          <input value={text} onChange={(e) => setText(e.target.value)} className="w-full field" />
          <div className="flex gap-2">
            <button disabled={busy || !text.trim()} onClick={go} className="btn !bg-red-700 text-white">
              {busy ? "Bezig..." : "Definitief verwijderen"}
            </button>
            <button onClick={() => { setOpen(false); setText(""); setErr(""); }} className="btn btn-ghost">Annuleren</button>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
      )}
    </div>
  );
}
