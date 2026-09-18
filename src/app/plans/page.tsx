"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { COPY, personById, placeById } from "@/data/seed";
import { InviteReceivedCard } from "@/components/invite-received-card";
import { PlanRow } from "@/components/plan-row";
import { TabBar } from "@/components/tab-bar";
import { usePlaces } from "@/state/places";

export default function PlansPage() {
  const {
    ready, plans, pendingInvite, distanceTo, acceptInvite, declineInvite, pollInvites,
    simulateIncomingInvite,
  } = usePlaces();
  const taps = useRef<number[]>([]);
  const [nowMs, setNowMs] = useState<number | null>(null);

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

  const ordered = [...plans].sort((a, b) => b.createdAtMs - a.createdAtMs);

  const inviteTime =
    pendingInvite && nowMs
      ? `${Math.max(1, Math.round((nowMs - pendingInvite.invite.createdAtMs) / 60000))} min ago`
      : null;

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="flex flex-1 flex-col pt-safe">
        <button
          onClick={onHeaderTap}
          className="px-5 pt-[20px] text-left text-[26px] font-medium tracking-[-0.02em]"
        >
          {COPY.plans.title}
        </button>

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
            ordered.map((plan) => {
              const place = placeById(plan.placeId);
              if (!place) return null;
              const people = plan.withPeople
                .map((id) => personById(id))
                .filter((p) => p !== undefined);
              return <PlanRow key={plan.id} place={place} people={people} />;
            })
          )}
        </div>
      </div>
      <TabBar />
    </main>
  );
}
