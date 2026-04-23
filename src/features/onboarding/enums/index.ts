export enum AuthAction {
  SignIn = "sign_in",
  SignUp = "sign_up",
  Verify = "verify_otp",
}

export enum OnboardingScreen {
  SignIn = "sign_in",
  SignUp = "sign_up",
  VerifyOtp = "verify_otp",
  Terms = "terms",
  FaceInstructions = "face_instructions",
  FaceLogin = "face_login",
  IdScanInstructions = "id_scan_instructions",
  IdScan = "id_scan",
  Payment = "payment",
  Success = "success",
}

export enum EUserOnboardingStep {
  Auth = "auth",
  PrivacyConsent = "privacy_consent",
  Terms = "terms",
  Face = "face",
  IdScan = "idscan",
  Vdt = "vdt",
  Profile = "profile",
  Wallet = "wallet",
  Payment = "payment",
}
