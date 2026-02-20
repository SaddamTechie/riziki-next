/**
 * Better Auth client — for use in Client Components.
 * On the server, use the `auth` instance from lib/auth/index.ts directly.
 */

import { createAuthClient } from "better-auth/react";
import { env } from "@/lib/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  updateUser,
  // Add more as needed (social providers, etc.)
} = authClient;
