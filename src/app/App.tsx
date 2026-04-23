/**
 * OnboardingProvider — Legacy React Component
 *
 * @deprecated Use ChainItAuthProvider + AuthUI instead.
 */

import { type ReactNode } from "react";
import { AuthRoot } from "./AuthRoot";
import { OnboardingEntry } from "@/features/onboarding";
import type { WhiteLabeledAuthConfig } from "@/core";

export interface OnboardingProviderProps {
  config: WhiteLabeledAuthConfig;
  children?: ReactNode;
}

export default function OnboardingProvider({
  config,
  children,
}: OnboardingProviderProps) {
  if (!config) {
    throw new Error("OnboardingProvider requires a config object.");
  }

  const session = { getSession: config.getSession };
  const callbacks = {
    onSuccess: config.onComplete,
    onError: config.onError,
  };

  return (
    <AuthRoot session={session} callbacks={callbacks}>
      {children ?? <OnboardingEntry />}
    </AuthRoot>
  );
}
