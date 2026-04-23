import { useScreenTexts, useThemeConfig } from "@/app/providers/ThemeProvider";
import { useWhiteLabeledAuthClient } from "@/core";
import { useHostedAuthInitiate } from "@/features/onboarding/api/auth.api";
import { useAuth, useCountries, useOnboardingNavigation } from "../hooks";
import { toast } from "@/components";
import { AuthCard } from "../components/AuthCard";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { Button } from "../ui";
import { OnboardingScreen } from "../onboarding.enums";
import type { FormValues } from "../types";
import { CountryPhoneInput } from "../components";

export function SignUpScreen() {
  const client = useWhiteLabeledAuthClient();
  const { goTo } = useOnboardingNavigation();
  const texts = useScreenTexts(OnboardingScreen.SignUp);
  const { logoUrl } = useThemeConfig();
  const initiate = useHostedAuthInitiate();
  const { defaultCountry, isCountryDetecting } = useCountries();

  const { handleAuthSignup } = useAuth({
    onSignup: async (fullPhone: string) => {
      await initiate.mutateAsync({ phone: fullPhone, authAction: "signup" });
      return true;
    },
  });

  const methods = useForm<FormValues>({
    defaultValues: { country: defaultCountry, phone: "", otp: "", consent: false },
    mode: "onChange",
  });

  const { control, handleSubmit, formState: { errors } } = methods;
  const formValues = useWatch({ control });

  const handleSignUp = async (data: FormValues) => {
    try {
      await handleAuthSignup(data.country, data.phone);
      toast.success("OTP sent successfully!");
      goTo({ screen: OnboardingScreen.VerifyOtp });
    } catch {
      // Error toast handled globally by MutationCache
    }
  };

  return (
    <AuthCard
      title={texts.signupTitle}
      subtitle={texts.signupSubtitle}
      logo={logoUrl}
      loader={isCountryDetecting}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleSignUp)} className="hosted-auth-auth-form">
          <div className="hosted-auth-auth-form__field-group">
            <CountryPhoneInput defaultCountry={defaultCountry} />
            {errors.phone && (
              <p className="hosted-auth-error-msg">{errors.phone.message}</p>
            )}
          </div>

          <div className="hosted-auth-consent-box">
            <Controller
              name="consent"
              control={control}
              rules={{ required: texts.signupConsentError }}
              render={({
                field,
              }: {
                field: { value: boolean; onChange: (value: boolean) => void };
              }) => (
                <label className="hosted-auth-consent-label">
                  <input
                    type="checkbox"
                    className="hosted-auth-checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span className="hosted-auth-consent-text">
                    {texts.signupConsentText.replace(
                      "{appName}",
                      texts?.appName || "ChainIT",
                    )}{" "}
                    <a
                      href={client.config.links.termsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hosted-auth-consent-link"
                    >
                      {texts.signupTermsLinkText}
                    </a>{" "}
                    {texts.andText || "and"}{" "}
                    <a
                      href={client.config.links.privacyPolicyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hosted-auth-consent-link"
                    >
                      {texts.signupPrivacyLinkText}
                    </a>
                  </span>
                </label>
              )}
            />
          </div>

          <Button
            type="submit"
            isLoading={initiate.isPending}
            isDisabled={!formValues.consent}
            title={texts.signupContinueButtonText}
          />

          <p className="hosted-auth-switch-row">
            {texts.signupAlreadyAccountText}{" "}
            <span
              className={`hosted-auth-switch-link ${initiate.isPending ? "hosted-auth-switch-link--disabled" : ""}`}
              onClick={() => {
                if (initiate.isPending) return;
                goTo({ screen: OnboardingScreen.SignIn });
              }}
            >
              {texts.signupLoginLinkText}
            </span>
          </p>
        </form>
      </FormProvider>
    </AuthCard>
  );
}
