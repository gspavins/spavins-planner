import { addDays, hhmm, parseKey, ymd } from "./dates.js";

const FALLBACK = { fill: "#E4E2DE", text: "#45413B" };

/**
 * Spread the family calendar's events across the days they cover.
 * Returns { "YYYY-MM-DD": [entry, ...] } for the keys asked for, each list sorted by time.
 *
 * All-day events: if the end has the same time-of-day as the start and is later,
 * the end is treated as exclusive (the common "ends at midnight next day" convention),
 * so a one-day all-day event shows on one day only.
 */
export function spreadEvents(events, keys) {
  const wanted = new Set(keys);
  const byDay = {};
  keys.forEach((k) => (byDay[k] = []));

  for (const ev of events || []) {
    const start = new Date(ev.starts_at);
    let end = new Date(ev.ends_at);
    if (isNaN(start)) continue;
    if (isNaN(end) || end < start) end = start;

    const cat = ev.categories || {};
    const colours = cat.fill_color ? { fill: cat.fill_color, text: cat.text_color || FALLBACK.text } : FALLBACK;
    const people = (ev.event_people || [])
      .map((ep) => ep.people)
      .filter(Boolean)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((p) => p.name);

    let firstKey = ymd(start);
    let lastKey;
    if (ev.all_day) {
      const sameClock = start.getHours() === end.getHours() && start.getMinutes() === end.getMinutes();
      lastKey = end > start && sameClock ? ymd(addDays(parseKey(ymd(end)), -1)) : ymd(end);
      if (lastKey < firstKey) lastKey = firstKey;
    } else {
      lastKey = end > start ? ymd(new Date(end.getTime() - 1)) : firstKey;
    }

    let day = parseKey(firstKey);
    let guard = 0;
    while (ymd(day) <= lastKey && guard < 400) {
      const key = ymd(day);
      if (wanted.has(key)) {
        const isFirst = key === firstKey;
        const time = ev.all_day ? "All day" : isFirst ? hhmm(start) : "Continues";
        const sortKey = ev.all_day ? "00:00a" : isFirst ? hhmm(start) : "00:00b";
        byDay[key].push({
          id: `${ev.id}-${key}`,
          title: ev.title,
          time,
          sortKey,
          category: cat.name || "Event",
          fill: colours.fill,
          text: colours.text,
          people,
        });
      }
      day = addDays(day, 1);
      guard++;
    }
  }

  Object.values(byDay).forEach((list) =>
    list.sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.title.localeCompare(b.title))
  );
  return byDay;
}
