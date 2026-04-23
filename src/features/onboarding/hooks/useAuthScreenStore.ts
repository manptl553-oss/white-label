import { useState, useEffect, useCallback } from "react";
import { AuthAction } from "../enums";
import type { AuthScreenType } from "../types";

let currentScreen: AuthScreenType = AuthAction.SignIn;
const listeners = new Set<(screen: AuthScreenType) => void>();

const setScreen = (screen: AuthScreenType) => {
  currentScreen = screen;
  listeners.forEach((listener) => listener(screen));
};

export const useAuthScreen = (): [
  AuthScreenType,
  (screen: AuthScreenType) => void,
] => {
  const [screen, setLocalScreen] = useState<AuthScreenType>(currentScreen);

  useEffect(() => {
    const listener = (newScreen: AuthScreenType) => setLocalScreen(newScreen);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const memoizedSetScreen = useCallback((newScreen: AuthScreenType) => {
    setScreen(newScreen);
  }, []);

  return [screen, memoizedSetScreen];
};
