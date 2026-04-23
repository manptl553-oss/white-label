import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: Props) {
  const inputId = id || `input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="hosted-auth-input-wrapper">
      <input
        {...props}
        id={inputId}
        placeholder=" "
        className={`hosted-auth-input ${error ? "hosted-auth-input--error" : ""} ${className}`}
      />
      <label htmlFor={inputId} className="hosted-auth-input__label">
        {label}
      </label>
      {error && (
        <p className="hosted-auth-input__error">{error}</p>
      )}
    </div>
  );
}
