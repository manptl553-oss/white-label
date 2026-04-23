import type { ComponentType } from "react";

import type { OnboardingScreen } from "@/features/onboarding/enums";
import type { OnboardingStep } from "../api";

// ── Step Definition ─────────────────────────────────────────
/**
 * A single step in the onboarding flow.
 *
 * @property screen    - Unique screen identifier from the enum.
 * @property step      - API step key (used by the backend to signal progress). `null` for entry screens.
 * @property priority  - Numeric order; higher = later in the flow.
 * @property component - React component rendered for this step.
 * @property condition - Optional guard: return `false` to skip this step.
 */
export interface StepDefinition {
  readonly screen: OnboardingScreen;
  readonly step: OnboardingStep | null;
  readonly priority: number;
  readonly component: ComponentType;
  readonly condition?: (ctx: FlowContext) => boolean;
  /**
   * Controls the back-arrow behaviour for this screen.
   * - `undefined`  → use the generic history stack (`goBack()`)
   * - `false`      → hide the back arrow entirely (e.g. Success)
   * - screen value → always navigate to that specific screen
   */
  readonly backScreen?: OnboardingScreen | false;
}

// ── Flow Context ────────────────────────────────────────────
/**
 * Runtime context available to step conditions and the flow engine.
 * Extend this as you add conditional step logic (e.g. user country, plan type).
 */
export interface FlowContext {
  /** Steps the user has already completed (by screen key). */
  completedSteps: Set<OnboardingScreen>;
}

// ── Flow Engine State ───────────────────────────────────────
export interface FlowEngineState {
  /** The currently active screen. */
  currentScreen: OnboardingScreen;
  /** Stack of previously visited screens (for back navigation). */
  history: OnboardingScreen[];
}

// ── Flow Engine Actions ─────────────────────────────────────
export interface FlowEngineActions {
  /** Navigate to a specific screen. Pushes the current screen onto history. */
  goTo: (_: { screen?: OnboardingScreen; step?: OnboardingStep }) => void;
  /** Navigate back to the previous screen. No-op if at the start. */
  goBack: () => void;
  /** Whether back navigation is possible. */
  canGoBack: boolean;
  /** The currently active screen. */
  currentScreen: OnboardingScreen;
  /**
   * Resolved back target for the current screen, derived from `flow.config.ts`.
   * - `false`           → hide the back arrow entirely
   * - `OnboardingScreen` → navigate to that specific screen on back
   * - `undefined`       → use the generic history stack (`goBack()`)
   */
  resolvedBackTarget: OnboardingScreen | false | undefined;
}
