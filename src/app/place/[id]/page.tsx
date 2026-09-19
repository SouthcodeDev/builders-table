"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Check, Navigation, X } from "lucide-react";
import { useState } from "react";
import {
  COPY,
  closingLabel,
  formatLocal,
  isStartingSoon,
  minutesUntil,
  placeById,
  weekdayOf,
  type Person,
} from "@/data/seed";
import { formatDistance } from "@/data/geo";
import { AvatarStack } from "@/components/avatar-stack";
import { InviteSheet } from "@/components/invite-sheet";
import { MapSnippet } from "@/components/map-snippet";
import { InviteSentSheet } from "@/components/invite-sent-sheet";
import { usePlaces } from "@/state/places";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-tile bg-canvas-soft px-3 py-2.5">
      <span className="kicker">{label}</span>
      <span className="truncate text-[15px] font-medium">{value}</span>
    </div>
  );
}

export default function PlaceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const {
    ready, user, friends, attendanceFor, distanceTo, addPlan, removePlan, planFor,
    sendInvite,
  } = usePlaces();
  const [inviting, setInviting] = useState(false);
  const [sentTo, setSentTo] = useState<Person[] | null>(null);

  // Business-created events only resolve after hydrate (see data/registry.ts), so
  // never decide "gone" before the provider is ready.
  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-canvas" />;
  }

  const place = placeById(params.id);
  if (!place) {
    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center bg-canvas px-6 text-center text-sm text-ink-50">
        That one is gone.
      </main>
    );
  }

  const plan = planFor(place.id);
  const going = plan?.status === "going";
  const saved = plan?.status === "saved";

  const attendance = attendanceFor(place.id);
  const attending = attendance.friends;
  const others = Math.max(0, attendance.base - attending.length);
  const goingLine =
    attending.length > 0
      ? (() => {
          const names = attending.map((f) => f.name.split(" ")[0]);
          const who =
            names.length > 1
              ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
              : names[0];
          return others > 0
            ? `${who} and ${others} others are going`
            : `${who} ${names.length > 1 ? "are" : "is"} going`;
        })()
      : attendance.base > 0
        ? `${attendance.base} people going · none you know yet`
        : null;

  const mins = minutesUntil(place);
  const isEvent = place.kind === "event";

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col bg-canvas">
      <div
        className="photo relative h-[292px] w-full shrink-0"
        style={{ backgroundImage: `url(${place.image})` }}
      >
        <span className="scrim-tile absolute inset-x-0 bottom-0 h-[45%]" />
        <button
          onClick={() =>
            window.history.length > 1 ? router.back() : router.push("/discover")
          }
          aria-label="Back"
          className="absolute left-5 grid h-[34px] w-[34px] place-items-center rounded-full bg-[rgba(10,10,10,0.4)] backdrop-blur-sm"
          style={{ top: "max(env(safe-area-inset-top), 54px)" }}
        >
          <ArrowLeft size={18} strokeWidth={2.25} className="text-white" aria-hidden />
        </button>
        <button
          onClick={() => (saved ? removePlan(place.id) : addPlan(place.id, "saved"))}
          aria-label={saved ? "Remove from saved" : "Save for later"}
          aria-pressed={saved}
          disabled={going}
          className="absolute right-5 grid h-[44px] w-[44px] place-items-center rounded-full bg-surface shadow-pill disabled:opacity-45"
          style={{ top: "max(env(safe-area-inset-top), 49px)" }}
        >
          <Bookmark
            size={19}
            strokeWidth={2}
            className="text-pop"
            fill={saved ? "currentColor" : "none"}
            aria-hidden
          />
        </button>
        {isEvent && isStartingSoon(place, 180) && (
          <span className="absolute bottom-[52px] left-5 flex items-center gap-2 rounded-full bg-[rgba(10,10,10,0.74)] px-3.5 py-2 text-[12px] font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-pop" />
            {COPY.event.startsIn(mins)}
          </span>
        )}
      </div>

      {/* Scroll region. The action bar below is pinned, so it pads for it. */}
      <div className="relative -mt-[30px] flex min-h-0 flex-1 flex-col gap-5 rounded-t-[28px] bg-surface px-5 pb-[170px] pt-7">
        <div>
          <h1 className="text-[29px] font-medium leading-[1.08] tracking-[-0.025em]">
            {place.title}
          </h1>
          <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-pop">
            {`${weekdayOf(place)} · ${place.area}`}
          </p>
        </div>

        <div className="flex gap-2.5">
          <Stat
            label={isEvent ? COPY.event.statStarts : COPY.event.statCloses}
            value={(isEvent ? formatLocal(place) : closingLabel(place)).toUpperCase()}
          />
          <Stat label={COPY.event.statAway} value={formatDistance(distanceTo(place)).toLowerCase()} />
          {place.price && <Stat label={COPY.event.statCosts} value={place.price} />}
        </div>

        <p className="text-[15px] leading-[1.6] text-ink-60">{place.blurb}</p>

        {goingLine && (
          <div className="flex items-center gap-3 border-t border-ink-07 pt-4">
            {attending.length > 0 && (
              <AvatarStack people={attending} size={30} max={3} extra={others} />
            )}
            <span className="text-[13px] leading-[1.4] text-ink-60">{goingLine}</span>
          </div>
        )}

        <div className="border-t border-ink-07 pt-4">
          <MapSnippet
            place={place}
            distanceKm={distanceTo(place)}
            onPress={() => router.push(`/go/${place.id}`)}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full flex-col gap-2.5 bg-surface px-5 pt-3 pb-safe">
        {going ? (
          <>
            <button
              onClick={() => router.push(`/go/${place.id}`)}
              className="button flex h-[54px] w-full items-center justify-center gap-2 bg-pop text-[15px] font-medium text-white shadow-pop"
            >
              <Navigation size={16} strokeWidth={2.25} aria-hidden />
              {COPY.event.directions}
            </button>
            <button
              onClick={() => removePlan(place.id)}
              className="button flex h-[54px] w-full items-center justify-center gap-2 border-[1.5px] border-pop text-[15px] font-medium"
            >
              {COPY.event.countMeOut}
              <X size={16} strokeWidth={2.25} aria-hidden />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => addPlan(place.id, "going")}
              className="button flex h-[54px] w-full items-center justify-center gap-2 bg-pop text-[15px] font-medium text-white shadow-pop"
            >
              {COPY.event.going}
              <Check size={16} strokeWidth={2.75} aria-hidden />
            </button>
            {friends.length > 0 && (
              <button
                onClick={() => setInviting(true)}
                className="button flex h-[54px] w-full items-center justify-center border-[1.5px] border-lime text-[15px] font-medium"
              >
                {COPY.event.plan}
              </button>
            )}
          </>
        )}
      </div>

      <InviteSheet
        open={inviting}
        onOpenChange={setInviting}
        place={place}
        friends={friends}
        onSend={(toUserIds, note) => {
          void sendInvite(place.id, toUserIds, note);
          addPlan(place.id, "going", toUserIds);
          const to = friends.filter((f) => toUserIds.includes(f.id));
          // ponytail: let the invite drawer finish sliding out before the sent one
          // slides in, otherwise both backdrops stack and the scrim double-darkens.
          setTimeout(() => setSentTo(to), 260);
        }}
      />

      {sentTo && (
        <InviteSentSheet
          open
          onOpenChange={(o) => !o && setSentTo(null)}
          place={place}
          sentTo={sentTo}
          me={user ? { ...user, area: "", note: "" } : null}
          onDone={() => {
            setSentTo(null);
            router.push("/plans");
          }}
        />
      )}
    </main>
  );
}
