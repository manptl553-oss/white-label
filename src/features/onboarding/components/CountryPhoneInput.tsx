import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useScreenTexts } from "@/app/providers/ThemeProvider";
import { COUNTRY_LIST } from "../utils";
import type { Country, FormValues } from "../types";
import { OnboardingScreen } from "../onboarding.enums";

interface Props {
  defaultCountry: Country;
}

export function CountryPhoneInput({ defaultCountry }: Props) {
  const { control, setValue } = useFormContext<FormValues>();
  const texts = useScreenTexts(OnboardingScreen.SignIn);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setValue("country", defaultCountry);
  }, [defaultCountry, setValue]);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return COUNTRY_LIST;
    return COUNTRY_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.iso2CountryCode.toLowerCase().includes(query) ||
        c.phoneCode.includes(search),
    );
  }, [search]);

  return (
    <div className="hosted-auth-country-input">
      {/* COUNTRY CONTROLLER */}
      <Controller
        name="country"
        control={control}
        rules={{ required: true }}
        render={({
          field,
        }: {
          field: { value: Country; onChange: (value: Country) => void };
        }) => {
          const currentCountry = field.value || defaultCountry;

          return (
            <>
              {/* Selected Country Button */}
              <button
                type="button"
                className="hosted-auth-country-select-btn"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
              >
                <img
                  src={`https://flagcdn.com/${currentCountry.iso2CountryCode.toLowerCase()}.svg`}
                  alt={currentCountry.name}
                  className="hosted-auth-country-flag"
                  width="24"
                  height="18"
                  loading="lazy"
                />
                <span className="hosted-auth-country-label">
                  {currentCountry.name},{" "}
                  {currentCountry.iso2CountryCode.toUpperCase()}{" "}
                  {currentCountry.phoneCode}
                </span>

                {/* Chevron */}
                <svg
                  className={`hosted-auth-country-chevron ${isOpen ? "hosted-auth-country-chevron--open" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="20"
                  height="20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {isOpen && (
                <div className="hosted-auth-country-dropdown">
                  {/* Search Box */}
                  <div className="hosted-auth-country-search">
                    <div className="hosted-auth-country-search__inner">
                      <svg
                        className="hosted-auth-country-search__icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder={texts.searchCountryPlaceholder}
                        className="hosted-auth-country-search__input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Country List */}
                  <div className="hosted-auth-country-list">
                    {filteredCountries.map((country) => (
                      <div
                        key={country.iso2CountryCode}
                        className={`hosted-auth-country-item ${
                          country.iso2CountryCode === currentCountry.iso2CountryCode
                            ? "hosted-auth-country-item--selected"
                            : ""
                        }`}
                        onClick={() => {
                          field.onChange(country);
                          setIsOpen(false);
                          setSearch("");
                        }}
                      >
                        <span className="hosted-auth-country-item__flag-wrap">
                          <img
                            src={`https://flagcdn.com/${country.iso2CountryCode.toLowerCase()}.svg`}
                            alt={country.name}
                            className="hosted-auth-country-item__flag"
                            width="24"
                            height="18"
                            loading="lazy"
                          />
                        </span>
                        <span className="hosted-auth-country-item__name">
                          {country.name},{" "}
                          <span className="hosted-auth-country-item__code">
                            {country.iso2CountryCode} {country.phoneCode}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        }}
      />

      {/* PHONE CONTROLLER */}
      <Controller
        name="phone"
        control={control}
        rules={{ required: "Phone number is required" }}
        render={({
          field,
        }: {
          field: { value: string; onChange: (value: string) => void };
        }) => (
          <div className="hosted-auth-phone-wrapper">
            <input
              type="tel"
              className="hosted-auth-phone-input"
              placeholder=" "
              value={field.value}
              onChange={(e) =>
                field.onChange(e.target.value.replace(/\D/g, ""))
              }
              inputMode="numeric"
              id="phone-input"
            />
            <label htmlFor="phone-input" className="hosted-auth-phone-label">
              {texts.phoneNumberLabel}
            </label>
          </div>
        )}
      />

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="hosted-auth-click-trap"
          onClick={() => {
            setIsOpen(false);
            setSearch("");
          }}
        />
      )}
    </div>
  );
}
