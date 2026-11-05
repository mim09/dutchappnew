import Shell from "@/components/Shell";
import WritingForm from "@/components/WritingForm";

export default function Page() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold mb-4">Schrijven</h1>
      <WritingForm />
    </Shell>
  );
}
