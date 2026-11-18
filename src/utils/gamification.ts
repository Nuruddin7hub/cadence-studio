import type { DailyLootRecord, WorkspaceProgression, WorkspaceSnapshot, WorkspaceTab } from '../types/workspace';
import { addDays } from './date';

export type TrophyCategory = 'consistency' | 'focus' | 'planning' | 'mastery';
export type TrophyRarity = 'common' | 'rare' | 'epic' | 'mythic';

export type EmblemKind =
  | 'ignition'
  | 'escalator'
  | 'vault'
  | 'striker'
  | 'engine'
  | 'architect'
  | 'sculptor'
  | 'immersion'
  | 'centurion'
  | 'cadence3'
  | 'rhythm7'
  | 'unbroken14'
  | 'combo'
  | 'chain'
  | 'anchor'
  | 'native';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: TrophyCategory;
  rarity: TrophyRarity;
  xpReward: number;
  emblem: EmblemKind;
  actionLabel: string;
  actionTab: WorkspaceTab;
  target: number;
  unit: string;
  measure: (ctx: AchievementMetricsContext) => number;
}

export interface AchievementStatus {
  def: AchievementDefinition;
  current: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyCrateSlot {
  day: number; // 1..7
  title: string;
  rewardLabel: string;
  baseXp: number;
  freezeBonus: number;
  tier: TrophyRarity;
  status: 'claimed' | 'ready' | 'locked';
}

export interface DailyBountyItem {
  id: string;
  slot: 'ritual' | 'execute' | 'deep';
  title: string;
  detail: string;
  xp: number;
  actionTab: WorkspaceTab;
  actionLabel: string;
  current: number;
  target: number;
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
  flameMultiplier: number;
  flameTierLabel: string;
  totalXp: number;
  level: number;
  rankTitle: string;
  levelXpIntoCurrent: number;
  levelXpNeeded: number;
  levelProgressPct: number;
  totalFocusMinutes: number;
  totalCompletedTasks: number;
  checkedInToday: boolean;
  crateClaimedToday: boolean;
  todayCrateDayNumber: number; // 1..7
  cycleNumber: number; // Week 1, Week 2...
  crateLadder: DailyCrateSlot[];
  lastLootDrop: DailyLootRecord | null;
  todayBounties: DailyBountyItem[];
  todayBountiesCompletedCount: number;
  allBountiesDone: boolean;
  comboClaimedToday: boolean;
  comboBonusXp: number;
  yesterdayAnchor: string;
  todayAnchor: string;
  tomorrowAnchor: string;
  achievements: AchievementStatus[];
  unlockedCount: number;
  newlyUnlocked: AchievementDefinition[];
  pinnedBadge: AchievementStatus | null;
  mosaicDays: MosaicDayCell[]; // 112 days (16 weeks x 7 rows)
  activityByDate: Record<string, number>;
  hasPriorHistory: boolean;
}

interface AchievementMetricsContext {
  snapshot: WorkspaceSnapshot;
  prog: WorkspaceProgression;
  todayKey: string;
  currentStreak: number;
  bestStreak: number;
  totalFocusMinutes: number;
  totalCompletedTasks: number;
  deepBlocksCount: number;
  maxHabitStreak: number;
  allBountiesDoneToday: boolean;
  plannedAnchorCount: number;
  pwaInstalled: boolean;
}

const RANK_TITLES = [
  'Initiate',
  'Time Keeper',
  'Flow Builder',
  'Sprint Tactician',
  'Cadence Architect',
  'Momentum Sage',
  'Focus Virtuoso',
  'Studio Legend',
];

export const DAILY_CRATE_SCHEDULE: Omit<DailyCrateSlot, 'status'>[] = [
  { day: 1, title: 'Ignition', rewardLabel: '+25 XP', baseXp: 25, freezeBonus: 0, tier: 'common' },
  { day: 2, title: 'Booster', rewardLabel: '+40 XP', baseXp: 40, freezeBonus: 0, tier: 'common' },
  { day: 3, title: 'Shield', rewardLabel: '+55 XP · Shield', baseXp: 55, freezeBonus: 1, tier: 'rare' },
  { day: 4, title: 'Overdrive', rewardLabel: '+75 XP', baseXp: 75, freezeBonus: 0, tier: 'rare' },
  { day: 5, title: 'Architect', rewardLabel: '+100 XP · Shield', baseXp: 100, freezeBonus: 1, tier: 'epic' },
  { day: 6, title: 'Vanguard', rewardLabel: '+125 XP', baseXp: 125, freezeBonus: 0, tier: 'epic' },
  { day: 7, title: 'Grand Vault', rewardLabel: '+200 XP · Shield', baseXp: 200, freezeBonus: 1, tier: 'mythic' },
];

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-check-in',
    title: 'First Ignition',
    description: 'Open your Daily Vault and claim your first day reward.',
    category: 'consistency',
    rarity: 'common',
    xpReward: 25,
    emblem: 'ignition',
    actionLabel: 'Claim Vault',
    actionTab: 'rewards',
    target: 1,
    unit: 'day',
    measure: (ctx) => ctx.prog.claimedCrateDates.length + ctx.prog.checkInDates.length,
  },
  {
    id: 'crate-streak-3',
    title: 'Three-Day Escalator',
    description: 'Open 3 Daily Reward Crates on an active streak.',
    category: 'consistency',
    rarity: 'rare',
    xpReward: 60,
    emblem: 'escalator',
    actionLabel: 'Open Vault',
    actionTab: 'rewards',
    target: 3,
    unit: 'crates',
    measure: (ctx) => ctx.prog.claimedCrateDates.length,
  },
  {
    id: 'crate-vault-7',
    title: 'Grand Vault Breaker',
    description: 'Reach Day 7 to crack the Grand Mythic Vault.',
    category: 'mastery',
    rarity: 'epic',
    xpReward: 150,
    emblem: 'vault',
    actionLabel: 'View Ladder',
    actionTab: 'rewards',
    target: 7,
    unit: 'crates',
    measure: (ctx) => ctx.prog.claimedCrateDates.length,
  },
  {
    id: 'first-task',
    title: 'Inbox Striker',
    description: 'Finish your first task on any Studio board.',
    category: 'planning',
    rarity: 'common',
    xpReward: 30,
    emblem: 'striker',
    actionLabel: 'Open Tasks',
    actionTab: 'tasks',
    target: 1,
    unit: 'task',
    measure: (ctx) => ctx.totalCompletedTasks,
  },
  {
    id: 'task-ten',
    title: 'Execution Engine',
    description: 'Ship 10 completed tasks across your studio boards.',
    category: 'planning',
    rarity: 'rare',
    xpReward: 85,
    emblem: 'engine',
    actionLabel: 'Go to Tasks',
    actionTab: 'tasks',
    target: 10,
    unit: 'tasks',
    measure: (ctx) => ctx.totalCompletedTasks,
  },
  {
    id: 'first-block',
    title: 'Grid Architect',
    description: 'Schedule your first deep-work block on the grid.',
    category: 'planning',
    rarity: 'common',
    xpReward: 30,
    emblem: 'architect',
    actionLabel: 'Open Planner',
    actionTab: 'planner',
    target: 1,
    unit: 'block',
    measure: (ctx) => ctx.snapshot.events.length,
  },
  {
    id: 'deep-blocks-5',
    title: 'Time Sculptor',
    description: 'Protect 5 focused deep-work blocks on your timeline.',
    category: 'planning',
    rarity: 'rare',
    xpReward: 90,
    emblem: 'sculptor',
    actionLabel: 'Block Time',
    actionTab: 'planner',
    target: 5,
    unit: 'blocks',
    measure: (ctx) => ctx.deepBlocksCount,
  },
  {
    id: 'first-focus',
    title: 'First Immersion',
    description: 'Finish your first uninterrupted Pomodoro focus sprint.',
    category: 'focus',
    rarity: 'common',
    xpReward: 40,
    emblem: 'immersion',
    actionLabel: 'Start Sprint',
    actionTab: 'focus',
    target: 1,
    unit: 'sprint',
    measure: (ctx) => ctx.snapshot.focusHistory.length,
  },
  {
    id: 'focus-100m',
    title: 'Centurion Flow',
    description: 'Log 100 cumulative minutes in Focus sprints.',
    category: 'focus',
    rarity: 'epic',
    xpReward: 120,
    emblem: 'centurion',
    actionLabel: 'Focus Studio',
    actionTab: 'focus',
    target: 100,
    unit: 'mins',
    measure: (ctx) => ctx.totalFocusMinutes,
  },
  {
    id: 'streak-3',
    title: 'Three-Day Cadence',
    description: 'Hold a 3-day unbroken streak at active momentum.',
    category: 'consistency',
    rarity: 'rare',
    xpReward: 65,
    emblem: 'cadence3',
    actionLabel: 'Daily Loop',
    actionTab: 'rewards',
    target: 3,
    unit: 'days',
    measure: (ctx) => Math.max(ctx.currentStreak, ctx.bestStreak),
  },
  {
    id: 'streak-7',
    title: 'Weekly Rhythm',
    description: 'Maintain an unbroken 7-day streak at full flame.',
    category: 'consistency',
    rarity: 'epic',
    xpReward: 140,
    emblem: 'rhythm7',
    actionLabel: 'View Streak',
    actionTab: 'rewards',
    target: 7,
    unit: 'days',
    measure: (ctx) => Math.max(ctx.currentStreak, ctx.bestStreak),
  },
  {
    id: 'streak-14',
    title: 'Iron Unbroken',
    description: 'Lock in a 14-day legendary return streak.',
    category: 'mastery',
    rarity: 'mythic',
    xpReward: 250,
    emblem: 'unbroken14',
    actionLabel: 'View Streak',
    actionTab: 'rewards',
    target: 14,
    unit: 'days',
    measure: (ctx) => Math.max(ctx.currentStreak, ctx.bestStreak),
  },
  {
    id: 'bounty-trio',
    title: 'Combo Sweeper',
    description: 'Sweep all 3 Daily Bounties in a day for bonus XP.',
    category: 'mastery',
    rarity: 'rare',
    xpReward: 95,
    emblem: 'combo',
    actionLabel: 'Check Bounties',
    actionTab: 'rewards',
    target: 1,
    unit: 'combo',
    measure: (ctx) => (ctx.allBountiesDoneToday || ctx.prog.claimedComboDates.length > 0 ? 1 : 0),
  },
  {
    id: 'habit-stack',
    title: 'Habit Chain',
    description: 'Build at least a 5-day active streak on any daily habit.',
    category: 'consistency',
    rarity: 'rare',
    xpReward: 90,
    emblem: 'chain',
    actionLabel: 'Open Habits',
    actionTab: 'focus',
    target: 5,
    unit: 'days',
    measure: (ctx) => ctx.maxHabitStreak,
  },
  {
    id: 'plan-ahead',
    title: 'Tomorrow Lock',
    description: 'Lock tomorrow’s #1 Priority Anchor ahead of close.',
    category: 'mastery',
    rarity: 'common',
    xpReward: 50,
    emblem: 'anchor',
    actionLabel: 'Lock Priority',
    actionTab: 'rewards',
    target: 1,
    unit: 'anchor',
    measure: (ctx) => ctx.plannedAnchorCount,
  },
  {
    id: 'pwa-installed',
    title: 'Studio Native',
    description: 'Install Cadence Studio as a standalone web app.',
    category: 'mastery',
    rarity: 'epic',
    xpReward: 100,
    emblem: 'native',
    actionLabel: 'Install App',
    actionTab: 'rewards',
    target: 1,
    unit: 'app',
    measure: (ctx) => (ctx.pwaInstalled ? 1 : 0),
  },
];

