export default function SkeletonCard() {
  return (
    <div className="bg-white border border-surface-200 rounded-xl p-5 sm:p-6 animate-skeleton shadow-sm">
      <div className="flex justify-between mb-4">
        <div className="w-[60%] h-5 rounded-md bg-primary-50" />
        <div className="w-20 h-6 rounded-full bg-primary-50" />
      </div>
      <div className="w-[35%] h-4 rounded-md bg-surface-100 mb-5" />
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 h-14 rounded-lg bg-primary-50/50" />
        <div className="flex-1 h-14 rounded-lg bg-primary-50/50" />
        <div className="flex-1 h-14 rounded-lg bg-primary-50/50" />
      </div>
    </div>
  );
}