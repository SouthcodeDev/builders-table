"use client";

import { LogoMark } from "@/components/logo-mark";
import {
  BAND,
  BAND_LABEL,
  BAND_NUMBER,
  BLOB,
  CARD,
  HEADLINE,
  HOURS,
  LOGO,
  PINK,
  type StampCardData,
} from "@/lib/share-card";

/**
 * The shareable stamp, on screen. Every offset comes from lib/share-card.ts, which is
 * also what the canvas draws from — so what gets shared is what was on screen.
 *
 * Laid out in 390×844 space and scaled to the viewport, rather than reflowed. A share
 * card is a fixed composition: the photo, the white blob and the band have to keep
 * their exact relationship at any screen size, which a fluid layout would not do.
 */
export function StampCard({ data }: { data: StampCardData }) {
  return (
    <div
      className="relative overflow-hidden bg-canvas-alt"
      style={{ width: CARD.w, height: CARD.h }}
    >
      {/* the photo, full bleed — it shows above and below the blob */}
      <div
        className="photo absolute inset-0"
        style={{ backgroundImage: `url(${data.photoSrc})` }}
      />

      {/* pink wedge, top right */}
      <span
        className="absolute right-0 top-0 bg-hero"
        style={{
          width: PINK.w,
          height: PINK.h,
          borderBottomLeftRadius: "100%",
        }}
      />

      {/* the white circle the copy sits in */}
      <span
        className="absolute rounded-full bg-surface"
        style={{ left: BLOB.x, top: BLOB.y, width: BLOB.d, height: BLOB.d }}
      />

      <div className="absolute" style={{ left: LOGO.x, top: LOGO.y }}>
        <LogoMark size={LOGO.w} color="#FF5C29" />
      </div>

      {/* Canvas fillText sits on the alphabetic baseline; a div sits on its top edge.
          Offsetting by roughly the cap height keeps the two renderings aligned. */}
      <p
        className="absolute text-muted"
        style={{
          left: HOURS.x,
          top: HOURS.y - HOURS.size,
          fontSize: HOURS.size,
          lineHeight: 1,
        }}
      >
        {data.hours}
      </p>

      <h1
        className="absolute font-medium tracking-[-0.02em] text-ink"
        style={{
          left: HEADLINE.x,
          top: HEADLINE.y - HEADLINE.size,
          width: HEADLINE.maxWidth,
          fontSize: HEADLINE.size,
          lineHeight: `${HEADLINE.lineHeight}px`,
        }}
      >
        {data.headline}
      </h1>

      {/* green band, domed top */}
      <div
        className="absolute inset-x-0 bottom-0 bg-stamp"
        style={{
          height: BAND.h,
          borderTopLeftRadius: `${BAND.topRadiusX * 100}% ${BAND.topRadiusY * 100}%`,
          borderTopRightRadius: `${BAND.topRadiusX * 100}% ${BAND.topRadiusY * 100}%`,
        }}
      />
      <span
        className="absolute inset-x-0 text-center font-medium uppercase text-white/88"
        style={{
          top: BAND_LABEL.y - BAND_LABEL.size,
          fontSize: BAND_LABEL.size,
          letterSpacing: BAND_LABEL.tracking,
          lineHeight: 1,
        }}
      >
        {data.band}
      </span>
      <span
        className="absolute inset-x-0 text-center font-wordmark text-white"
        style={{
          top: BAND_NUMBER.y - BAND_NUMBER.size,
          fontSize: BAND_NUMBER.size,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {data.number}
      </span>
    </div>
  );
}
