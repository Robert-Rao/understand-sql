"use client";

interface Props {
  className?: string;
}

export default function Skeleton({ className = "" }: Props) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonSummary() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
      <Skeleton className="h-5 w-48" />
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonGraph() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-32" />
      </div>
      <Skeleton className="h-[500px] w-full rounded-none" />
    </div>
  );
}

export function SkeletonDetailPanel() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
      <div>
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div>
        <Skeleton className="h-3 w-16 mb-2" />
        <div className="space-y-1.5">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-3/4" />
        </div>
      </div>
      <div>
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

export function SkeletonBreakdown() {
  return (
    <div className="space-y-2.5">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-13 w-full" />
      ))}
    </div>
  );
}
