"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

// English and Macedonian day-name stems, Sunday-first (index = Date.getDay())
const SHORT = [
  ["sun", "нед"],
  ["mon", "пон"],
  ["tue", "вто"],
  ["wed", "сре"],
  ["thu", "чет"],
  ["fri", "пет"],
  ["sat", "саб"],
];

/** Does a label like "Monday – Friday", "Sat & Sun" or "Weekends" include today's day index? */
function includesDay(label: string, day: number) {
  const l = label.toLowerCase();
  if (/every ?day|daily|секој ден|секојдневно/.test(l)) return true;
  if (/weekend|викенд/.test(l)) return day === 0 || day === 6;
  if (/weekday|работни денови|работен ден/.test(l)) return day >= 1 && day <= 5;
  const found = SHORT.map((stems, i) => ({ i, at: Math.max(...stems.map((s) => l.search(new RegExp(`(^|[^\\p{L}])${s}`, "u")))) }))
    .filter((f) => f.at >= 0)
    .sort((a, b) => a.at - b.at);
  if (!found.length) return false;
  if (found.length === 2 && /[–—-]|\bto\b|\bдо\b/.test(l)) {
    const [a, b] = [found[0].i, found[1].i];
    return a <= b ? day >= a && day <= b : day >= a || day <= b;
  }
  return found.some((f) => f.i === day);
}

const subscribe = () => () => {};

export function TodayHours({ hours, note, todayLabel = "Today" }: { hours: { days: string; time: string }[]; note?: string; todayLabel?: string }) {
  // client-only "today" (server renders without a highlight, avoiding hydration mismatch)
  const today = useSyncExternalStore(subscribe, () => new Date().getDay(), () => -1);
  return (
    <div>
      <dl className="divide-y divide-line">
        {hours.map((h, i) => {
          const isToday = today >= 0 && includesDay(h.days, today);
          return (
            <div key={i} className={cn("flex items-center justify-between gap-4 py-3.5 transition-colors", isToday && "font-semibold text-espresso")}>
              <dt className="flex items-center gap-2.5">
                {isToday && <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-caramel opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-caramel" /></span>}
                {h.days}
                {isToday && <span className="rounded-full bg-caramel/15 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-caramel">{todayLabel}</span>}
              </dt>
              <dd className={cn(isToday ? "text-espresso" : "text-muted")}>{h.time}</dd>
            </div>
          );
        })}
      </dl>
      {note && <p className="mt-3 text-sm text-muted">{note}</p>}
    </div>
  );
}
