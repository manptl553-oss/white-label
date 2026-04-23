import { z } from "zod";

export const AuthActionSchema = z.enum(["signin", "signup"]);
export type AuthAction = z.infer<typeof AuthActionSchema>;

export const OnboardingStepSchema = z.enum([
  "auth",
  "terms",
  "face",
  "idscan",
  "payment",
  "complete",
]);
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;

const SessionSchema = z.object({
  sessionId: z.string(),
  sessionSignature: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;

export const CreateClientSessionResponseSchema = SessionSchema.extend({
  expiresIn: z.number(),
});

export const HostedAuthAppConfigRequestSchema = SessionSchema;

export const HostedAuthAppConfigScreenConfigurationSchema = z.object({
  id: z.string().optional(),
  brandId: z.string().optional(),
  screenType: z.string().optional(),
  isCustomized: z.boolean().optional(),
  requiredTexts: z.record(z.string(), z.string()).optional(),
});

export const HostedAuthAppConfigResponseSchema = z.object({
  config: z.object({
    id: z.string().optional(),
    appId: z.string().optional(),
    brandName: z.string().optional(),
    brandLogo: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
    screenConfigurations: z
      .array(HostedAuthAppConfigScreenConfigurationSchema)
      .optional(),
  }),
  locked: z.boolean(),
  isDefault: z.boolean(),
  lockedMessage: z.string().optional(),
  requestToken: z.string().optional(),
  step: OnboardingStepSchema.nullish(),
});

export const HostedAuthInitiateRequestSchema = z.object({
  phone: z.string().min(6),
  authAction: AuthActionSchema,
});

export const HostedAuthInitiateResponseSchema = z.object({
  requestToken: z.string().optional(),
  step: z.null(),
});

export const HostedAuthVerifyOtpRequestSchema = z.object({
  code: z.string().min(4).max(10),
});

export const HostedAuthVerifyOtpResponseSchema = z.object({
  requestToken: z.string().optional(),
  step: OnboardingStepSchema.optional(),
});

export const HostedAuthConsentsRequestSchema = z.object({
  acceptTerms: z.boolean(),
  acceptPrivacy: z.boolean(),
});

export const HostedAuthConsentsResponseSchema = z.object({
  requestToken: z.string().optional(),
  step: OnboardingStepSchema.optional(),
});

export const HostedAuthFaceSessionResponseSchema = z.object({
  requestToken: z.string().optional(),
  step: OnboardingStepSchema.optional(),
  session: z.object({
    sessionId: z.string(),
    signature: z.string(),
  }),
});

export const HostedAuthFaceVerifyRequestSchema = z.object({
  sessionId: z.string().min(1),
  signature: z.string().min(1),
});

export const HostedAuthFaceVerifyResponseSchema = z.object({
  requestToken: z.string().optional(),
  step: OnboardingStepSchema.optional(),
  result: z
    .object({
      faceId: z.string().optional(),
      nonce: z.string().optional(),
      key: z.string().optional(),
      imageUrl: z.string().nullish(),
      imagePath: z.string().optional(),
    })
    .optional(),
});

export const HostedAuthIdScanVerifyRequestSchema = z.object({
  frontImage: z.string().min(1),
  backImage: z.string().optional(),
  documentType: z.number(),
});

export const HostedAuthIdScanVerifyResponseSchema = z.object({
  requestToken: z.string().optional(),
  step: OnboardingStepSchema.optional(),
  verified: z.boolean().optional(),
});

export const HostedAuthPromoCodeResponseSchema = z.object({
  requestToken: z.string().optional(),
  step: OnboardingStepSchema.optional(),
});

export const HostedAuthCompleteRequestSchema = z.object({
  promoCode: z.string().optional(),
});

export const HostedAuthCompleteResponseSchema = z.object({
  requestToken: z.string().optional(),
  step: OnboardingStepSchema.optional(),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    idToken: z.string().optional(),
  }),
});

export const OAuthTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
});

export type OAuthTokenResponse = z.infer<typeof OAuthTokenResponseSchema>;

// ── Init User VDT & Device VDT v2 ──────────────────────────

export const HostedAuthInitVdtDeviceInfoSchema = z.object({
  model: z.string().optional(),
  os: z.string().optional(),
  imei: z.string().optional(),
  macAddress: z.string().optional(),
  manufacturer: z.string().optional(),
});

export const HostedAuthInitVdtRequestSchema = z.object({
  appName: z.string().optional(),
  externalId: z.string(),
  name: z.string(),
  typeId: z.number(),
  deviceInfo: HostedAuthInitVdtDeviceInfoSchema.optional(),
  locationId: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  meanSeaLevel: z.number(),
  platformType: z.string().optional(),
});

export const HostedAuthInitVdtResponseSchema = z.object({
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
});

export const AxiosErrorModel = z.object({
  error: z.string().nullish(),
  message: z.string().nullish(),
  statusCode: z.number().nullish(),
});

export type AxiosErrorType = z.infer<typeof AxiosErrorModel>;
