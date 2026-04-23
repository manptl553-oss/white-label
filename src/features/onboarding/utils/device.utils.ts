import { v5 as uuidv5 } from "uuid";
import { getWindow, logger } from "@/core";

// ── Types ───────────────────────────────────────────────────

export interface DeviceInfoPayload {
  deviceId: string;
  macAddress: string;
  model: string;
  os: string;
  name: string;
  fcmToken: string;
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  meanSeaLevel: number | null;
}

export interface BrowserDeviceInfo {
  name: string;
  model: string;
  os: string;
  imei: string;
  macAddress: string;
  deviceId: string;
}

// ── Browser Device Info ─────────────────────────────────────

export const getDeviceInfo = (): BrowserDeviceInfo => {
  const win = getWindow();
  const nav = win?.navigator;

  return {
    name: nav?.userAgent ?? "",
    model: nav?.userAgent ?? "",
    os: nav?.platform ?? "",
    imei: "",
    macAddress: "",
    deviceId: nav?.userAgent ?? "browser",
  };
};

// ── External ID (uuid v5) ───────────────────────────────────

export const getBrowserId = (userId: string): string => {
  const win = getWindow();
  const browserFullName = win?.navigator.appName ?? "UnknownBrowser";
  const browserVersion = win?.navigator.appVersion ?? "1.0";

  const browserInfo = `${userId}_${browserFullName}${browserVersion}`;
  return uuidv5(browserInfo, uuidv5.URL);
};

// ── Geolocation ─────────────────────────────────────────────

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * Gets the current geolocation.
 * Phone (RN WebView): Uses the ReactNativeWebView bridge.
 * Web:                Uses navigator.geolocation.
 * Mirrors PWA's `getGeolocation()`.
 */
export const getGeolocation = async (): Promise<GeolocationResult> => {
  const win = getWindow();

  return new Promise((resolve, reject) => {
    // ── RN WebView bridge ───────────────────────────────────
    if (win?.ReactNativeWebView) {
      const requestId = "location_" + Date.now() + "_" + Math.random();

      const cleanup = () => {
        win.removeEventListener("message", handleResponse);
        document.removeEventListener(
          "message",
          handleResponse as EventListener,
        );
      };

      const handleResponse = (event: MessageEvent) => {
        try {
          if (!event?.data || typeof event?.data !== "string") return;
          const parsed = JSON.parse(event.data);
          const { requestId: responseRequestId, ...rest } = parsed.payload;

          if (responseRequestId === requestId) {
            if (rest?.error) {
              cleanup();
              reject({
                error: "Geolocation error",
                message: rest?.message,
                statusCode: rest?.code,
              });
            } else {
              cleanup();
              resolve(rest?.coords as GeolocationResult);
            }
          }
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      win.addEventListener("message", handleResponse);
      document.addEventListener("message", handleResponse as EventListener);

      win.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "GET_GEOLOCATION",
          payload: { requestId },
        }),
      );
      return;
    }

    // ── Browser geolocation API ─────────────────────────────
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            meanSeaLevel: position.coords.altitude,
          });
        },
        (error) => {
          // Fallback to 0,0 on error instead of rejecting
          logger.warn("Geolocation error, using defaults:", error.message);
          resolve({ latitude: 0, longitude: 0, meanSeaLevel: 0 });
        },
      );
      return;
    }

    // ── No geolocation available ────────────────────────────
    resolve({ latitude: 0, longitude: 0, meanSeaLevel: 0 });
  });
};
