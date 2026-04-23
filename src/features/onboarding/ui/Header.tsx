import type { FC, ReactNode } from "react";

import { useFlowEngineContext } from "@/features/onboarding/engine";

type HeaderProps = {
  title?: string;
  rightIcon?: ReactNode;
  leftIcon?: ReactNode | null;
  onLeftClick?: () => void;
  titleClassName?: string;
  wrapperClassName?: string;
  disabled?: boolean;
};

export const Header: FC<HeaderProps> = ({
  title,
  titleClassName,
  rightIcon,
  leftIcon,
  onLeftClick,
  wrapperClassName,
  disabled = false,
}) => {
  const { goTo, goBack, resolvedBackTarget } = useFlowEngineContext();

  const handleLeftClick = (): void => {
    if (onLeftClick) {
      onLeftClick();
      return;
    }
    if (resolvedBackTarget === false) return;
    if (resolvedBackTarget !== undefined) {
      goTo({ screen: resolvedBackTarget });
      return;
    }
    goBack();
  };

  const showBackArrow = leftIcon !== null && resolvedBackTarget !== false;

  const renderLeftIcon = () => {
    if (!showBackArrow) return <div className="hosted-auth-header__spacer" />;

    return (
      <button
        disabled={disabled}
        onClick={handleLeftClick}
        className="hosted-auth-header__back-btn"
        aria-label="Go back"
      >
        {leftIcon || (
          <svg
            className="hosted-auth-header__back-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        )}
      </button>
    );
  };

  return (
    <div className={`hosted-auth-header ${wrapperClassName ?? ""}`}>
      <div className="hosted-auth-header__inner">
        <div className="hosted-auth-header__left">{renderLeftIcon()}</div>
        <h1 className={`hosted-auth-header__title ${titleClassName ?? ""}`}>
          {title}
        </h1>
        <div className="hosted-auth-header__right">
          {rightIcon || <div style={{ width: "1.5rem" }} />}
        </div>
      </div>
    </div>
  );
};
