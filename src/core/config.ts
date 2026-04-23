import { env } from "@/config/env";
import type {
  NormalizedWhiteLabeledAuthConfig,
  WhiteLabeledAuthConfig,
} from "./types";

export function normalizeConfig(
  config: WhiteLabeledAuthConfig,
): NormalizedWhiteLabeledAuthConfig {
  return {
    baseURL: env.VITE_API_BASE_URL,
    appName: env.VITE_APP_NAME,
    storageKeyPrefix: env.VITE_APP_NAME || "white_labeled_auth",
    theme: {},
    amplify: {
      config: {
        aws_project_region: env.VITE_AWS_REGION,
        aws_cognito_identity_pool_id: env.VITE_COGNITO_IDENTITY_POOL_ID,
        aws_cognito_region: env.VITE_AWS_REGION,
        aws_user_pools_id: env.VITE_COGNITO_USER_POOL_ID,
        aws_user_pools_web_client_id: env.VITE_COGNITO_APP_CLIENT_ID,
        oauth: {},
        aws_cognito_username_attributes: [],
        aws_cognito_signup_attributes: ["EMAIL"],
        aws_cognito_mfa_configuration: "OFF",
        aws_cognito_mfa_types: ["SMS"],
        aws_cognito_password_protection_settings: {
          passwordPolicyMinLength: 8,
          passwordPolicyCharacters: [],
        },
        aws_cognito_verification_mechanisms: ["EMAIL"],
        aws_user_files_s3_bucket: env.VITE_AWS_USER_FILES_S3_BUCKET,
        aws_user_files_s3_bucket_region: env.VITE_AWS_REGION,
      },
    },
    http: {
      retries: 0,
      retryDelayMs: 250,
      retryStatusCodes: [408, 425, 429, 500, 502, 503, 504],
    },
    links: {
      termsUrl: "https://www.chainit.com/terms-and-conditions",
      privacyPolicyUrl: "https://www.chainit.com/privacy-policy/",
      biometricPolicyUrl: "https://www.chainit.com/biometric-policy/",
      successRedirectUrl: "/",
    },
    idScan: {
      licenseKey: env.VITE_ID_SCAN_LICENSE_KEY,
      networkUrl: "",
    },
    faceLiveness: {
      region: env.VITE_AWS_REGION,
    },
    country: {
      defaultCountryCode: "US",
    },
    getSession: config.getSession,
    onComplete: config.onComplete,
    onError: config.onError,
  };
}
