'use client';

import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

// Re-export all essential Clerk hooks & components
export {
  UserButton,
  useUser,
  useAuth,
  useSignIn,
  useSignUp,
  useClerk,
  useSession,
} from "@clerk/nextjs";

/**
 * Renders children ONLY when the user is authenticated.
 */
export function SignedIn({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Renders children ONLY when the user is signed out.
 */
export function SignedOut({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return <>{children}</>;
}