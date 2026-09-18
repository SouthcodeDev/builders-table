"use client";

import { useRouter } from "next/navigation";
import { CITIES, COPY, ME_ACTIVE } from "@/data/seed";
import { StampTile } from "@/components/stamp-tile";
import { TabBar } from "@/components/tab-bar";
import { LogoMark } from "@/components/logo-mark";
import { usePlaces } from "@/state/places";

export default function ProfilePage() {
  const router = useRouter();
  const { ready, user, city, passport, setCity } = usePlaces();

  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-canvas" />;
  }

  const inTokyo = city === "tokyo";
  const initials = user?.initials ?? ME_ACTIVE.initials;
  const displayName = user?.name.split(" ")[0] ?? ME_ACTIVE.name;

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="flex flex-1 flex-col px-5 pt-safe">
        {passport ? (
          <>
            <div className="flex items-center gap-3.5 pt-1">
              <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-hero-deep text-base font-medium text-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-[22px] font-medium tracking-[-0.015em]">
                  {displayName}&rsquo;s passport
                </h1>
                <p className="mt-0.5 text-[13px] text-muted">
                  Since {ME_ACTIVE.since} · Cape Town, Tokyo
                </p>
              </div>
            </div>

            <div className="mt-[18px] grid grid-cols-3 gap-2">
              {[
                { n: passport.stats.places, label: COPY.passport.stats[0] },
                { n: passport.stats.withFriends, label: COPY.passport.stats[1] },
                { n: passport.stats.cities, label: COPY.passport.stats[2] },
              ].map((s) => (
                <div key={s.label} className="rounded-tile bg-canvas-soft p-3 text-center">
                  <div className="text-[22px] font-medium">{s.n}</div>
                  <div className="kicker mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-canvas p-4">
              <span className="h-2 w-2 shrink-0 rounded-full bg-hero" />
              <span className="text-[13px] leading-[1.4] text-ink-60">{passport.note}</span>
            </div>

            <div className="mt-[18px] flex items-baseline justify-between">
              <h2 className="text-[15px] font-medium">{COPY.passport.stampsLabel}</h2>
              <span className="text-[11px] font-medium tracking-[0.08em] text-muted">
                {passport.stats.places} COLLECTED
              </span>
            </div>
            <div className="mt-2.5 grid min-h-0 flex-1 grid-cols-3 grid-rows-[repeat(3,minmax(0,1fr))] gap-2">
              {passport.stamps.map((stamp) => (
                <StampTile key={stamp.title} stamp={stamp} />
              ))}
              <div className="grid place-items-center rounded-tile bg-canvas-soft text-xs font-medium text-muted">
                {COPY.passport.more(passport.stampsMore)}
              </div>
              {passport.nextStamp && (
                <div className="col-span-2 flex flex-col justify-center gap-0.5 rounded-tile bg-hero-deep p-3.5">
                  <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-white/60">
                    {COPY.passport.nextKicker}
                  </span>
                  <span className="text-[13px] font-medium leading-[1.25] text-white">
                    {passport.nextStamp.title}, {passport.nextStamp.when}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-canvas-soft">
              <LogoMark size={26} color="#6E6E76" />
            </span>
            <p className="text-[19px] font-medium tracking-[-0.015em]">
              {COPY.passport.emptyTitle}
            </p>
            <p className="max-w-[240px] text-sm leading-[1.5] text-ink-50">
              {COPY.passport.emptySub}
            </p>
          </div>
        )}

        {/* Tokyo / city switch — the "one more thing" */}
        <div className="mt-4 mb-3 flex items-center gap-3 rounded-big bg-canvas p-4 text-left">
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-hero text-white">
            <LogoMark size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="kicker">{inTokyo ? COPY.tokyo.back : COPY.tokyo.entryKicker}</p>
            <p className="mt-0.5 text-[14px] font-medium leading-[1.3]">
              {inTokyo ? CITIES["cape-town"].label : COPY.tokyo.title}
            </p>
          </div>
          <button
            onClick={() => {
              setCity(inTokyo ? "cape-town" : "tokyo");
              router.push("/discover");
            }}
            className="button bg-ink px-4 py-2.5 text-[13px] font-medium text-white"
          >
            {inTokyo ? COPY.tokyo.back : "Go"}
          </button>
        </div>
      </div>
      <TabBar />
    </main>
  );
}
