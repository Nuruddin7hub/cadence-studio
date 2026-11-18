import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  BellOff,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  Flame,
  Layers,
  Lock,
  Shield,
  Smartphone,
  Snowflake,
  Sparkles,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { AchievementIconKey } from '../utils/gamification';
import { CountUp, SpotlightCard } from '../lib/reactbits';

interface Props {
  variant: 'strip' | 'hub';
}

const ICON_MAP: Record<AchievementIconKey, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  check: CheckCircle2,
  calendar: Calendar,
  timer: Timer,
  flame: Flame,
  trophy: Trophy,
  zap: Zap,
  layers: Layers,
  shield: Shield,
  book: BookOpen,
  compass: Compass,
  smartphone: Smartphone,
};

export const StreakAchievementsPanel: React.FC<Props> = ({ variant }) => {
  const {
    snapshot,
    progression,
    claimDailyCheckIn,
    setTomorrowAnchor,
    promoteTodayAnchorToTask,
    toggleDailyReminder,
    setActiveTab,
    triggerPwaInstall,
    pwaInstalled,
  } = useWorkspace();

  const isDark = snapshot.preferences.theme === 'dark';
  const [anchorDraft, setAnchorDraft] = useState(progression.tomorrowAnchor);

  useEffect(() => {
    setAnchorDraft(progression.tomorrowAnchor);
  }, [progression.tomorrowAnchor]);

  const handleSaveAnchor = (e: React.FormEvent) => {
    e.preventDefault();
    setTomorrowAnchor(anchorDraft);
  };

  if (variant === 'strip') {
    return (
      <section aria-label="Daily momentum and return loop" className="max-w-6xl mx-auto px-6 sm:px-10 py-6">
        <SpotlightCard
          theme={isDark ? 'dark' : 'light'}
          spotlightColor={isDark ? 'rgba(231, 64, 4, 0.14)' : 'rgba(231, 64, 4, 0.06)'}
          className="studio-card rounded-2xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[12.5px] font-bold">
                <Flame className="w-4 h-4" />
                <span>{progression.currentStreak}d Streak</span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border bg-[var(--bg-inset)] text-[12px] text-[var(--ink-secondary)] font-mono-num"
                title="Streak Freeze automatically protects a missed day without losing your streak"
              >
                <Snowflake className="w-3.5 h-3.5 text-[var(--accent-sky)]" />
                <span>
                  {progression.streakFreezesRemaining} Shield{progression.streakFreezesRemaining === 1 ? '' : 's'}
                </span>
              </div>
              <div className="text-[12.5px] text-[var(--ink-secondary)]">
                <span className="font-semibold text-[var(--ink-primary)]">
                  Lv.{progression.level} {progression.rankTitle}
                </span>{' '}
                · <span className="font-mono-num">{progression.totalXp} XP</span> ·{' '}
                <span className="font-mono-num text-[var(--accent-emerald)]">
                  {progression.unlockedCount}/{progression.achievements.length} Badges
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!progression.checkedInToday ? (
                <button
                  type="button"
                  onClick={claimDailyCheckIn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Claim Daily Check-In (+15 XP)</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[var(--accent-emerald-soft)]/35 border-[var(--accent-emerald)]/35 text-[12px] font-medium text-[var(--accent-emerald)]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Checked in today</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('focus')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border bg-[var(--bg-inset)] hover:bg-[var(--bg-hover)] text-[12px] font-medium text-[var(--ink-primary)] transition-colors"
              >
                <span>Achievements & Mosaic</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
            {/* 3 Daily Quests */}
            <div className="md:col-span-7 p-3 rounded-xl border bg-[var(--bg-inset)] space-y-2">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-[var(--ink-primary)]">Today’s Momentum Loop</span>
                <span className="font-mono-num text-[var(--ink-muted)]">
                  {progression.todayQuestsCompletedCount}/{progression.todayQuests.length} complete
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {progression.todayQuests.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[11.5px]"
                    style={{
                      backgroundColor: q.done ? 'var(--accent-emerald-soft)' : 'var(--bg-surface)',
                      borderColor: q.done ? 'rgba(44, 204, 116, 0.35)' : 'var(--rule-hairline)',
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: q.done ? 'var(--accent-emerald)' : 'var(--bg-elevated)',
                        color: q.done ? '#ffffff' : 'var(--ink-muted)',
                      }}
                    >
                      {q.done ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </span>
                    <span className="truncate text-[var(--ink-primary)]">{q.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-day Zeigarnik Anchor */}
            <div className="md:col-span-5 p-3 rounded-xl border bg-[var(--bg-inset)] space-y-2">
              <div className="flex items-center justify-between gap-2 text-[11.5px]">
                <span className="font-semibold text-[var(--ink-primary)]">
                  {progression.todayAnchor ? 'Today’s Priority Anchor' : 'Lock Tomorrow’s #1 Priority'}
                </span>
                {progression.todayAnchor && (
                  <button
                    type="button"
                    onClick={promoteTodayAnchorToTask}
                    className="text-[11px] font-medium text-[var(--accent-primary)] hover:underline shrink-0"
                  >
                    Send to Sprint →
                  </button>
                )}
              </div>
              {progression.todayAnchor ? (
                <div className="px-2.5 py-2 rounded-lg border bg-[var(--bg-surface)] text-[12px] text-[var(--ink-primary)] font-medium truncate">
                  {progression.todayAnchor}
                </div>
              ) : (
                <form onSubmit={handleSaveAnchor} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={anchorDraft}
                    onChange={(e) => setAnchorDraft(e.target.value)}
                    placeholder="What starts tomorrow cleanly?"
                    aria-label="Tomorrow priority anchor"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border bg-[var(--bg-surface)] text-[12px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    Lock
                  </button>
                </form>
              )}
            </div>
          </div>
        </SpotlightCard>
      </section>
    );
  }

  // Full Retention & Achievements Hub inside Focus & Habits Studio
  const progRaw = snapshot.progression;
  const reminderEnabled = Boolean(progRaw?.reminderEnabled);
  const reminderHour = typeof progRaw?.reminderHour === 'number' ? progRaw.reminderHour : 9;

  return (
    <section id="achievements-hub" className="space-y-5 pt-2">
      {/* Top XP / Streak / Freeze / Check-in / Tomorrow Anchor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <SpotlightCard
          theme={isDark ? 'dark' : 'light'}
          spotlightColor={isDark ? 'rgba(231, 64, 4, 0.14)' : 'rgba(231, 64, 4, 0.06)'}
          className="lg:col-span-5 studio-card rounded-2xl p-5 flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--accent-primary)]">
                <Award className="w-3.5 h-3.5" />
                <span>Level {progression.level} · {progression.rankTitle}</span>
              </div>
              <h2 className="font-display font-bold text-[22px] tracking-tight text-[var(--ink-primary)] mt-1 tabular-nums">
                <CountUp to={progression.totalXp} duration={0.65} /> XP
              </h2>
              <p className="text-[12px] text-[var(--ink-muted)] mt-0.5">
                {progression.levelXpIntoCurrent} / {progression.levelXpNeeded} XP to Level {progression.level + 1}
              </p>
            </div>

            {!progression.checkedInToday ? (
              <button
                type="button"
                onClick={claimDailyCheckIn}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white shrink-0"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Daily Check-In</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-emerald-soft)] text-[var(--accent-emerald)] text-[11.5px] font-semibold shrink-0">
                <Check className="w-3.5 h-3.5" />
                <span>Checked In</span>
              </span>
            )}
          </div>

          <div className="h-2 rounded-full bg-[var(--bg-inset)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(4, progression.levelProgressPct)}%`,
                backgroundColor: 'var(--accent-primary)',
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[var(--bg-inset)]">
              <div className="inline-flex items-center gap-1 font-mono-num font-bold text-[15px] text-[var(--accent-primary)]">
                <Flame className="w-4 h-4" />
                <span>{progression.currentStreak}d</span>
              </div>
              <div className="text-[10.5px] text-[var(--ink-muted)] mt-0.5">Current Streak</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-inset)]">
              <div className="inline-flex items-center gap-1 font-mono-num font-bold text-[15px] text-[var(--accent-sky)]">
                <Snowflake className="w-4 h-4" />
                <span>{progression.streakFreezesRemaining}</span>
              </div>
              <div className="text-[10.5px] text-[var(--ink-muted)] mt-0.5">Freeze Shields</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-inset)]">
              <div className="inline-flex items-center gap-1 font-mono-num font-bold text-[15px] text-[var(--accent-amber)]">
                <Trophy className="w-4 h-4" />
                <span>{progression.bestStreak}d</span>
              </div>
              <div className="text-[10.5px] text-[var(--ink-muted)] mt-0.5">Best Run</div>
            </div>
          </div>

          {/* Tomorrow Anchor + Reminder Opt-in */}
          <div className="pt-2 border-t space-y-2.5">
            {progression.todayAnchor && (
              <div className="p-2.5 rounded-xl border bg-[var(--accent-amber-soft)]/30 border-[var(--accent-amber)]/35 flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate text-[var(--ink-primary)]">
                  <strong>Today’s Anchor:</strong> {progression.todayAnchor}
                </span>
                <button
                  type="button"
                  onClick={promoteTodayAnchorToTask}
                  className="text-[11px] font-semibold text-[var(--accent-primary)] hover:underline shrink-0"
                >
                  Create P1 Task →
                </button>
              </div>
            )}

            <form onSubmit={handleSaveAnchor} className="space-y-1.5">
              <label className="text-[11.5px] font-medium text-[var(--ink-secondary)] block">
                Lock Tomorrow’s #1 Priority (Return Loop)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={anchorDraft}
                  onChange={(e) => setAnchorDraft(e.target.value)}
                  placeholder="Write 1 priority to tackle tomorrow morning..."
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border bg-[var(--bg-inset)] text-[12.5px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl border bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[12px] font-medium shrink-0"
                >
                  Save Anchor
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px]">
              <div className="inline-flex items-center gap-1.5 text-[var(--ink-secondary)]">
                {reminderEnabled ? (
                  <Bell className="w-3.5 h-3.5 text-[var(--accent-emerald)]" />
                ) : (
                  <BellOff className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                )}
                <span>Daily Check-In Reminder</span>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  aria-label="Daily reminder hour"
                  value={reminderHour}
                  onChange={(e) => void toggleDailyReminder(true, Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border bg-[var(--bg-inset)] text-[11.5px] font-mono-num"
                >
                  {[7, 8, 9, 12, 18, 20].map((hr) => (
                    <option key={hr} value={hr}>
                      {String(hr).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void toggleDailyReminder(!reminderEnabled, reminderHour)}
                  className="px-2.5 py-1 rounded-lg border text-[11.5px] font-medium hover:bg-[var(--bg-hover)]"
                >
                  {reminderEnabled ? 'On' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Right: 12-Week Activity Mosaic + Daily Quests */}
        <SpotlightCard
          theme={isDark ? 'dark' : 'light'}
          spotlightColor={isDark ? 'rgba(20, 164, 252, 0.12)' : 'rgba(20, 164, 252, 0.06)'}
          className="lg:col-span-7 studio-card rounded-2xl p-5 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-[15px]">12-Week Momentum Mosaic</h2>
                <p className="text-[12px] text-[var(--ink-muted)]">
                  Every completed task, habit check, sprint, or block adds a tile. Freeze shields keep chains unbroken.
                </p>
              </div>
              {!pwaInstalled && (
                <button
                  type="button"
                  onClick={() => void triggerPwaInstall()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-[var(--bg-inset)] hover:bg-[var(--bg-hover)] text-[11.5px] font-medium text-[var(--ink-primary)] shrink-0"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>Install App (+75 XP)</span>
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-xl border bg-[var(--bg-inset)] overflow-x-auto">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[460px]">
                {progression.mosaicDays.map((cell) => {
                  const bg = cell.frozen
                    ? 'rgba(20, 164, 252, 0.55)'
                    : cell.count >= 4
                      ? '#E74004'
                      : cell.count >= 2
                        ? 'rgba(231, 64, 4, 0.65)'
                        : cell.count >= 1
                          ? 'rgba(231, 64, 4, 0.34)'
                          : isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(15, 17, 21, 0.07)';
                  return (
                    <div
                      key={cell.date}
                      title={`${cell.date}: ${cell.frozen ? 'Protected by Streak Freeze' : `${cell.count} action(s)`}`}
                      className="w-3.5 h-3.5 rounded-[4px] transition-transform hover:scale-125"
                      style={{
                        backgroundColor: bg,
                        boxShadow: cell.isToday ? '0 0 0 1.5px var(--ink-primary)' : 'none',
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[11px] text-[var(--ink-muted)]">
                <span>
                  {progression.protectedYesterdayByFreeze
                    ? 'Streak Freeze protected yesterday automatically.'
                    : 'Earn extra Freeze Shields at 3-day, 7-day, and Daily Trio milestones.'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span>Less</span>
                  {[0, 1, 2, 4].map((lvl) => (
                    <span
                      key={lvl}
                      className="w-2.5 h-2.5 rounded-[3px]"
                      style={{
                        backgroundColor:
                          lvl === 4
                            ? '#E74004'
                            : lvl === 2
                              ? 'rgba(231, 64, 4, 0.65)'
                              : lvl === 1
                                ? 'rgba(231, 64, 4, 0.34)'
                                : isDark
                                  ? 'rgba(255,255,255,0.06)'
                                  : 'rgba(15,17,21,0.08)',
                      }}
                    />
                  ))}
                  <span>More</span>
                  <span className="ml-2 inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: 'rgba(20, 164, 252, 0.55)' }} />
                    <span>Freeze</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--ink-primary)]">Daily Return Quests</span>
              <span className="font-mono-num text-[var(--ink-muted)]">
                {progression.todayQuestsCompletedCount} / {progression.todayQuests.length} done today
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {progression.todayQuests.map((q) => (
                <div
                  key={q.id}
                  className="p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[12px]"
                  style={{
                    backgroundColor: q.done ? 'var(--accent-emerald-soft)' : 'var(--bg-inset)',
                    borderColor: q.done ? 'rgba(44, 204, 116, 0.35)' : 'var(--rule-hairline)',
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {q.done ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent-emerald)] shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[var(--rule-strong)] shrink-0" />
                    )}
                    <span className="text-[var(--ink-primary)] truncate">{q.label}</span>
                  </div>
                  <span className="font-mono-num text-[11px] text-[var(--ink-muted)] shrink-0">+{q.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Achievements Badge Gallery */}
      <SpotlightCard
        theme={isDark ? 'dark' : 'light'}
        spotlightColor={isDark ? 'rgba(231, 64, 4, 0.1)' : 'rgba(231, 64, 4, 0.05)'}
        className="studio-card rounded-2xl p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-[15px]">Achievements & Milestone Badges</h2>
            <p className="text-[12px] text-[var(--ink-muted)]">
              Synced cleanly across devices. Unlock milestones by building daily rhythm and deep work habits.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full border bg-[var(--bg-inset)] font-mono-num text-[12px] font-semibold text-[var(--ink-primary)]">
            {progression.unlockedCount} / {progression.achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {progression.achievements.map((item) => {
            const Icon = ICON_MAP[item.def.icon];
            const pct = Math.min(100, Math.round((item.current / item.target) * 100));
            return (
              <div
                key={item.def.id}
                className="p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-colors"
                style={{
                  backgroundColor: item.unlocked ? 'var(--bg-elevated)' : 'var(--bg-inset)',
                  borderColor: item.unlocked ? 'rgba(231, 64, 4, 0.42)' : 'var(--rule-hairline)',
                  opacity: item.unlocked ? 1 : 0.82,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: item.unlocked ? 'var(--accent-primary-soft)' : 'var(--bg-surface)',
                      color: item.unlocked ? 'var(--accent-primary)' : 'var(--ink-muted)',
                    }}
                  >
                    {item.unlocked ? <Icon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <span
                    className="font-mono-num text-[11px] px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: item.unlocked ? 'var(--accent-emerald-soft)' : 'var(--bg-surface)',
                      color: item.unlocked ? 'var(--accent-emerald)' : 'var(--ink-muted)',
                    }}
                  >
                    {item.unlocked ? `Unlocked +${item.def.xpReward}` : `+${item.def.xpReward} XP`}
                  </span>
                </div>

                <div>
                  <div className="text-[13px] font-semibold text-[var(--ink-primary)]">{item.def.title}</div>
                  <p className="text-[11.5px] text-[var(--ink-secondary)] mt-0.5 leading-snug">
                    {item.def.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.unlocked ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] font-mono-num text-[var(--ink-muted)]">
                    <span className="capitalize">{item.def.category}</span>
                    <span>
                      {item.current} / {item.target}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SpotlightCard>
    </section>
  );
};
