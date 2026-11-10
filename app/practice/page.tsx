import Shell from "@/components/Shell";
import HubGrid from "@/components/HubGrid";
import { Headphones, Mic, BookOpen, PenLine, Puzzle, Layers, RefreshCw } from "lucide-react";

export default function Page() {
  return (
    <Shell>
      <HubGrid title="Oefenen" items={[
        { href: "/listening", label: "Luisteren", hint: "Dialogen, dictee en klankparen", icon: Headphones, tint: "bg-sky-500/15 text-sky-600" },
        { href: "/speaking", label: "Spreken", hint: "Rollenspel met een gesprekspartner", icon: Mic, tint: "bg-rose-500/15 text-rose-600" },
        { href: "/reading", label: "Lezen", hint: "Teksten met vragen en woordenlijst", icon: BookOpen, tint: "bg-amber-500/15 text-amber-600" },
        { href: "/writing", label: "Schrijven", hint: "Krijg je tekst gecorrigeerd", icon: PenLine, tint: "bg-emerald-500/15 text-emerald-600" },
        { href: "/grammar", label: "Grammatica", hint: "Lessen en je terugkerende fouten", icon: Puzzle, tint: "bg-teal-500/15 text-teal-600" },
        { href: "/vocabulary", label: "Woordenschat", hint: "Woorden herhalen met kaartjes", icon: Layers, tint: "bg-violet-500/15 text-violet-600" },
        { href: "/revision", label: "Herhalen", hint: "Oefeningen op je zwakke punten", icon: RefreshCw, tint: "bg-indigo-500/15 text-indigo-600" },
      ]} />
    </Shell>
  );
}
