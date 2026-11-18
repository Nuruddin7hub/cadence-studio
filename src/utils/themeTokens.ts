import type { CalendarEvent, CalendarLayerId, EventCategory, TaskPriority } from '../types/workspace';

export interface CategoryStyle {
  label: string;
  shortLabel: string;
  bar: string;
  bgDark: string;
  bgLight: string;
  borderDark: string;
  borderLight: string;
  textDark: string;
  textLight: string;
  glowDark: string;
}

export const CUSTOM_COLOR_SWATCHES: string[] = [
  '#06B6D4',
  '#E74004',
  '#14A4FC',
  '#2CCC74',
  '#F4C46C',
  '#EC4899',
  '#F97316',
  '#848F9F',
];

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return [6, 182, 212];
}

function rgbaFromHex(hex: string, alpha: number): string {
  const [r, g, b] = parseHexRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Build accessible dark/light card styling for any custom category name and hex color. */
export function buildDynamicCategoryStyle(label: string, colorHex = '#06B6D4'): CategoryStyle {
  const cleanLabel = label.trim() || 'Custom';
  const safeHex = /^#[0-9a-fA-F]{6}$/.test(colorHex) ? colorHex : '#06B6D4';
  const [r, g, b] = parseHexRgb(safeHex);
  // Darken light-mode ink cleanly so any vivid custom swatch remains legible on paper backgrounds
  const lr = Math.max(12, Math.round(r * 0.56));
  const lg = Math.max(12, Math.round(g * 0.56));
  const lb = Math.max(12, Math.round(b * 0.56));
  return {
    label: cleanLabel,
    shortLabel: cleanLabel.slice(0, 8),
    bar: safeHex,
    bgDark: rgbaFromHex(safeHex, 0.17),
    bgLight: rgbaFromHex(safeHex, 0.11),
    borderDark: rgbaFromHex(safeHex, 0.36),
    borderLight: rgbaFromHex(safeHex, 0.28),
    textDark: '#F8FAFC',
    textLight: `rgb(${lr}, ${lg}, ${lb})`,
    glowDark: rgbaFromHex(safeHex, 0.26),
  };
}

export const EVENT_CATEGORY_STYLES: Record<EventCategory, CategoryStyle> = {
  deep: {
    label: 'Deep Focus',
    shortLabel: 'Focus',
    bar: '#E74004',
    bgDark: 'rgba(231, 64, 4, 0.18)',
    bgLight: 'rgba(231, 64, 4, 0.10)',
    borderDark: 'rgba(231, 64, 4, 0.36)',
    borderLight: 'rgba(231, 64, 4, 0.26)',
    textDark: '#FFF2ED',
    textLight: '#8E2906',
    glowDark: 'rgba(231, 64, 4, 0.28)',
  },
  meeting: {
    label: 'Meeting',
    shortLabel: 'Meet',
    bar: '#14A4FC',
    bgDark: 'rgba(20, 164, 252, 0.16)',
    bgLight: 'rgba(11, 140, 224, 0.095)',
    borderDark: 'rgba(20, 164, 252, 0.34)',
    borderLight: 'rgba(11, 140, 224, 0.24)',
    textDark: '#ECF6FF',
    textLight: '#095387',
    glowDark: 'rgba(20, 164, 252, 0.25)',
  },
  personal: {
    label: 'Personal',
    shortLabel: 'Life',
    bar: '#F4C46C',
    bgDark: 'rgba(244, 196, 108, 0.16)',
    bgLight: 'rgba(214, 149, 14, 0.105)',
    borderDark: 'rgba(244, 196, 108, 0.34)',
    borderLight: 'rgba(214, 149, 14, 0.26)',
    textDark: '#FFF6E3',
    textLight: '#734E07',
    glowDark: 'rgba(244, 196, 108, 0.24)',
  },
  health: {
    label: 'Health',
    shortLabel: 'Health',
    bar: '#2CCC74',
    bgDark: 'rgba(44, 204, 116, 0.16)',
    bgLight: 'rgba(20, 158, 86, 0.095)',
    borderDark: 'rgba(44, 204, 116, 0.34)',
    borderLight: 'rgba(20, 158, 86, 0.24)',
    textDark: '#E9FFF2',
    textLight: '#0F6336',
    glowDark: 'rgba(44, 204, 116, 0.24)',
  },
  deadline: {
    label: 'Milestone',
    shortLabel: 'Goal',
    bar: '#D9534F',
    bgDark: 'rgba(217, 83, 79, 0.18)',
    bgLight: 'rgba(201, 59, 55, 0.105)',
    borderDark: 'rgba(217, 83, 79, 0.36)',
    borderLight: 'rgba(201, 59, 55, 0.26)',
    textDark: '#FFECEB',
    textLight: '#85201D',
    glowDark: 'rgba(217, 83, 79, 0.26)',
  },
  custom: {
    label: 'Custom',
    shortLabel: 'Custom',
    bar: '#06B6D4',
    bgDark: 'rgba(6, 182, 212, 0.17)',
    bgLight: 'rgba(6, 182, 212, 0.10)',
    borderDark: 'rgba(6, 182, 212, 0.36)',
    borderLight: 'rgba(6, 182, 212, 0.26)',
    textDark: '#ECFEFF',
    textLight: '#0E5D6D',
    glowDark: 'rgba(6, 182, 212, 0.26)',
  },
};

export function resolveEventStyle(
  ev: Pick<CalendarEvent, 'category' | 'customLabel' | 'customColor'>
): CategoryStyle {
  if (ev.customLabel || ev.customColor || ev.category === 'custom') {
    const base = EVENT_CATEGORY_STYLES[ev.category] ?? EVENT_CATEGORY_STYLES.custom;
    return buildDynamicCategoryStyle(ev.customLabel ?? base.label, ev.customColor ?? base.bar);
  }
  return EVENT_CATEGORY_STYLES[ev.category] ?? EVENT_CATEGORY_STYLES.deep;
}

export const CALENDAR_LAYERS: { id: CalendarLayerId; label: string; color: string }[] = [
  { id: 'work', label: 'Work & Deep Blocks', color: '#E74004' },
  { id: 'team', label: 'Team Syncs', color: '#14A4FC' },
  { id: 'personal', label: 'Personal', color: '#F4C46C' },
  { id: 'wellness', label: 'Health & Training', color: '#2CCC74' },
  { id: 'custom', label: 'Custom & Imported', color: '#06B6D4' },
];

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; short: string; color: string; bg: string }
> = {
  p1: { label: 'Critical (P1)', short: 'P1', color: '#E74004', bg: 'rgba(231, 64, 4, 0.14)' },
  p2: { label: 'High (P2)', short: 'P2', color: '#F4C46C', bg: 'rgba(244, 196, 108, 0.14)' },
  p3: { label: 'Normal (P3)', short: 'P3', color: '#14A4FC', bg: 'rgba(20, 164, 252, 0.14)' },
  p4: { label: 'Low (P4)', short: 'P4', color: '#848E9F', bg: 'rgba(132, 142, 159, 0.14)' },
};
