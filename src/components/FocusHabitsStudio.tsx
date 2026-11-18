import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Flame,
  Maximize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { HabitItem } from '../types/workspace';
import { addDays, formatReadableDate, WEEKDAY_TWO } from '../utils/date';
import {
  AnimatedContent,
  BellToggle,
  Counter,
  ElasticSlider,
  ElectricBorder,
  GlareHover,
  RubberSegment,
  ShinyText,
  SpotlightCard,
} from '../lib/reactbits';

export const FocusHabitsStudio: React.FC = () => {
  const {
    snapshot,
    todayKey,
    selectedDate,
    focusMode,
    setFocusMode,
    focusSecondsLeft,
    focusRunning,
    setFocusRunning,
    resetFocusTimer,
    completeFocusNow,
    activeFocusTaskId,
    setActiveFocusTaskId,
    setFocusCurtainOpen,
    updatePreferences,
    toggleHabitDate,
    addHabit,
    deleteHabit,
    updateDailyNote,
    extractLineToTask,
  } = useWorkspace();

  const [habitName, setHabitName] = useState('');
  const [habitCat, setHabitCat] = useState<HabitItem['category']>('focus');
  const [noteDraft, setNoteDraft] = useState('');
  const isDark = snapshot.preferences.theme === 'dark';

  const last7Days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(todayKey, i - 6)),
    [todayKey]
  );

  const note = snapshot.notes[selectedDate] ?? {
    date: selectedDate,
    content: '',
    mood: 4,
    energy: 4,
    extractedLines: [],
  };

  const noteLines = useMemo(
    () => note.content.split('\n').map((l) => l.trim()).filter(Boolean),
    [note.content]
  );

  const totalSec =
    (focusMode === 'focus'
      ? snapshot.preferences.focusMinutes
      : focusMode === 'short_break'
        ? snapshot.preferences.shortBreakMinutes
        : snapshot.preferences.longBreakMinutes) * 60;
  const pct = Math.max(0, Math.min(1, 1 - focusSecondsLeft / Math.max(1, totalSec)));
  const focusMins = Math.floor(focusSecondsLeft / 60);
  const focusSecs = focusSecondsLeft % 60;

  const todayFocusMins = useMemo(
    () =>
      snapshot.focusHistory
        .filter((s) => s.completedAt.startsWith(todayKey))
        .reduce((acc, s) => acc + s.durationMinutes, 0),
    [snapshot.focusHistory, todayKey]
  );

  const totalFocusMins = useMemo(
    () => snapshot.focusHistory.reduce((acc, s) => acc + s.durationMinutes, 0),
    [snapshot.focusHistory]
  );

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    const accentMap: Record<HabitItem['category'], string> = {
      focus: '#E74004',
      health: '#149E56',
      craft: '#C95A02',
      mindset: '#B87B06',
    };
    addHabit(habitName, habitCat, accentMap[habitCat]);
    setHabitName('');
  };

  const handleAddJournalLine = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = noteDraft.trim();
    if (!clean) return;
    const nextContent = note.content ? `${note.content}\n${clean}` : clean;
    updateDailyNote(selectedDate, { content: nextContent });
    setNoteDraft('');
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[var(--bg-canvas)] studio-spotlight-dark">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-[22px] tracking-tight text-[var(--ink-primary)]">
              Deep Focus, Habits & Daily Journal
            </h1>
            <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
              Protect uninterrupted deep work, maintain daily streaks, and convert reflections into tasks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <BellToggle
              size="sm"
              radius={10}
              offLabel="Chime Muted"
              onLabel="Chime On"
              clapper
              waves
              pressed={snapshot.preferences.soundEnabled}
              onChange={(on: boolean) => updatePreferences({ soundEnabled: on })}
              color={isDark ? '#c5ccd8' : '#374151'}
              background={isDark ? '#161922' : '#ffffff'}
              onColor="#ffffff"
              onBackground="#E74004"
              className="border"
            />
            <GlareHover glareColor="#ffffff" glareOpacity={0.2} borderRadius="8px" className="inline-flex">
              <button
                type="button"
                onClick={() => setFocusCurtainOpen(true)}
                className="studio-card inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[12px] font-semibold text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Distraction-free mode</span>
              </button>
            </GlareHover>
          </div>
        </div>

        <AnimatedContent
          trigger="load"
          distance={14}
          duration={0.36}
          stagger={0.05}
          ease="back.out(1.2)"
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
        >
          {/* Balanced Pomodoro Focus Engine with ElectricBorder (ignites when timer runs), Rolling Counter, GlareHover & ElasticSlider */}
          <ElectricBorder
            className="lg:col-span-5 h-full"
            active={focusRunning}
            color="#E74004"
            speed={1.65}
            chaos={0.28}
            strands={3}
            intensity={1.0}
            glow={0.55}
            thickness={1.4}
            borderRadius={16}
            theme={isDark ? 'dark' : 'light'}
          >
            <section className="studio-card rounded-2xl p-5 w-full h-full flex flex-col justify-between space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-[15px]">Pomodoro Session</h2>
                  <p className="text-[12px] text-[var(--ink-muted)] font-mono-num">
                    {focusRunning ? (
                      <ShinyText text="Deep focus timer active" color="var(--accent-primary)" shineColor="#FFFFFF" speed={2.5} />
                    ) : (
                      `25 / 5 / 15m cadences · ${totalFocusMins}m all-time`
                    )}
                  </p>
                </div>
                <RubberSegment
                  items={[
                    { value: 'focus', label: '25m' },
                    { value: 'short_break', label: '5m' },
                    { value: 'long_break', label: '15m' },
                  ]}
                  value={focusMode}
                  onChange={(val: string) => setFocusMode(val as 'focus' | 'short_break' | 'long_break')}
                  size="sm"
                  radius={9}
                  stretch={34}
                  squash={22}
                  trackColor={isDark ? '#151821' : '#eaedf3'}
                  thumbColor={isDark ? '#242938' : '#ffffff'}
                  textColor={isDark ? '#b4bccb' : '#4b5563'}
                  activeTextColor={isDark ? '#ffffff' : '#0f1115'}
                  ariaLabel="Pomodoro duration preset"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 py-1">
                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="66" fill="none" stroke="var(--rule-strong)" strokeWidth="6.5" />
                    <circle
                      cx="80"
                      cy="80"
                      r="66"
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth="6.5"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 66}
                      strokeDashoffset={2 * Math.PI * 66 * (1 - pct)}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="inline-flex items-center justify-center font-mono-num text-[26px] font-bold tracking-tight text-[var(--ink-primary)]">
                      <Counter value={focusMins} minDigits={2} fontSize={26} fontWeight={700} textColor="var(--ink-primary)" intro={false} fade={0} motionBlur={false} duration={0.28} />
                      <span className="pb-0.5 text-[var(--accent-primary)]">:</span>
                      <Counter value={focusSecs} minDigits={2} fontSize={26} fontWeight={700} textColor="var(--ink-primary)" intro={false} fade={0} motionBlur={false} duration={0.28} />
                    </div>
                    <div className="text-[10.5px] text-[var(--ink-muted)]">
                      {focusMode === 'focus' ? 'Deep work' : 'Recovery'}
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full min-w-0 space-y-2.5">
                  <div className="px-3 py-2 rounded-xl bg-[var(--bg-inset)] space-y-0.5">
                    <span className="text-[11px] text-[var(--ink-muted)]">Active target</span>
                    <select
                      value={activeFocusTaskId ?? ''}
                      onChange={(e) => setActiveFocusTaskId(e.target.value || null)}
                      aria-label="Linked focus task"
                      className="w-full bg-transparent text-[12.5px] font-medium text-[var(--ink-primary)] focus:outline-none cursor-pointer"
                    >
                      <option value="">Free focus session</option>
                      {snapshot.tasks
                        .filter((t) => !t.completed)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[var(--bg-inset)]">
                      <div className="font-mono-num font-bold text-[15px]">{todayFocusMins}m</div>
                      <div className="text-[10.5px] text-[var(--ink-muted)]">Today logged</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--bg-inset)]">
                      <div className="font-mono-num font-bold text-[15px]">{snapshot.focusHistory.length}</div>
                      <div className="text-[10.5px] text-[var(--ink-muted)]">Sprints done</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <GlareHover glareColor="#ffffff" glareOpacity={0.2} borderRadius="12px" className="inline-flex">
                      <button
                        type="button"
                        onClick={() => setFocusRunning(!focusRunning)}
                        aria-label={focusRunning ? 'Pause timer' : 'Start session'}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-colors"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      >
                        {focusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{focusRunning ? 'Pause timer' : 'Start session'}</span>
                      </button>
                    </GlareHover>
                    <button
                      type="button"
                      onClick={() => resetFocusTimer()}
                      className="p-2 rounded-xl border hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
                      aria-label="Reset timer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={completeFocusNow}
                    className="px-3.5 py-2 rounded-xl border hover:bg-[var(--bg-hover)] text-[12px] font-medium"
                  >
                    Log sprint
                  </button>
                </div>

                {/* Tactile React Bits ElasticSlider for customizable sprint duration */}
                <div className="pt-2 border-t flex items-center justify-between gap-3">
                  <span className="text-[11.5px] text-[var(--ink-muted)] shrink-0">
                    Sprint length
                  </span>
                  <ElasticSlider
                    value={snapshot.preferences.focusMinutes}
                    startingValue={15}
                    maxValue={60}
                    isStepped
                    stepSize={5}
                    onChange={(v: number) => updatePreferences({ focusMinutes: v })}
                    leftIcon={<span className="font-mono-num text-[10.5px] opacity-65">15m</span>}
                    rightIcon={<span className="font-mono-num text-[10.5px] opacity-65">60m</span>}
                    rangeColor="var(--accent-primary)"
                    thumbColor="#FFFFFF"
                    valuePosition="none"
                    thickness={5}
                    activeThickness={8}
                    ariaLabel="Focus session duration minutes"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </section>
          </ElectricBorder>

          {/* Habit Streak Matrix with SpotlightCard */}
          <SpotlightCard
            theme={isDark ? 'dark' : 'light'}
            spotlightColor={isDark ? 'rgba(231, 64, 4, 0.12)' : 'rgba(231, 64, 4, 0.06)'}
            intensity={isDark ? 0.11 : 0.06}
            className="lg:col-span-7 studio-card rounded-2xl p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-[15px]">Daily Habit Streaks</h2>
                  <p className="text-[12px] text-[var(--ink-muted)]">7-day consistency grid</p>
                </div>
                <form onSubmit={handleAddHabit} className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full sm:w-auto">
                  <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    placeholder="New habit..."
                    className="flex-1 min-w-[120px] px-2.5 py-1.5 rounded-lg border bg-[var(--bg-inset)] text-[12px] sm:w-44 focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <select
                    value={habitCat}
                    onChange={(e) => setHabitCat(e.target.value as HabitItem['category'])}
                    className="px-2 py-1.5 rounded-lg border bg-[var(--bg-inset)] text-[12px]"
                  >
                    <option value="focus">Focus</option>
                    <option value="health">Health</option>
                    <option value="craft">Craft</option>
                    <option value="mindset">Mindset</option>
                  </select>
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                    aria-label="Add habit"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-[11px] font-mono-num text-[var(--ink-muted)]">
                      <th className="py-2 pr-3 font-medium">Habit</th>
                      {last7Days.map((dKey) => {
                        const d = new Date(`${dKey}T00:00:00`);
                        const isToday = dKey === todayKey;
                        return (
                          <th key={dKey} className="py-2 px-1 text-center font-medium">
                            <div style={{ color: isToday ? 'var(--accent-primary)' : 'var(--ink-secondary)' }}>
                              {WEEKDAY_TWO[d.getDay()]}
                            </div>
                            <div
                              className="mt-0.5 mx-auto w-5 h-5 rounded flex items-center justify-center"
                              style={{
                                backgroundColor: isToday ? 'var(--accent-primary)' : 'transparent',
                                color: isToday ? '#FFFFFF' : 'var(--ink-primary)',
                                fontWeight: isToday ? 700 : 500,
                              }}
                            >
                              {d.getDate()}
                            </div>
                          </th>
                        );
                      })}
                      <th className="py-2 pl-3 text-right font-medium">Streak</th>
                      <th className="py-2 w-7" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {snapshot.habits.map((h) => {
                      let streak = 0;
                      for (let i = 0; i < 21; i++) {
                        if (h.history[addDays(todayKey, -i)]) streak++;
                        else if (i > 0) break;
                      }
                      const pillColor =
                        h.category === 'health'
                          ? '#149E56'
                          : h.category === 'craft'
                            ? '#0B8CE0'
                            : h.category === 'mindset'
                              ? '#C97A04'
                              : 'var(--accent-primary)';

                      return (
                        <tr key={h.id} className="group hover:bg-[var(--bg-hover)]/35">
                          <td className="py-3 pr-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pillColor }} />
                              <span className="text-[13px] font-medium text-[var(--ink-primary)]">{h.name}</span>
                            </div>
                          </td>
                          {last7Days.map((dKey) => {
                            const checked = Boolean(h.history[dKey]);
                            return (
                              <td key={dKey} className="py-2 px-0.5 sm:px-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleHabitDate(h.id, dKey)}
                                  aria-label={`${h.name} on ${dKey}`}
                                  className="w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-150"
                                  style={{
                                    backgroundColor: checked
                                      ? `color-mix(in srgb, ${pillColor} 16%, transparent)`
                                      : 'var(--bg-inset)',
                                    boxShadow: checked
                                      ? `inset 0 0 0 1px color-mix(in srgb, ${pillColor} 45%, transparent)`
                                      : 'inset 0 0 0 1px var(--rule-hairline)',
                                  }}
                                >
                                  {checked && <Check className="w-3.5 h-3.5 stroke-[2.6]" style={{ color: pillColor }} />}
                                </button>
                              </td>
                            );
                          })}
                          <td className="py-3 pl-3 text-right font-mono-num text-[12.5px]">
                            <span className="inline-flex items-center gap-1 text-[var(--ink-secondary)]">
                              <Flame className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                              <span>{streak}d</span>
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => deleteHabit(h.id)}
                              className="p-1 opacity-30 group-hover:opacity-100 text-[var(--ink-muted)] hover:text-[var(--accent-coral)] transition-opacity"
                              aria-label={`Delete ${h.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </SpotlightCard>
        </AnimatedContent>

        {/* Clean Hairline-Divided Daily Journal & Rebalanced Recent Focus Log with SpotlightCard */}
        <AnimatedContent
          trigger="load"
          distance={14}
          duration={0.38}
          delay={0.08}
          stagger={0.06}
          ease="back.out(1.2)"
          className="grid grid-cols-1 lg:grid-cols-12 gap-5"
        >
          <SpotlightCard
            theme={isDark ? 'dark' : 'light'}
            spotlightColor={isDark ? 'rgba(231, 64, 4, 0.11)' : 'rgba(231, 64, 4, 0.06)'}
            intensity={isDark ? 0.1 : 0.05}
            className="lg:col-span-7 studio-card rounded-2xl p-5 space-y-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-[15px]">
                  Daily Journal: {formatReadableDate(selectedDate)}
                </h2>
                <p className="text-[12px] text-[var(--ink-muted)]">
                  Capture notes below and turn any line into an actionable task.
                </p>
              </div>
              <label className="flex items-center gap-1.5 text-[12px]">
                <span className="text-[var(--ink-muted)]">Energy</span>
                <select
                  value={note.energy}
                  onChange={(e) => updateDailyNote(selectedDate, { energy: Number(e.target.value) })}
                  className="px-2 py-1 rounded border bg-[var(--bg-inset)] font-mono-num"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}/5
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <form onSubmit={handleAddJournalLine} className="flex items-center gap-2">
              <input
                type="text"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Write a reflection, decision, or action item and press Enter..."
                className="flex-1 px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl border bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[12px] font-medium"
              >
                Add note
              </button>
            </form>

            <div className="divide-y">
              {noteLines.map((line, i) => {
                const done = note.extractedLines.includes(line);
                return (
                  <div
                    key={`${i}-${line.slice(0, 8)}`}
                    className="group flex items-center justify-between gap-3 py-2.5 text-[12.5px]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: done ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}
                      />
                      <span className="text-[var(--ink-primary)] leading-snug">{line}</span>
                    </div>
                    <button
                      type="button"
                      disabled={done}
                      onClick={() => extractLineToTask(selectedDate, line)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-medium shrink-0 opacity-75 group-hover:opacity-100 transition-opacity hover:bg-[var(--bg-inset)] disabled:opacity-45"
                      style={{ color: done ? 'var(--accent-emerald)' : 'var(--accent-primary)' }}
                    >
                      <span>{done ? 'In To-Do' : 'Send to To-Do'}</span>
                      {!done && <ArrowUpRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </SpotlightCard>

          <SpotlightCard
            theme={isDark ? 'dark' : 'light'}
            spotlightColor={isDark ? 'rgba(231, 64, 4, 0.11)' : 'rgba(231, 64, 4, 0.06)'}
            intensity={isDark ? 0.1 : 0.05}
            className="lg:col-span-5 studio-card rounded-2xl p-5 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-[15px]">Recent Focus Log</h2>
                  <p className="text-[11.5px] text-[var(--ink-muted)] font-mono-num">
                    Goal progress: {todayFocusMins} / 120 min today
                  </p>
                </div>
                <span className="font-mono-num text-[11.5px] text-[var(--ink-secondary)]">
                  {totalFocusMins}m total
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((todayFocusMins / 120) * 100))}%`,
                    backgroundColor: 'var(--accent-primary)',
                  }}
                />
              </div>

              <ul className="divide-y pt-1">
                {snapshot.focusHistory.slice(0, 5).map((s) => (
                  <li key={s.id} className="py-2.5 flex items-center justify-between gap-3 text-[12.5px]">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--ink-primary)] leading-snug">{s.taskTitle}</p>
                      <p className="text-[11px] font-mono-num text-[var(--ink-muted)] mt-0.5">{s.date}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono-num text-[11.5px] shrink-0 bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                      {s.durationMinutes}m
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </SpotlightCard>
        </AnimatedContent>
      </div>
    </div>
  );
};
