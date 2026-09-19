"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bookmark, CalendarDays, Plus } from "lucide-react";
import { COPY, personById, placeById } from "@/data/seed";
import { InviteReceivedCard } from "@/components/invite-received-card";
import { PlanRow } from "@/components/plan-row";
import { RicochetCard } from "@/components/ricochet-card";
import { Segmented } from "@/components/segmented";
import { TabBar } from "@/components/tab-bar";
import { usePlaces } from "@/state/places";

// Ricochets live under the Plans tab rather than getting a fourth nav slot — they are
// plans, just someone else's. The switch below is the only way in.
type View = "plans" | "ricochets";
type Shelf = "near" | "trips" | "yours";

export default function PlansPage() {
  const router = useRouter();
  const {
    ready, plans, pendingInvite, distanceTo, acceptInvite, declineInvite, pollInvites,
    simulateIncomingInvite, ricochets, city,
  } = usePlaces();
  const taps = useRef<number[]>([]);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [view, setView] = useState<View>("plans");
  const [shelf, setShelf] = useState<Shelf>("near");

  // Poll for live invites while Plans is mounted (no-ops without Supabase env).
  useEffect(() => {
    queueMicrotask(() => setNowMs(Date.now()));
    const interval = setInterval(() => {
      setNowMs(Date.now());
      void pollInvites();
    }, 2000);
    return () => clearInterval(interval);
  }, [pollInvites]);

  // Hidden fallback: five taps on the header fire the identical invite animation.
  const onHeaderTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      simulateIncomingInvite("sam");
    }
  };

  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-canvas" />;
  }

  // Saved lives behind the bookmark in the header — this page is only real plans.
  const ordered = plans
    .filter((p) => p.status === "going")
    .sort((a, b) => b.createdAtMs - a.createdAtMs);

  const mine = ricochets.filter((r) => r.mine);
  const shelved =
    shelf === "yours"
      ? mine
      : shelf === "trips"
        ? ricochets.filter((r) => r.kind === "trip")
        // "Near you" means this city, which is what makes the Tokyo trip a trip.
        : ricochets.filter((r) => r.kind === "day" && r.city === city);

  const row = (plan: (typeof plans)[number]) => {
    const place = placeById(plan.placeId);
    if (!place) return null;
    const people = plan.withPeople.map((id) => personById(id)).filter((p) => p !== undefined);
    return (
      <PlanRow
        key={plan.id}
        place={place}
        people={people}
        onPress={() => router.push(`/place/${place.id}`)}
      />
    );
  };

  const inviteTime =
    pendingInvite && nowMs
      ? `${Math.max(1, Math.round((nowMs - pendingInvite.invite.createdAtMs) / 60000))} min ago`
      : null;

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="flex min-h-0 flex-1 flex-col pt-safe">
        <div className="flex items-center justify-between px-5 pt-[20px]">
          <button
            onClick={onHeaderTap}
            className="text-left text-[26px] font-medium tracking-[-0.02em]"
          >
            {view === "plans" ? COPY.plans.title : COPY.ricochets.title}
          </button>
          <button
            onClick={() => router.push("/saved")}
            aria-label={COPY.saved.openLabel}
            className="-mr-1.5 grid h-10 w-10 place-items-center rounded-full"
          >
            <Bookmark size={21} strokeWidth={2} className="text-pop" aria-hidden />
          </button>
        </div>

        <div className="px-5 pt-3.5">
          <Segmented
            options={[
              { id: "plans" as View, label: COPY.plans.title },
              { id: "ricochets" as View, label: COPY.ricochets.tab },
            ]}
            value={view}
            onChange={setView}
          />
        </div>

        {view === "plans" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4 pt-4">
            {pendingInvite && (
              <InviteReceivedCard
                from={pendingInvite.from}
                place={pendingInvite.place}
                distanceKm={distanceTo(pendingInvite.place)}
                timeLabel={inviteTime ?? ""}
                onAccept={() => acceptInvite(pendingInvite.invite.id)}
                onDecline={() => declineInvite(pendingInvite.invite.id)}
              />
            )}

            {ordered.length === 0 && !pendingInvite ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-canvas-soft">
                  <CalendarDays size={24} strokeWidth={1.75} className="text-muted" aria-hidden />
                </span>
                <p className="text-[19px] font-medium tracking-[-0.015em]">
                  {COPY.plans.emptyTitle}
                </p>
                <p className="max-w-[240px] text-sm leading-[1.5] text-ink-50">
                  {COPY.plans.emptySub}
                </p>
              </div>
            ) : (
              ordered.map(row)
            )}
          </div>
        ) : (
          <>
            <div className="px-5 pt-3">
              <p className="kicker">{COPY.ricochets.kicker}</p>
              <p className="mt-1.5 text-[14px] leading-[1.5] text-ink-60">
                {COPY.ricochets.sub}
              </p>
              <div className="mt-3 flex gap-1 rounded-full bg-canvas p-1">
                {(
                  [
                    ["near", COPY.ricochets.near],
                    ["trips", COPY.ricochets.trips],
                    ["yours", COPY.ricochets.yours(mine.length)],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setShelf(id)}
                    className={`flex-1 rounded-full py-2 text-[13px] font-medium ${
                      shelf === id ? "bg-surface text-ink shadow-pill" : "text-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pb-[80px] pt-4">
              {shelved.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
                  <p className="text-[19px] font-medium tracking-[-0.015em]">
                    {COPY.ricochets.emptyYours}
                  </p>
                  <p className="max-w-[250px] text-sm leading-[1.5] text-ink-50">
                    {COPY.ricochets.emptyYoursSub}
                  </p>
                </div>
              ) : (
                shelved.map((r, i) => (
                  <RicochetCard
                    key={r.id}
                    ricochet={r}
                    variant={i === 0 ? "featured" : "compact"}
                    onPress={() => router.push(`/ricochets/${r.id}`)}
                  />
                ))
              )}
            </div>

            {/* Fixed above the tab bar — in flow it renders underneath the fixed nav. */}
            <div className="bottom-tabbar fixed inset-x-0 z-40 px-5 pb-3">
              <button
                onClick={() => router.push("/ricochets/new")}
                className="button flex h-[52px] w-full items-center justify-center gap-2 bg-pop text-[15px] font-medium text-white shadow-pop"
              >
                <Plus size={18} strokeWidth={2.5} aria-hidden />
                {COPY.ricochets.chain}
              </button>
            </div>
          </>
        )}
      </div>
      <TabBar />
    </main>
  );
}
