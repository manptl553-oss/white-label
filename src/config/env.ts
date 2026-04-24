import { z } from "zod";

const EnvSchema = z.object({
  // API
  VITE_API_BASE_URL: z.string().url().catch("http://192.168.50.53:8888"),

  // App
  VITE_APP_NAME: z.string().catch("white_labeled_auth"),
  VITE_APP_ENV: z.string().catch("development"),
  VITE_ONBOARDING_NAV_MODE: z.enum(["router", "screen"]).catch("router"),

  // Amplify / Cognito
  VITE_AWS_REGION: z.string().catch("us-east-1"),
  VITE_COGNITO_IDENTITY_POOL_ID: z.string().catch(""),
  VITE_COGNITO_USER_POOL_ID: z.string().catch(""),
  VITE_COGNITO_APP_CLIENT_ID: z.string().catch(""),
  VITE_AWS_USER_FILES_S3_BUCKET: z.string().catch(""),

  // ID Scan
  VITE_ID_SCAN_LICENSE_KEY: z.string().catch(""),

  // Face Liveness (defaults to same AWS region)
});

type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(import.meta.env);
