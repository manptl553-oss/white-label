# `@blackinc/white-labeled-auth`

White-labeled authentication and onboarding components for React applications.

## Installation

```bash
npm install @blackinc/white-labeled-auth
```

Install the required peers in your host app if they are not already present:

```bash
npm install react react-dom react-router react-router-dom @tanstack/react-query
```

## Quick Start

```tsx
import { OnboardingProvider } from "@blackinc/white-labeled-auth";

export function App() {
  return (
    <OnboardingProvider
      config={{
        clientId: process.env.REACT_APP_AUTH_CLIENT_ID!,
        baseURL: process.env.REACT_APP_AUTH_BASE_URL!,
        appName: "acme-auth",
        navigationMode: "router",
        routerMode: "browser",
        links: {
          termsUrl: "https://acme.com/terms",
          privacyPolicyUrl: "https://acme.com/privacy",
          biometricPolicyUrl: "https://acme.com/biometric-policy",
          successRedirectUrl: "/dashboard",
        },
        faceLiveness: {
          region: "us-east-1",
        },
        idScan: {
          licenseKey: process.env.REACT_APP_IDSCAN_LICENSE_KEY!,
        },
      }}
    />
  );
}
```

## Creating A Reusable Client

```tsx
import {
  createWhiteLabeledAuthClient,
  OnboardingProvider,
} from "@blackinc/white-labeled-auth";

const authClient = createWhiteLabeledAuthClient({
  clientId: process.env.REACT_APP_AUTH_CLIENT_ID!,
  baseURL: process.env.REACT_APP_AUTH_BASE_URL!,
  appName: "acme-auth",
});

export function App() {
  return <OnboardingProvider client={authClient} />;
}
```

## Configuration

`OnboardingProvider` and `createWhiteLabeledAuthClient` accept:

- `clientId`: Hosted auth client identifier.
- `baseURL`: Base API URL for all hosted auth requests.
- `appName`: Prefix used for persisted package storage keys.
- `headers`: Extra request headers.
- `navigationMode`: `"router"` or `"screen"`.
- `routerMode`: `"browser"`, `"memory"`, or `"external"`.
- `basename`: Optional router basename.
- `storage`: Custom storage adapter.
- `theme`: Partial theme override.
- `links`: Legal and success redirect URLs.
- `amplify.config`: AWS Amplify config object.
- `faceLiveness.region`: AWS region for face liveness.
- `idScan.licenseKey`: IDScan license key.
- `onUnauthorized`: Callback invoked after a 401 response.
- `onStepChange`: Callback invoked when onboarding advances.
- `onComplete`: Callback invoked when auth completes with tokens.
- `onError`: Centralized error callback.

## Public API

- `OnboardingProvider`
- `OnboardingEntry`
- `OnboardingRoutes`
- `createWhiteLabeledAuthClient`
- `useWhiteLabeledAuthClient`
- `useOnboardingConfig`
- `tokenStorage`
- `navigateToStep`
- `OnboardingScreen`
- `AuthAction`

## Development

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```
