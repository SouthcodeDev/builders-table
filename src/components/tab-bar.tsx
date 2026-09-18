"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COPY } from "@/data/seed";

const TABS = [
  { href: "/discover", label: COPY.nav.discover, shape: "square" },
  { href: "/plans", label: COPY.nav.plans, shape: "square" },
  { href: "/profile", label: COPY.nav.profile, shape: "circle" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="border-t border-ink-07 bg-surface/95 pt-2 pb-safe">
      <div className="flex items-start justify-around px-6">
        {TABS.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-1.5 pt-2 ${
                active ? "text-hero" : "text-muted"
              }`}
            >
              <span
                className={`block h-5 w-5 bg-current ${
                  t.shape === "circle" ? "rounded-full" : "rounded-md"
                }`}
              />
              <span className="text-[10px] font-medium">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
