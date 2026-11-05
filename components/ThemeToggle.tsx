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
          className={`rounded border px-3 py-1 ${t === v ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}>{v}</button>
      ))}
    </div>
  );
}
