import Shell from "@/components/Shell";
import TutorChat from "@/components/TutorChat";

export default function Page() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold mb-4">AI-tutor</h1>
      <TutorChat />
    </Shell>
  );
}
