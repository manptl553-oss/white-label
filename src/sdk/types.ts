/**
 * ChainItAuth SDK — Public Types
 * All types accepted by configure() and render().
 * @packageDocumentation
 */

// ─── Session ─────────────────────────────────────────────────────────────────

/** Called by the SDK whenever it needs a fresh session from your backend. */
export type GetSessionHandler = () => Promise<{
  sessionId: string;
  sessionSignature: string;
}>;

/** Passed inside configure() to provide the session function. */
export interface SessionConfig {
  getSession: GetSessionHandler;
}

// ─── Auth Tokens ─────────────────────────────────────────────────────────────

/** Tokens delivered to onSuccess() after the onboarding flow completes. */
export interface AuthTokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
}

// ─── Callbacks ───────────────────────────────────────────────────────────────

/** Lifecycle hooks fired by the SDK during the onboarding flow. */
export interface CallbacksConfig {
  /** Fires on successful completion. Receives auth tokens. */
  onSuccess?: (tokens: AuthTokens) => void;
  /** Fires on any fatal SDK error. */
  onError?: (error: unknown) => void;
}

// ─── Config ──────────────────────────────────────────────────────────────────

/** Config for the face-liveness module. */
export interface FaceModuleConfig {
  /** Liveness check timeout in ms. @default 30000 */
  timeout?: number;
}

/** Per-feature configuration overrides. */
export interface SDKConfig {
  face?: FaceModuleConfig;
}

// ─── configure() ─────────────────────────────────────────────────────────────

/**
 * Options passed to ChainItAuth.configure().
 * @example
 * ```ts
 * ChainItAuth.configure({
 *   session:   { getSession },
 *   callbacks: { onSuccess, onError },
 *   config:    { face: { timeout: 15_000 } },
 * });
 * ```
 */
export interface ChainItAuthOptions {
  /** Required. How the SDK fetches a signed session from your backend. */
  session: SessionConfig;
  /** Optional callbacks for success and error events. */
  callbacks?: CallbacksConfig;
  /** Optional per-feature configuration overrides. */
  config?: SDKConfig;
}

// ─── render() ────────────────────────────────────────────────────────────────

/** Screen to open on launch. Defaults to 'signin'. */
export type SDKScreen = "signin" | "signup" | "face";

/**
 * Options passed to ChainItAuth.render().
 * @example
 * ```ts
 * ChainItAuth.render('#container', { screen: 'signup' });
 * ```
 */
export interface RenderOptions {
  /** Deep-link to a specific screen on first render. */
  screen?: SDKScreen;
}
