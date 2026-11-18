import type { CalendarEvent } from '../types/workspace';

export const SEED_TODAY = '2026-11-18'; // Wednesday Nov 18, 2026

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAY_TWO = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Format local Date as YYYY-MM-DD. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Return current wall-clock local date as YYYY-MM-DD. */
export function getLocalTodayKey(): string {
  return toDateKey(new Date());
}

/** Return minutes elapsed since local midnight (0..1439). */
export function getLocalNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** Parse YYYY-MM-DD into a local midnight Date safely. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

/** Add N days to a YYYY-MM-DD key. */
export function addDays(key: string, delta: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

/** Add N months to a YYYY-MM-DD key while keeping day clamped cleanly. */
export function addMonths(key: string, delta: number): string {
  const d = fromDateKey(key);
  const origDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(origDay, lastDay));
  return toDateKey(d);
}

/** Return the 7 date keys of the week containing `anchor`. */
export function getWeekDates(anchor: string, weekStartsOn: 0 | 1 = 1): string[] {
  const d = fromDateKey(anchor);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  return Array.from({ length: 7 }, (_, i) => {
    const copy = new Date(start);
    copy.setDate(start.getDate() + i);
    return toDateKey(copy);
  });
}

/** Return 42 date keys (6x7 grid) for the month containing `anchor`. */
export function getMonthGridDates(anchor: string, weekStartsOn: 0 | 1 = 1): string[] {
  const d = fromDateKey(anchor);
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const offset = (firstOfMonth.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const cell = new Date(start);
    cell.setDate(start.getDate() + i);
    return toDateKey(cell);
  });
}

/** Format minutes since midnight (e.g. 570 -> "9:30 AM" or "09:30"). */
export function formatMinutes(minutes: number, compact = false): string {
  const clamped = ((minutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(clamped / 60);
  const m = clamped % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  if (compact && m === 0) return `${h12} ${suffix}`;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Format range like "9:00 AM - 10:30 AM". */
export function formatTimeRange(startMinutes: number, durationMinutes: number): string {
  return `${formatMinutes(startMinutes)} - ${formatMinutes(startMinutes + durationMinutes)}`;
}

/** Convert minutes since midnight (0..1439) to <input type="time"> HH:MM string. */
export function minutesToTimeInput(minutes: number): string {
  const clamped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Parse <input type="time"> HH:MM string into minutes since midnight. */
export function timeInputToMinutes(hhmm: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

/** Friendly human-readable duration label, e.g. 45 -> "45 min", 90 -> "1h 30m". */
export function formatDurationHuman(minutes: number): string {
  const mins = Math.max(1, Math.round(minutes));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return h === 1 ? '1 hour' : `${h} hours`;
  return `${h}h ${rem}m`;
}

/** Format date key nicely, e.g. "Wed, Nov 18". */
export function formatReadableDate(key: string): string {
  const d = fromDateKey(key);
  return `${WEEKDAY_SHORT[d.getDay()]}, ${SHORT_MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

/** Convert local calendar hour to target IANA timezone hour using Intl with offset fallback. */
export function formatSecondaryTzHour(hour: number, tz: string): string {
  try {
    const base = new Date();
    const sample = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, 0, 0);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(sample);
    const hVal = parts.find((p) => p.type === 'hour')?.value;
    if (hVal) return `${hVal.padStart(2, '0')}h`;
  } catch {
    // fallback if environment lacks full ICU timezone tables
  }
  const offsets: Record<string, number> = {
    UTC: -8,
    'America/New_York': -13,
    'Europe/London': -8,
    'Asia/Tokyo': 1,
  };
  const shift = offsets[tz] ?? -8;
  const h = ((hour + shift) % 24 + 24) % 24;
  return `${String(h).padStart(2, '0')}h`;
}

export interface PositionedEvent {
  event: CalendarEvent;
  col: number;
  totalCols: number;
}

/**
 * Compute side-by-side layout columns for overlapping events within a single day.
 * Guarantees crisp non-overlapping rendering even for concurrent calendar blocks.
 */
export function layoutDayEvents(dayEvents: CalendarEvent[]): PositionedEvent[] {
  const timed = dayEvents
    .filter((e) => !e.allDay)
    .slice()
    .sort((a, b) => a.startMinutes - b.startMinutes || b.durationMinutes - a.durationMinutes);

  const clusters: CalendarEvent[][] = [];
  let currentCluster: CalendarEvent[] = [];
  let clusterEnd = -1;

  for (const ev of timed) {
    const evEnd = ev.startMinutes + ev.durationMinutes;
    if (currentCluster.length === 0 || ev.startMinutes < clusterEnd) {
      currentCluster.push(ev);
      clusterEnd = Math.max(clusterEnd, evEnd);
    } else {
      clusters.push(currentCluster);
      currentCluster = [ev];
      clusterEnd = evEnd;
    }
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  const out: PositionedEvent[] = [];
  for (const cluster of clusters) {
    const colEnds: number[] = [];
    const assigned: { event: CalendarEvent; col: number }[] = [];

    for (const ev of cluster) {
      let col = colEnds.findIndex((end) => end <= ev.startMinutes);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(ev.startMinutes + ev.durationMinutes);
      } else {
        colEnds[col] = ev.startMinutes + ev.durationMinutes;
      }
      assigned.push({ event: ev, col });
    }

    const totalCols = Math.max(1, colEnds.length);
    for (const item of assigned) {
      out.push({ event: item.event, col: item.col, totalCols });
    }
  }
  return out;
}

/** ISO week number helper matching Cron left-gutter week numbers. */
export function getIsoWeekNumber(key: string): number {
  const d = fromDateKey(key);
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
