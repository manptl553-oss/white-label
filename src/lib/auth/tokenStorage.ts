export type StoredTokens = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
};

import { getActiveWhiteLabeledAuthClient } from "@/core";

function getClient() {
  return getActiveWhiteLabeledAuthClient();
}

const key = (suffix: string) => getClient().getKey(suffix);

export const tokenStorage = {
  getAccessToken(): string | null {
    return getClient().storage.getItem(key("token"));
  },
  getRefreshToken(): string | null {
    return getClient().storage.getItem(key("refreshToken"));
  },
  getIdToken(): string | null {
    return getClient().storage.getItem(key("idToken"));
  },

  setTokens(tokens: StoredTokens) {
    const storage = getClient().storage;
    storage.setItem(key("token"), tokens.accessToken);
    if (tokens.refreshToken)
      storage.setItem(key("refreshToken"), tokens.refreshToken);
    if (tokens.idToken) storage.setItem(key("idToken"), tokens.idToken);
  },
  clear() {
    const storage = getClient().storage;
    storage.removeItem(key("token"));
    storage.removeItem(key("refreshToken"));
    storage.removeItem(key("idToken"));
  },
};
