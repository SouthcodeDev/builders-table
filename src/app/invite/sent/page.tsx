"use client";

import { useRouter } from "next/navigation";
import { COPY } from "@/data/seed";
import { usePlaces } from "@/state/places";

export default function InviteSentPage() {
  const router = useRouter();
  const { lastSentNames } = usePlaces();
  const name = lastSentNames[0]?.split(" ")[0] ?? "them";

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface px-7 pt-safe pb-safe">
      <div className="flex flex-1 flex-col items-center justify-center gap-[22px] text-center">
        <span className="grid h-[78px] w-[78px] place-items-center rounded-full bg-canvas-soft">
          <span className="block h-6 w-4 -translate-y-px -rotate-45 border-x-[3px] border-b-[3px] border-hero" />
        </span>
        <h1 className="text-[26px] font-medium leading-[1.2] tracking-[-0.02em]">
          {COPY.invite.sentTitle(name)}
        </h1>
        <p className="max-w-[260px] text-[15px] leading-[1.5] text-ink-50">
          {COPY.invite.sentSub}
        </p>
        <button
          onClick={() => router.push("/plans")}
          className="button mt-1.5 bg-ink px-10 py-[15px] text-[15px] font-medium text-white"
        >
          {COPY.invite.backToPlans}
        </button>
      </div>
    </main>
  );
}
