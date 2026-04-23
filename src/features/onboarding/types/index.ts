import { AuthAction } from "../enums";

export interface Country {
  name: string;
  iso2CountryCode: string;
  iso3CountryCode: string;
  phoneCode: string; // already "+91"
  flagCode: string; // "U+1F1E6 U+1F1EB" OR emoji
}

export type AuthScreenType = AuthAction;

export interface FormValues {
  country: Country;
  phone: string;
  otp: string;
  consent: boolean;
}
