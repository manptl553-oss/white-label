import { useMemo, type ReactNode } from "react";

import {
  WhiteLabeledAuthClientProvider,
  createWhiteLabeledAuthClient,
  useWhiteLabeledAuthClient,
  type WhiteLabeledAuthClient,
  type WhiteLabeledAuthConfig,
} from "@/core";

export type OnboardingConfig = WhiteLabeledAuthConfig;

export function useOnboardingConfig() {
  const client = useWhiteLabeledAuthClient();
  return { config: client.config, client };
}

interface OnboardingConfigProviderProps {
  children: ReactNode;
  config?: OnboardingConfig;
  client?: WhiteLabeledAuthClient;
}

export function OnboardingConfigProvider({
  children,
  config,
  client,
}: OnboardingConfigProviderProps) {
  const resolvedClient = useMemo(
    () => client ?? (config ? createWhiteLabeledAuthClient(config) : null),
    [client, config],
  );

  if (!resolvedClient) {
    throw new Error(
      "OnboardingConfigProvider requires either a config object or a pre-created client.",
    );
  }

  return (
    <WhiteLabeledAuthClientProvider client={resolvedClient}>
      {children}
    </WhiteLabeledAuthClientProvider>
  );
}
