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
  if (days === 1 && !isWeekend) return "وای! فردا تعطیله! کرکره‌ها رو بکش پایین که رفتیم تو فاز استراحت 😎🎉";
  if (days === 1 && isWeekend)  return "پاشو که فردا جمعه‌ست! اصلاً بوی کباب و خواب تا لنگ ظهر میاد 🤤🛌";
  if (days === 2)               return "فقط یه فردا رو دندون رو جیگر بذار... پس‌فردا تعطیله! 😍✌️";
  if (days <= 7)                return `داریم می‌رسیم! فقط ${toFarsi(days)} روز دیگه مونده تا یه نفس راحت بکشیم 🏃‍♂️💨`;
  if (days <= 14)               return `طاقت بیار رفیق! ${toFarsi(days)} روز دیگه یه تعطیلی مشتی تو راهه 💪🔥`;
  if (days <= 30)               return `هعی... ${toFarsi(days)} روز مونده. یه کم دوره، ولی خب به امید همون زنده‌ایم! 🥲🚶‍♂️`;
  return                               `ای بابا... ${toFarsi(days)} روز دیگه تا تعطیلی مونده! تقویمم که انگار باهامون لجه 😩📅`;
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

  const filteredUpcoming = (data?.upcomingHolidays ?? [])
    .slice(1)
    .filter((h) => {
      if (filter === "public") return !h.isPureWeekend;
      if (filter === "weekend") return h.solar.dayWeek === "ج";
      return true;
    });

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-5 py-12 sm:py-20">
      <div className="w-full max-w-sm">

        {/* Date header */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-widest text-neutral-300 mb-1 uppercase">امروز</p>
          <p className="text-sm font-bold text-neutral-600">
            {pd ? `${toFarsi(pd.day)} ${MONTH_NAMES[pd.month]} ${toFarsi(pd.year)}` : ""}
          </p>
        </div>

        {/* Hero */}
        {loading ? (
          <div className="rounded-3xl bg-rose-50 px-6 py-10 space-y-4 text-center mb-6">
            <Skeleton className="h-20 w-20 mx-auto rounded-2xl" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-6 w-24 mx-auto rounded-full" />
          </div>
        ) : next ? (
          <div className={`rounded-3xl px-6 py-10 text-center mb-6 ${
            next.isPureWeekend ? "bg-blue-50" : "bg-rose-50"
          }`}>
            <div className={`text-[80px] sm:text-[96px] font-black leading-none tabular-nums mb-3 ${
              next.isPureWeekend ? "text-blue-500" : "text-rose-500"
            }`}>
              {toFarsi(next.daysUntil)}
            </div>

            <p className="text-sm font-medium text-neutral-500 leading-relaxed px-2 mb-5">
              {getDaysUntilLabel(next.daysUntil, next.isPureWeekend)}
            </p>

            <p className="text-xl font-bold text-black mb-3">
              {getDayName(next.solar.dayWeek)} {toFarsi(next.solar.day)} {MONTH_NAMES[next.solar.month]}
            </p>

            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold inline-block mb-2 ${
              next.isPureWeekend
                ? "bg-blue-100 text-blue-600"
                : "bg-rose-100 text-rose-600"
            }`}>
              {next.isPureWeekend ? "آخر هفته" : "تعطیل رسمی"}
            </span>

            {next.event.length > 0 && (
              <p className="text-xs text-neutral-400 mt-1">{next.event[0]}</p>
            )}
          </div>
        ) : (
          <div className="rounded-3xl bg-neutral-50 px-6 py-10 text-center mb-6 space-y-2">
            <p className="text-lg font-bold text-black">فاجعه‌ست!</p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              هیچ تعطیلی‌ای نزدیک نیست... رسماً باید بریم تو افق محو شیم 💀🥀
            </p>
          </div>
        )}

        {/* Today banner */}
        {data?.todayInfo && (
          <div className="bg-emerald-50 rounded-2xl px-4 py-3 text-center mb-8">
            <p className="text-sm text-emerald-600 font-semibold">
              امروز تعطیله! گوشیو بنداز کنار، فقط بخواب و عشق کن 🥳🛋️
            </p>
            {data.todayInfo.event[0] && (
              <p className="text-xs text-emerald-400 mt-0.5">{data.todayInfo.event[0]}</p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-neutral-100 mb-8" />

        {/* Upcoming section */}
        <div className="space-y-5">

          {/* Filter tabs */}
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

          {/* List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filteredUpcoming.length === 0 ? (
            <div className="text-center py-8 space-y-1">
              <p className="text-2xl">🔍</p>
              <p className="text-sm text-neutral-300 font-medium">
                با این فیلترایی که زدی هیچ تعطیلی‌ای پیدا نکردم. مطمئنی درست گشتی؟
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUpcoming.map((h, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-neutral-50 last:border-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    h.isPureWeekend ? "bg-blue-300" : "bg-rose-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black">
                      {getDayName(h.solar.dayWeek)} {toFarsi(h.solar.day)} {MONTH_NAMES[h.solar.month]}
                    </p>
                    {h.event.length > 0 && (
                      <p className="text-xs text-neutral-400 truncate">{h.event[0]}</p>
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

      </div>
    </div>
  );
}
