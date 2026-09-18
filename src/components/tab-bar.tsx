"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Compass, UserRound } from "lucide-react";
import { COPY } from "@/data/seed";

const TABS = [
  { href: "/discover", label: COPY.nav.discover, Icon: Compass },
  { href: "/plans", label: COPY.nav.plans, Icon: CalendarDays },
  { href: "/profile", label: COPY.nav.profile, Icon: UserRound },
] as const;

export function TabBar() {
  const pathname = usePathname();
  return (
    <>
      {/*
        The bar is fixed, so it is out of normal flow and can never be scrolled away.
        This spacer stands in its place so page content still ends above it — height
        comes from --tabbar-h in globals.css, the one number both of them read.
      */}
      <div aria-hidden className="h-tabbar shrink-0" />
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-07 bg-surface pt-2 pb-safe">
        <div className="flex items-start justify-around px-6">
          {TABS.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1.5 pt-2 ${
                  active ? "text-hero" : "text-muted"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
