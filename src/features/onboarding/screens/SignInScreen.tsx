import { useHostedAuthInitiate } from "@/features/onboarding/api/auth.api";
import { useAuth, useCountries, useOnboardingNavigation } from "../hooks";
import { toast } from "@/components";
import { AuthCard } from "../components/AuthCard";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../ui";
import { OnboardingScreen } from "../onboarding.enums";
import type { FormValues } from "../types";
import { CountryPhoneInput } from "../components";
import { useScreenTexts, useThemeConfig } from "@/app/providers/ThemeProvider";

export function SignInScreen() {
  const { goTo } = useOnboardingNavigation();
  const texts = useScreenTexts(OnboardingScreen.SignIn);
  const { logoUrl } = useThemeConfig();
  const initiate = useHostedAuthInitiate();
  const { defaultCountry, isCountryDetecting } = useCountries();

  const { handleAuthSignin } = useAuth({
    onSignin: async (fullPhone: string) => {
      await initiate.mutateAsync({ phone: fullPhone, authAction: "signin" });
      return true;
    },
  });

  const methods = useForm<FormValues>({
    defaultValues: { country: defaultCountry, phone: "", otp: "", consent: true },
    mode: "onChange",
  });

  const { handleSubmit, formState: { errors } } = methods;

  const handleSignIn = async (data: FormValues) => {
    try {
      await handleAuthSignin(data.country, data.phone);
      toast.success("OTP sent successfully!");
      goTo({ screen: OnboardingScreen.VerifyOtp });
    } catch {
      // Error toast handled globally by MutationCache
    }
  };

  return (
    <AuthCard
      title={texts.loginTitle}
      subtitle={texts.loginSubtitle}
      logo={logoUrl}
      loader={isCountryDetecting}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleSignIn)} className="hosted-auth-auth-form">
          <div className="hosted-auth-auth-form__field-group">
            <CountryPhoneInput defaultCountry={defaultCountry} />
            {errors.phone && (
              <p className="hosted-auth-error-msg">{errors.phone.message}</p>
            )}
          </div>

          <Button
            type="submit"
            isLoading={initiate.isPending}
            title={texts.loginContinueButtonText}
          />

          <p className="hosted-auth-switch-row">
            {texts.loginNoAccountText}{" "}
            <span
              className={`hosted-auth-switch-link ${initiate.isPending ? "hosted-auth-switch-link--disabled" : ""}`}
              onClick={() => {
                if (initiate.isPending) return;
                goTo({ screen: OnboardingScreen.SignUp });
              }}
            >
              {texts.loginSignupLinkText}
            </span>
          </p>
        </form>
      </FormProvider>
    </AuthCard>
  );
}
