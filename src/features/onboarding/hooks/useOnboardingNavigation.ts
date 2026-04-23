import { useMemo } from "react";

import { getActiveWhiteLabeledAuthClient, getWindow } from "@/core";
import {
  useFlowEngineContext,
  STORAGE_KEYS,
} from "@/features/onboarding/engine";

/**
 * Convenience hook that wraps the flow engine context.
 *
 * Screens should use this hook to navigate:
 * ```tsx
 * const { goTo, goBack } = useOnboardingNavigation();
 * ```
 *
 * The hook re-exports everything from `useFlowEngineContext` so that
 * existing screen code (`const { goTo } = useOnboardingNavigation()`)
 * continues to work without any changes.
 */
export function useOnboardingNavigation() {
  const { currentScreen, goTo, goBack, canGoBack, resolvedBackTarget } =
    useFlowEngineContext();

  return useMemo(
    () => ({
      screen: currentScreen,
      currentScreen,
      goTo,
      goBack,
      canGoBack,
      resolvedBackTarget,
    }),
    [currentScreen, goTo, goBack, canGoBack, resolvedBackTarget],
  );
}

/**
 * Imperative navigation from outside React (e.g. from a callback, iframe postMessage, etc.).
 * Dispatches a custom event that the flow engine listens for.
 */
export function navigateToStep(step: string) {
  const client = getActiveWhiteLabeledAuthClient();
  getWindow()?.dispatchEvent(
    new CustomEvent("hosted-auth-step", { detail: { step } }),
  );
  client.storage.setItem(client.getKey(STORAGE_KEYS.SCREEN), step);
}
