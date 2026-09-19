"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { COPY, ME_ACTIVE, collection, levelFor } from "@/data/seed";
import { StampTile } from "@/components/stamp-tile";
import { TabBar } from "@/components/tab-bar";
import { LogoMark } from "@/components/logo-mark";
import { usePlaces } from "@/state/places";

export default function ProfilePage() {
  const router = useRouter();
  const { ready, user, passport, signOut } = usePlaces();

  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-canvas" />;
  }

  const initials = user?.initials ?? ME_ACTIVE.initials;
  const displayName = user?.name.split(" ")[0] ?? ME_ACTIVE.name;

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="flex min-h-0 gap-4 flex-1 flex-col overflow-y-auto px-5 pt-safe pb-4">
        {passport ? (
          <>
            <div className="flex items-center gap-3.5 pt-1">
              <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-pop text-base font-medium text-white">
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

            {/*
              The collection. Everything on this block is a count of places actually
              attended — see src/data/levels.ts for why there is no streak here and
              why there must never be one (AGENTS.md §1.2).
            */}
            {(() => {
              const counted = collection(passport.stamps);
              // The seeded passport has 31 visits but only 6 stamp tiles; the level
              // tracks real attendance, so it reads the visit count.
              const state = levelFor(passport.stats.places);
              return (
                <div className="mt-2.5 rounded-2xl bg-pop p-4 text-white">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-white/60">
                      {COPY.levels.kicker}
                    </span>
                    <span className="text-[13px] font-medium">
                      {COPY.levels.level(state.level.n, state.level.name)}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-stamp"
                      style={{ width: `${Math.round(state.progress * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-white/65">
                    {state.next && state.span !== null
                      ? COPY.levels.toNext(state.next.at - passport.stats.places, state.next.name)
                      : COPY.levels.maxed}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {[
                      { n: counted.bounced, label: COPY.levels.bounced },
                      { n: passport.stats.withFriends, label: COPY.levels.withPeople },
                      { n: counted.areas, label: COPY.levels.areas },
                    ].map((c) => (
                      <div key={c.label} className="flex-1 rounded-tile bg-white/10 p-2.5">
                        <div className="text-[17px] font-medium leading-none">{c.n}</div>
                        <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.06em] text-white/55">
                          {c.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="mt-[18px] flex items-baseline justify-between">
              <h2 className="text-[15px] font-medium">{COPY.passport.stampsLabel}</h2>
              <span className="text-[11px] font-medium tracking-[0.08em] text-muted">
                {passport.stats.places} COLLECTED
              </span>
            </div>
            <div className="mt-2.5 grid shrink-0 grid-cols-3 grid-rows-[repeat(3,104px)] gap-2">
              {passport.stamps.map((stamp) => (
                <StampTile
                  key={stamp.id}
                  stamp={stamp}
                  onPress={() => router.push(`/stamp/${stamp.id}`)}
                />
              ))}
              <div className="grid place-items-center rounded-tile bg-canvas-soft text-xs font-medium text-muted">
                {COPY.passport.more(passport.stampsMore)}
              </div>
              {passport.nextStamp && (
                <div className="col-span-2 flex flex-col justify-center gap-0.5 rounded-tile bg-pop p-3.5">
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

        <div className="mt-6 flex flex-col items-center gap-1.5 pb-2">
          <button
            onClick={() => {
              signOut();
              // replace, not push — Back must not land on a logged-out passport.
              router.replace("/sign-in");
            }}
            className="flex h-[46px] items-center justify-center gap-2 rounded-full border-[1.5px] border-ink-16 px-6 text-[15px] font-medium text-ink"
          >
            <LogOut size={17} strokeWidth={2} aria-hidden />
            {COPY.profile.signOut}
          </button>
          <p className="text-[12px] text-ink-42">{COPY.profile.signOutNote}</p>
        </div>
      </div>
      <TabBar />
    </main>
  );
}
