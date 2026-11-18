import type { WorkspaceProgression, WorkspaceSnapshot } from '../types/workspace';
import { addDays } from './date';

export type AchievementCategory = 'consistency' | 'focus' | 'planning' | 'mastery';

export type AchievementIconKey =
  | 'sparkles'
  | 'check'
  | 'calendar'
  | 'timer'
  | 'flame'
  | 'trophy'
  | 'zap'
  | 'layers'
  | 'shield'
  | 'book'
  | 'compass'
  | 'smartphone';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  xpReward: number;
  icon: AchievementIconKey;
  target: number;
  measure: (ctx: AchievementMetricsContext) => number;
}

export interface AchievementStatus {
  def: AchievementDefinition;
  current: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyQuestItem {
  id: 'checkin' | 'execute' | 'focus';
  label: string;
  xp: number;
  done: boolean;
}

export interface MosaicDayCell {
  date: string;
  count: number;
  frozen: boolean;
  isToday: boolean;
}

export interface EvaluatedProgression {
  currentStreak: number;
  bestStreak: number;
  activeToday: boolean;
  protectedYesterdayByFreeze: boolean;
  streakFreezesRemaining: number;
  earnedFreezeBonus: number;
  daysUntilNextFreeze: number;
  totalXp: number;
  level: number;
  rankTitle: string;
  levelXpIntoCurrent: number;
  levelXpNeeded: number;
  levelProgressPct: number;
  totalFocusMinutes: number;
  totalCompletedTasks: number;
  checkedInToday: boolean;
  todayQuests: DailyQuestItem[];
  todayQuestsCompletedCount: number;
  yesterdayAnchor: string;
  todayAnchor: string;
  tomorrowAnchor: string;
  achievements: AchievementStatus[];
  unlockedCount: number;
  newlyUnlocked: AchievementDefinition[];
  mosaicDays: MosaicDayCell[];
  activityByDate: Record<string, number>;
}

interface AchievementMetricsContext {
  snapshot: WorkspaceSnapshot;
  prog: WorkspaceProgression;
  todayKey: string;
  currentStreak: number;
  bestStreak: number;
  totalFocusMinutes: number;
  totalCompletedTasks: number;
  maxHabitStreak: number;
  todayAllQuestsDone: boolean;
  extractedNotesCount: number;
  plannedAnchorCount: number;
  pwaInstalled: boolean;
}

const RANK_TITLES = [
  'Initiate',
  'Time Keeper',
  'Flow Builder',
  'Sprint Tactician',
  'Deep Architect',
  'Momentum Sage',
  'Focus Master',
  'Studio Legend',
];

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-check-in',
    title: 'First Spark',
    description: 'Claim your first Daily Check-In to ignite your streak.',
    category: 'consistency',
    xpReward: 25,
    icon: 'sparkles',
    target: 1,
    measure: (ctx) => ctx.prog.checkInDates.length,
  },
  {
    id: 'first-task',
    title: 'Task Finisher',
    description: 'Complete your very first task in Smart List, Kanban, or Matrix.',
    category: 'planning',
    xpReward: 30,
    icon: 'check',
    target: 1,
    measure: (ctx) => ctx.totalCompletedTasks,
  },
  {
    id: 'first-block',
    title: 'Time Architect',
    description: 'Schedule a dedicated time-block onto the calendar timeline.',
    category: 'planning',
    xpReward: 30,
    icon: 'calendar',
    target: 1,
    measure: (ctx) => ctx.snapshot.events.length,
  },
  {
    id: 'first-focus',
    title: 'Deep Diver',
    description: 'Complete your first uninterrupted Pomodoro focus sprint.',
    category: 'focus',
    xpReward: 40,
    icon: 'timer',
    target: 1,
    measure: (ctx) => ctx.snapshot.focusHistory.length,
  },
  {
    id: 'streak-3',
    title: '3-Day Cadence',
    description: 'Keep daily momentum alive for 3 consecutive active days.',
    category: 'consistency',
    xpReward: 60,
    icon: 'flame',
    target: 3,
    measure: (ctx) => Math.max(ctx.currentStreak, ctx.bestStreak),
  },
  {
    id: 'streak-7',
    title: 'Weekly Rhythm',
    description: 'Maintain a 7-day active streak without breaking the chain.',
    category: 'consistency',
    xpReward: 120,
    icon: 'trophy',
    target: 7,
    measure: (ctx) => Math.max(ctx.currentStreak, ctx.bestStreak),
  },
  {
    id: 'focus-100m',
    title: 'Focus Centurion',
    description: 'Accumulate 100 minutes of logged Pomodoro deep work.',
    category: 'focus',
    xpReward: 100,
    icon: 'zap',
    target: 100,
    measure: (ctx) => ctx.totalFocusMinutes,
  },
  {
    id: 'daily-trio',
    title: 'Momentum Closer',
    description: 'Complete all 3 Daily Quests on the same day.',
    category: 'mastery',
    xpReward: 80,
    icon: 'layers',
    target: 1,
    measure: (ctx) => (ctx.todayAllQuestsDone ? 1 : 0),
  },
  {
    id: 'habit-stack',
    title: 'Habit Builder',
    description: 'Build at least a 5-day streak on any tracked habit.',
    category: 'consistency',
    xpReward: 90,
    icon: 'shield',
    target: 5,
    measure: (ctx) => ctx.maxHabitStreak,
  },
  {
    id: 'journal-action',
    title: 'Reflective Builder',
    description: 'Write a journal note and send an action line straight to To-Do.',
    category: 'planning',
    xpReward: 50,
    icon: 'book',
    target: 1,
    measure: (ctx) => ctx.extractedNotesCount,
  },
  {
    id: 'plan-ahead',
    title: 'Evening Shutdown',
    description: 'Lock a #1 Priority Anchor so tomorrow opens with clarity.',
    category: 'mastery',
    xpReward: 50,
    icon: 'compass',
    target: 1,
    measure: (ctx) => ctx.plannedAnchorCount,
  },
  {
    id: 'pwa-installed',
    title: 'Studio Native',
    description: 'Download & launch Cadence Studio as an installed Web App.',
    category: 'mastery',
    xpReward: 75,
    icon: 'smartphone',
    target: 1,
    measure: (ctx) => (ctx.pwaInstalled ? 1 : 0),
  },
];

