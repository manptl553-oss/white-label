/**
 * AuthUI — React Auth Widget Renderer
 *
 * Renders the onboarding/auth UI inside the `<ChainItAuthProvider>` context.
 * Must be placed somewhere inside a `<ChainItAuthProvider>` subtree.
 *
 * @example
 * ```tsx
 * <ChainItAuthProvider session={{ getSession }}>
 *   <AuthUI initialScreen="signup" />
 * </ChainItAuthProvider>
 * ```
 */

import { OnboardingEntry } from "@/features/onboarding";
import { OnboardingScreen } from "@/features/onboarding/onboarding.enums";

// ── Screen mapping ───────────────────────────────────────────────────────────

/** Consumer-facing screen names — same values as the SDK's `SDKScreen` type. */
type AuthScreen = "signin" | "signup" | "face";

const SCREEN_MAP: Record<AuthScreen, OnboardingScreen> = {
  signin: OnboardingScreen.SignIn,
  signup: OnboardingScreen.SignUp,
  face: OnboardingScreen.FaceInstructions,
};

// ── Props ────────────────────────────────────────────────────────────────────

export interface AuthUIProps {
  /**
   * Deep-link the widget to a specific screen on first render.
   *
   * - `'signin'` — Sign-in screen (default)
   * - `'signup'` — Sign-up screen
   * - `'face'`   — Face liveness verification
   *
   * Omit to start at `'signin'`.
   */
  initialScreen?: AuthScreen;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AuthUI({ initialScreen }: AuthUIProps) {
  const resolvedScreen = initialScreen ? SCREEN_MAP[initialScreen] : undefined;

  return <OnboardingEntry initialScreen={resolvedScreen} />;
}
