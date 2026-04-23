type Props = {
  size?: "default" | "lg";
  className?: string;
};

export function Loader({ size, className }: Props) {
  const sizeClass = size === "lg" ? "hosted-auth-loader--lg" : "";
  return (
    <div
      className={`hosted-auth-loader ${sizeClass} ${className ?? ""}`}
      role="status"
      aria-label="Loading"
    />
  );
}
