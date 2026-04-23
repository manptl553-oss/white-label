import { useCallback, useEffect, useState } from "react";

import {
  getActiveWhiteLabeledAuthClient,
  useWhiteLabeledAuthClient,
  logger,
} from "@/core";
import { OnboardingScreen } from "@/features/onboarding/enums";

const STORAGE_KEY = "onboardingScreen";

let listeners: ((screen: OnboardingScreen) => void)[] = [];

export const setGlobalOnboardingScreen = (screen: OnboardingScreen) => {
  const client = getActiveWhiteLabeledAuthClient();
  const storage = client.storage;
  const scopedKey = client.getKey(STORAGE_KEY);

  const current = storage.getItem(scopedKey) as OnboardingScreen | null;
  if (current === screen) return;

  storage.setItem(scopedKey, screen);

  for (const listener of listeners) {
    try {
      listener(screen);
    } catch (err) {
      logger.error("Onboarding screen listener error", err);
    }
  }
};

const isValidScreen = (value: string | null): value is OnboardingScreen => {
  if (!value) return false;
  return Object.values(OnboardingScreen).includes(value as OnboardingScreen);
};

export const useOnboardingScreenStore = (): [
  OnboardingScreen,
  (next: OnboardingScreen) => void,
] => {
  const client = useWhiteLabeledAuthClient();

  const [screen, setScreen] = useState<OnboardingScreen>(() => {
    const stored = client.storage.getItem(client.getKey(STORAGE_KEY));
    return isValidScreen(stored) ? stored : OnboardingScreen.SignIn;
  });

  const setScreenState = useCallback((next: OnboardingScreen) => {
    setScreen((prev) => (prev === next ? prev : next));
    setGlobalOnboardingScreen(next);
  }, []);

  useEffect(() => {
    if (!listeners.includes(setScreenState)) listeners.push(setScreenState);
    return () => {
      listeners = listeners.filter((fn) => fn !== setScreenState);
    };
  }, [setScreenState]);

  return [screen, setScreenState];
};
