"use client";

import { useRouter } from "next/navigation";
import { COPY } from "@/data/seed";
import { LogoMark } from "@/components/logo-mark";

export default function SplashPage() {
  const router = useRouter();
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-surface">
      <span className="absolute -right-[120px] -top-[170px] h-[400px] w-[400px] rounded-full bg-hero" />
      <span className="absolute -bottom-[140px] -left-[80px] h-[330px] w-[470px] rounded-[999px_999px_60px_60px] bg-pop" />
      <div className="relative z-10 flex flex-1 flex-col px-7 pt-safe">
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <LogoMark size={62} color="#FF4A00" />
          <h1 className="font-wordmark text-[64px] font-black leading-[0.9] tracking-[-0.02em] text-pop">
            {COPY.splash.wordmark}
          </h1>
          <p className="max-w-[260px] text-base leading-[1.5] text-ink-60">{COPY.splash.line}</p>
          <button
            onClick={() => router.push("/sign-in")}
            className="button mt-1.5 border-[1.5px] border-ink-16 px-10 py-[15px] text-[15px] font-medium"
          >
            {COPY.splash.cta}
          </button>
        </div>
        <div
          className="photo -mx-7 h-[240px] shrink-0 rounded-b-[32px] rounded-t-[220px]"
          style={{ backgroundImage: "url(/images/hero-splash.jpg)" }}
        />
      </div>
    </main>
  );
}
