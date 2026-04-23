import { useEffect } from "react";
import { useWhiteLabeledAuthClient } from "@/core";
import { axiosGet, axiosPost, useZodMutation, useZodQuery } from "@/lib/api";
import { tokenStorage } from "@/lib/auth";
import {
  LS_AUTH_ACTION,
  LS_PHONE,
  getBrowserId,
  getDeviceInfo,
  getGeolocation,
  getRequestTokenPayload,
  persistRequestToken,
  renewSessionToken,
} from "@/features/onboarding/utils";
import { z } from "zod";

import { type AuthAction } from "./auth.schemas";
import {
  hostedAuthApi,
  type HostedAuthApiKey,
  type HostedAuthRequest,
  type HostedAuthResponse,
} from "./hostedAuthApi";
import { useFlowEngine } from "../engine";
import { OnboardingScreen } from "../onboarding.enums";

// Generic factories
function useHostedAuthGenericQuery<T extends HostedAuthApiKey>(
  key: T,
  options: {
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
  } = {},
) {
  const client = useWhiteLabeledAuthClient();
  const api = hostedAuthApi[key];
  const persist = persistRequestToken<HostedAuthResponse<T>>(client);

  return useZodQuery<HostedAuthResponse<T>>({
    queryKey: ["hosted-auth", key],
    schema: api.response as unknown as z.ZodType<HostedAuthResponse<T>>,
    queryFn: async () => {
      const res = await axiosGet(api.endpoint);
      const parsed = api.response.parse(res) as HostedAuthResponse<T>;
      return persist(parsed);
    },
    staleTime: 1000 * 60 * 30,
    ...options,
  });
}

function useHostedAuthGenericMutation<T extends HostedAuthApiKey>(key: T) {
  const client = useWhiteLabeledAuthClient();
  const api = hostedAuthApi[key];
  const persist = persistRequestToken<HostedAuthResponse<T>>(client);

  return useZodMutation<HostedAuthResponse<T>, HostedAuthRequest<T>>({
    mutationKey: ["hosted-auth", key],
    schema: api.response as unknown as z.ZodType<HostedAuthResponse<T>>,
    mutationFn: async (payload: HostedAuthRequest<T>) => {
      const body = api.request.parse(payload);
      const res =
        api.method === "GET"
          ? await axiosGet(api.endpoint, body)
          : await axiosPost(api.endpoint, body);
      const parsed = api.response.parse(res) as HostedAuthResponse<T>;
      return persist(parsed);
    },
  });
}

// =============================================
// 3. Exported Hooks
// =============================================

// Simple hooks (auto-generated)
export const useHostedAuthVerifyOtp = () =>
  useHostedAuthGenericMutation("verifyOtp");
export const useHostedAuthConsents = () =>
  useHostedAuthGenericMutation("consents");
export const useHostedAuthFaceVerify = () =>
  useHostedAuthGenericMutation("faceVerify");
export const useHostedAuthIdScanVerify = () =>
  useHostedAuthGenericMutation("idScanVerify");
export const useHostedAuthPromoCode = () =>
  useHostedAuthGenericMutation("promoCode");

export const useHostedAuthFaceSession = () =>
  useHostedAuthGenericQuery("faceSession", {
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

// Custom hooks with special logic
export function useHostedAuthAppConfig() {
  const client = useWhiteLabeledAuthClient();
  const { goTo } = useFlowEngine();

  const query = useZodQuery({
    queryKey: ["hosted-auth", "app-config"],
    schema: hostedAuthApi.appConfig.response,
    queryFn: async () => {
      return renewSessionToken(client);
    },
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (query.isSuccess && query.data?.step) {
      goTo({ step: query.data.step });
    } else {
      goTo({ screen: OnboardingScreen.SignIn });
    }
  }, [query.isSuccess, query.data?.step, goTo]);

  return query;
}

export function useHostedAuthInitiate() {
  const client = useWhiteLabeledAuthClient();

  return useZodMutation({
    mutationKey: ["hosted-auth", "initiate"],
    schema: hostedAuthApi.initiate.response,
    mutationFn: async ({
      phone,
      authAction,
    }: HostedAuthRequest<"initiate">) => {
      const body = hostedAuthApi.initiate.request.parse({ phone, authAction });
      const res = await axiosPost(hostedAuthApi.initiate.endpoint, body);
      const parsed = hostedAuthApi.initiate.response.parse(res);

      persistRequestToken<typeof parsed>(client)(parsed);

      client.storage.setItem(client.getKey(LS_AUTH_ACTION), authAction);
      client.storage.setItem(client.getKey(LS_PHONE), phone);
      return parsed;
    },
  });
}

export function useHostedAuthResendOtp() {
  const client = useWhiteLabeledAuthClient();

  return useZodMutation({
    mutationKey: ["hosted-auth", "resend-otp"],
    schema: hostedAuthApi.initiate.response,
    mutationFn: async () => {
      const phone = client.storage.getItem(client.getKey(LS_PHONE)) ?? "";
      const authAction =
        (client.storage.getItem(client.getKey(LS_AUTH_ACTION)) as AuthAction) ??
        "signin";

      const body = hostedAuthApi.initiate.request.parse({
        phone,
        authAction,
      });

      const res = await axiosPost(hostedAuthApi.initiate.endpoint, body);
      const parsed = hostedAuthApi.initiate.response.parse(res);

      persistRequestToken<typeof parsed>(client)(parsed);
      return parsed;
    },
  });
}

export function useHostedAuthInitVdt() {
  const client = useWhiteLabeledAuthClient();

  return useZodMutation({
    mutationKey: ["hosted-auth", "initVdt"],
    schema: hostedAuthApi.initVdt.response,
    mutationFn: async () => {
      const rawToken = client.storage.getItem(client.getKey(LS_REQUEST_TOKEN));
      if (!rawToken) {
        window.location.reload();
        return;
      }

      const payload = getRequestTokenPayload(client);
      if (!payload) {
        try {
          const data = await renewSessionToken(client);
          if (data?.step) {
            getWindow()?.dispatchEvent(
              new CustomEvent("hosted-auth-step", {
                detail: { step: data.step },
              }),
            );
          }
        } catch {
          window.location.reload();
        }
        return;
      }

      const userId = payload.userId;
      if (!userId) throw new Error("Malformed token: missing userId");

      const [currentLocation, device] = await Promise.all([
        getGeolocation(),
        Promise.resolve(getDeviceInfo()),
      ]);

      const requestBody: HostedAuthRequest<"initVdt"> = {
        externalId: getBrowserId(userId),
        typeId: 4,
        name: device.name,
        deviceInfo: {
          model: device.model,
          os: device.os,
          imei: device.imei,
          macAddress: device.macAddress,
        },
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        meanSeaLevel: currentLocation.meanSeaLevel ?? 0,
      };

      const body = hostedAuthApi.initVdt.request.parse(requestBody);
      const res = await axiosPost(hostedAuthApi.initVdt.endpoint, body);
      return hostedAuthApi.initVdt.response.parse(res);
    },
    onSuccess: (data) => {
      if (data.access_token) {
        tokenStorage.setTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        });
        client.config.onComplete?.({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        });
      }
    },
  });
}
