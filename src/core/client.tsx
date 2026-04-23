import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import { createContext, useContext, useEffect, type ReactNode } from "react";

import { getWindow } from "./browser";
import { normalizeConfig } from "./config";
import {
  resolveStorageAdapter,
  clearStorageByPrefix,
  type StorageAdapter,
} from "./storage";
import type {
  NormalizedWhiteLabeledAuthConfig,
  WhiteLabeledAuthConfig,
} from "./types";
import type { Session } from "@/features/onboarding";

export type WhiteLabeledAuthClient = {
  config: NormalizedWhiteLabeledAuthConfig;
  storage: StorageAdapter;
  http: AxiosInstance;
  getKey: (suffix: string) => string;
  getSession: () => Promise<{ sessionId: string; sessionSignature: string }>;
};

const REQUEST_TOKEN_KEY = "hostedAuthRequestToken";

function shouldRetry(
  error: AxiosError,
  retries: number,
  retryStatusCodes: number[],
  attempt: number,
) {
  if (attempt >= retries) return false;
  const status = error.response?.status;
  return typeof status === "number" && retryStatusCodes.includes(status);
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createWhiteLabeledAuthClient(
  input: WhiteLabeledAuthConfig,
): WhiteLabeledAuthClient {
  const config = normalizeConfig(input);
  const storage = resolveStorageAdapter(config.storage);
  const getKey = (suffix: string) => `${config.storageKeyPrefix}:${suffix}`;
  let sessionPromise: Promise<Session> | null = null;
  const getSession = async (): Promise<Session> => {
    if (sessionPromise) return sessionPromise;

    if (config.getSession) {
      sessionPromise = config.getSession();
      return sessionPromise;
    }

    throw new Error(
      "Session callback not configured. Provide getSession handler.",
    );
  };
  const http = axios.create({
    baseURL: config.baseURL || undefined,
    headers: config.headers,
  });

  const client: WhiteLabeledAuthClient = {
    config,
    storage,
    http,
    getKey,
    getSession,
  };

  http.interceptors.request.use((request) => {
    const headers = request.headers ?? {};
    const requestToken = storage.getItem(getKey(REQUEST_TOKEN_KEY));

    if (config.baseURL) {
      request.baseURL = config.baseURL;
    }

    if (requestToken) headers["x-request-token"] = requestToken;

    request.headers = headers;
    return request;
  });

  http.interceptors.response.use(
    (response) => {
      const requestToken = (
        response?.data as { requestToken?: unknown } | undefined
      )?.requestToken;

      if (typeof requestToken === "string" && requestToken.trim()) {
        const normalizedToken = requestToken.trim();
        storage.setItem(getKey(REQUEST_TOKEN_KEY), normalizedToken);
        const activeWindow = getWindow();
        activeWindow?.dispatchEvent(
          new CustomEvent("hosted-auth-token", {
            detail: { requestToken: normalizedToken },
          }),
        );
      }

      return response;
    },
    async (
      error: AxiosError<{
        name?: string;
        error?: string;
        message?: string | string[];
        statusCode?: number;
      }>,
    ) => {
      const originalRequest = error.config as
        | (AxiosRequestConfig & {
            _retryAttempt?: number;
            _skipSessionRenew?: boolean;
          })
        | undefined;

      if (originalRequest) {
        const attempt = originalRequest._retryAttempt ?? 0;
        if (
          shouldRetry(
            error,
            config.http.retries,
            config.http.retryStatusCodes,
            attempt,
          )
        ) {
          originalRequest._retryAttempt = attempt + 1;
          await sleep(config.http.retryDelayMs * (attempt + 1));
          return http(originalRequest);
        }
      }

      const normalizedError = {
        error:
          error.response?.data?.error ?? error.response?.data?.name ?? "Failed",
        message: Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join(", ")
          : (error.response?.data?.message ??
            error.message ??
            "Something went wrong"),
        statusCode:
          error.response?.data?.statusCode ?? error.response?.status ?? 500,
      };
      if (
        typeof normalizedError.error === "string" &&
        normalizedError.error === "SESSION_ERROR"
      ) {
        clearStorageByPrefix(storage, config.storageKeyPrefix);
        config.onError?.(normalizedError);
        window.location.reload();
        return Promise.reject(normalizedError);
      }

      config.onError?.(normalizedError);

      return Promise.reject(normalizedError);
    },
  );

  return client;
}

const WhiteLabeledAuthClientContext =
  createContext<WhiteLabeledAuthClient | null>(null);

let activeClient: WhiteLabeledAuthClient | null = null;

export function WhiteLabeledAuthClientProvider({
  client,
  children,
}: {
  client: WhiteLabeledAuthClient;
  children: ReactNode;
}) {
  useEffect(() => {
    activeClient = client;
  }, [client]);

  return (
    <WhiteLabeledAuthClientContext.Provider value={client}>
      {children}
    </WhiteLabeledAuthClientContext.Provider>
  );
}

export function useWhiteLabeledAuthClient() {
  const context = useContext(WhiteLabeledAuthClientContext);
  if (!context) {
    throw new Error(
      "useWhiteLabeledAuthClient must be used within WhiteLabeledAuthClientProvider",
    );
  }
  return context;
}

export function getActiveWhiteLabeledAuthClient() {
  if (!activeClient) {
    throw new Error(
      "White-labeled auth client has not been initialized. Wrap your app with OnboardingProvider or WhiteLabeledAuthProvider.",
    );
  }
  return activeClient;
}
