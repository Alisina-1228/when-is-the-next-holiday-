"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DayInfo {
  solar: { day: number; month: number; year: number; dayWeek: string };
  holiday: boolean;
  event: string[];
  daysUntil: number;
  isPureWeekend: boolean;
}

interface ApiResponse {
  nextHoliday: DayInfo | null;
  upcomingHolidays: DayInfo[];
  todayInfo: DayInfo | null;
  currentPersianDate: { year: number; month: number; day: number };
}

const MONTH_NAMES = [
  "", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const DAY_WEEK_FULL: Record<string, string> = {
  "ش": "شنبه", "ی": "یکشنبه", "د": "دوشنبه", "س": "سه‌شنبه",
  "چ": "چهارشنبه", "پ": "پنجشنبه", "ج": "جمعه",
};

function toFarsi(n: number | string): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

function getDayName(dw: string): string {
  return DAY_WEEK_FULL[dw] ?? dw;
}

function getDaysUntilLabel(days: number, isWeekend: boolean): string {
  if (days === 1) return isWeekend ? "فردا جمعه‌ست! 🛌" : "فردا تعطیله! 🎉";
  if (days === 2) return "پس‌فردا تعطیله ✌️";
  if (days <= 7)  return `فقط ${toFarsi(days)} روز دیگه! 💪`;
  if (days <= 14) return `${toFarsi(days)} روز دیگه طاقت بیار`;
  return `${toFarsi(days)} روز تا تعطیلی`;
}

type Filter = "all" | "public" | "weekend";

export default function HolidayPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/holidays")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const pd = data?.currentPersianDate;
  const next = data?.nextHoliday;
  const accent = next?.isPureWeekend ? "blue" : "rose";

  const filteredUpcoming = (data?.upcomingHolidays ?? [])
    .slice(1)
    .filter((h) => {
      if (filter === "public") return !h.isPureWeekend;
      if (filter === "weekend") return h.solar.dayWeek === "ج";
      return true;
    });

  const heroBg     = accent === "blue" ? "bg-blue-50"   : "bg-rose-50";
  const heroNum    = accent === "blue" ? "text-blue-500" : "text-rose-500";
  const badgeBg    = accent === "blue" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600";

  return (
    <div className="min-h-screen bg-white">

      {/* ── Top bar ── */}
      <header className="border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-sm font-bold text-black">تعطیلی بعدی کی هست؟</h1>
        <p className="text-xs text-neutral-400">
          {pd ? `${toFarsi(pd.day)} ${MONTH_NAMES[pd.month]} ${toFarsi(pd.year)}` : ""}
        </p>
      </header>

      {/* ── Body: single col mobile, two col desktop ── */}
      <main className="max-w-5xl mx-auto px-5 py-10 sm:py-16
                       grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">

        {/* ── LEFT: hero ── */}
        <div>
          {loading ? (
            <div className={`rounded-3xl bg-neutral-50 px-8 py-12 text-center space-y-4`}>
              <Skeleton className="h-28 w-28 mx-auto rounded-2xl" />
              <Skeleton className="h-5 w-48 mx-auto" />
              <Skeleton className="h-7 w-40 mx-auto" />
              <Skeleton className="h-6 w-24 mx-auto rounded-full" />
            </div>
          ) : next ? (
            <div className={`rounded-3xl px-8 py-12 text-center ${heroBg}`}>
              {/* big number */}
              <div className={`text-[100px] md:text-[140px] font-black leading-none tabular-nums ${heroNum}`}>
                {toFarsi(next.daysUntil)}
              </div>

              {/* label */}
              <p className="text-sm font-medium text-neutral-500 mt-3 mb-6">
                {getDaysUntilLabel(next.daysUntil, next.isPureWeekend)}
              </p>

              {/* date */}
              <p className="text-2xl font-bold text-black">
                {getDayName(next.solar.dayWeek)}&nbsp;
                {toFarsi(next.solar.day)}&nbsp;
                {MONTH_NAMES[next.solar.month]}
              </p>

              {/* badge */}
              <span className={`inline-block mt-4 text-xs px-3 py-1.5 rounded-full font-semibold ${badgeBg}`}>
                {next.isPureWeekend ? "آخر هفته" : "تعطیل رسمی"}
              </span>

              {/* event */}
              {next.event.length > 0 && (
                <p className="text-xs text-neutral-400 mt-3">{next.event[0]}</p>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-neutral-50 px-8 py-12 text-center space-y-2">
              <p className="text-lg font-bold text-black">تعطیلی نزدیک نیست!</p>
              <p className="text-sm text-neutral-400">در ۹۰ روز آینده خبری نیست.</p>
            </div>
          )}

          {/* Today banner — shown below hero */}
          {data?.todayInfo && (
            <div className="mt-4 bg-emerald-50 rounded-2xl px-5 py-4 text-center">
              <p className="text-sm text-emerald-600 font-semibold">امروز تعطیله! 🥳</p>
              {data.todayInfo.event[0] && (
                <p className="text-xs text-emerald-400 mt-1">{data.todayInfo.event[0]}</p>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: upcoming list ── */}
        <div className="space-y-5">

          {/* section label */}
          <p className="text-xs text-neutral-400 tracking-widest uppercase">تعطیلات بعدی</p>

          {/* filter tabs */}
          <div className="flex gap-1 bg-neutral-100 rounded-2xl p-1">
            {([["all", "همه"], ["public", "رسمی"], ["weekend", "آخر هفته"]] as [Filter, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`flex-1 text-xs py-2 rounded-xl font-semibold transition-all ${
                  filter === val
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* list */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredUpcoming.length === 0 ? (
            <div className="text-center py-10 space-y-1">
              <p className="text-2xl">🫙</p>
              <p className="text-sm text-neutral-300 font-medium">موردی پیدا نشد</p>
            </div>
          ) : (
            <div>
              {filteredUpcoming.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3.5 border-b border-neutral-50 last:border-0"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    h.isPureWeekend ? "bg-blue-300" : "bg-rose-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black">
                      {getDayName(h.solar.dayWeek)}&nbsp;
                      {toFarsi(h.solar.day)}&nbsp;
                      {MONTH_NAMES[h.solar.month]}
                    </p>
                    {h.event.length > 0 && (
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{h.event[0]}</p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold tabular-nums shrink-0 ${
                    h.isPureWeekend ? "text-blue-400" : "text-rose-500"
                  }`}>
                    {toFarsi(h.daysUntil)} روز
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
