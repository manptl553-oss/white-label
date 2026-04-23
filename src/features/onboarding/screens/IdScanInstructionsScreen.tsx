import { useOnboardingNavigation } from "@/features/onboarding/hooks/useOnboardingNavigation";
import { OnboardingScreen } from "@/features/onboarding/onboarding.enums";
import { Button, Header } from "@/features/onboarding/ui";
import { GovIdInstructionIcon } from "@/assets/illustrations/GovIdInstructionIcon";
import { InfoIcon } from "@/assets/illustrations/InfoIcon";
import { useScreenTexts } from "@/app/providers/ThemeProvider";

export function IdScanInstructionsScreen() {
  const { goTo } = useOnboardingNavigation();
  const texts = useScreenTexts(OnboardingScreen.IdScanInstructions);

  return (
    <div className="hosted-auth-screen hosted-auth-no-scrollbar">
      <Header title={texts.idScanTitle} leftIcon={null} />

      <div className="hosted-auth-id-instructions__body hosted-auth-no-scrollbar">
        <div className="hosted-auth-id-instructions__top">
          <div className="hosted-auth-id-instructions__heading-group">
            <h2 className="hosted-auth-id-instructions__heading">
              {texts.successTitle}
            </h2>
            <p className="hosted-auth-id-instructions__subtext">
              {texts.idScanInstructionText}
            </p>
          </div>

          <div className="hosted-auth-id-instructions__icon-section">
            <GovIdInstructionIcon className="hosted-auth-id-instructions__gov-icon" />
            <div className="hosted-auth-id-instructions__warning">
              <InfoIcon className="hosted-auth-id-instructions__warning-icon" />
              <p className="hosted-auth-id-instructions__warning-text">
                {texts.idScanPassportWarningText}
              </p>
            </div>
          </div>
        </div>

        <div className="hosted-auth-id-instructions__footer">
          <Button
            type="button"
            onClick={() => goTo({ screen: OnboardingScreen.IdScan })}
            title={texts.idScanContinueButtonText}
          />
        </div>
      </div>
    </div>
  );
}
