export const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const pad = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const todayKey = () => ymd(new Date());
export const parseKey = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Every date key (YYYY-MM-DD) in a month. m is 0-based. */
export function monthKeys(y, m) {
  const count = new Date(y, m + 1, 0).getDate();
  const keys = [];
  for (let d = 1; d <= count; d++) keys.push(`${y}-${pad(m + 1)}-${pad(d)}`);
  return keys;
}

/** First/last date keys plus ISO instants bounding the month in local time. */
export function monthBounds(y, m) {
  const keys = monthKeys(y, m);
  return {
    firstKey: keys[0],
    lastKey: keys[keys.length - 1],
    startISO: new Date(y, m, 1).toISOString(),
    endISO: new Date(y, m + 1, 1).toISOString(),
  };
}

export function longLabel(key) {
  const d = parseKey(key);
  return `${DOW_LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