export function normalizeProgression(prog?: WorkspaceProgression): WorkspaceProgression {
  return {
    xp: typeof prog?.xp === 'number' ? prog.xp : 0,
    streakFreezes: typeof prog?.streakFreezes === 'number' ? Math.max(0, prog.streakFreezes) : 1,
    streakFreezeDates: Array.isArray(prog?.streakFreezeDates) ? prog!.streakFreezeDates : [],
    checkInDates: Array.isArray(prog?.checkInDates) ? prog!.checkInDates : [],
    unlockedAchievements:
      prog?.unlockedAchievements && typeof prog.unlockedAchievements === 'object' ? prog.unlockedAchievements : {},
    dailyAnchors: prog?.dailyAnchors && typeof prog.dailyAnchors === 'object' ? prog.dailyAnchors : {},
    reminderEnabled: Boolean(prog?.reminderEnabled),
    reminderHour: typeof prog?.reminderHour === 'number' ? prog.reminderHour : 9,
    lastRemindedDate: prog?.lastRemindedDate,
    pwaInstalled: Boolean(prog?.pwaInstalled),
  };
}

export function buildActivityByDate(snapshot: WorkspaceSnapshot): Record<string, number> {
  const counts: Record<string, number> = {};
  const bump = (dateStr?: string) => {
    if (!dateStr || dateStr.length < 10) return;
    const key = dateStr.slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  };

  for (const ev of snapshot.events) bump(ev.date);
  for (const t of snapshot.tasks) {
    if (t.completed) bump(t.completedAt ?? t.dueDate ?? t.createdAt);
  }
  for (const h of snapshot.habits) {
    for (const [dayKey, done] of Object.entries(h.history)) {
      if (done) bump(dayKey);
    }
  }
  for (const fs of snapshot.focusHistory) {
    bump(fs.completedAt?.slice(0, 10) ?? fs.date?.slice(0, 10));
  }
  for (const [dayKey, note] of Object.entries(snapshot.notes)) {
    if (note.content.trim().length > 0) bump(dayKey);
  }
  const prog = normalizeProgression(snapshot.progression);
  for (const d of prog.checkInDates) bump(d);

  return counts;
}

