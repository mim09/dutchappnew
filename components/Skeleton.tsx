export default function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Laden">
      <div className="h-8 w-1/2 rounded-xl bg-[var(--line)]" />
      <div className="h-36 rounded-3xl bg-[var(--line)]" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 rounded-2xl bg-[var(--line)]" />
        <div className="h-20 rounded-2xl bg-[var(--line)]" />
        <div className="h-20 rounded-2xl bg-[var(--line)]" />
      </div>
      <div className="h-48 rounded-2xl bg-[var(--line)]" />
    </div>
  );
}
