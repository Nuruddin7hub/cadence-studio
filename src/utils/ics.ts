import type {
  CalendarEvent,
  CalendarLayerId,
  CustomCategoryPreset,
  EventCategory,
  RecurrenceRule,
  WorkspaceSnapshot,
} from '../types/workspace';
import { fromDateKey, toDateKey } from './date';
import { CUSTOM_COLOR_SWATCHES } from './themeTokens';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toIcsTimestamp(dateKey: string, minutes: number): string {
  const d = fromDateKey(dateKey);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(h)}${pad2(m)}00`;
}

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function unescapeIcsText(s: string): string {
  return s
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

/** Generates a valid RFC 5545 .ics calendar payload for all user events. */
export function buildIcsExport(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cadence Studio//Calendar & Tasks//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const ev of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.uid ?? `${ev.id}@cadence.local`}`);
    lines.push(`SUMMARY:${escapeIcsText(ev.title)}`);
    if (ev.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${ev.date.replace(/-/g, '')}`);
    } else {
      lines.push(`DTSTART:${toIcsTimestamp(ev.date, ev.startMinutes)}`);
      lines.push(`DTEND:${toIcsTimestamp(ev.date, ev.startMinutes + ev.durationMinutes)}`);
    }
    if (ev.location) lines.push(`LOCATION:${escapeIcsText(ev.location)}`);
    if (ev.notes) lines.push(`DESCRIPTION:${escapeIcsText(ev.notes)}`);
    if (ev.customLabel) lines.push(`CATEGORIES:${escapeIcsText(ev.customLabel)}`);
    if (ev.recurrence === 'daily') lines.push('RRULE:FREQ=DAILY');
    if (ev.recurrence === 'weekdays') lines.push('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
    if (ev.recurrence === 'weekly') lines.push('RRULE:FREQ=WEEKLY');
    if (ev.recurrence === 'monthly') lines.push('RRULE:FREQ=MONTHLY');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

interface ParsedIcsMoment {
  date: string;
  startMinutes: number;
  allDay: boolean;
  utcMs: number;
}

function parseIcsDateValue(paramsUpper: string, rawValue: string): ParsedIcsMoment | null {
  const val = rawValue.trim();
  const isDateOnly = paramsUpper.includes('VALUE=DATE') && !paramsUpper.includes('DATE-TIME');

  const dateMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(val);
  if (dateMatch || (isDateOnly && /^(\d{4})(\d{2})(\d{2})/.test(val))) {
    const m = /^(\d{4})(\d{2})(\d{2})/.exec(val);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const da = Number(m[3]);
    return {
      date: `${y}-${pad2(mo)}-${pad2(da)}`,
      startMinutes: 9 * 60,
      allDay: true,
      utcMs: Date.UTC(y, mo - 1, da, 0, 0, 0),
    };
  }

  const dtMatch = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/i.exec(val);
  if (!dtMatch) return null;
  const y = Number(dtMatch[1]);
  const mo = Number(dtMatch[2]);
  const da = Number(dtMatch[3]);
  const hh = Number(dtMatch[4]);
  const mm = Number(dtMatch[5]);
  const ss = dtMatch[6] ? Number(dtMatch[6]) : 0;
  const isUtc = Boolean(dtMatch[7]);

  if (isUtc) {
    const local = new Date(Date.UTC(y, mo - 1, da, hh, mm, ss));
    return {
      date: toDateKey(local),
      startMinutes: local.getHours() * 60 + local.getMinutes(),
      allDay: false,
      utcMs: local.getTime(),
    };
  }

  const wall = new Date(y, mo - 1, da, hh, mm, ss);
  return {
    date: `${y}-${pad2(mo)}-${pad2(da)}`,
    startMinutes: hh * 60 + mm,
    allDay: false,
    utcMs: wall.getTime(),
  };
}

function parseIcsDurationMinutes(raw: string): number | null {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i.exec(raw.trim());
  if (!m) return null;
  const days = m[1] ? Number(m[1]) : 0;
  const hours = m[2] ? Number(m[2]) : 0;
  const mins = m[3] ? Number(m[3]) : 0;
  const total = days * 1440 + hours * 60 + mins;
  return total > 0 ? total : null;
}

function parseIcsRrule(raw: string): RecurrenceRule {
  const upper = raw.toUpperCase();
  if (upper.includes('FREQ=DAILY')) return 'daily';
  if (upper.includes('FREQ=WEEKLY')) {
    if (/BYDAY=MO,TU,WE,TH,FR/i.test(upper)) return 'weekdays';
    return 'weekly';
  }
  if (upper.includes('FREQ=MONTHLY')) return 'monthly';
  return 'none';
}

function inferIcsCategory(
  summary: string,
  rawCategories: string
): { category: EventCategory; calendarId: CalendarLayerId; customLabel?: string; customColor?: string } {
  const firstCat = rawCategories.split(',')[0]?.trim() ?? '';
  const combined = `${firstCat} ${summary}`.toLowerCase();

  if (/\b(health|gym|workout|run|yoga|doctor|dentist|medical|fitness)\b/.test(combined)) {
    return { category: 'health', calendarId: 'wellness' };
  }
  if (/\b(meet|sync|standup|call|1:1|interview|review|retro|zoom|teams|google meet)\b/.test(combined)) {
    return { category: 'meeting', calendarId: 'team' };
  }
  if (/\b(personal|family|dinner|lunch|birthday|holiday|flight|travel)\b/.test(combined)) {
    return { category: 'personal', calendarId: 'personal' };
  }
  if (/\b(deadline|milestone|due|launch|exam|release|submit)\b/.test(combined)) {
    return { category: 'deadline', calendarId: 'work' };
  }
  if (/\b(deep|focus|coding|study)\b/.test(combined) && !firstCat) {
    return { category: 'deep', calendarId: 'work' };
  }
  if (firstCat) {
    const hash = Array.from(firstCat).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return {
      category: 'custom',
      calendarId: 'custom',
      customLabel: firstCat,
      customColor: CUSTOM_COLOR_SWATCHES[hash % CUSTOM_COLOR_SWATCHES.length],
    };
  }
  return { category: 'custom', calendarId: 'custom', customLabel: 'Imported', customColor: '#06B6D4' };
}

export interface ParsedIcsResult {
  events: Omit<CalendarEvent, 'id'>[];
  customLabels: CustomCategoryPreset[];
  error?: string;
}

/** Parses RFC 5545 .ics calendar payload into Cadence calendar events. */
export function parseIcsCalendar(icsText: string): ParsedIcsResult {
  if (!icsText || !/BEGIN:VCALENDAR/i.test(icsText)) {
    return { events: [], customLabels: [], error: 'File does not contain a valid VCALENDAR block.' };
  }

  // RFC 5545 Section 3.1: unfold CRLF/LF followed by linear whitespace
  const unfolded = icsText.replace(/\r?\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);

  const events: Omit<CalendarEvent, 'id'>[] = [];
  const customMap = new Map<string, CustomCategoryPreset>();

  let inEvent = false;
  let props: Record<string, { params: string; value: string }> = {};

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    if (/^BEGIN:VEVENT$/i.test(line)) {
      inEvent = true;
      props = {};
      continue;
    }

    if (/^END:VEVENT$/i.test(line)) {
      if (inEvent) {
        const dtStartProp = props.DTSTART;
        if (dtStartProp) {
          const start = parseIcsDateValue(dtStartProp.params, dtStartProp.value);
          if (start) {
            const title = unescapeIcsText(props.SUMMARY?.value ?? 'Imported Event') || 'Imported Event';
            const dtEndProp = props.DTEND;
            const durProp = props.DURATION;
            let durationMinutes = 60;
            let allDay = start.allDay;

            if (dtEndProp) {
              const end = parseIcsDateValue(dtEndProp.params, dtEndProp.value);
              if (end) {
                const diffMins = Math.round((end.utcMs - start.utcMs) / 60000);
                if (diffMins >= 1440 || (start.allDay && diffMins > 0)) {
                  allDay = true;
                  durationMinutes = 60;
                } else if (diffMins > 0) {
                  durationMinutes = Math.max(15, Math.min(720, diffMins));
                }
              }
            } else if (durProp) {
              const dur = parseIcsDurationMinutes(durProp.value);
              if (dur !== null) {
                if (dur >= 1440) {
                  allDay = true;
                  durationMinutes = 60;
                } else {
                  durationMinutes = Math.max(15, Math.min(720, dur));
                }
              }
            }

            const rawCats = props.CATEGORIES?.value ? unescapeIcsText(props.CATEGORIES.value) : '';
            const inferred = inferIcsCategory(title, rawCats);
            const location = props.LOCATION?.value ? unescapeIcsText(props.LOCATION.value) : undefined;
            const notes = props.DESCRIPTION?.value ? unescapeIcsText(props.DESCRIPTION.value) : undefined;
            const uid = props.UID?.value ? props.UID.value.trim() : undefined;
            const recurrence = props.RRULE?.value ? parseIcsRrule(props.RRULE.value) : 'none';

            if (inferred.customLabel && inferred.customColor && inferred.customLabel !== 'Imported') {
              const key = inferred.customLabel.toLowerCase();
              if (!customMap.has(key)) {
                customMap.set(key, {
                  id: `lbl-${key.replace(/[^a-z0-9]+/g, '-')}`,
                  label: inferred.customLabel,
                  color: inferred.customColor,
                });
              }
            }

            events.push({
              uid,
              title,
              date: start.date,
              startMinutes: allDay ? 9 * 60 : Math.max(0, Math.min(23 * 60 + 45, start.startMinutes)),
              durationMinutes,
              allDay: allDay || undefined,
              category: inferred.category,
              customLabel: inferred.customLabel,
              customColor: inferred.customColor,
              calendarId: inferred.calendarId,
              location: location || undefined,
              notes: notes || undefined,
              recurrence,
            });
          }
        }
      }
      inEvent = false;
      props = {};
      continue;
    }

    if (!inEvent) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx <= 0) continue;
    const left = line.slice(0, colonIdx);
    const val = line.slice(colonIdx + 1);
    const semiIdx = left.indexOf(';');
    const name = (semiIdx >= 0 ? left.slice(0, semiIdx) : left).toUpperCase();
    const params = semiIdx >= 0 ? left.slice(semiIdx + 1).toUpperCase() : '';
    props[name] = { params, value: val };
  }

  return { events, customLabels: Array.from(customMap.values()) };
}

export function triggerFileDownload(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildJsonBackup(snapshot: WorkspaceSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
