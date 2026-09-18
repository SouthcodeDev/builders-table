export function LogoMark({
  size = 18,
  color = "currentColor",
  dotColor = "#FFFFFF",
}: {
  size?: number;
  color?: string;
  dotColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.82}
      viewBox="0 0 22 18"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M11 0.5C6.3 0.5 2.8 3.9 2.8 8.2c0 5.5 8.2 9.3 8.2 9.3s8.2-3.8 8.2-9.3C19.2 3.9 15.7 0.5 11 0.5Z"
        fill={color}
      />
      <circle cx="11" cy="7.9" r="2.9" fill={dotColor} />
    </svg>
  );
}
