import { useState, type ReactNode } from "react";
import { useThemeConfig } from "@/app/providers/ThemeProvider";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  logo?: string;
  loader?: boolean;
}

export function AuthCard({ title, subtitle, children, logo, loader }: Props) {
  const { name } = useThemeConfig();
  const [logoLoaded, setLogoLoaded] = useState(false);

  return (
    <div className="hosted-auth-card">
      <div className="hosted-auth-card__inner">
        {(logo || name) && (
          <div className="hosted-auth-card__brand">
            {logo && (
              <div className="hosted-auth-card__logo-wrapper">
                {!logoLoaded && <div className="hosted-auth-card__logo-skeleton" />}
                <img
                  src={logo}
                  alt="Logo"
                  className={`hosted-auth-card__logo-img ${logoLoaded ? "hosted-auth-card__logo-img--visible" : ""}`}
                  onLoad={() => setLogoLoaded(true)}
                />
              </div>
            )}
            {name && (
              <span className="hosted-auth-card__brand-name">{name}</span>
            )}
          </div>
        )}
        <h1 className="hosted-auth-card__title">{title}</h1>
        <p className="hosted-auth-card__subtitle">{subtitle}</p>
        <div className="hosted-auth-card__content">{children}</div>
        {loader && (
          <div
            className="hosted-auth-card__overlay"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="hosted-auth-card__overlay-spinner-wrap">
              <div className="hosted-auth-card__overlay-spinner" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
