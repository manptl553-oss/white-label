import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useWhiteLabeledAuthClient, type WhiteLabeledAuthClient } from "@/core";
import { logger } from "@/core/logger";
import { OnboardingScreen } from "@/features/onboarding/onboarding.enums";

import { ONBOARDING_STEPS, STORAGE_KEYS } from "./flow.config";
import type { FlowEngineActions } from "./flow.types";
import type { OnboardingStep } from "../api";

// ── Helpers ─────────────────────────────────────────────────

const ALL_SCREEN_VALUES = Object.values(OnboardingScreen);

const isValidScreen = (value: string | null): value is OnboardingScreen =>
  !!value && ALL_SCREEN_VALUES.includes(value as OnboardingScreen);

/**
 * Resolve input to a screen.
 * - goTo(OnboardingScreen.Terms) → TermsScreen (direct)
 * - goTo("terms") → FaceInstructionsScreen (next after terms)
 * - goTo("face") → IdScanInstructionsScreen (next after face)
 */
const resolveStep = (step: OnboardingStep): OnboardingScreen | null => {
  const normalized = step.toLowerCase();
  const found = ONBOARDING_STEPS.find(
    (s) => s.step?.toLowerCase() === normalized,
  );
  return found?.screen ?? null;
};

/** Persist the current screen to storage. */
const saveScreen = (
  client: WhiteLabeledAuthClient,
  screen: OnboardingScreen,
): void => {
  client.storage.setItem(client.getKey(STORAGE_KEYS.SCREEN), screen);
};

// ── Context ─────────────────────────────────────────────────
const FlowEngineContext = createContext<FlowEngineActions | null>(null);

export function FlowEngineProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FlowEngineActions;
}) {
  return (
    <FlowEngineContext.Provider value={value}>
      {children}
    </FlowEngineContext.Provider>
  );
}

/**
 * Access the flow engine from any child component.
 * Throws if used outside `<FlowEngineProvider>`.
 */
export function useFlowEngineContext(): FlowEngineActions {
  const ctx = useContext(FlowEngineContext);
  if (!ctx) {
    throw new Error(
      "useFlowEngineContext must be used within <FlowEngineProvider>.",
    );
  }
  return ctx;
}

// ── Core Hook ───────────────────────────────────────────────

/**
 * Central flow engine hook.
 *
 * Manages the current screen and an internal history stack for
 * UI-driven back-navigation (e.g. the Header back button).
 *
 * The SDK does NOT interact with the browser history at all.
 * Browser back/forward events are completely ignored so that they
 * propagate naturally to the consumer application.
 */
export function useFlowEngine(
  initialScreen?: OnboardingScreen,
): FlowEngineActions {
  const client = useWhiteLabeledAuthClient();

  // ── Initialise from initialScreen → storage → default ─────
  const [currentScreen, setCurrentScreen] = useState<OnboardingScreen>(() => {
    // If SDK provides a deep-link screen, use it
    if (initialScreen) return initialScreen;
    // Otherwise try to restore from storage
    const stored = client.storage.getItem(client.getKey(STORAGE_KEYS.SCREEN));
    return isValidScreen(stored) ? stored : OnboardingScreen.SignIn;
  });

  // Internal history stack used only by the UI back button (Header).
  const [history, setHistory] = useState<OnboardingScreen[]>([]);

  // ── goTo ──────────────────────────────────────────────────
  const goTo = useCallback(
    ({
      step,
      screen,
    }: {
      step?: OnboardingStep;
      screen?: OnboardingScreen;
    }) => {
      if (screen) {
        saveScreen(client, screen);
        client.config.onStepChange?.(screen);
        setCurrentScreen(screen);
        return;
      }

      if (!step) {
        logger.error("step not found");
        return;
      }

      const next = resolveStep(step);
      if (!next) {
        logger.error("next not found");
        return;
      }

      saveScreen(client, next);
      client.config.onStepChange?.(typeof step === "string" ? step : next);

      setCurrentScreen((prev) => {
        if (prev === next) return prev;
        setHistory((h) => [...h, prev]);
        return next;
      });
    },
    [client],
  );

  // ── goBack ────────────────────────────────────────────────
  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const newHistory = [...h];
      const prev = newHistory.pop();
      if (prev) {
        saveScreen(client, prev);
        client.config.onStepChange?.(prev);
        setCurrentScreen(prev);
      }
      return newHistory;
    });
  }, [client]);

  const canGoBack = history.length > 0;

  // ── External step navigation via custom event ─────────────
  // Allows non-React code (Axios interceptors, imperative utils) to
  // trigger navigation by dispatching:
  //   new CustomEvent("hosted-auth-step", { detail: { step } })
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const step = (e as CustomEvent<{ step: string }>).detail?.step;
      if (step) goTo({ step: step as OnboardingStep });
    };
    window.addEventListener("hosted-auth-step", handler);
    return () => window.removeEventListener("hosted-auth-step", handler);
  }, [goTo]);

  // ── Resolved back target from config ─────────────────────
  // Look up the current screen's `backScreen` from the step config.
  // This drives the Header's back-arrow behaviour without any
  // per-screen wiring.
  const resolvedBackTarget = useMemo(() => {
    const def = ONBOARDING_STEPS.find((s) => s.screen === currentScreen);
    return def && "backScreen" in def ? def.backScreen : undefined;
  }, [currentScreen]);

  return useMemo(
    () => ({ currentScreen, goTo, goBack, canGoBack, resolvedBackTarget }),
    [currentScreen, goTo, goBack, canGoBack, resolvedBackTarget],
  );
}
