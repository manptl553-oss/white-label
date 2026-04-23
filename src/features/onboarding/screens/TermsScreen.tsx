import { useState } from "react";

import { useWhiteLabeledAuthClient } from "@/core";
import { useHostedAuthConsents } from "@/features/onboarding/api/auth.api";
import { OnboardingScreen } from "@/features/onboarding/onboarding.enums";
import { useOnboardingNavigation } from "@/features/onboarding/hooks/useOnboardingNavigation";
import { Button } from "@/features/onboarding/ui/Button";
import { Header } from "@/features/onboarding/ui/Header";
import { TermsIcon } from "@/assets/illustrations/TermsIcon";
import { useScreenTexts } from "@/app/providers/ThemeProvider";
import { toast } from "@/components";

export function TermsScreen() {
  const client = useWhiteLabeledAuthClient();
  const { goTo } = useOnboardingNavigation();
  const texts = useScreenTexts(OnboardingScreen.Terms);
  const [consentCheckbox, setConsentCheckbox] = useState(false);
  const [policyCheckbox, setPolicyCheckbox] = useState(false);
  const consents = useHostedAuthConsents();

  return (
    <div className="hosted-auth-screen hosted-auth-no-scrollbar">
      <Header title={texts.termsTitle} />

      <div className="hosted-auth-terms__body hosted-auth-no-scrollbar">
        <div className="hosted-auth-terms__top">
          <TermsIcon className="hosted-auth-terms__icon" />

          <div className="hosted-auth-terms__desc-wrapper">
            {(() => {
              const desc = texts.termsDescription || "";
              const match = desc.match(/(Biometric Data Policy)/i);

              if (match) {
                const policyIndex = match.index!;
                const splitPoint = desc.lastIndexOf(". ", policyIndex);

                if (splitPoint !== -1) {
                  const firstPara = desc.substring(0, splitPoint + 1);
                  const secondPara = desc.substring(splitPoint + 2);
                  const parts = secondPara.split(match[0]);

                  return (
                    <>
                      <p className="hosted-auth-terms__desc-text">{firstPara}</p>
                      <p className="hosted-auth-terms__desc-text">
                        {parts[0]}
                        <a
                          href={client.config.links?.biometricPolicyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hosted-auth-terms__desc-link"
                        >
                          {match[0]}
                        </a>
                        {parts[1]}
                      </p>
                    </>
                  );
                }
              }

              return (
                <p className="hosted-auth-terms__desc-text">{desc}</p>
              );
            })()}
          </div>
        </div>

        <div className="hosted-auth-terms__footer">
          <label className="hosted-auth-terms__check-label">
            <input
              type="checkbox"
              className="hosted-auth-checkbox"
              checked={consentCheckbox}
              onChange={(e) => setConsentCheckbox(e.target.checked)}
            />
            <span className="hosted-auth-terms__check-text">
              {texts.termsConsentCheckboxText}
            </span>
          </label>

          <label className="hosted-auth-terms__check-label">
            <input
              type="checkbox"
              className="hosted-auth-checkbox"
              checked={policyCheckbox}
              onChange={(e) => setPolicyCheckbox(e.target.checked)}
            />
            <span className="hosted-auth-terms__check-text">
              {texts.termsAgeConfirmationText}{" "}
              <a
                href={client.config.links.termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hosted-auth-terms__check-link"
              >
                {texts.signupTermsLinkText}
              </a>{" "}
              {texts.andText}{" "}
              <a
                href={client.config.links.privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hosted-auth-terms__check-link"
              >
                {texts.signupPrivacyLinkText}
              </a>
            </span>
          </label>

          <Button
            type="button"
            isLoading={consents.isPending}
            isDisabled={!(consentCheckbox && policyCheckbox)}
            onClick={async () => {
              try {
                await consents.mutateAsync({
                  acceptTerms: policyCheckbox,
                  acceptPrivacy: consentCheckbox,
                });
                toast.success("Consent accepted successfully!");
                goTo({ screen: OnboardingScreen.FaceInstructions });
              } catch (e) {
                client.config.onError?.(e);
              }
            }}
            title={texts.termsContinueButtonText}
          />
        </div>
      </div>
    </div>
  );
}
