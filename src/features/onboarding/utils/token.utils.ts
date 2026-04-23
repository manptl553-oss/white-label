import { jwtDecode } from "jwt-decode";
import { getActiveWhiteLabeledAuthClient, type WhiteLabeledAuthClient } from "@/core";
import { LS_REQUEST_TOKEN } from "./constants";

export interface HostedAuthAuthTokenPayload {
  requestId: string;
  step: string;
  phone: string;
  clientId: string;
  userId?: string;
  faceSessionId?: string;
  faceSessionExp?: number;
  iat?: number;
  exp?: number;
}

export const getRequestTokenPayload = (clientOverride?: WhiteLabeledAuthClient): HostedAuthAuthTokenPayload | null => {
  const client = clientOverride || getActiveWhiteLabeledAuthClient();
  const requestToken = client.storage.getItem(
    client.getKey(LS_REQUEST_TOKEN),
  );
  if (!requestToken) return null;

  try {
    return jwtDecode<HostedAuthAuthTokenPayload>(requestToken);
  } catch {
    return null;
  }
};

export const getRequestToken = (clientOverride?: WhiteLabeledAuthClient): string | null => {
  const client = clientOverride || getActiveWhiteLabeledAuthClient();
  return client.storage.getItem(client.getKey(LS_REQUEST_TOKEN));
};
