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
    bgDark: 'rgba(231, 64, 4, 0.11)',
    bgLight: 'rgba(231, 64, 4, 0.08)',
    borderDark: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(231, 64, 4, 0.18)',
    textDark: '#F5ECE9',
    textLight: '#8E2906',
  },
  meeting: {
    label: 'Meeting',
    bar: '#14A4FC',
    bgDark: 'rgba(20, 164, 252, 0.1)',
    bgLight: 'rgba(11, 140, 224, 0.075)',
    borderDark: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(11, 140, 224, 0.18)',
    textDark: '#E4F1FC',
    textLight: '#095387',
  },
  personal: {
    label: 'Personal',
    bar: '#F4C46C',
    bgDark: 'rgba(244, 196, 108, 0.095)',
    bgLight: 'rgba(214, 149, 14, 0.09)',
    borderDark: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(214, 149, 14, 0.2)',
    textDark: '#F6EEDF',
    textLight: '#734E07',
  },
  health: {
    label: 'Health',
    bar: '#2CCC74',
    bgDark: 'rgba(44, 204, 116, 0.1)',
    bgLight: 'rgba(20, 158, 86, 0.08)',
    borderDark: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(20, 158, 86, 0.18)',
    textDark: '#E2F5EB',
    textLight: '#0F6336',
  },
  deadline: {
    label: 'Milestone',
    bar: '#D9534F',
    bgDark: 'rgba(217, 83, 79, 0.11)',
    bgLight: 'rgba(201, 59, 55, 0.085)',
    borderDark: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(201, 59, 55, 0.2)',
    textDark: '#F7E2E1',
    textLight: '#85201D',
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
