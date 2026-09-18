// The bounce mark — the actual logo SVG (three blobs), colour-parametric so
// it can render in white on hero surfaces.
export function LogoMark({
  size = 90,
  color = "#FF5309",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={(size * 53) / 90}
      viewBox="0 0 90 53"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M42.282 0C49.6304 -7.27232e-07 55.5874 4.76568 55.5874 10.6445C55.5874 16.5232 49.6304 21.2889 42.282 21.2889C34.9337 21.2889 28.9766 16.5232 28.9766 10.6445C28.9766 4.76569 34.9337 7.27239e-07 42.282 0Z"
        fill={color}
        fillOpacity={0.5}
      />
      <path
        d="M20.7486 44.1112C17.3298 51.0164 10.3274 54.3841 5.10819 51.6334C-0.111006 48.8826 -1.57055 41.055 1.84821 34.1498C5.26697 27.2447 12.2694 23.8769 17.4886 26.6276C22.7078 29.3784 24.1674 37.206 20.7486 44.1112Z"
        fill={color}
        fillOpacity={0.25}
      />
      <path
        d="M72.9499 27.4706C82.3041 27.8447 89.6968 32.9098 89.4618 38.7839C89.2269 44.658 81.4534 49.1166 72.0993 48.7425C62.7451 48.3685 55.3525 43.3033 55.5874 37.4292C55.8223 31.5552 63.5958 27.0965 72.9499 27.4706Z"
        fill={color}
      />
    </svg>
  );
}
