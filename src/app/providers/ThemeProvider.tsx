import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeConfig {
  name: string;
  logoUrl?: string;
  fontFamily?: string;
  colors: ThemeColors;
  texts: Record<string, Record<string, string>>;
}

const screenTypeToOnboardingScreen: Record<string, string> = {
  LOGIN_SCREEN: OnboardingScreen.SignIn,
  SIGNUP_SCREEN: OnboardingScreen.SignUp,
  VERIFY_SCREEN: OnboardingScreen.VerifyOtp,
  TERMS_AND_CONDITIONS: OnboardingScreen.Terms,
  FACE_SCAN_INSTRUCTIONS: OnboardingScreen.FaceInstructions,
  FACE_SCAN: OnboardingScreen.FaceLogin,
  ID_SCAN_INSTRUCTIONS: OnboardingScreen.IdScanInstructions,
  ID_SCAN: OnboardingScreen.IdScan,
  PAYMENT_SCREEN: OnboardingScreen.Payment,
};

export const fallbackTexts: Record<OnboardingScreen, Record<string, string>> = {
  [OnboardingScreen.SignIn]: {
    loginTitle: "Welcome Back",
    loginSubtitle: "Log in to continue",
    loginNoAccountText: "Don't have an account?",
    loginSignupLinkText: "Sign up",
    loginContinueButtonText: "Continue",
    phoneNumberLabel: "Phone number*",
  },
  [OnboardingScreen.SignUp]: {
    signupTitle: "Create Your Account",
    signupSubtitle: "Sign up to continue",
    signupConsentText:
      "I agree to receive essential SMS messages from ChainIT with One-Time Passwords (OTP) for login and identity verification. Message & data rates may apply. These messages are required for secure access. Opt-out is not available. See Terms & Conditions and Privacy Policy.",
    signupLoginLinkText: "Log In",
    signupTermsLinkText: "Terms & Conditions",
    signupPrivacyLinkText: "Privacy Policy",
    signupAlreadyAccountText: "Already have an account?",
    signupContinueButtonText: "Continue",
    signupConsentError: "You must consent to continue.",
    andText: "and",
  },
  [OnboardingScreen.VerifyOtp]: {
    verifyTitle: "Verify Your Identity",
    verifySubtitle: "We've sent a code to your number",
    verifyCodePlaceholder: "Enter 6-digit code*",
    verifyResendText: "Resend",
    verifyEditNumberText: "Edit",
    verifyContinueButtonText: "Verify",
    otpRequiredError: "Please enter the OTP",
    otpLengthError: "OTP must be 6 digits",
    didNotReceiveCode: "Didn't receive a code?",
    resendInText: "Resend in",
  },
  [OnboardingScreen.Terms]: {
    termsTitle: "Terms & Privacy Policy",
    termsDescription:
      "As part of your onboarding, we will take a short video of your face and use it to verify your identity. This includes analyzing your facial features using biometric technology.",
    termsContinueButtonText: "Continue",
    termsAgeConfirmationText:
      "By checking this box, I confirm I am 18 years of age or older and I have read and agree to the Terms and Conditions and Privacy Policy.",
    termsConsentCheckboxText:
      "By checking this box, I consent to the collection and use of my biometric data for this purpose.",
  },
  [OnboardingScreen.FaceInstructions]: {
    faceScanInstructionTitle: "Face Scan Instructions",
    faceScanInstructionSubtitle:
      "Please follow the instructions for the face scan.",
    faceScanCameraLevelText: "Keep camera at eye level.",
    faceScanLightingInstructionText: "Ensure good lighting.",
    faceScanRemoveGlassesText: "Remove glasses or hats.",
    faceScanInstructionContinueButtonText: "Continue",
    photosensitivityWarningTitle: "Photosensitivity Warning",
  },
  [OnboardingScreen.FaceLogin]: {
    faceScanTitle: "Face Scan",
    cameraPermissionError: "Camera permission is required.",
    tryAgainButton: "Try Again",
  },
  [OnboardingScreen.IdScanInstructions]: {
    idScanTitle: "Government ID",
    successTitle: "Success!",
    idScanInstructionText:
      "Next, verify your identity by scanning your government issued ID.",
    idScanContinueButtonText: "Continue",
    idScanPassportWarningText:
      "Signing up with a passport will result in a lower BeingID level. You may be required to add another form of ID to complete certain actions.",
  },
  [OnboardingScreen.IdScan]: {
    refreshButton: "Refresh",
    backButton: "Back",
    continueButton: "Continue",
  },
  [OnboardingScreen.Payment]: {
    paymentTitle: "ChainIt ID Payment",
    idItemName: "ChainIt ID",
    idItemPrice: "$9.99/mo",
    taxLabel: "Tax",
    taxAmount: "$0.00",
    totalLabel: "Total",
    promoCodeTitle: "Have a Promo Code?",
    promoCodePlaceholder: "Enter Promo Code",
    applyButton: "Apply",
    promoAppliedText: "Promo Code Applied! No payment required.",
    paymentMethodTitle: "Payment Method",
    paymentMethodType: "Credit/Debit Card",
    paymentSecuredBy: "Secured by Paysafe",
    payButtonPrefix: "Pay",
  },
  [OnboardingScreen.Success]: {
    successTitle: "Success!",
    successSubtitle: "Your action was successful.",
  },
};

