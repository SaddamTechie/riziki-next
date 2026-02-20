/**
 * Account layout — protected, sidebar navigation.
 * Redirects to sign-in if not authenticated.
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AccountSidebar } from "@/components/store/account/account-sidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in?callbackUrl=/account");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        <AccountSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
