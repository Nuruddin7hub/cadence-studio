import type { CalendarLayerId, EventCategory, TaskPriority } from '../types/workspace';

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
};

export const CALENDAR_LAYERS: { id: CalendarLayerId; label: string; color: string }[] = [
  { id: 'work', label: 'Work & Deep Blocks', color: '#E74004' },
  { id: 'team', label: 'Team Syncs', color: '#14A4FC' },
  { id: 'personal', label: 'Personal', color: '#F4C46C' },
  { id: 'wellness', label: 'Health & Training', color: '#2CCC74' },
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
