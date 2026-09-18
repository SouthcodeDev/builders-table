// The bounce mark — three tilted pills. Geometry from the Places4 handoff.
export function LogoMark({
  size = 62,
  color = "#FF4A00",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={(size * 50) / 62}
      viewBox="0 0 62 50"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <rect x="12" y="2" width="15" height="18" rx="7.5" fill={color} transform="rotate(-12 19.5 11)" />
      <rect x="34" y="16" width="15" height="17" rx="7.5" fill={color} transform="rotate(-12 41.5 24.5)" />
      <rect x="12" y="30" width="15" height="18" rx="7.5" fill={color} transform="rotate(-12 19.5 39)" />
    </svg>
  );
}
