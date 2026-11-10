"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [t, setT] = useState("system");
  useEffect(() => { setT(localStorage.getItem("theme") ?? "system"); }, []);
  function choose(v: string) {
    setT(v); localStorage.setItem("theme", v);
    const dark = v === "dark" || (v === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }
  return (
    <div className="flex gap-2 text-sm">
      {["system", "light", "dark"].map((v) => (
        <button key={v} onClick={() => choose(v)}
          className={`btn btn-ghost !min-h-0 !py-1.5 ${t === v ? "!bg-[var(--brand)] !text-white !border-transparent" : ""}`}>{v}</button>
      ))}
    </div>
  );
}
