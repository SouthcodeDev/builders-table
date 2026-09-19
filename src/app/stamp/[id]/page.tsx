"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ImagePlus, Share2 } from "lucide-react";
import { COPY } from "@/data/seed";
import { StampCard } from "@/components/stamp-card";
import { CARD, downscaleImage, shareStampCard, type StampCardData } from "@/lib/share-card";
import { usePlaces } from "@/state/places";

/** "Woodstock, Muizenberg and Observatory" */
function listAreas(areas: string[]): string {
  if (areas.length === 0) return "town";
  if (areas.length === 1) return areas[0];
  return `${areas.slice(0, -1).join(", ")} and ${areas[areas.length - 1]}`;
}

type Status = { kind: "idle" | "working" | "error" | "done"; message?: string };

export default function StampPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { ready, passport, stampPhotos, setStampPhoto } = usePlaces();
  const fileRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // The card is a fixed 390×844 composition, so it is scaled to the stage rather than
  // reflowed — the photo, the blob and the band have to hold their relationship.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setScale(Math.min(width / CARD.w, height / CARD.h));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [ready]);

  const stamp = passport?.stamps.find((s) => s.id === params.id);
  const photo = stamp ? stampPhotos[stamp.id] : undefined;

  const onPick = useCallback(
    async (file: File | undefined) => {
      if (!file || !stamp) return;
      setStatus({ kind: "working" });
      try {
        setStampPhoto(stamp.id, await downscaleImage(file));
        setStatus({ kind: "idle" });
      } catch {
        setStatus({ kind: "error", message: "That photo could not be read." });
      }
    },
    [stamp, setStampPhoto],
  );

  const onShare = useCallback(
    async (data: StampCardData) => {
      setStatus({ kind: "working", message: COPY.stamp.sharing });
      try {
        // data.number is the display string ("Stamp 26") — digits only for a filename.
        const slug = data.number.replace(/\D/g, "") || "card";
        const outcome = await shareStampCard(data, `places-stamp-${slug}.png`);
        setStatus(
          outcome === "downloaded"
            ? { kind: "done", message: COPY.stamp.saved }
            : { kind: "idle" },
        );
      } catch (err) {
        // The user dismissing the iOS share sheet rejects with AbortError. That is
        // not a failure and must not show an error on stage.
        if (err instanceof Error && err.name === "AbortError") {
          setStatus({ kind: "idle" });
          return;
        }
        setStatus({ kind: "error", message: COPY.stamp.shareFailed });
      }
    },
    [],
  );

  if (!ready) return <main className="min-h-dvh flex-1 bg-ink" />;

  if (!stamp) {
    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center bg-ink px-6 text-center text-sm text-white/60">
        That stamp is gone.
      </main>
    );
  }

  const data: StampCardData = {
    headline: COPY.stamp.headline[stamp.kind](listAreas(stamp.areas)),
    hours: COPY.stamp.hours(stamp.hours, stamp.withFriends),
    band: COPY.stamp.band[stamp.kind],
    number: COPY.stamp.number(stamp.number),
    photoSrc: photo ?? "",
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-ink">
      <div ref={stageRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {photo ? (
          // Absolute, because transform: scale() does not change layout size — left in
          // flow, the card's intrinsic 844px pushes the action bar off the screen.
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            <StampCard data={data} />
          </div>
        ) : (
          <div className="flex max-w-[280px] flex-col items-center gap-5 px-6 text-center">
            <span className="grid h-[72px] w-[72px] place-items-center rounded-full bg-white/10">
              <ImagePlus size={28} strokeWidth={1.75} className="text-white/70" aria-hidden />
            </span>
            <div>
              <p className="text-[20px] font-medium leading-[1.2] text-white">
                {stamp.title}
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.5] text-white/55">
                {COPY.stamp.photoPrompt}
              </p>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="button h-[50px] bg-surface px-6 text-[15px] font-medium text-ink"
            >
              {COPY.stamp.addPhoto}
            </button>
          </div>
        )}

        {/* Offset rather than padded — it sits over the card. Same rhythm as pt-safe. */}
        <button
          onClick={() => router.back()}
          aria-label="Back"
          style={{ top: "max(env(safe-area-inset-top), 54px)" }}
          className="absolute left-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/35 backdrop-blur-sm"
        >
          <ChevronLeft size={20} strokeWidth={2.25} className="text-white" aria-hidden />
        </button>
      </div>

      <div className="shrink-0 px-4 pb-safe pt-3">
        {status.message && (
          <p
            className={`pb-2 text-center text-[13px] ${
              status.kind === "error" ? "text-pop" : "text-white/60"
            }`}
          >
            {status.message}
          </p>
        )}
        <div className="flex gap-2.5">
          <button
            onClick={() => fileRef.current?.click()}
            className="button h-[54px] flex-1 border-[1.5px] border-white/25 text-[15px] font-medium text-white"
          >
            {photo ? COPY.stamp.replacePhoto : COPY.stamp.addPhoto}
          </button>
          <button
            onClick={() => void onShare(data)}
            disabled={!photo || status.kind === "working"}
            className="button flex h-[54px] flex-[1.4] items-center justify-center gap-2.5 bg-pop text-[15px] font-medium text-white disabled:opacity-40"
          >
            <Share2 size={18} strokeWidth={2.25} aria-hidden />
            {COPY.stamp.share}
          </button>
        </div>
      </div>

      {/*
        accept without capture, so iOS offers Photo Library as well as the camera —
        the photo from the event is already on the phone by the time this screen opens.
      */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void onPick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </main>
  );
}
