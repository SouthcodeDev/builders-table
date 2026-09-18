"use client";

import { useRouter } from "next/navigation";
import { AppleMark, GoogleMark } from "@/components/brand-marks";
import { COPY } from "@/data/seed";
import { usePlaces } from "@/state/places";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = usePlaces();

  const enter = (mode: "judge" | "active") => {
    signIn(mode);
    router.push(mode === "judge" ? "/interests" : "/discover");
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div
        className="photo h-[380px] w-full shrink-0 rounded-bl-[32px] rounded-br-[220px] rounded-tl-[32px] rounded-tr-[32px]"
        style={{ backgroundImage: "url(/images/hero-signin.jpg)" }}
      />
      <div className="flex flex-1 flex-col px-6 pt-6 pb-safe">
        <h1 className="text-[32px] font-medium leading-none tracking-[-0.02em]">
          {COPY.signIn.title}
        </h1>
        <p className="mt-2 max-w-[290px] text-[15px] leading-[1.5] text-ink-50">
          {COPY.signIn.sub}
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => enter("active")}
            className="button flex h-[54px] w-full items-center justify-center gap-2.5 bg-ink text-base font-medium text-white"
          >
            <AppleMark />
            {COPY.signIn.appleDoor}
          </button>
          <button
            onClick={() => enter("active")}
            className="button flex h-[54px] w-full items-center justify-center gap-2.5 border-[1.5px] border-ink-16 bg-surface text-base font-medium"
          >
            <GoogleMark />
            {COPY.signIn.googleDoor}
          </button>
          <button
            onClick={() => enter("judge")}
            className="h-[50px] w-full text-base font-medium text-hero"
          >
            {COPY.signIn.judgeDoor}
          </button>
          <p className="px-5 pt-2 text-center text-xs leading-[1.5] text-ink-42">
            {COPY.signIn.footnote}
          </p>
        </div>
      </div>
    </main>
  );
}