const defaultTheme: ThemeConfig = {
  name: "",
  colors: {
    primary: "#7ec040",
    primaryHover: "#6da839",
    primaryLight: "#7ec0401a",
    secondary: "#1e212a",
    background: "#f9f8fd",
    textPrimary: "#1e212a",
    textSecondary: "#65676e",
    error: "#d40000",
    success: "#7ec040",
    warning: "#f79009",
  },
  fontFamily: undefined,
  texts: fallbackTexts,
};

const ThemeContext = createContext<ThemeConfig>({
  ...defaultTheme,
});

export const useThemeConfig = () => useContext(ThemeContext);

export function useScreenTexts(screen: string) {
  const theme = useContext(ThemeContext);
  const screenText = theme.texts[screen] ?? {};
  const flatTexts: Record<string, string> = {};
  Object.entries(theme.texts).forEach(([, texts]) => {
    Object.assign(flatTexts, texts);
  });
  return { ...flatTexts, ...screenText };
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal != null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>,
      );
    } else if (srcVal !== undefined) {
      result[key] = srcVal;
    }
  }
  return result;
}

interface ThemeProviderProps {
  children: ReactNode;
  theme?: Partial<ThemeConfig>;
}

export interface ApiBrandingData {
  id: string;
  appId: string;
  brandName: string;
  brandLogo: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  screenConfigurations: Array<{
    screenType: string;
    requiredTexts: Record<string, string>;
  }>;
}

function resolveFontFamily(fontFamily?: string) {
  const fallback =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  if (!fontFamily?.trim()) return fallback;
  const normalized = fontFamily.trim();
  return normalized.includes(",") ? normalized : `${normalized}, ${fallback}`;
}

import { useHostedAuthAppConfig } from "@/features/onboarding/api/auth.api";
import { Loader } from "@/components";
import { OnboardingScreen } from "@/features/onboarding";
import { getHostedAuthErrorMeta } from "@/features/onboarding/utils";

