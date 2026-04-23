import type { ButtonHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className = "",
  isLoading = false,
  loadingText,
  isDisabled = false,
  title,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "link";
  isLoading?: boolean;
  loadingText?: string;
  isDisabled?: boolean;
  title?: string;
}) {
  return (
    <button
      disabled={isDisabled || isLoading}
      className={`hosted-auth-button hosted-auth-button--${variant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="hosted-auth-button__spinner">
          <span className="hosted-auth-button__spinner-dot" />
          {loadingText && loadingText}
        </span>
      ) : (
        title || children
      )}
    </button>
  );
}
