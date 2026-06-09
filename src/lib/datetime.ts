// Datetime helpers for applications

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTime12(t: string | null | undefined): string {
  if (!t) return "—";
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t;
  let h = +m[1];
  const min = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${min} ${ampm}`;
}

const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

// Parse a date + time out of free-form email body text.
export function extractDateTimeFromText(text: string): { date: string | null; time: string } {
  if (!text) return { date: null, time: "" };

  let date: string | null = null;
  let time = "";

  // Date forms: "Jun 15, 2026", "June 15 2026", "15 Jun 2026", "2026-06-15", "06/15/2026"
  const monthName = "(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*";
  const reMonthDayYear = new RegExp(`\\b${monthName}\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`, "i");
  const reDayMonthYear = new RegExp(`\\b(\\d{1,2})\\s+${monthName}\\s+(\\d{4})\\b`, "i");
  const reIso = /\b(\d{4})-(\d{2})-(\d{2})\b/;
  const reSlash = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;

  let m: RegExpMatchArray | null;
  if ((m = text.match(reMonthDayYear))) {
    const mo = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) + 1;
    const d = +m[2], y = +m[3];
    date = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  } else if ((m = text.match(reDayMonthYear))) {
    const d = +m[1];
    const mo = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase()) + 1;
    const y = +m[3];
    date = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  } else if ((m = text.match(reIso))) {
    date = `${m[1]}-${m[2]}-${m[3]}`;
  } else if ((m = text.match(reSlash))) {
    const mo = +m[1], d = +m[2], y = +m[3];
    date = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  // Time forms: "3:00 PM", "3 PM", "15:00"
  const re12 = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
  const re24 = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
  if ((m = text.match(re12))) {
    let h = +m[1];
    const min = m[2] ? +m[2] : 0;
    const ap = m[3].toLowerCase();
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  } else if ((m = text.match(re24))) {
    time = `${m[1].padStart(2, "0")}:${m[2]}`;
  }

  return { date, time };
}

// Combine "yyyy-mm-dd" + "HH:MM" into ISO timestamp string (local time)
export function combineDateTime(date: string, time: string): string | null {
  if (!date) return null;
  const t = time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
  // Local time -> ISO
  const dt = new Date(`${date}T${t}:00`);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
}
