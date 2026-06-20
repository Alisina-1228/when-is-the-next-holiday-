import { NextResponse } from "next/server";
import jalaali from "jalaali-js";

export interface DayInfo {
  solar: { day: number; month: number; year: number; dayWeek: string };
  holiday: boolean;
  event: string[];
}

function nextMonths(jy: number, jm: number, count: number) {
  const months = [];
  for (let i = 0; i < count; i++) {
    const m = ((jm - 1 + i) % 12) + 1;
    const y = jy + Math.floor((jm - 1 + i) / 12);
    months.push({ year: y, month: m });
  }
  return months;
}

export async function GET() {
  try {
    const today = new Date();
    const { jy, jm, jd } = jalaali.toJalaali(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );

    const holidays: Array<DayInfo & { daysUntil: number; isPureWeekend: boolean }> = [];
    let todayInfo: DayInfo | null = null;

    // Fetch 4 months to ensure we always have enough holidays within 90-day window
    await Promise.all(
      nextMonths(jy, jm, 4).map(async ({ year, month }) => {
        const url = `https://pnldev.com/api/calender?year=${year}&month=${month}&holiday=true`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        if (!data.status || !data.result) return;

        for (const [, dayData] of Object.entries(data.result) as [string, DayInfo][]) {
          const { solar } = dayData;
          const diff = jalaaliDiffDays(jy, jm, jd, solar.year, solar.month, solar.day);

          if (diff === 0 && dayData.holiday) todayInfo = dayData;

          if (diff >= 1 && diff <= 90 && dayData.holiday) {
            // isPureWeekend = Friday with no official named event
            const isPureWeekend = solar.dayWeek === "ج" && dayData.event.length === 0;
            holidays.push({ ...dayData, daysUntil: diff, isPureWeekend });
          }
        }
      })
    );

    holidays.sort((a, b) => a.daysUntil - b.daysUntil);

    return NextResponse.json({
      nextHoliday: holidays[0] ?? null,
      upcomingHolidays: holidays.slice(0, 10),
      todayInfo,
      currentPersianDate: { year: jy, month: jm, day: jd },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 });
  }
}

function jalaaliToAbsDay(jy: number, jm: number, jd: number): number {
  const g = jalaali.toGregorian(jy, jm, jd);
  return Math.floor(new Date(g.gy, g.gm - 1, g.gd).getTime() / 86400000);
}

function jalaaliDiffDays(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): number {
  return jalaaliToAbsDay(y2, m2, d2) - jalaaliToAbsDay(y1, m1, d1);
}
