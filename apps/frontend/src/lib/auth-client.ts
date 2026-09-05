import { createAuthClient } from "better-auth/react";

/** Client Better Auth cote frontend — parle au backend Express qui monte auth.handler sur /api/auth. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
