import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

/**
 * Not-found page for any route within the (store) layout group.
 * This means the 404 renders with the site header and footer.
 */
export default function StoreNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-heading text-8xl font-extrabold tracking-tight text-foreground/10">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
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
