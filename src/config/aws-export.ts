// for develop
export const awsConfig = {
  aws_project_region: import.meta.env.VITE_AWS_REGION,
  aws_cognito_identity_pool_id: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: import.meta.env.VITE_AWS_REGION,
  aws_user_pools_id: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  aws_user_pools_web_client_id: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
  oauth: {},
  aws_cognito_username_attributes: [],
  // aws_cognito_social_providers: import.meta.env
  //   .VITE_AWS_COGNITO_SOCIAL_PROVIDERS,
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: ["SMS"],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_cognito_verification_mechanisms: ["EMAIL"],
  aws_user_files_s3_bucket: import.meta.env.VITE_AWS_USER_FILES_S3_BUCKET,
  aws_user_files_s3_bucket_region: import.meta.env.VITE_AWS_REGION,
  predictions: {
    identify: {
      identifyEntities: {
        proxy: false,
        region: import.meta.env.VITE_AWS_REGION,
        celebrityDetectionEnabled: true,
      },
    },
  },
};
