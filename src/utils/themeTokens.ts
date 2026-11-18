import type { CalendarLayerId, EventCategory, TaskPriority } from '../types/workspace';

export interface CategoryStyle {
  label: string;
  bar: string;
  bgDark: string;
  bgLight: string;
  borderDark: string;
  borderLight: string;
  textDark: string;
  textLight: string;
}

export const EVENT_CATEGORY_STYLES: Record<EventCategory, CategoryStyle> = {
  deep: {
    label: 'Deep Focus',
    bar: '#E74004',
    bgDark: 'rgba(231, 64, 4, 0.14)',
    bgLight: 'rgba(231, 64, 4, 0.09)',
    borderDark: 'rgba(231, 64, 4, 0.34)',
    borderLight: 'rgba(231, 64, 4, 0.25)',
    textDark: '#FFD8CC',
    textLight: '#9A2B04',
  },
  meeting: {
    label: 'Meeting',
    bar: '#14A4FC',
    bgDark: 'rgba(20, 164, 252, 0.14)',
    bgLight: 'rgba(11, 140, 224, 0.09)',
    borderDark: 'rgba(20, 164, 252, 0.32)',
    borderLight: 'rgba(11, 140, 224, 0.24)',
    textDark: '#CCE8FF',
    textLight: '#065A94',
  },
  personal: {
    label: 'Personal',
    bar: '#F4C46C',
    bgDark: 'rgba(244, 196, 108, 0.14)',
    bgLight: 'rgba(214, 149, 14, 0.11)',
    borderDark: 'rgba(244, 196, 108, 0.32)',
    borderLight: 'rgba(214, 149, 14, 0.28)',
    textDark: '#FCE9C2',
    textLight: '#7D5506',
  },
  health: {
    label: 'Health',
    bar: '#2CCC74',
    bgDark: 'rgba(44, 204, 116, 0.14)',
    bgLight: 'rgba(20, 158, 86, 0.09)',
    borderDark: 'rgba(44, 204, 116, 0.32)',
    borderLight: 'rgba(20, 158, 86, 0.25)',
    textDark: '#C8F5DC',
    textLight: '#0D6A39',
  },
  deadline: {
    label: 'Milestone',
    bar: '#D9534F',
    bgDark: 'rgba(217, 83, 79, 0.16)',
    bgLight: 'rgba(201, 59, 55, 0.1)',
    borderDark: 'rgba(217, 83, 79, 0.36)',
    borderLight: 'rgba(201, 59, 55, 0.28)',
    textDark: '#FAD0CF',
    textLight: '#8E201D',
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
  p1: { label: 'Critical (P1)', short: 'P1', color: '#E74004', bg: 'rgba(231, 64, 4, 0.15)' },
  p2: { label: 'High (P2)', short: 'P2', color: '#F4C46C', bg: 'rgba(244, 196, 108, 0.16)' },
  p3: { label: 'Normal (P3)', short: 'P3', color: '#14A4FC', bg: 'rgba(20, 164, 252, 0.14)' },
  p4: { label: 'Low (P4)', short: 'P4', color: '#8A93A2', bg: 'rgba(138, 147, 162, 0.14)' },
};
