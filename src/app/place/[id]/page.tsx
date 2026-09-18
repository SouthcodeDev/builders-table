"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { COPY, formatDayLabel, formatLocal, placeById } from "@/data/seed";
import { formatDistance } from "@/data/geo";
import { AvatarStack } from "@/components/avatar-stack";
import { InviteSheet } from "@/components/invite-sheet";
import { usePlaces } from "@/state/places";

export default function PlaceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { friends, attendanceFor, distanceTo, addPlan, sendInvite } = usePlaces();
  const [inviting, setInviting] = useState(false);

  const place = placeById(params.id);
  if (!place) {
    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center bg-canvas px-6 text-center text-sm text-ink-50">
        That one is gone.
      </main>
    );
  }

  const attendance = attendanceFor(place.id);
  const meta = [
    formatDayLabel(place),
    formatLocal(place),
    formatDistance(distanceTo(place)),
    place.price ?? null,
  ]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  const going = attendance.friends.length > 0 ? attendance.friends : null;
  const goingLine =
    going && going.length > 1
      ? `${going.map((f) => f.name.split(" ")[0]).slice(0, -1).join(", ")} and ${going
          .slice(-1)
          .map((f) => f.name.split(" ")[0])} are going`
      : going
        ? `${going[0].name.split(" ")[0]} is going`
        : attendance.base > 0
          ? `${attendance.base} people going · none you know yet`
          : null;

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div
        className="photo relative h-[380px] w-full shrink-0"
        style={{ backgroundImage: `url(${place.image})` }}
      >
        <span className="absolute inset-0 bg-gradient-to-t from-[rgba(8,7,14,0.7)] to-transparent [height:55%] bottom-0 top-auto" />
        <button
          onClick={() => router.push("/discover")}
          aria-label="Back"
          className="absolute left-5 top-safe-plus grid h-[34px] w-[34px] place-items-center rounded-full bg-[rgba(10,10,10,0.4)]"
          style={{ top: "max(env(safe-area-inset-top), 54px)" }}
        >
          <span className="block h-2.5 w-2.5 -rotate-45 border-x-2 border-b-2 border-white/90" />
        </button>
        <div className="absolute inset-x-5 bottom-[18px] text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/80">
            {meta}
          </p>
          <h1 className="mt-1.5 text-[28px] font-medium leading-[1.1] tracking-[-0.02em]">
            {place.title}
          </h1>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pt-5">
        <p className="text-[15px] leading-[1.6] text-ink-60">{place.blurb}</p>
        {going ? (
          <div className="flex items-center gap-2.5">
            <AvatarStack people={going} size={28} />
            <span className="text-[13px] text-ink-60">{goingLine}</span>
          </div>
        ) : goingLine ? (
          <div className="flex items-center gap-2 rounded-xl bg-canvas-soft px-3.5 py-2.5">
            <span className="h-2 w-2 rounded-full bg-hero" />
            <span className="text-[13px] text-ink-60">{goingLine}</span>
          </div>
        ) : null}
        {friends.length > 0 && (
          <button
            onClick={() => setInviting(true)}
            className="self-start text-[15px] font-medium text-hero"
          >
            {COPY.event.plan}
          </button>
        )}
      </div>

      <div className="flex gap-2.5 px-5 pt-4 pb-safe">
        <button
          onClick={() => {
            addPlan(place.id, "going");
            router.push("/plans");
          }}
          className="button flex h-[54px] flex-1 items-center justify-center border-[1.5px] border-ink-16 text-[15px] font-medium"
        >
          {COPY.event.going}
        </button>
        <button
          onClick={() => router.push(`/go/${place.id}`)}
          className="button flex h-[54px] flex-1 items-center justify-center bg-hero text-[15px] font-medium text-white shadow-hero"
        >
          {COPY.event.directions}
        </button>
      </div>

      <InviteSheet
        open={inviting}
        onOpenChange={setInviting}
        place={place}
        friends={friends}
        onSend={(toUserIds, note) => {
          void sendInvite(place.id, toUserIds, note);
          addPlan(place.id, "going", toUserIds);
          router.push("/invite/sent");
        }}
      />
    </main>
  );
}
