const SkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
    <div className="h-4 w-2/3 rounded bg-secondary" />
    <div className="mt-3 h-1.5 w-full rounded-full bg-secondary" />
    <div className="mt-3 space-y-2">
      <div className="h-3 w-full rounded bg-secondary" />
      <div className="h-3 w-4/5 rounded bg-secondary" />
    </div>
    <div className="mt-3 flex gap-2">
      <div className="h-5 w-12 rounded-full bg-secondary" />
      <div className="h-5 w-16 rounded-full bg-secondary" />
      <div className="h-5 w-20 rounded-full bg-secondary" />
    </div>
  </div>
);

export default SkeletonCard;
