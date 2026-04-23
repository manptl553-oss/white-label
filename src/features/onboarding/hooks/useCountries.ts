import { useEffect, useMemo, useState } from "react";
import { useWhiteLabeledAuthClient, logger } from "@/core";
import { COUNTRY_LIST, PREFERRED_COUNTRY_CODE } from "../utils";
import type { Country } from "../types";

export const useCountries = (preferredCountryCode?: string) => {
  const client = useWhiteLabeledAuthClient();
  const preferredStorageKey = client.getKey(PREFERRED_COUNTRY_CODE);

  const [detectedCountryCode, setDetectedCountryCode] = useState<string | null>(
    null,
  );
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const explicitCode = preferredCountryCode?.trim();
    const storedCode = client.storage.getItem(preferredStorageKey);

    // If we already have explicit, stored, or detected code, skip fetching
    if (!explicitCode && !storedCode && !detectedCountryCode) {
      const detectCountry = async () => {
        setIsDetecting(true);
        try {
          const res = await fetch("https://ipapi.co/country_code/");
          if (!res.ok) throw new Error("Failed to fetch country code");

          const code = await res.text();
          const cleanCode = code.trim();

          if (
            cleanCode &&
            cleanCode.length === 2 &&
            !cleanCode.toLowerCase().includes("error")
          ) {
            setDetectedCountryCode(cleanCode);
            client.storage.setItem(preferredStorageKey, cleanCode);
          }
        } catch (error) {
          logger.error("Error detecting country:", error);
        } finally {
          setIsDetecting(false);
        }
      };

      detectCountry();
    }
  }, [
    client.storage,
    detectedCountryCode,
    preferredCountryCode,
    preferredStorageKey,
  ]);

  const resolvedCountryCode =
    preferredCountryCode?.trim() ||
    client.storage.getItem(preferredStorageKey) ||
    detectedCountryCode ||
    client.config.country.defaultCountryCode ||
    "US";

  const defaultCountry = useMemo<Country>(() => {
    const found = COUNTRY_LIST.find(
      (c) =>
        c.iso2CountryCode.toLowerCase() === resolvedCountryCode.toLowerCase(),
    );

    const fallback =
      found ?? COUNTRY_LIST.find((c) => c.iso2CountryCode === "US")!;
    return fallback;
  }, [resolvedCountryCode]);

  return {
    loading: false,
    error: null,
    defaultCountry,
    isCountryDetecting: isDetecting,
  };
};
