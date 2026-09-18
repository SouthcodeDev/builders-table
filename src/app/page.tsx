"use client";

import { useRouter } from "next/navigation";
import { COPY } from "@/data/seed";
import { LogoMark } from "@/components/logo-mark";

export default function SplashPage() {
  const router = useRouter();
  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-7 pt-safe text-center">
        <LogoMark size={30} color="#2A0085" dotColor="#B9A6FF" />
        <h1 className="font-wordmark text-[64px] font-black leading-[0.9] tracking-[-0.02em] text-hero-deep">
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
        className="photo h-[240px] w-full rounded-t-[220px]"
        style={{ backgroundImage: "url(/images/hero-splash.jpg)" }}
      />
    </main>
  );
}
