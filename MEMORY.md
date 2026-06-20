# Project Memory — When is the Next Holiday?

## Color System

| Type | Background | Number/Text | Badge | List Dot | List Counter |
|------|-----------|-------------|-------|----------|-------------|
| Official holiday (تعطیل رسمی) | `bg-rose-50` | `text-rose-500` | `bg-rose-100 text-rose-600` | `bg-rose-400` | `text-rose-500` |
| Weekend / Friday (آخر هفته) | `bg-blue-50` | `text-blue-500` | `bg-blue-100 text-blue-600` | `bg-blue-300` | `text-blue-400` |
| No holiday / neutral | `bg-neutral-50` | `text-black` | — | — | — |
| Today is holiday | `bg-emerald-50` | `text-emerald-600` | — | — | — |

**Decision notes:**
- Violet/amber were tried and rejected — too generic
- Rose = festive and clearly "special"
- Blue = calm weekend feel
- Weekdays (Sat–Wed) don't appear in the list — only the hero card changes color based on what the next holiday is

---

## Micro-Copy Persona

**The app's voice:** That one friend who's obsessed with holidays — always hyped when one's coming, genuinely bummed when there isn't. Warm, casual, a little dramatic. Pure conversational Persian (not formal).

**Examples of the tone:**
- آخ جون! فردا تعطیله!
- ای بابا... X روز دیگه تا تعطیلی مونده!
- هعی... یه کم دوره، ولی خب به امید همون زنده‌ایم!

---

## Micro-Copy Scenarios

| Scenario | Copy |
|----------|------|
| Tomorrow — official | وای! فردا تعطیله! کرکره‌ها رو بکش پایین که رفتیم تو فاز استراحت 😎🎉 |
| Tomorrow — Friday | پاشو که فردا جمعه‌ست! اصلاً بوی کباب و خواب تا لنگ ظهر میاد 🤤🛌 |
| Day after tomorrow | فقط یه فردا رو دندون رو جیگر بذار... پس‌فردا تعطیله! 😍✌️ |
| 3–7 days | داریم می‌رسیم! فقط X روز دیگه مونده تا یه نفس راحت بکشیم 🏃‍♂️💨 |
| 8–14 days | طاقت بیار رفیق! X روز دیگه یه تعطیلی مشتی تو راهه 💪🔥 |
| 15–30 days | هعی... X روز مونده. یه کم دوره، ولی خب به امید همون زنده‌ایم! 🥲🚶‍♂️ |
| 30+ days | ای بابا... X روز دیگه تا تعطیلی مونده! تقویمم که انگار باهامون لجه 😩📅 |
| No holiday in 90 days | فاجعه‌ست! هیچ تعطیلی‌ای نزدیک نیست... رسماً باید بریم تو افق محو شیم 💀🥀 |
| Today is a holiday | امروز تعطیله! گوشیو بنداز کنار، فقط بخواب و عشق کن 🥳🛋️ |
| Empty list (filter active) | با این فیلترایی که زدی هیچ تعطیلی‌ای پیدا نکردم. مطمئنی درست گشتی؟ 🤔🔍 |

---

## Design Rules

- **No standalone emojis** at the top of the hero card — emojis only inside micro-copy text
- **No brackets** around event names — just plain text
- **Date header** always shows "امروز" as a muted label above the bold date
- **Hero card** is a rounded card (`rounded-3xl`) with colored background — never floating text on white
- **Filter tabs** use `rounded-2xl` outer / `rounded-xl` inner pill — consistent pill language throughout
- **List dots** are `w-2.5 h-2.5` — slightly larger than default for legibility
- **Spacing** is explicit per section (`mb-*`) not uniform `space-y-*` — gives more control

---

## Logic / Data

- Holiday window: **90 days** ahead (was 60 — extended)
- API fetches **4 months** at a time (was 3)
- `isPureWeekend = true` when: day is Friday AND event list is empty (no named holiday)
- Hero always shows the **very next** holiday regardless of filter
- Upcoming list skips item[0] (already shown as hero) and applies the active filter
- API: `https://pnldev.com/api/calender?year=Y&month=M&holiday=true`
