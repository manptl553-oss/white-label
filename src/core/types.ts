import type { AxiosRequestHeaders } from "axios";
import type { ThemeConfig } from "@/app/providers/ThemeProvider";
import type { StoredTokens } from "@/lib/auth/tokenStorage";
import type { StorageAdapter } from "./storage";

// ── Internal-only config pieces ──────────────────────────────────────────────
// These are NOT exposed to SDK consumers. They are used purely inside feature
// screens (IdScan, FaceLogin, Terms, SignUp, etc.) via the internal client.

/** @internal */
export interface AmplifyConfigInput {
  config?: Record<string, unknown>;
}

/** @internal */
export interface HttpRetryConfig {
  retries?: number;
  retryDelayMs?: number;
  retryStatusCodes?: number[];
}

/** @internal Links shown inside Terms / SignUp / Success screens. */
export interface AuthLinksConfig {
  termsUrl: string;
  privacyPolicyUrl: string;
  biometricPolicyUrl: string;
  successRedirectUrl: string;
}

/** @internal ID scan SDK configuration. */
export interface IdScanConfig {
  licenseKey: string;
  networkUrl: string;
}

/** @internal Face liveness AWS region. */
export interface FaceLivenessConfig {
  region: string;
}

/** @internal Default country selection. */
export interface CountryConfig {
  defaultCountryCode: string;
}

// ── Public-facing input type (used by WhiteLabeledAuthConfig / SDK shell) ────

export type GetSessionHandler = () => Promise<{
  sessionId: string;
  sessionSignature: string;
}>;

/**
 * Input config for `createWhiteLabeledAuthClient`.
 * This is the internal bridge — not directly exposed to SDK consumers.
 *
 * @internal
 */
export interface WhiteLabeledAuthConfig {
  getSession: GetSessionHandler;
  onComplete?: (tokens: StoredTokens) => void;
  onError?: (error: unknown) => void;
}

/**
 * Normalized (fully resolved) config held by the internal client.
 * All optional fields are filled with defaults by `normalizeConfig()`.
 *
 * @internal — SDK consumers never touch this type directly.
 */
export interface NormalizedWhiteLabeledAuthConfig {
  baseURL: string;
  appName: string;
  storageKeyPrefix: string;
  http: Required<HttpRetryConfig>;
  theme: Partial<ThemeConfig>;
  amplify: AmplifyConfigInput;
  links: AuthLinksConfig;
  idScan: IdScanConfig;
  faceLiveness: FaceLivenessConfig;
  country: CountryConfig;
  getSession: GetSessionHandler;
  headers?: AxiosRequestHeaders | Record<string, string>;
  storage?: StorageAdapter;
  onStepChange?: (step: string) => void;
  onComplete?: (tokens: StoredTokens) => void;
  onError?: (error: unknown) => void;
}
