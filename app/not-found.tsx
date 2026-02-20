import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-8xl font-extrabold tracking-tight text-foreground/10">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t find what you were looking for. It may have moved or no
        longer exists.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            View all products
          </Link>
        </Button>
      </div>
    </div>
  );
}
