import { useOnboardingNavigation } from "@/features/onboarding/hooks/useOnboardingNavigation";
import { OnboardingScreen } from "@/features/onboarding/onboarding.enums";
import { Button } from "@/features/onboarding/ui";
import { FaceInstructionIcon } from "@/assets/illustrations/FaceInstructionIcons";
import type { FaceInstructionType } from "@/assets/illustrations/FaceInstructionIcons";
import { Icons } from "@/assets";
import { useScreenTexts } from "@/app/providers/ThemeProvider";

function InstructionBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="hosted-auth-instruction-banner">
      <div className="hosted-auth-instruction-banner__inner">
        <div className="hosted-auth-instruction-banner__icon">
          <svg width={20} height={20} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="hosted-auth-instruction-banner__content">
          <p className="hosted-auth-instruction-banner__title">{title}</p>
          <p className="hosted-auth-instruction-banner__desc">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function FaceInstructionsScreen() {
  const { goTo } = useOnboardingNavigation();
  const texts = useScreenTexts(OnboardingScreen.FaceInstructions);

  return (
    <div className="hosted-auth-screen hosted-auth-no-scrollbar">
      <div className="hosted-auth-face-instructions__body hosted-auth-no-scrollbar">
        <div className="hosted-auth-face-instructions__top">
          <InstructionBanner
            title={texts.photosensitivityWarningTitle}
            description={texts.faceScanInstructionSubtitle}
          />
          <div className="hosted-auth-face-instructions__center">
            <h1 className="hosted-auth-face-instructions__title">
              {texts.faceScanInstructionTitle}
            </h1>
            <div className="hosted-auth-face-instructions__img-wrap">
              <img
                src={Icons.faceCapture}
                alt="Face Capture"
                className="hosted-auth-face-instructions__img"
              />
            </div>
            <div className="hosted-auth-face-instructions__cards">
              {[
                { type: "glass", text: texts.faceScanRemoveGlassesText },
                { type: "light", text: texts.faceScanLightingInstructionText },
                { type: "camera", text: texts.faceScanCameraLevelText },
              ].map((item, idx) => (
                <div className="hosted-auth-face-instruction-card" key={idx}>
                  <FaceInstructionIcon
                    type={item.type as FaceInstructionType}
                    className="hosted-auth-face-instruction-card__icon"
                  />
                  <span className="hosted-auth-face-instruction-card__text">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hosted-auth-face-instructions__footer">
          <Button
            type="button"
            onClick={() => goTo({ screen: OnboardingScreen.FaceLogin })}
            title={texts.faceScanInstructionContinueButtonText}
          />
        </div>
      </div>
    </div>
  );
}
