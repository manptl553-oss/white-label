import type { FC, SVGProps } from "react";

export const InfoIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
      <path d="M12 16v-4" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8h.01" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
