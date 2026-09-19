import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/** Client Better Auth cote frontend — parle au backend Express qui monte auth.handler sur /api/auth. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [adminClient()],
});
