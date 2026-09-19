// share-card.ts — the stamp card's geometry, and the canvas that turns it into a
// real PNG for the iOS share sheet.
//
// The numbers below are the ONLY copy of the layout. The React card in
// components/stamp-card.tsx positions itself from them and this file draws from them,
// so the shared image and the screen cannot drift apart. Everything is in 390×844
// logical space and scaled up at draw time.

import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/logo-mark";

export const CARD = { w: 390, h: 844 };

/** Top-right pink wedge. A box whose bottom-left corner is an elliptical arc. */
export const PINK = { w: 210, h: 120 };

/** The big white circle the copy sits in. Runs off the left edge on purpose. */
export const BLOB = { x: -70, y: 70, d: 440 };

/** Green band across the foot of the card. */
export const BAND = { h: 160, topRadiusX: 0.55, topRadiusY: 0.4 };

export const PAD = 48;
export const LOGO = { x: 48, y: 186, w: 95 };
export const HOURS = { x: 48, y: 288, size: 13 };
export const HEADLINE = {
  x: 48,
  y: 318,
  size: 31,
  lineHeight: 36,
  maxWidth: 292,
  /** Matches the DOM's tracking-[-0.02em]. Without it canvas wraps a word earlier. */
  tracking: -0.02,
};
export const BAND_LABEL = { y: 752, size: 11, tracking: 1.5 };
export const BAND_NUMBER = { y: 806, size: 42 };

export const COLORS = {
  pink: "#FFBEBE",
  white: "#FFFFFF",
  ink: "#0A0A0A",
  muted: "#6E6E76",
  green: "#8CC63F",
  pop: "#FF5C29",
};

export type StampCardData = {
  headline: string;
  hours: string;
  band: string;
  number: string;
  photoSrc: string;
};

/**
 * Downscale a picked photo before it goes anywhere near localStorage. A modern phone
 * photo is 3–6 MB; the whole localStorage budget is about 5 MB, and blowing it throws
 * and takes the rest of the persisted state down with it.
 */
export async function downscaleImage(file: File, maxEdge = 1200): Promise<string> {
  const bitmap = await loadImage(URL.createObjectURL(file), true);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function loadImage(src: string, revoke = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Same-origin for seed photos and data:/blob: for picked ones. Set anyway so a
    // future remote photo cannot silently taint the canvas and break toBlob.
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (revoke) URL.revokeObjectURL(src);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`image failed: ${src.slice(0, 40)}`));
    img.src = src;
  });
}

/**
 * Fonts are loaded by CSS for the DOM, but canvas will silently fall back to a system
 * face if the face is not resident when fillText runs — the PNG then looks nothing
 * like the screen. Force both faces in before drawing.
 */
async function ensureFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load('500 31px "FT Polar"'),
    document.fonts.load('400 13px "FT Polar"'),
    document.fonts.load('900 42px "PP Watch"'),
  ]);
  await document.fonts.ready;
}

/** Greedy word wrap against the real measured width. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Cover-fit, like background-size: cover. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export async function renderStampCard(
  data: StampCardData,
  scale = 3,
): Promise<Blob> {
  const [photo] = await Promise.all([loadImage(data.photoSrc), ensureFonts()]);

  const canvas = document.createElement("canvas");
  canvas.width = CARD.w * scale;
  canvas.height = CARD.h * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.scale(scale, scale);

  // 1 — the photo, full bleed. It shows through above and below the white blob.
  drawCover(ctx, photo, CARD.w, CARD.h);

  // 2 — pink wedge, top right. Quarter ellipse matching border-bottom-left-radius:100%.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(CARD.w, 0);
  ctx.lineTo(CARD.w - PINK.w, 0);
  ctx.ellipse(CARD.w, 0, PINK.w, PINK.h, 0, Math.PI, Math.PI / 2, true);
  ctx.closePath();
  ctx.fillStyle = COLORS.pink;
  ctx.fill();
  ctx.restore();

  // 3 — the white circle
  ctx.beginPath();
  ctx.arc(BLOB.x + BLOB.d / 2, BLOB.y + BLOB.d / 2, BLOB.d / 2, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.white;
  ctx.fill();

  // 4 — the mark, from the same paths the DOM logo uses
  ctx.save();
  ctx.translate(LOGO.x, LOGO.y);
  const logoScale = LOGO.w / LOGO_VIEWBOX.w;
  ctx.scale(logoScale, logoScale);
  for (const p of LOGO_PATHS) {
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = COLORS.pop;
    ctx.fill(new Path2D(p.d));
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // 5 — hours line
  ctx.fillStyle = COLORS.muted;
  ctx.font = `400 ${HOURS.size}px "FT Polar", system-ui, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(data.hours, HOURS.x, HOURS.y);

  // 6 — headline. Tracking is set BEFORE wrapping, so measureText sees the same
  // widths the DOM does and the two break at the same words.
  ctx.fillStyle = COLORS.ink;
  ctx.font = `500 ${HEADLINE.size}px "FT Polar", system-ui, sans-serif`;
  ctx.letterSpacing = `${HEADLINE.tracking * HEADLINE.size}px`;
  const lines = wrap(ctx, data.headline, HEADLINE.maxWidth);
  lines.forEach((line, i) => {
    ctx.fillText(line, HEADLINE.x, HEADLINE.y + i * HEADLINE.lineHeight);
  });
  ctx.letterSpacing = "0px";

  // 7 — green band with the domed top
  const bandTop = CARD.h - BAND.h;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, CARD.h);
  ctx.lineTo(0, bandTop + BAND.h * BAND.topRadiusY);
  ctx.ellipse(
    CARD.w / 2,
    bandTop + BAND.h * BAND.topRadiusY,
    CARD.w / 2,
    BAND.h * BAND.topRadiusY,
    0,
    Math.PI,
    0,
  );
  ctx.lineTo(CARD.w, CARD.h);
  ctx.closePath();
  ctx.fillStyle = COLORS.green;
  ctx.fill();
  ctx.restore();

  // 8 — band copy
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = `500 ${BAND_LABEL.size}px "FT Polar", system-ui, sans-serif`;
  ctx.letterSpacing = `${BAND_LABEL.tracking}px`;
  ctx.fillText(data.band.toUpperCase(), CARD.w / 2, BAND_LABEL.y);

  ctx.letterSpacing = "0px";
  ctx.fillStyle = COLORS.white;
  ctx.font = `900 ${BAND_NUMBER.size}px "PP Watch", "FT Polar", sans-serif`;
  ctx.fillText(data.number, CARD.w / 2, BAND_NUMBER.y);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned null"))),
      "image/png",
    );
  });
}

export type ShareOutcome = "shared" | "downloaded";

/**
 * Hand the PNG to the OS. navigator.share with files is the real thing on iOS; the
 * download fallback is for desktop Chrome, which is where this gets rehearsed.
 */
export async function shareStampCard(
  data: StampCardData,
  filename: string,
): Promise<ShareOutcome> {
  const blob = await renderStampCard(data);
  const file = new File([blob], filename, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    navigator.canShare?.({ files: [file] }) &&
    navigator.share
  ) {
    await navigator.share({ files: [file] });
    return "shared";
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Revoking synchronously can beat the download on Safari.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return "downloaded";
}
