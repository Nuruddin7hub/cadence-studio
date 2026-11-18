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
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { HabitItem } from '../types/workspace';
import { addDays, formatReadableDate, WEEKDAY_TWO } from '../utils/date';

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

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
      craft: '#0B8CE0',
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

  const isLight = snapshot.preferences.theme === 'light';

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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updatePreferences({ soundEnabled: !snapshot.preferences.soundEnabled })}
              className="studio-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[var(--bg-hover)]"
            >
              {snapshot.preferences.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[var(--accent-emerald)]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              )}
              <span>{snapshot.preferences.soundEnabled ? 'Chime On' : 'Chime Muted'}</span>
            </button>
            <button
              type="button"
              onClick={() => setFocusCurtainOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
              style={{
                backgroundColor: isLight ? '#0B8CE0' : 'var(--ink-primary)',
                color: isLight ? '#FFFFFF' : 'var(--bg-canvas)',
              }}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Distraction-free mode</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Balanced Pomodoro Focus Engine */}
          <section className="lg:col-span-5 studio-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-[15px]">Pomodoro Session</h2>
                <p className="text-[12px] text-[var(--ink-muted)] font-mono-num">
                  {todayFocusMins}m today · {totalFocusMins}m all-time
                </p>
              </div>
              <div className="flex items-center gap-1 p-0.5 rounded-lg border bg-[var(--bg-inset)]">
                {([
                  ['focus', '25m'],
                  ['short_break', '5m'],
                  ['long_break', '15m'],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFocusMode(mode)}
                    className="px-2.5 py-1 rounded-md text-[11.5px] font-mono-num font-medium transition-colors"
                    style={{
                      backgroundColor: focusMode === mode ? 'var(--bg-elevated)' : 'transparent',
                      color: focusMode === mode ? 'var(--ink-primary)' : 'var(--ink-muted)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-1">
              <div className="sm:col-span-5 flex justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="66" fill="none" stroke="var(--rule-strong)" strokeWidth="6" />
                    <circle
                      cx="80"
                      cy="80"
                      r="66"
                      fill="none"
                      stroke={isLight ? '#0B8CE0' : 'var(--accent-primary)'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 66}
                      strokeDashoffset={2 * Math.PI * 66 * (1 - pct)}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="font-mono-num text-[28px] font-bold tracking-tight">
                      {formatClock(focusSecondsLeft)}
                    </div>
                    <div className="text-[11px] text-[var(--ink-muted)]">
                      {focusMode === 'focus' ? 'Deep work' : 'Recovery'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-7 space-y-2.5">
                <div className="p-3 rounded-xl border bg-[var(--bg-inset)] space-y-1">
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
                  <div className="p-2.5 rounded-xl border bg-[var(--bg-inset)]">
                    <div className="font-mono-num font-bold text-[15px]">{todayFocusMins}m</div>
                    <div className="text-[10.5px] text-[var(--ink-muted)]">Today logged</div>
                  </div>
                  <div className="p-2.5 rounded-xl border bg-[var(--bg-inset)]">
                    <div className="font-mono-num font-bold text-[15px]">{snapshot.focusHistory.length}</div>
                    <div className="text-[10.5px] text-[var(--ink-muted)]">Sprints done</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFocusRunning(!focusRunning)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors"
                style={{ backgroundColor: isLight ? '#0B8CE0' : 'var(--accent-primary)' }}
              >
                {focusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{focusRunning ? 'Pause timer' : 'Start session'}</span>
              </button>
              <button
                type="button"
                onClick={() => resetFocusTimer()}
                className="p-2.5 rounded-xl border hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={completeFocusNow}
                className="px-3.5 py-2.5 rounded-xl border hover:bg-[var(--bg-hover)] text-[12px] font-medium"
              >
                Log sprint
              </button>
            </div>
          </section>

          {/* Habit Streak Matrix */}
          <section className="lg:col-span-7 studio-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-[15px]">Daily Habit Streaks</h2>
                  <p className="text-[12px] text-[var(--ink-muted)]">7-day consistency grid</p>
                </div>
                <form onSubmit={handleAddHabit} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    placeholder="New habit..."
                    className="px-2.5 py-1.5 rounded-lg border bg-[var(--bg-inset)] text-[12px] w-36 sm:w-44 focus:outline-none focus:border-[var(--accent-primary)]"
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
                    style={{ backgroundColor: isLight ? '#0B8CE0' : 'var(--accent-primary)' }}
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
                        return (
                          <th key={dKey} className="py-2 px-1 text-center font-medium">
                            <div>{WEEKDAY_TWO[d.getDay()]}</div>
                            <div className={dKey === todayKey ? 'text-[var(--accent-primary)] font-bold' : ''}>
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

                      return (
                        <tr key={h.id} className="group hover:bg-[var(--bg-hover)]/35">
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: h.accent }} />
                              <span className="text-[13px] font-medium text-[var(--ink-primary)]">{h.name}</span>
                            </div>
                          </td>
                          {last7Days.map((dKey) => {
                            const checked = Boolean(h.history[dKey]);
                            return (
                              <td key={dKey} className="py-2 px-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleHabitDate(h.id, dKey)}
                                  aria-label={`${h.name} on ${dKey}`}
                                  className="w-7 h-7 mx-auto rounded-lg border flex items-center justify-center transition-colors"
                                  style={{
                                    backgroundColor: checked ? `color-mix(in srgb, ${h.accent} 18%, transparent)` : 'var(--bg-inset)',
                                    borderColor: checked ? h.accent : 'var(--rule-strong)',
                                  }}
                                >
                                  {checked && <Check className="w-3.5 h-3.5 stroke-[2.8]" style={{ color: h.accent }} />}
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
                              className="p-1 opacity-35 group-hover:opacity-100 text-[var(--ink-muted)] hover:text-[var(--accent-coral)] transition-opacity"
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
          </section>
        </div>

        {/* Unified Interactive Daily Journal (Zero verbatim duplication!) & Focus Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <section className="lg:col-span-7 studio-card rounded-2xl p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-[15px]">
                  Daily Journal: {formatReadableDate(selectedDate)}
                </h2>
                <p className="text-[12px] text-[var(--ink-muted)]">
                  Capture notes below and send any line straight to your To-Do queue in one click.
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

            <div className="rounded-xl border divide-y bg-[var(--bg-inset)]/50">
              {noteLines.map((line, i) => {
                const done = note.extractedLines.includes(line);
                return (
                  <div
                    key={`${i}-${line.slice(0, 8)}`}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[12.5px] hover:bg-[var(--bg-hover)]/45 transition-colors"
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
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-medium shrink-0 transition-colors hover:bg-[var(--bg-surface)] disabled:opacity-50"
                      style={{ color: done ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}
                    >
                      <span>{done ? 'In To-Do' : 'Send to To-Do'}</span>
                      {!done && <ArrowUpRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-5 studio-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-[15px]">Recent Focus Log</h2>
                <span className="font-mono-num text-[11.5px] text-[var(--ink-muted)]">
                  {totalFocusMins}m across {snapshot.focusHistory.length} sprints
                </span>
              </div>
              <ul className="divide-y">
                {snapshot.focusHistory.slice(0, 5).map((s) => (
                  <li key={s.id} className="py-3 flex items-center justify-between gap-3 text-[12.5px]">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--ink-primary)] leading-snug">{s.taskTitle}</p>
                      <p className="text-[11px] font-mono-num text-[var(--ink-muted)] mt-0.5">{s.date}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded font-mono-num text-[11.5px] shrink-0"
                      style={{
                        backgroundColor: isLight ? 'var(--accent-sky-soft)' : 'var(--accent-primary-soft)',
                        color: isLight ? 'var(--accent-sky)' : 'var(--accent-primary)',
                      }}
                    >
                      {s.durationMinutes}m
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t flex items-center justify-between text-[12px] text-[var(--ink-secondary)]">
              <span>Daily focus goal</span>
              <span className="font-mono-num font-semibold text-[var(--ink-primary)]">
                {todayFocusMins} / 120 min
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
