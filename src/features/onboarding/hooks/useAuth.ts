import { useState, useCallback, useEffect } from "react";

import { useWhiteLabeledAuthClient } from "@/core";
import { useAuthScreen } from "./useAuthScreenStore";
import type { AuthScreenType, Country } from "../types";
import { LS_COUNTRY, LS_PHONE } from "../utils";
import { AuthAction } from "../enums";

interface UseAuthProps {
  initialPhone?: string;
  initialOtp?: string;
  onSignup?: (phone: string) => Promise<boolean>;
  onSignin?: (phone: string) => Promise<boolean>;
  onVerify?: (phone: string, otp: string) => Promise<boolean>;
  onResendOTP?: (phone: string) => Promise<boolean>;
}

interface UseAuthReturn {
  screen: AuthScreenType;
  phone: string;
  fullPhone: string;
  otp: string;
  setPhone: (phone: string) => void;
  setOtp: (otp: string) => void;
  setScreen: (screen: AuthScreenType) => void;
  handleAuthSignup: (selectedCountry: Country, phone: string) => Promise<void>;
  handleAuthSignin: (selectedCountry: Country, phone: string) => Promise<void>;
  handleVerify: (otp: string) => Promise<void>;
  handleResendOtp: () => Promise<boolean>;
  isLoading: boolean;
  isResendingOtp: boolean;
}

export const useAuth = ({
  initialPhone = "",
  initialOtp = "",
  onSignup,
  onSignin,
  onVerify,
  onResendOTP,
}: UseAuthProps = {}): UseAuthReturn => {
  const client = useWhiteLabeledAuthClient();
  const [screen, setScreen] = useAuthScreen();
  const phoneKey = client.getKey(LS_PHONE);
  const countryKey = client.getKey(LS_COUNTRY);

  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState(initialOtp);
  const [fullPhone, setFullPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // ─────────────────────────────────────────
  // PURE HELPER (no side effects)
  // ─────────────────────────────────────────
  const buildFullPhone = useCallback((country: Country, partial: string) => {
    return `${country.phoneCode}${partial}`;
  }, []);
  // ─────────────────────────────────────────
  // Restore full phone safely from localStorage
  // (no side effects during render)
  // ─────────────────────────────────────────
  useEffect(() => {
    const storedPhone = client.storage.getItem(phoneKey);
    const storedCountryRaw = client.storage.getItem(countryKey);

    if (!storedPhone || !storedCountryRaw) {
      setFullPhone("");
      return;
    }

    try {
      const parsedCountry: Country = JSON.parse(storedCountryRaw);
      setFullPhone(buildFullPhone(parsedCountry, storedPhone));
    } catch {
      client.storage.removeItem(phoneKey);
      client.storage.removeItem(countryKey);
      setFullPhone("");
      setScreen(AuthAction.SignIn);
    }
  }, [buildFullPhone, client.storage, countryKey, phoneKey, setScreen]);

  // ─────────────────────────────────────────
  // Signup
  // ─────────────────────────────────────────
  const handleAuthSignup = useCallback(
    async (selectedCountry: Country, phone: string) => {
      if (!selectedCountry || !phone) return;

      const full = buildFullPhone(selectedCountry, phone);

      setIsLoading(true);

      try {
        client.storage.setItem(phoneKey, phone);
        client.storage.setItem(countryKey, JSON.stringify(selectedCountry));
        setFullPhone(full);

        if (onSignup) {
          const success = await onSignup(full);
          if (success) setScreen(AuthAction.Verify);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [buildFullPhone, client.storage, countryKey, onSignup, phoneKey, setScreen],
  );

  // ─────────────────────────────────────────
  // Signin
  // ─────────────────────────────────────────
  const handleAuthSignin = useCallback(
    async (selectedCountry: Country, inputPhone: string) => {
      if (!selectedCountry || !inputPhone) return;

      const full = buildFullPhone(selectedCountry, inputPhone);

      setIsLoading(true);

      try {
        client.storage.setItem(phoneKey, inputPhone);
        client.storage.setItem(countryKey, JSON.stringify(selectedCountry));
        setFullPhone(full);

        if (onSignin) {
          const success = await onSignin(full);
          if (success) setScreen(AuthAction.Verify);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [buildFullPhone, client.storage, countryKey, onSignin, phoneKey, setScreen],
  );

  // ─────────────────────────────────────────
  // Verify
  // ─────────────────────────────────────────
  const handleVerify = useCallback(
    async (otpValue: string) => {
      if (!fullPhone || !otpValue) {
        setScreen(AuthAction.SignIn);
        return;
      }

      setIsLoading(true);

      try {
        if (onVerify) {
          const success = await onVerify(fullPhone, otpValue);
          if (success) {
            client.storage.removeItem(phoneKey);
            client.storage.removeItem(countryKey);
            setFullPhone("");
            setScreen(AuthAction.SignIn);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [client.storage, countryKey, fullPhone, onVerify, phoneKey, setScreen],
  );

  // ─────────────────────────────────────────
  // Resend
  // ─────────────────────────────────────────
  const handleResendOtp = useCallback(async (): Promise<boolean> => {
    if (!fullPhone) {
      setScreen(AuthAction.SignIn);
      return false;
    }

    setIsResendingOtp(true);
    setOtp("");

    try {
      if (onResendOTP) {
        return await onResendOTP(fullPhone);
      }
      return false;
    } finally {
      setIsResendingOtp(false);
    }
  }, [fullPhone, onResendOTP, setScreen]);

  return {
    screen,
    phone,
    fullPhone,
    otp,
    setPhone,
    setOtp,
    setScreen,
    handleAuthSignup,
    handleAuthSignin,
    handleVerify,
    handleResendOtp,
    isLoading,
    isResendingOtp,
  };
};
