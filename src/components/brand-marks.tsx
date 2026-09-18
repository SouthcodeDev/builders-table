/*
 * The two sign-in doors. Lucide has no brand marks — by policy it never will — and
 * the handoff set draws these as blank placeholder shapes, which read as unfinished.
 * These are the real Apple and Google wordless marks, which is what every
 * "Continue with…" button in the world puts there.
 *
 * Neither door does real auth: sign-in is a facade (AGENTS.md §1.4). The button
 * label already says "Continue with Apple" / "Continue with Google"; the mark makes
 * the screen look finished, it does not make a new claim.
 */

export function AppleMark({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M17.05 12.94c-.03-2.52 2.06-3.73 2.15-3.79-1.17-1.71-2.99-1.95-3.64-1.98-1.55-.16-3.02.91-3.81.91-.78 0-1.99-.89-3.28-.86-1.69.02-3.24.98-4.11 2.49-1.75 3.04-.45 7.54 1.26 10 .83 1.2 1.82 2.55 3.12 2.5 1.25-.05 1.72-.81 3.24-.81 1.51 0 1.94.81 3.27.79 1.35-.03 2.2-1.22 3.03-2.43.95-1.39 1.34-2.74 1.36-2.81-.03-.01-2.61-1-2.64-3.97zM14.6 5.12c.69-.84 1.16-2 1.03-3.16-1 .04-2.2.66-2.91 1.5-.64.74-1.2 1.93-1.05 3.06 1.11.09 2.25-.57 2.93-1.4z" />
    </svg>
  );
}

export function GoogleMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}
