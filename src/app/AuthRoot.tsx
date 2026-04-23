/**
 * AuthRoot — Unified Internal Component
 *
 * Single source of truth for rendering the auth flow.
 * Used by:
 * - ChainItAuthProvider (React API)
 * - SDK renderer (ChainItAuth.render())
 *
 * @internal
 */

import { useMemo, useEffect, type ReactNode } from "react";
import { Amplify } from "aws-amplify";

import { QueryProvider } from "@/app/providers/QueryProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { OnboardingConfigProvider } from "@/lib/auth";
import { ToastProvider } from "@/components";
import { OnboardingEntry } from "@/features/onboarding";
import {
  createWhiteLabeledAuthClient,
  type WhiteLabeledAuthClient,
  logger,
} from "@/core";
import type {
  SessionConfig,
  CallbacksConfig,
  SDKConfig,
} from "@/sdk/types";
import type { StoredTokens } from "@/lib/auth/tokenStorage";

function createClient(
  session: SessionConfig,
  callbacks?: CallbacksConfig,
): WhiteLabeledAuthClient {
  if (!session?.getSession) {
    throw new Error(
      "[ChainItAuth] session.getSession is required — a function returning Promise<{ sessionId, sessionSignature }>",
    );
  }

  return createWhiteLabeledAuthClient({
    getSession: session.getSession,
    ...(callbacks?.onSuccess && {
      onComplete: (tokens: StoredTokens) => {
        callbacks.onSuccess!({
          accessToken: tokens.accessToken,
          idToken: tokens.idToken ?? "",
          refreshToken: tokens.refreshToken,
        });
      },
    }),
    ...(callbacks?.onError && { onError: callbacks.onError }),
  });
}

export interface AuthRootProps {
  session: SessionConfig;
  callbacks?: CallbacksConfig;
  config?: SDKConfig;
  theme?: WhiteLabeledAuthClient["config"]["theme"];
  children?: ReactNode;
  renderOnboardingEntry?: boolean;
  wrapInContainer?: boolean;
}

export function AuthRoot({
  session,
  callbacks,
  config,
  theme,
  children,
  renderOnboardingEntry = false,
  wrapInContainer = false,
}: AuthRootProps) {
  const resolvedClient = useMemo(
    () => createClient(session, callbacks),
    [session, callbacks],
  );

  useEffect(() => {
    if (resolvedClient.config.amplify?.config) {
      Amplify.configure(resolvedClient.config.amplify.config);
    }
  }, [resolvedClient]);

  useEffect(() => {
    if (config) {
      logger.debug("[ChainItAuth] SDK config:", config);
    }
  }, [config]);

  const content = (
    <QueryProvider>
      <OnboardingConfigProvider client={resolvedClient}>
        <ThemeProvider theme={theme ?? resolvedClient.config.theme}>
          <ToastProvider>
            {renderOnboardingEntry ? <OnboardingEntry /> : children}
          </ToastProvider>
        </ThemeProvider>
      </OnboardingConfigProvider>
    </QueryProvider>
  );

  if (wrapInContainer) {
    return <div data-chainit-sdk="">{content}</div>;
  }

  return content;
}
