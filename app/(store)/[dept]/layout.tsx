/**
 * Department layout — wraps all /[dept]/* pages.
 *
 * Responsibilities:
 *  1. Validate the URL segment is a real department; 404 otherwise.
 *  2. Mount <DepartmentSync> so Zustand + the cookie stay in sync on every
 *     dept-scoped page (home, products, etc.), not just the homepage.
 */

import { notFound } from "next/navigation";
import { DepartmentSync } from "@/components/store/header/department-sync";
import type { Department } from "@/lib/config/site";

const VALID_DEPTS: Department[] = ["men", "women", "beauty"];

export default async function DeptLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;

  if (!VALID_DEPTS.includes(dept as Department)) {
    notFound();
  }

  return (
    <>
      {/* Sync this dept into Zustand + cookie for mega menu / search bar */}
      <DepartmentSync dept={dept as Department} />
      {children}
    </>
  );
}
