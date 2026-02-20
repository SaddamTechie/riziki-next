import { Skeleton } from "@/components/ui/skeleton";

/** Shown while checkout page is loading */
export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-7 w-32" />
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Form skeleton */}
        <div className="space-y-6 lg:col-span-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-4">
              <Skeleton className="h-5 w-36" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ))}
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Summary skeleton */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-5 space-y-4">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
