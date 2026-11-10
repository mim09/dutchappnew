import Shell from "@/components/Shell";
import HubGrid from "@/components/HubGrid";
import { Route, ClipboardCheck, TrendingUp, Settings, Shield } from "lucide-react";

export default function Page() {
  return (
    <Shell>
      <HubGrid list title="Meer" items={[
        { href: "/path", label: "Leerpad", hint: "Alle niveaus, modules en lessen", icon: Route, tint: "bg-indigo-500/15 text-indigo-600" },
        { href: "/assessments", label: "Toetsen", hint: "Niveautoets en eerdere resultaten", icon: ClipboardCheck, tint: "bg-orange-500/15 text-orange-600" },
        { href: "/progress", label: "Voortgang", hint: "Studietijd, woorden en zwakke punten", icon: TrendingUp, tint: "bg-emerald-500/15 text-emerald-600" },
        { href: "/settings", label: "Instellingen", hint: "Profiel, thema en account", icon: Settings, tint: "bg-slate-500/15 text-slate-600" },
        { href: "/privacy", label: "Privacyverklaring", hint: "Welke gegevens we bewaren", icon: Shield, tint: "bg-sky-500/15 text-sky-600" },
      ]} />
    </Shell>
  );
}
