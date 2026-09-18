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
      <div className="relative z-10 flex justify-center items-center flex-1 flex-col px-7 pt-safe pb-safe gap-8">
        <div className="flex flex-col items-center justify-center gap-5 text-center">
          <LogoMark size={90} />
          <h1 className="font-wordmark text-[64px] font-black leading-[0.9] tracking-[-0.02em] text-pop">
            {COPY.splash.wordmark}
          </h1>
          <p className="max-w-[260px] text-base leading-[1.5] text-ink-60">{COPY.splash.line}</p>
        </div>
        <button
          onClick={() => router.push("/sign-in")}
          className="button w-full border-[1.5px] bg-white border-ink-16 py-8 text-xl font-medium"
        >
          {COPY.splash.cta}
        </button>
      </div>
    </main>
  );
}
