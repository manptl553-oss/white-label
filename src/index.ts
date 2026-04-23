/**
 * @blackinc/white-labeled-auth
 *
 * White-labeled authentication & onboarding SDK.
 *
 * Usage:
 * - React: import { ChainItAuthProvider, AuthUI } from '@blackinc/white-labeled-auth';
 * - Vue/Angular/Vanilla: import { ChainItAuth } from '@blackinc/white-labeled-auth';
 */

// React Components
export { ChainItAuthProvider } from "@/app/ChainItAuthProvider";
export type { ChainItAuthProviderProps } from "@/app/ChainItAuthProvider";
export { AuthUI } from "@/app/AuthUI";
export type { AuthUIProps } from "@/app/AuthUI";
export { default as OnboardingProvider } from "@/app/App";

// Core Client
export {
  createWhiteLabeledAuthClient,
  useWhiteLabeledAuthClient,
  type WhiteLabeledAuthClient,
  type WhiteLabeledAuthConfig,
  type StorageAdapter,
} from "@/core";

// Theme
export type { ThemeConfig, ThemeColors } from "@/app/providers/ThemeProvider";
export { useThemeConfig, useScreenTexts } from "@/app/providers/ThemeProvider";

// Auth Context
export type { OnboardingConfig } from "@/lib/auth/AuthContext";
export {
  OnboardingConfigProvider,
  useOnboardingConfig,
} from "@/lib/auth/AuthContext";
export { tokenStorage } from "@/lib/auth/tokenStorage";
export type { StoredTokens } from "@/lib/auth/tokenStorage";

// Onboarding Features (everything from single entry)
export * from "@/features/onboarding";

// SDK (framework-agnostic)
export { ChainItAuth } from "@/sdk";
export type {
  ChainItAuthOptions,
  SessionConfig,
  GetSessionHandler,
  CallbacksConfig,
  SDKConfig,
  FaceModuleConfig,
  RenderOptions,
  SDKScreen,
  AuthTokens,
} from "@/sdk/types";

import "./index.css";
