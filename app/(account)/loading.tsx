import { Skeleton } from "@/components/ui/skeleton";

/** Shown while (account) pages are loading */
export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden w-52 shrink-0 space-y-2 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </aside>

        {/* Content skeleton */}
        <div className="flex-1 space-y-4">
          <Skeleton className="h-7 w-40" />
          <div className="rounded-xl border p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
