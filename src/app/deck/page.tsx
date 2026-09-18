"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { COPY, weekday, type Place } from "@/data/seed";
import { AvatarStack } from "@/components/avatar-stack";
import { DeckCard } from "@/components/deck-card";
import { usePlaces } from "@/state/places";

const THRESHOLD = 90;
const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six"];

export default function DeckPage() {
  const router = useRouter();
  const {
    ready, mode, deckEvents, deckPicks, markDeck, attendanceFor, distanceTo, reasonFor,
  } = usePlaces();
  const x = useMotionValue(0);
  const [pastThreshold, setPastThreshold] = useState(false);
  const flying = useRef(false);

  useMotionValueEvent(x, "change", (v) => {
    const past = Math.abs(v) >= THRESHOLD;
    if (past !== pastThreshold) setPastThreshold(past);
  });

  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const stampOpacity = useTransform(x, [THRESHOLD * 0.5, THRESHOLD], [0, 1]);

  const remaining = useMemo(
    () => deckEvents.filter((p) => !deckPicks[p.id]),
    [deckEvents, deckPicks],
  );
  const behind = remaining.slice(1, 3);

  const yeses = useMemo(
    () => deckEvents.filter((p) => deckPicks[p.id] === "yes"),
    [deckEvents, deckPicks],
  );

  const top: Place | undefined = remaining[0];

  const commit = (verdict: "yes" | "pass") => {
    if (!top || flying.current) return;
    flying.current = true;
    markDeck(top.id, verdict);
    animate(x, verdict === "yes" ? 520 : -520, { type: "spring", stiffness: 320, damping: 34 }).then(
      () => {
        x.set(0);
        flying.current = false;
        setPastThreshold(false);
      },
    );
  };

  const saveCurrent = () => {
    if (!top || flying.current) return;
    markDeck(top.id, "saved");
    x.set(0);
  };

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], last }) => {
      if (flying.current) return;
      if (last) {
        if (mx > THRESHOLD || vx > 0.5) commit("yes");
        else if (mx < -THRESHOLD || vx < -0.5) commit("pass");
        else animate(x, 0, { type: "spring", stiffness: 400, damping: 34 });
      } else {
        x.set(Math.max(-260, Math.min(260, mx)));
      }
    },
    { axis: "x", filterTaps: true },
  );

  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-hero" />;
  }

  const seen = deckEvents.length - remaining.length;
  const total = deckEvents.length;
  const done = !top;

  const firstNameFriend = yeses
    .flatMap((p) => attendanceFor(p.id).friends)
    .map((f) => f.name.split(" ")[0])[0];

  const endHeadline =
    mode === "active" && firstNameFriend
      ? `You said yes to ${yeses.length}. ${firstNameFriend}'s in on one.`
      : `${WORDS[Math.min(yeses.length, 6)]} ${yeses.length === 1 ? "yes" : "yeses"}. Good ${weekday(
          "Africa/Johannesburg",
        )}'s work.`;

  const planTarget = yeses.find((p) => attendanceFor(p.id).friends.length > 0) ?? yeses[0];

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-hero px-5 pt-safe pb-safe text-white">
      {done ? (
        <>
          <div className="mt-[60px] flex flex-col gap-3.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/50">
              {COPY.deck.endKicker}
            </p>
            <h1 className="text-[32px] font-medium leading-[1.1] tracking-[-0.02em]">
              {endHeadline}
            </h1>
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            {yeses.map((p) => {
              const going = attendanceFor(p.id).friends;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-tile bg-white/10 p-3"
                >
                  <span
                    className="photo h-11 w-11 shrink-0 rounded-[10px]"
                    style={{ backgroundImage: `url(${p.image})` }}
                  />
                  <span className="min-w-0 flex-1 text-sm">{p.title}</span>
                  {mode === "active" && going.length > 0 && (
                    <AvatarStack people={going} size={20} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <p className="text-sm leading-[1.5] text-white/60">{COPY.deck.endFootnote}</p>
            {mode === "active" && planTarget ? (
              <button
                onClick={() => router.push(`/place/${planTarget.id}`)}
                className="button flex h-[54px] w-full items-center justify-center bg-surface text-base font-medium text-hero"
              >
                Plan the one with {firstNameFriend ?? "someone"}
              </button>
            ) : (
              <button
                onClick={() => router.push("/")}
                className="button flex h-[54px] w-full items-center justify-center bg-surface text-base font-medium text-hero"
              >
                {COPY.deck.endClose}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mt-[18px] flex items-center justify-between">
            <button onClick={() => router.push("/discover")} className="text-[15px] font-medium text-white/70">
              {COPY.deck.close}
            </button>
            <span className="text-[11px] font-medium tracking-[0.1em] text-white/60">
              {COPY.deck.counter(Math.min(seen + 1, total), total)}
            </span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {deckEvents.map((p, i) => (
              <span
                key={p.id}
                className={`h-[3px] flex-1 rounded-full ${
                  i <= seen ? "bg-white" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <div className="relative mt-[22px] min-h-0 flex-1">
            {behind[1] && (
              <div className="absolute inset-x-[22px] bottom-[26px] top-4 rounded-deckcard bg-deck-deep" style={{ transform: "rotate(-3deg)" }} />
            )}
            {behind[0] && (
              <div className="absolute inset-x-3 bottom-[18px] top-2 rounded-deckcard bg-deck-card" style={{ transform: "rotate(1.6deg)" }} />
            )}
            {top && (
              <div
                {...bind()}
                style={{ touchAction: "pan-y" }}
                className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
              >
                <motion.div style={{ x, rotate }} className="absolute inset-0">
                  <DeckCard
                    place={top}
                    distanceKm={distanceTo(top)}
                    reason={reasonFor(top.id)}
                    attendance={attendanceFor(top.id)}
                  />
                  <motion.span
                    style={{ opacity: stampOpacity }}
                    className="absolute left-6 top-6 -rotate-[10deg] rounded-full bg-hero px-[18px] py-2.5 text-base font-medium text-white shadow-[0_10px_20px_-8px_rgba(0,0,0,0.4)]"
                  >
                    Looks cool
                  </motion.span>
                </motion.div>
              </div>
            )}
          </div>

          <div className="mt-[18px] flex items-center justify-center gap-6">
            <button
              onClick={() => commit("pass")}
              className="grid h-[58px] w-[58px] place-items-center rounded-full border-[1.5px] border-white/28 text-[13px] font-medium text-white/85"
            >
              {COPY.deck.pass}
            </button>
            <button
              onClick={saveCurrent}
              className="grid h-[52px] w-[52px] place-items-center rounded-full border-[1.5px] border-white/28 text-xs font-medium text-white/85"
            >
              {COPY.deck.save.split(" ")[0]}
            </button>
            <button
              onClick={() => commit("yes")}
              className="grid h-[62px] w-[62px] place-items-center rounded-full bg-surface text-sm font-medium text-hero shadow-[0_14px_26px_-12px_rgba(81,0,255,0.9)]"
            >
              {COPY.deck.yes}
            </button>
          </div>
          {pastThreshold && (
            <p className="mt-[18px] text-center text-[13px] leading-[1.4] text-white/50">
              <span className="text-white/90">{COPY.deck.releaseYes}</span>{" "}
              {COPY.deck.releaseNote}
            </p>
          )}
        </>
      )}
    </main>
  );
}
