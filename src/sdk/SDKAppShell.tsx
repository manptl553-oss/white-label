/**
 * SDKAppShell — SDK React Renderer
 * @internal
 * Used by: ChainItAuth.render()
 */

import { AuthRoot } from "@/app/AuthRoot";
import { OnboardingEntry } from "@/features/onboarding";
import { OnboardingScreen } from "@/features/onboarding/onboarding.enums";
import type { ChainItAuthOptions, SDKScreen } from "./types";

const SCREEN_MAP: Record<SDKScreen, OnboardingScreen> = {
  signin: OnboardingScreen.SignIn,
  signup: OnboardingScreen.SignUp,
  face: OnboardingScreen.FaceInstructions,
};

export interface SDKAppShellProps {
  options: ChainItAuthOptions;
  initialScreen?: SDKScreen;
}

export function SDKAppShell({ options, initialScreen }: SDKAppShellProps) {
  const resolvedScreen = initialScreen ? SCREEN_MAP[initialScreen] : undefined;

  return (
    <AuthRoot
      session={options.session}
      callbacks={options.callbacks}
      config={options.config}
      wrapInContainer
    >
      <OnboardingEntry initialScreen={resolvedScreen} />
    </AuthRoot>
  );
}