export function ThemeProvider({
  children,
  theme: themeOverride,
}: ThemeProviderProps) {
  const appConfigQuery = useHostedAuthAppConfig();

  const theme = useMemo(() => {
    let merged = defaultTheme as unknown as Record<string, unknown>;
    const finalTexts: Record<string, Record<string, string>> = JSON.parse(
      JSON.stringify(fallbackTexts),
    );

    if (appConfigQuery.data?.config) {
      merged = deepMerge(merged, {
        name: appConfigQuery.data.config.brandName ?? "White Label",
        logoUrl: appConfigQuery.data.config.brandLogo,
        fontFamily: appConfigQuery.data.config.fontFamily,
        colors: {
          primary: appConfigQuery.data.config.primaryColor ?? "#7EC040",
          primaryHover: appConfigQuery.data.config.primaryColor ?? "#7EC040",
          primaryLight: appConfigQuery.data.config.primaryColor ?? "#7EC040",
          secondary: appConfigQuery.data.config.secondaryColor ?? "#131811",
          background: "#ffffff",
          textPrimary: "#1a1a1a",
          textSecondary: "#666666",
          error: "#dc2626",
          success: "#16a34a",
          warning: "#d97706",
        },
      } as unknown as Record<string, unknown>);

      if (appConfigQuery.data.config.screenConfigurations) {
        for (const screenConfig of appConfigQuery.data.config.screenConfigurations) {
          const onboardingScreen =
            screenTypeToOnboardingScreen[screenConfig.screenType ?? ""];
          if (onboardingScreen && screenConfig.requiredTexts) {
            finalTexts[onboardingScreen] = {
              ...(finalTexts[onboardingScreen] ?? {}),
              ...screenConfig.requiredTexts,
            };
          }
        }
      }
    }

    if (themeOverride) {
      merged = deepMerge(
        merged,
        themeOverride as unknown as Record<string, unknown>,
      );
    }

    merged = deepMerge(merged, { texts: finalTexts } as unknown as Record<
      string,
      unknown
    >);

    return merged as unknown as ThemeConfig;
  }, [appConfigQuery.data, themeOverride]);

  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;

    if (theme.fontFamily) {
      const id = `google-font-${theme.fontFamily.replace(/\s+/g, "-")}`;
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/\s+/g, "+")}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }

    root.style.setProperty("--color-primary", c.primary);
    root.style.setProperty("--color-primary-hover", c.primaryHover);
    root.style.setProperty("--color-primary-light", c.primaryLight);
    root.style.setProperty("--color-bg-color", c.background);
    root.style.setProperty("--color-text-primary", c.textPrimary);
    root.style.setProperty("--color-text-secondary", c.textSecondary);
    root.style.setProperty("--color-error", c.error);
    root.style.setProperty("--color-success", c.success);
    root.style.setProperty("--color-warning", c.warning);

    root.style.setProperty("--color-primary-50", c.primaryLight);
    root.style.setProperty("--color-primary-100", `${c.primary}1a`);
    root.style.setProperty("--color-primary-200", `${c.primary}33`);
    root.style.setProperty("--color-primary-300", `${c.primary}4d`);
    root.style.setProperty("--color-primary-500", c.primary);
    root.style.setProperty("--color-primary-600", `${c.primary}b3`);

    root.style.setProperty("--auth-primary", c.primary);
    root.style.setProperty("--color-secondary", c.secondary);
    root.style.setProperty("--auth-secondary", c.secondary);
    root.style.setProperty("--auth-primary-bg", c.primary);
    root.style.setProperty("--auth-primary-hover", c.primaryHover);
    root.style.setProperty("--auth-link-color", c.primary);
    root.style.setProperty("--auth-border-focus", c.primary);
    root.style.setProperty("--auth-error-color", c.error);
    root.style.setProperty("--auth-focus-ring", `${c.primary}1a`);
    root.style.setProperty("--auth-focus-shadow", `${c.primary}40`);
    root.style.setProperty("--auth-focus-outline", c.primary);
    root.style.setProperty("--auth-text-primary", c.textPrimary);
    root.style.setProperty("--auth-text-secondary", c.textSecondary);
    root.style.setProperty("--auth-text-placeholder", "#9e9e9e");
    root.style.setProperty("--auth-border-default", "#d9d9d9");
    root.style.setProperty("--auth-border-hover", c.primaryHover);
    root.style.setProperty("--auth-bg-white", "#ffffff");
    root.style.setProperty("--auth-bg-light", "#fafafa");
    root.style.setProperty("--auth-page-bg", c.background);
    root.style.setProperty("--auth-input-bg", "#ffffff");
    root.style.setProperty("--auth-input-bg-search", "#f9fafb");
    root.style.setProperty("--auth-country-hover-bg", "#f3f3f3");
    root.style.setProperty("--auth-country-dropdown-bg", "#ffffff");
    root.style.setProperty("--auth-country-border-light", "#e5e7eb");
    root.style.setProperty("--auth-search-icon-color", "#9ca3af");
    root.style.setProperty("--auth-btn-text-color", "#ffffff");
    root.style.setProperty("--auth-modal-bg", "#ffffff");
    root.style.setProperty("--auth-modal-header-bg", "#f5f5f5");
    root.style.setProperty("--auth-modal-border", "#dddddd");
    root.style.setProperty("--auth-btn-cancel-bg", "#f0f0f0");
    root.style.setProperty("--auth-btn-cancel-bg-hover", "#e0e0e0");
    root.style.setProperty("--auth-btn-cancel-text", "#555555");
    root.style.setProperty("--auth-shadow-sm", "0 1px 2px 0 rgba(0, 0, 0, 0.05)");
    root.style.setProperty("--auth-shadow-md", "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)");
    root.style.setProperty("--auth-shadow-lg", "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)");
    root.style.setProperty("--auth-font-family", resolveFontFamily(theme.fontFamily));
    root.style.setProperty("--auth-radius-sm", "4px");
    root.style.setProperty("--auth-radius-md", "6px");
    root.style.setProperty("--auth-radius-lg", "12px");
    root.style.setProperty("--auth-transition-fast", "0.15s ease");
    root.style.setProperty("--auth-transition-normal", "0.2s ease");
    root.style.setProperty("--auth-transition-slow", "0.3s ease");

    root.style.setProperty("--amplify-components-button-primary-background-color", c.primary);
    root.style.setProperty("--amplify-components-button-primary-hover-background-color", c.primaryHover);
    root.style.setProperty("--amplify-components-textfield-focus-border-color", c.primary);
    root.style.setProperty("--amplify-components-fieldcontrol-focus-box-shadow", `0 0 0 2px ${c.primary}40`);

    return () => {
      root.style.removeProperty("--color-primary");
      root.style.removeProperty("--color-primary-hover");
      root.style.removeProperty("--auth-primary");
      root.style.removeProperty("--color-primary-50");
      root.style.removeProperty("--color-primary-100");
      root.style.removeProperty("--color-primary-200");
      root.style.removeProperty("--color-primary-300");
      root.style.removeProperty("--color-primary-500");
      root.style.removeProperty("--color-primary-600");
      root.style.removeProperty("--color-secondary");
      root.style.removeProperty("--auth-secondary");
    };
  }, [theme]);

  const isLoading = appConfigQuery.isLoading;
  const hasError = appConfigQuery.isError;

  return (
    <ThemeContext.Provider value={theme}>
      <div className="hosted-auth-root">
        <div className="hosted-auth-panel">
          {children}
          {isLoading && (
            <div className="hosted-auth-loading-overlay">
              <Loader />
            </div>
          )}
          {hasError &&
            (() => {
              const info = getHostedAuthErrorMeta(
                appConfigQuery.error as Error | null,
              );

              return (
                <div className="hosted-auth-error-overlay">
                  <div className="hosted-auth-error-overlay__accent" />

                  <div className="hosted-auth-error-overlay__content">
                    <div className="hosted-auth-error-overlay__icon-wrap">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        className="hosted-auth-error-overlay__icon-svg"
                      >
                        {info.type === "credentials" && (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        )}
                        {info.type === "server" && (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3V6a3 3 0 013-3h13.5a3 3 0 013 3v5.25a3 3 0 01-3 3m-13.5 0v3.75m13.5-3.75v3.75m-13.5 0h13.5M12 18.75v2.25m-3.75 0h7.5" />
                        )}
                        {info.type === "network" && (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 20.25h.008v.008H12v-.008z" />
                        )}
                        {info.type === "unknown" && (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        )}
                      </svg>
                    </div>

                    <div className="hosted-auth-error-overlay__text-group">
                      <h2 className="hosted-auth-error-overlay__title">{info.title}</h2>
                      <p className="hosted-auth-error-overlay__subtitle">{info.subtitle}</p>
                    </div>

                    {info.causes.length > 0 && (
                      <div className="hosted-auth-error-overlay__causes">
                        {info.causes.map(({ icon, label }) => (
                          <div key={label} className="hosted-auth-error-overlay__cause-item">
                            <span className="hosted-auth-error-overlay__cause-icon" style={{ fontSize: 16 }}>
                              {icon}
                            </span>
                            <span className="hosted-auth-error-overlay__cause-label">{label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {appConfigQuery.error?.message && (
                      <div className="hosted-auth-error-overlay__raw-error">
                        <p className="hosted-auth-error-overlay__raw-error-text">
                          {appConfigQuery.error.message}
                        </p>
                      </div>
                    )}

                    <div className="hosted-auth-error-overlay__actions">
                      <button
                        onClick={() => window.location.reload()}
                        className="hosted-auth-error-overlay__reload-btn"
                      >
                        Reload Page
                      </button>
                      <p className="hosted-auth-error-overlay__hint">{info.hint}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
