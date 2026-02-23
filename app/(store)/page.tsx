import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSiteConfig } from "@/lib/config/site";

// ─── Page — redirects to the active department homepage ─────────────────────
// All content lives at /[dept]/* (men, women, beauty)

export default async function RootPage() {
  const config = await getSiteConfig();
  const VALID = config.activeDepartments;
  const cookieDept = (await cookies()).get("riziki_dept")?.value;
  const dept =
    cookieDept && VALID.includes(cookieDept as never)
      ? cookieDept
      : (VALID[0] ?? "men");
  redirect(`/${dept}`);
}
