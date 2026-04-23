import { getActiveWhiteLabeledAuthClient } from "@/core";

export function getAxiosInstance() {
  return getActiveWhiteLabeledAuthClient().http;
}