export function normalizeProgression(prog?: WorkspaceProgression): WorkspaceProgression {
  return {
    xp: typeof prog?.xp === 'number' ? Math.max(0, prog.xp) : 0,
    streakFreezes: typeof prog?.streakFreezes === 'number' ? Math.max(0, Math.min(3, prog.streakFreezes)) : 1,
    streakFreezeDates: Array.isArray(prog?.streakFreezeDates) ? prog!.streakFreezeDates : [],
    checkInDates: Array.isArray(prog?.checkInDates) ? prog!.checkInDates : [],
    claimedCrateDates: Array.isArray(prog?.claimedCrateDates) ? prog!.claimedCrateDates : [],
    claimedComboDates: Array.isArray(prog?.claimedComboDates) ? prog!.claimedComboDates : [],
    unlockedAchievements:
      prog?.unlockedAchievements && typeof prog.unlockedAchievements === 'object' ? prog.unlockedAchievements : {},
    dailyAnchors: prog?.dailyAnchors && typeof prog.dailyAnchors === 'object' ? prog.dailyAnchors : {},
    pinnedBadgeId: typeof prog?.pinnedBadgeId === 'string' ? prog.pinnedBadgeId : undefined,
    lastLootDrop: prog?.lastLootDrop && typeof prog.lastLootDrop === 'object' ? prog.lastLootDrop : null,
    reminderEnabled: Boolean(prog?.reminderEnabled),
    reminderHour: typeof prog?.reminderHour === 'number' ? prog.reminderHour : 9,
    lastRemindedDate: prog?.lastRemindedDate,
    pwaInstalled: Boolean(prog?.pwaInstalled),
  };
}

