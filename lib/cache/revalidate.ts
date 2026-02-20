/**
 * Thin wrapper around Next.js `revalidateTag`.
 *
 * Next.js 16 changed the signature to require a second `profile` argument.
 * This helper defaults to the "default" cache profile so call sites don't
 * need to change.
 */
import { revalidateTag as _revalidateTag } from "next/cache";

export function revalidateTag(tag: string): void {
  _revalidateTag(tag, "default");
}
