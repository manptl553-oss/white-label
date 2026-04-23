import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useScreenTexts, useThemeConfig } from "@/app/providers/ThemeProvider";
import {
  useHostedAuthResendOtp,
  useHostedAuthVerifyOtp,
} from "@/features/onboarding/api/auth.api";
import { useAuth, useOnboardingNavigation } from "../hooks";
import { OnboardingScreen } from "../onboarding.enums";
import { Button, Input } from "@/features/onboarding/ui";
import { AuthCard } from "../components/AuthCard";
import { toast } from "@/components";

function useCountdown(seconds: number = 60) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [left]);
  return { left, start: () => setLeft(seconds) };
}

export function VerifyOtpScreen() {
  const { goTo } = useOnboardingNavigation();
  const texts = useScreenTexts(OnboardingScreen.VerifyOtp);
  const { logoUrl } = useThemeConfig();
  const verifyMutation = useHostedAuthVerifyOtp();
  const resendMutation = useHostedAuthResendOtp();
  const countdown = useCountdown(60);

  const { fullPhone, handleVerify, handleResendOtp, isLoading, isResendingOtp } = useAuth({
    onVerify: async (phone: string, otp: string) => {
      void phone;
      const response = await verifyMutation.mutateAsync({ code: otp });
      toast.success("OTP verified successfully!");
      if (response?.step) {
        goTo({ step: response.step });
        return true;
      }
      return false;
    },
    onResendOTP: async (_phone: string) => {
      void _phone;
      await resendMutation.mutateAsync();
      toast.success("OTP resent successfully!");
      countdown.start();
      return true;
    },
  });

  const displayPhone = fullPhone.replace(/^(\+\d+)\1/, "$1");

  const { control, handleSubmit, formState: { errors } } = useForm<{ otp: string }>({
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  return (
    <AuthCard
      title={texts.verifyTitle}
      subtitle={
        texts.verifySubtitle?.replace("+1******1234", displayPhone) ||
        texts.verifySubtitle
      }
      logo={logoUrl}
    >
      <div className="hosted-auth-verify-phone-box">
        <span className="hosted-auth-verify-phone-text">{displayPhone}</span>
        <button
          className="hosted-auth-verify-edit-btn"
          onClick={() => goTo({ screen: OnboardingScreen.SignIn })}
        >
          {texts.verifyEditNumberText}
        </button>
      </div>

      <form
        onSubmit={handleSubmit(async (data) => { await handleVerify(data.otp); })}
        className="hosted-auth-verify-form"
      >
        <Controller
          name="otp"
          control={control}
          rules={{
            required: texts.otpRequiredError,
            minLength: { value: 6, message: texts.otpLengthError },
            maxLength: { value: 6, message: texts.otpLengthError },
          }}
          render={({
            field,
          }: {
            field: {
              value: string;
              onChange: (value: string) => void;
              onBlur?: () => void;
              name?: string;
            };
          }) => (
            <Input
              label={texts.verifyCodePlaceholder}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              {...field}
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
              error={errors.otp?.message}
            />
          )}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          isDisabled={isLoading}
          title={texts.verifyContinueButtonText}
        />
      </form>

      <div className="hosted-auth-verify-resend-row">
        <p className="hosted-auth-verify-resend-text">
          {texts.didNotReceiveCode}
        </p>
        <Button
          variant="link"
          title={
            countdown.left > 0
              ? `${texts.resendInText} ${countdown.left}s`
              : texts.verifyResendText
          }
          isLoading={isResendingOtp}
          isDisabled={countdown.left > 0 || isLoading}
          onClick={handleResendOtp}
        />
      </div>
    </AuthCard>
  );
}
