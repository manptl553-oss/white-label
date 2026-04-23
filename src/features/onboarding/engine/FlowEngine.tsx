import { useMemo } from "react";

import { ONBOARDING_STEPS } from "./flow.config";
import { FlowEngineProvider, useFlowEngine } from "./useFlowEngine";
import type { OnboardingScreen } from "@/features/onboarding/enums";

interface FlowEngineProps {
  /** Optional initial screen override for SDK deep-linking. */
  initialScreen?: OnboardingScreen;
}

// ── Flow Engine Renderer ────────────────────────────────────
/**
 * Renders the current onboarding step based on the flow engine state.
 *
 * This component:
 * 1. Runs the flow engine hook (state, history, popstate).
 * 2. Resolves the active screen to its registered component.
 * 3. Wraps children in `FlowEngineProvider` so any descendant can
 *    call `useFlowEngineContext()` to access `goTo` / `goBack`.
 */
export function FlowEngine({ initialScreen }: FlowEngineProps) {
  const engine = useFlowEngine(initialScreen);
  const ScreenComponent = useMemo(() => {
    const step = ONBOARDING_STEPS.find(
      (s) => s.screen === engine.currentScreen,
    );
    return step?.component ?? ONBOARDING_STEPS[0].component;
  }, [engine.currentScreen]);

  return (
    <FlowEngineProvider value={engine}>
      <ScreenComponent />
    </FlowEngineProvider>
  );
}
