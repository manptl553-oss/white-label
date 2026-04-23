import { z } from "zod";
import { useWhiteLabeledAuthClient } from "@/core";
import { axiosPost } from "@/lib/api";
import { LS_REQUEST_TOKEN } from "./constants";
import { hostedAuthApi } from "../api/hostedAuthApi";
import { HostedAuthAppConfigResponseSchema } from "../api/auth.schemas";

export const persistRequestToken =
  <T extends object>(client: ReturnType<typeof useWhiteLabeledAuthClient>) =>
  (response: T): T => {
    const token = (response as { requestToken?: string })?.requestToken;
    if (token) {
      client.storage.setItem(client.getKey(LS_REQUEST_TOKEN), token);
    }
    return response;
  };

export const renewSessionToken = async (
  client: ReturnType<typeof useWhiteLabeledAuthClient>,
  apiConfig = hostedAuthApi.appConfig,
): Promise<z.infer<typeof HostedAuthAppConfigResponseSchema>> => {
  const session = await client.getSession();
  const body = apiConfig.request.parse(session);
  const res = await axiosPost(apiConfig.endpoint, body);
  const parsed = apiConfig.response.parse(res) as z.infer<
    typeof HostedAuthAppConfigResponseSchema
  >;
  persistRequestToken(client)(parsed);
  return parsed;
};
