import { FlowEngine } from "@/features/onboarding/engine";
import type { OnboardingScreen } from "@/features/onboarding/onboarding.enums";

interface OnboardingEntryProps {
  initialScreen?: OnboardingScreen;
}

export function OnboardingEntry({ initialScreen }: OnboardingEntryProps) {
  return (
    <div className="hosted-auth-root">
      <div className="hosted-auth-panel">
        <FlowEngine initialScreen={initialScreen} />
      </div>
    </div>
  );
}
