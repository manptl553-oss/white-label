import { OnboardingScreen } from "@/features/onboarding/onboarding.enums";
import {
  FaceInstructionsScreen,
  FaceLoginScreen,
  IdScanInstructionsScreen,
  IdScanScreen,
  PaymentScreen,
  SignInScreen,
  SignUpScreen,
  SuccessScreen,
  TermsScreen,
  VerifyOtpScreen,
} from "@/features/onboarding/screens";

import type { StepDefinition } from "./flow.types";
import { OnboardingStepSchema } from "../api";

export const ONBOARDING_STEPS: readonly StepDefinition[] = [
  // Direct screen mappings for manual navigation
  {
    screen: OnboardingScreen.SignIn,
    step: null,
    priority: 0,
    component: SignInScreen,
  },
  {
    screen: OnboardingScreen.SignUp,
    step: null,
    priority: 0,
    component: SignUpScreen,
  },
  {
    screen: OnboardingScreen.VerifyOtp,
    step: null,
    priority: 0,
    component: VerifyOtpScreen,
  },
  {
    screen: OnboardingScreen.Terms,
    step: OnboardingStepSchema.enum.auth,
    priority: 1,
    component: TermsScreen,
    // "auth" step → Terms is the first gated screen; back takes user to login
    backScreen: OnboardingScreen.SignIn,
  },
  {
    screen: OnboardingScreen.FaceInstructions,
    step: OnboardingStepSchema.enum.terms,
    priority: 2,
    component: FaceInstructionsScreen,
  },
  {
    screen: OnboardingScreen.FaceLogin,
    step: OnboardingStepSchema.enum.terms,
    priority: 2,
    component: FaceLoginScreen,
    // Face scan → back goes to the instructions screen, not login
    backScreen: OnboardingScreen.FaceInstructions,
  },
  {
    screen: OnboardingScreen.IdScanInstructions,
    step: OnboardingStepSchema.enum.face,
    priority: 4,
    component: IdScanInstructionsScreen,
  },
  {
    screen: OnboardingScreen.IdScan,
    step: OnboardingStepSchema.enum.face,
    priority: 5,
    component: IdScanScreen,
    // ID scan → back goes to the instructions screen
    backScreen: OnboardingScreen.IdScanInstructions,
  },
  {
    screen: OnboardingScreen.Payment,
    step: OnboardingStepSchema.enum.idscan,
    priority: 6,
    component: PaymentScreen,
  },
  {
    screen: OnboardingScreen.Success,
    step: OnboardingStepSchema.enum.payment,
    priority: 7,
    component: SuccessScreen,
    // No going back from success
    backScreen: false,
  },
] as const;

// ── Storage Keys ────────────────────────────────────────────
export const STORAGE_KEYS = {
  SCREEN: "onboardingScreen",
  STEP: "currentStep",
} as const;
