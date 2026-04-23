/**
 * ChainItAuthProvider — React Component API
 *
 * Primary entry point for React applications.
 *
 * @example
 * ```tsx
 * import { ChainItAuthProvider, AuthUI } from '@blackinc/white-labeled-auth';
 *
 * <ChainItAuthProvider session={{ getSession }}>
 *   <AuthUI />
 * </ChainItAuthProvider>
 * ```
 */

import { type ReactNode, useEffect } from "react";
import { AuthRoot } from "./AuthRoot";
import { logger } from "@/core";
import type {
  SessionConfig,
  CallbacksConfig,
  SDKConfig,
} from "@/sdk/types";

export interface ChainItAuthProviderProps {
  session: SessionConfig;
  callbacks?: CallbacksConfig;
  config?: SDKConfig;
  children: ReactNode;
}

export function ChainItAuthProvider({
  session,
  callbacks,
  config,
  children,
}: ChainItAuthProviderProps) {
  useEffect(() => {
    if (config) {
      logger.debug("[ChainItAuth] SDK config:", config);
    }
  }, [config]);

  return (
    <AuthRoot session={session} callbacks={callbacks} config={config}>
      {children}
    </AuthRoot>
  );
}
