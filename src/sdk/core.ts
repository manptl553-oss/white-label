/**
 * ChainItAuth SDK — Core Config Store
 *
 * Stores and validates options from configure(). Zero React, zero DOM.
 * @internal
 */

import type { ChainItAuthOptions } from "./types";

let _options: ChainItAuthOptions | null = null;

export const core = {
  /**
   * Validate and store SDK options. Must be called before render().
   *
   * Calling configure() more than once is intentionally allowed (e.g. to
   * swap session providers in a SPA), but a console warning is emitted so
   * developers notice accidental double-initialisation during development.
   *
   * @throws If `session.getSession` is not a function.
   */
  configure(options: ChainItAuthOptions): void {
    if (typeof options?.session?.getSession !== "function") {
      throw new Error(
        "[ChainItAuth] configure() requires `session.getSession` — " +
          "a function returning Promise<{ sessionId, sessionSignature }>.\n\n" +
          "Example:\n" +
          "  ChainItAuth.configure({ session: { getSession: () => fetch('/api/session').then(r => r.json()) } })",
      );
    }
    if (_options !== null) {
      console.warn(
        "[ChainItAuth] configure() was called more than once. " +
          "The previous configuration has been replaced. " +
          "If this is intentional (e.g. session rotation), you can ignore this warning. " +
          "Otherwise, make sure configure() is only called once per page load.",
      );
    }
    _options = options;
  },

  /**
   * Returns stored options. Called by renderer before mounting.
   * @throws If configure() has not been called yet.
   */
  getOptions(): ChainItAuthOptions {
    if (!_options) {
      throw new Error(
        "[ChainItAuth] Call ChainItAuth.configure() before ChainItAuth.render().",
      );
    }
    return _options;
  },

  /** Clears stored config. Called by destroy() with no argument. */
  reset(): void {
    _options = null;
  },

  /** Returns true if configure() has been called. */
  isConfigured(): boolean {
    return _options !== null;
  },
};
