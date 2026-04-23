/**
 * ChainItAuth — Cross-Platform SDK Entry Point
 *
 * Framework-agnostic API that works in ANY environment:
 * - HTML/Vanilla JS (script tag / CDN)
 * - Vue, Angular, React (via import)
 * - WebView / Mobile apps
 *
 * Usage:
 * ```ts
 * // 1. Configure once
 * ChainItAuth.configure({
 *   session: { getSession },
 *   callbacks: { onSuccess, onError },
 *   config: { face: { timeout: 10000 } },
 * });
 *
 * // 2. Render (container is optional)
 * ChainItAuth.render('#sdk-root', { screen: 'signin' });
 *
 * // 3. Destroy on unmount
 * ChainItAuth.destroy('#sdk-root');
 * ```
 *
 * Distribution:
 * - UMD: window.ChainItAuth (HTML, script-tag, WebView)
 * - ESM: import { ChainItAuth } from '@blackinc/white-labeled-auth'
 */

import { core } from "./core";
import { renderer } from "./renderer";
import type { ChainItAuthOptions, RenderOptions } from "./types";

import "../index.css";

declare const __SDK_VERSION__: string;

const ChainItAuth = {
  configure(options: ChainItAuthOptions): void {
    core.configure(options);
  },

  render(
    containerOrOptions?: string | HTMLElement | RenderOptions,
    options?: RenderOptions,
  ): void {
    renderer.render(containerOrOptions, options);
  },

  destroy(container?: string | HTMLElement): void {
    renderer.destroy(container);
    if (!container) core.reset();
  },

  version: typeof __SDK_VERSION__ !== "undefined" ? __SDK_VERSION__ : "0.0.0",
} as const;

if (typeof window !== "undefined") {
  const win = window as unknown as Record<string, unknown>;
  const existing = win["ChainItAuth"] as typeof ChainItAuth | undefined;
  if (existing !== undefined) {
    console.warn(
      `[ChainItAuth] window.ChainItAuth is already defined (v${String(existing.version ?? "unknown")}). ` +
        `This page loaded SDK v${ChainItAuth.version} as well. ` +
        "Only the most recently loaded version will be active. " +
        "Remove duplicate SDK script tags or ensure only one version is bundled.",
    );
  }
  win["ChainItAuth"] = ChainItAuth;
}

export { ChainItAuth };
export default ChainItAuth;

// SDKAppShell is internal - not exported for public API

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
} from "./types";
