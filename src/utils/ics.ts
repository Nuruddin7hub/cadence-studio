import type { CalendarEvent, WorkspaceSnapshot } from '../types/workspace';
import { fromDateKey } from './date';

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
    lines.push(`UID:${ev.id}@cadence.local`);
    lines.push(`SUMMARY:${escapeIcsText(ev.title)}`);
    lines.push(`DTSTART:${toIcsTimestamp(ev.date, ev.startMinutes)}`);
    lines.push(`DTEND:${toIcsTimestamp(ev.date, ev.startMinutes + ev.durationMinutes)}`);
    if (ev.location) lines.push(`LOCATION:${escapeIcsText(ev.location)}`);
    if (ev.notes) lines.push(`DESCRIPTION:${escapeIcsText(ev.notes)}`);
    if (ev.recurrence === 'daily') lines.push('RRULE:FREQ=DAILY');
    if (ev.recurrence === 'weekdays') lines.push('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
    if (ev.recurrence === 'weekly') lines.push('RRULE:FREQ=WEEKLY');
    if (ev.recurrence === 'monthly') lines.push('RRULE:FREQ=MONTHLY');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
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
