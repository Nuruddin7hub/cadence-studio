import type { RecurrenceRule, TaskPriority } from '../types/workspace';
import { addDays, fromDateKey, toDateKey } from './date';

export interface ParsedQuickEntry {
  title: string;
  date?: string;
  startMinutes?: number;
  durationMinutes?: number;
  priority?: TaskPriority;
  tags: string[];
  recurrence?: RecurrenceRule;
  isEventIntent: boolean;
}

const WEEKDAY_MAP: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

/**
 * Parses natural-language task or calendar input such as:
 * "Ship Q4 design review tomorrow 2pm 45m !p1 #work every week"
 */
export function parseQuickInput(raw: string, baseToday: string): ParsedQuickEntry {
  let working = raw.trim();
  let date: string | undefined;
  let startMinutes: number | undefined;
  let durationMinutes: number | undefined;
  let priority: TaskPriority | undefined;
  let recurrence: RecurrenceRule | undefined;
  const tags: string[] = [];

  // Tags (#tag)
  working = working.replace(/#([a-zA-Z0-9_-]+)/g, (_, tag) => {
    tags.push(tag.toLowerCase());
    return '';
  });

  // Priority (!p1..p4 or p1..p4)
  working = working.replace(/(?:^|\s)!?(p[1-4])(?=\s|$)/gi, (_, p) => {
    priority = p.toLowerCase() as TaskPriority;
    return ' ';
  });

  // Recurrence
  const recPatterns: [RegExp, RecurrenceRule][] = [
    [/\b(?:every\s+day|daily)\b/i, 'daily'],
    [/\b(?:every\s+weekday|weekdays)\b/i, 'weekdays'],
    [/\b(?:every\s+week|weekly)\b/i, 'weekly'],
    [/\b(?:every\s+month|monthly)\b/i, 'monthly'],
  ];
  for (const [re, rule] of recPatterns) {
    if (re.test(working)) {
      recurrence = rule;
      working = working.replace(re, ' ');
      break;
    }
  }

  // Duration (e.g. 45m, 1.5h, 2h, 90min)
  working = working.replace(/\b(\d+(?:\.\d+)?)\s*(m|min|mins|h|hr|hrs)\b/gi, (_, num, unit) => {
    const val = parseFloat(num);
    durationMinutes = unit.toLowerCase().startsWith('h')
      ? Math.round(val * 60)
      : Math.round(val);
    return ' ';
  });

  // Time (e.g. 2pm, 2:30pm, 14:15, 9am)
  working = working.replace(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/gi, (_, hh, mm, mer) => {
    let h = parseInt(hh, 10);
    const m = mm ? parseInt(mm, 10) : 0;
    const isPm = mer.toLowerCase() === 'pm';
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      startMinutes = h * 60 + m;
    }
    return ' ';
  });

  if (startMinutes === undefined) {
    working = working.replace(/\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/g, (_, hh, mm) => {
      startMinutes = parseInt(hh, 10) * 60 + parseInt(mm, 10);
      return ' ';
    });
  }

  // Relative dates
  if (/\btoday\b/i.test(working)) {
    date = baseToday;
    working = working.replace(/\btoday\b/i, ' ');
  } else if (/\btomorrow\b|\btmr\b/i.test(working)) {
    date = addDays(baseToday, 1);
    working = working.replace(/\btomorrow\b|\btmr\b/i, ' ');
  } else {
    working = working.replace(
      /\b(?:next\s+)?(sunday|sun|monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat)\b/i,
      (_, wd) => {
        const target = WEEKDAY_MAP[wd.toLowerCase()];
        const base = fromDateKey(baseToday);
        let diff = (target - base.getDay() + 7) % 7;
        if (diff === 0) diff = 7;
        base.setDate(base.getDate() + diff);
        date = toDateKey(base);
        return ' ';
      }
    );
  }

  const cleanTitle = working.replace(/\s+/g, ' ').trim();
  const isEventIntent = startMinutes !== undefined;

  return {
    title: cleanTitle || raw.trim(),
    date,
    startMinutes,
    durationMinutes: durationMinutes ?? (isEventIntent ? 45 : undefined),
    priority,
    tags,
    recurrence,
    isEventIntent,
  };
}
