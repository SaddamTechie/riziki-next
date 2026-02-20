"use client";

import { ErrorPage } from "@/components/ui/error-page";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      backLabel="Back to account"
      backHref="/account"
    />
  );
}
