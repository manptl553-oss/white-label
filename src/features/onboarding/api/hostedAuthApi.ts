import { z } from "zod";
import {
  HostedAuthAppConfigRequestSchema,
  HostedAuthAppConfigResponseSchema,
  HostedAuthConsentsRequestSchema,
  HostedAuthConsentsResponseSchema,
  HostedAuthFaceSessionResponseSchema,
  HostedAuthFaceVerifyRequestSchema,
  HostedAuthFaceVerifyResponseSchema,
  HostedAuthIdScanVerifyRequestSchema,
  HostedAuthIdScanVerifyResponseSchema,
  HostedAuthPromoCodeResponseSchema,
  HostedAuthInitiateRequestSchema,
  HostedAuthInitiateResponseSchema,
  HostedAuthVerifyOtpRequestSchema,
  HostedAuthVerifyOtpResponseSchema,
  HostedAuthInitVdtRequestSchema,
  HostedAuthInitVdtResponseSchema,
} from "./auth.schemas";

export const hostedAuthApi = {
  appConfig: {
    endpoint: "/users/v1/hosted-auth/app-config" as const,
    method: "POST" as const,
    request: HostedAuthAppConfigRequestSchema,
    response: HostedAuthAppConfigResponseSchema,
  },

  initiate: {
    endpoint: "/users/v1/hosted-auth/initiate" as const,
    method: "POST" as const,
    request: HostedAuthInitiateRequestSchema,
    response: HostedAuthInitiateResponseSchema,
  },

  verifyOtp: {
    endpoint: "/users/v1/hosted-auth/verify" as const,
    method: "POST" as const,
    request: HostedAuthVerifyOtpRequestSchema,
    response: HostedAuthVerifyOtpResponseSchema,
  },

  consents: {
    endpoint: "/users/v1/hosted-auth/consents" as const,
    method: "POST" as const,
    request: HostedAuthConsentsRequestSchema,
    response: HostedAuthConsentsResponseSchema,
  },

  faceSession: {
    endpoint: "/users/v1/hosted-auth/face/session" as const,
    method: "GET" as const,
    request: z.object({}),
    response: HostedAuthFaceSessionResponseSchema,
  },

  faceVerify: {
    endpoint: "/users/v1/hosted-auth/face/verify" as const,
    method: "POST" as const,
    request: HostedAuthFaceVerifyRequestSchema,
    response: HostedAuthFaceVerifyResponseSchema,
  },

  idScanVerify: {
    endpoint: "/users/v1/hosted-auth/idscan/verify" as const,
    method: "POST" as const,
    request: HostedAuthIdScanVerifyRequestSchema,
    response: HostedAuthIdScanVerifyResponseSchema,
  },

  promoCode: {
    endpoint: "/users/v1/hosted-auth/promo-code" as const,
    method: "POST" as const,
    request: z.object({}),
    response: HostedAuthPromoCodeResponseSchema,
  },

  initVdt: {
    endpoint: "/users/v1/hosted-auth/init-user-vdt-and-device-vdt-v2" as const,
    method: "POST" as const,
    request: HostedAuthInitVdtRequestSchema,
    response: HostedAuthInitVdtResponseSchema,
  },
} as const;

export type HostedAuthApiKey = keyof typeof hostedAuthApi;

export type HostedAuthRequest<T extends HostedAuthApiKey> = z.infer<
  (typeof hostedAuthApi)[T]["request"]
>;

export type HostedAuthResponse<T extends HostedAuthApiKey> = z.infer<
  (typeof hostedAuthApi)[T]["response"]
>;