export function getFlameMultiplier(streak: number): { mult: number; label: string } {
  if (streak >= 14) return { mult: 2.5, label: 'Mythic Flame' };
  if (streak >= 7) return { mult: 2.0, label: 'Unbroken Rhythm' };
  if (streak >= 3) return { mult: 1.5, label: 'Cadence Warmth' };
  return { mult: 1.0, label: 'Spark Multiplier' };
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
  for (const d of prog.claimedCrateDates) bump(d);

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

function hashDaySeed(dateKey: string): number {
  let acc = 0;
  for (let i = 0; i < dateKey.length; i++) {
    acc = (acc * 31 + dateKey.charCodeAt(i)) % 100000;
  }
  return acc;
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
  const tomorrowKey = addDays(todayKey, 1);
  const activeToday = (activityByDate[todayKey] ?? 0) > 0;
  const protectedYesterdayByFreeze = freezeSet.has(yesterdayKey) && (activityByDate[yesterdayKey] ?? 0) === 0;

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

  const { mult: flameMultiplier, label: flameTierLabel } = getFlameMultiplier(currentStreak);

  // Escalating 7-Day Reward Crate Ladder
  const crateClaimedToday = prog.claimedCrateDates.includes(todayKey);
  const totalCratesClaimed = prog.claimedCrateDates.length;
  // Determine position inside current 7-day cycle
  const completedBeforeToday = crateClaimedToday ? Math.max(0, totalCratesClaimed - 1) : totalCratesClaimed;
  const cycleNumber = Math.floor(completedBeforeToday / 7) + 1;
  const claimedInCycle = totalCratesClaimed === 0 ? 0 : ((totalCratesClaimed - 1) % 7) + 1;
  const todayCrateDayNumber = crateClaimedToday ? claimedInCycle : (totalCratesClaimed % 7) + 1;

  const crateLadder: DailyCrateSlot[] = DAILY_CRATE_SCHEDULE.map((slot) => {
    const isClaimed = crateClaimedToday ? slot.day <= todayCrateDayNumber : slot.day < todayCrateDayNumber;
    const isReady = !crateClaimedToday && slot.day === todayCrateDayNumber;
    return {
      ...slot,
      status: isClaimed ? 'claimed' : isReady ? 'ready' : 'locked',
    };
  });

  // Deterministic Rotating Daily Bounties (3 varied challenges per day)
  const seed = hashDaySeed(todayKey);
  const completedTodayCount = snapshot.tasks.filter(
    (t) => t.completed && (t.completedAt ?? t.createdAt).startsWith(todayKey)
  ).length;
  const habitsCheckedToday = snapshot.habits.filter((h) => Boolean(h.history[todayKey])).length;
  const focusMinsToday = snapshot.focusHistory
    .filter((s) => s.completedAt.startsWith(todayKey) || s.date.startsWith(todayKey))
    .reduce((s, x) => s + x.durationMinutes, 0);
  const blocksTodayCount = snapshot.events.filter((e) => e.date === todayKey).length;
  const hasTomorrowAnchor = Boolean(prog.dailyAnchors[tomorrowKey]?.trim());

  const executeVariants = [
    {
      title: 'Clear a queued task today',
      detail: 'Complete 1 task in Smart List or Kanban',
      current: Math.min(1, completedTodayCount),
      target: 1,
      actionTab: 'tasks' as WorkspaceTab,
      actionLabel: 'Open Tasks',
    },
    {
      title: 'Stack a daily habit check',
      detail: 'Mark 1 habit done in Focus Studio',
      current: Math.min(1, habitsCheckedToday + completedTodayCount),
      target: 1,
      actionTab: 'focus' as WorkspaceTab,
      actionLabel: 'Check Habits',
    },
  ];

  const deepVariants = [
    {
      title: 'Run a 25m Deep Focus sprint',
      detail: 'Log at least 25 focus minutes today',
      current: Math.min(25, focusMinsToday),
      target: 25,
      actionTab: 'focus' as WorkspaceTab,
      actionLabel: 'Start Sprint',
    },
    {
      title: 'Time-block today on your grid',
      detail: 'Schedule 1 block or log a focus sprint',
      current: Math.min(1, blocksTodayCount + (focusMinsToday > 0 ? 1 : 0)),
      target: 1,
      actionTab: 'planner' as WorkspaceTab,
      actionLabel: 'Open Planner',
    },
  ];

  const exPick = executeVariants[seed % executeVariants.length];
  const dpPick = deepVariants[(seed + 1) % deepVariants.length];

  const checkedInToday = prog.checkInDates.includes(todayKey) || crateClaimedToday;
  const todayBounties: DailyBountyItem[] = [
    {
      id: 'bounty-vault',
      slot: 'ritual',
      title: `Open Day ${todayCrateDayNumber} Reward Vault`,
      detail: 'Claim your daily escalation crate & check in',
      xp: 20,
      actionTab: 'rewards',
      actionLabel: crateClaimedToday ? 'Claimed' : 'Claim Crate',
      current: crateClaimedToday ? 1 : 0,
      target: 1,
      done: crateClaimedToday,
    },
    {
      id: 'bounty-exec',
      slot: 'execute',
      title: exPick.title,
      detail: exPick.detail,
      xp: 35,
      actionTab: exPick.actionTab,
      actionLabel: exPick.actionLabel,
      current: exPick.current,
      target: exPick.target,
      done: exPick.current >= exPick.target,
    },
    {
      id: 'bounty-deep',
      slot: 'deep',
      title: hasTomorrowAnchor && blocksTodayCount === 0 ? 'Tomorrow Priority Locked' : dpPick.title,
      detail: dpPick.detail,
      xp: 45,
      actionTab: dpPick.actionTab,
      actionLabel: dpPick.actionLabel,
      current: dpPick.current,
      target: dpPick.target,
      done: dpPick.current >= dpPick.target,
    },
  ];

  const todayBountiesCompletedCount = todayBounties.filter((b) => b.done).length;
  const allBountiesDone = todayBountiesCompletedCount === todayBounties.length;
  const comboClaimedToday = prog.claimedComboDates.includes(todayKey);
  const comboBonusXp = Math.round(60 * flameMultiplier);

  const totalFocusMinutes = snapshot.focusHistory.reduce((s, f) => s + f.durationMinutes, 0);
  const totalCompletedTasks = snapshot.tasks.filter((t) => t.completed).length;
  const deepBlocksCount = snapshot.events.filter((e) => e.category === 'deep').length;
  const maxHabitStreak = computeMaxHabitStreak(snapshot, todayKey);
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
    deepBlocksCount,
    maxHabitStreak,
    allBountiesDoneToday: allBountiesDone,
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

  const baseXpFloor =
    totalCompletedTasks * 20 +
    snapshot.focusHistory.length * 25 +
    prog.claimedCrateDates.length * 25 +
    prog.claimedComboDates.length * 60 +
    achievements.reduce((s, a) => s + (a.unlocked ? a.def.xpReward : 0), 0);
  const totalXp = Math.max(prog.xp, baseXpFloor);

  let level = 1;
  let remaining = totalXp;
  let threshold = 120;
  while (remaining >= threshold && level < 30) {
    remaining -= threshold;
    level++;
    threshold += 50;
  }

  const rankTitle = RANK_TITLES[Math.min(RANK_TITLES.length - 1, Math.floor((level - 1) / 2))];
  const levelProgressPct = Math.min(100, Math.round((remaining / threshold) * 100));

  const pinnedBadge =
    achievements.find((a) => a.def.id === prog.pinnedBadgeId && a.unlocked) ??
    achievements.find((a) => a.unlocked) ??
    null;

  // 16 weeks (112 days) contribution mosaic ending on todayKey
  const mosaicDays: MosaicDayCell[] = [];
  for (let i = 111; i >= 0; i--) {
    const key = addDays(todayKey, -i);
    mosaicDays.push({
      date: key,
      count: activityByDate[key] ?? 0,
      frozen: freezeSet.has(key),
      isToday: key === todayKey,
    });
  }

  const hasPriorHistory = Object.keys(activityByDate).some((d) => d < todayKey);

  return {
    currentStreak,
    bestStreak,
    activeToday,
    protectedYesterdayByFreeze,
    streakFreezesRemaining: prog.streakFreezes,
    flameMultiplier,
    flameTierLabel,
    totalXp,
    level,
    rankTitle,
    levelXpIntoCurrent: remaining,
    levelXpNeeded: threshold,
    levelProgressPct,
    totalFocusMinutes,
    totalCompletedTasks,
    checkedInToday,
    crateClaimedToday,
    todayCrateDayNumber,
    cycleNumber,
    crateLadder,
    lastLootDrop: prog.lastLootDrop ?? null,
    todayBounties,
    todayBountiesCompletedCount,
    allBountiesDone,
    comboClaimedToday,
    comboBonusXp,
    yesterdayAnchor: prog.dailyAnchors[yesterdayKey] ?? '',
    todayAnchor: prog.dailyAnchors[todayKey] ?? '',
    tomorrowAnchor: prog.dailyAnchors[tomorrowKey] ?? '',
    achievements,
    unlockedCount: achievements.filter((a) => a.unlocked).length,
    newlyUnlocked,
    pinnedBadge,
    mosaicDays,
    activityByDate,
    hasPriorHistory,
  };
}