export function computeMaxHabitStreak(snapshot: WorkspaceSnapshot, todayKey: string): number {
  let best = 0;
  for (const h of snapshot.habits) {
    let run = 0;
    for (let i = 0; i < 60; i++) {
      if (h.history[addDays(todayKey, -i)]) {
        run++;
        if (run > best) best = run;
      } else if (i > 0) {
        break;
      }
    }
  }
  return best;
}

export function evaluateProgression(
  snapshot: WorkspaceSnapshot,
  todayKey: string,
  pwaInstalledNow = false
): EvaluatedProgression {
  const prog = normalizeProgression(snapshot.progression);
  const activityByDate = buildActivityByDate(snapshot);
  const freezeSet = new Set(prog.streakFreezeDates);

  const yesterdayKey = addDays(todayKey, -1);
  const activeToday = (activityByDate[todayKey] ?? 0) > 0;
  const protectedYesterdayByFreeze = freezeSet.has(yesterdayKey) && (activityByDate[yesterdayKey] ?? 0) === 0;

  // Calculate active consecutive streak walking backwards from today (or yesterday if today still in progress)
  let currentStreak = 0;
  const startOffset = activeToday ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const key = addDays(todayKey, -i);
    if ((activityByDate[key] ?? 0) > 0 || freezeSet.has(key)) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Compute historical best streak across known active dates
  const allDates = Object.keys(activityByDate).sort();
  let bestStreak = currentStreak;
  if (allDates.length > 0) {
    let run = 0;
    const first = allDates[0];
    for (let i = 0; i < 400; i++) {
      const k = addDays(first, i);
      if (k > todayKey) break;
      if ((activityByDate[k] ?? 0) > 0 || freezeSet.has(k)) {
        run++;
        if (run > bestStreak) bestStreak = run;
      } else {
        run = 0;
      }
    }
  }

  const totalFocusMinutes = snapshot.focusHistory.reduce((s, f) => s + f.durationMinutes, 0);
  const totalCompletedTasks = snapshot.tasks.filter((t) => t.completed).length;
  const checkedInToday = prog.checkInDates.includes(todayKey);

  const taskOrHabitDoneToday =
    snapshot.tasks.some((t) => t.completed && (t.completedAt ?? t.createdAt).startsWith(todayKey)) ||
    snapshot.habits.some((h) => Boolean(h.history[todayKey]));

  const focusOrBlockToday =
    snapshot.focusHistory.some((s) => s.completedAt.startsWith(todayKey) || s.date.startsWith(todayKey)) ||
    snapshot.events.some((e) => e.date === todayKey);

  const todayQuests: DailyQuestItem[] = [
    { id: 'checkin', label: 'Daily check-in & priority scan', xp: 15, done: checkedInToday },
    { id: 'execute', label: 'Complete a task or daily habit', xp: 25, done: taskOrHabitDoneToday },
    { id: 'focus', label: 'Log a focus sprint or time-block', xp: 30, done: focusOrBlockToday },
  ];
  const todayQuestsCompletedCount = todayQuests.filter((q) => q.done).length;
  const todayAllQuestsDone = todayQuestsCompletedCount === todayQuests.length;

  const maxHabitStreak = computeMaxHabitStreak(snapshot, todayKey);
  const extractedNotesCount = Object.values(snapshot.notes).reduce((sum, n) => sum + (n.extractedLines?.length ?? 0), 0);
  const plannedAnchorCount = Object.values(prog.dailyAnchors).filter((v) => v.trim().length > 0).length;
  const effectivePwa = Boolean(prog.pwaInstalled || pwaInstalledNow);

  const ctx: AchievementMetricsContext = {
    snapshot,
    prog,
    todayKey,
    currentStreak,
    bestStreak,
    totalFocusMinutes,
    totalCompletedTasks,
    maxHabitStreak,
    todayAllQuestsDone,
    extractedNotesCount,
    plannedAnchorCount,
    pwaInstalled: effectivePwa,
  };

  const newlyUnlocked: AchievementDefinition[] = [];
  const achievements: AchievementStatus[] = ACHIEVEMENTS.map((def) => {
    const raw = Math.max(0, def.measure(ctx));
    const alreadyUnlockedAt = prog.unlockedAchievements[def.id];
    const unlockedNow = raw >= def.target;
    const unlocked = Boolean(alreadyUnlockedAt) || unlockedNow;
    if (unlockedNow && !alreadyUnlockedAt) {
      newlyUnlocked.push(def);
    }
    return {
      def,
      current: Math.min(def.target, unlocked ? def.target : raw),
      target: def.target,
      unlocked,
      unlockedAt: alreadyUnlockedAt,
    };
  });

  // Base activity XP + achievement rewards (monotonically rewards real actions cleanly)
  const activityXp =
    totalCompletedTasks * 20 +
    snapshot.focusHistory.length * 25 +
    snapshot.habits.reduce((acc, h) => acc + Object.values(h.history).filter(Boolean).length * 10, 0) +
    prog.checkInDates.length * 15;
  const badgeXp = achievements.reduce((sum, a) => sum + (a.unlocked ? a.def.xpReward : 0), 0);
  const totalXp = Math.max(prog.xp, activityXp + badgeXp);

  // Level progression (120 XP per level early -> scales gently by +40 each level)
  let level = 1;
  let remaining = totalXp;
  let threshold = 120;
  while (remaining >= threshold && level < 25) {
    remaining -= threshold;
    level++;
    threshold += 45;
  }

  const rankTitle = RANK_TITLES[Math.min(RANK_TITLES.length - 1, Math.floor((level - 1) / 2))];
  const levelProgressPct = Math.min(100, Math.round((remaining / threshold) * 100));

  // Build 12-week (84 days) contribution mosaic ending on todayKey
  const mosaicDays: MosaicDayCell[] = [];
  for (let i = 83; i >= 0; i--) {
    const key = addDays(todayKey, -i);
    mosaicDays.push({
      date: key,
      count: activityByDate[key] ?? 0,
      frozen: freezeSet.has(key),
      isToday: key === todayKey,
    });
  }

  const mod5 = currentStreak > 0 ? currentStreak % 5 : 0;
  const daysUntilNextFreeze = currentStreak === 0 ? 5 : mod5 === 0 ? 5 : 5 - mod5;

  return {
    currentStreak,
    bestStreak,
    activeToday,
    protectedYesterdayByFreeze,
    streakFreezesRemaining: prog.streakFreezes,
    earnedFreezeBonus: Math.floor(bestStreak / 5),
    daysUntilNextFreeze,
    totalXp,
    level,
    rankTitle,
    levelXpIntoCurrent: remaining,
    levelXpNeeded: threshold,
    levelProgressPct,
    totalFocusMinutes,
    totalCompletedTasks,
    checkedInToday,
    todayQuests,
    todayQuestsCompletedCount,
    yesterdayAnchor: prog.dailyAnchors[yesterdayKey] ?? '',
    todayAnchor: prog.dailyAnchors[todayKey] ?? '',
    tomorrowAnchor: prog.dailyAnchors[addDays(todayKey, 1)] ?? '',
    achievements,
    unlockedCount: achievements.filter((a) => a.unlocked).length,
    newlyUnlocked,
    mosaicDays,
    activityByDate,
  };
}
