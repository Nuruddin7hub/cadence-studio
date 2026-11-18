import React, { useMemo, useState } from 'react';
import {
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

  const totalSec =
    (focusMode === 'focus'
      ? snapshot.preferences.focusMinutes
      : focusMode === 'short_break'
        ? snapshot.preferences.shortBreakMinutes
        : snapshot.preferences.longBreakMinutes) * 60;
  const pct = Math.max(0, Math.min(1, 1 - focusSecondsLeft / Math.max(1, totalSec)));

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    const accentMap: Record<HabitItem['category'], string> = {
      focus: '#E74004',
      health: '#2CCC74',
      craft: '#14A4FC',
      mindset: '#F4C46C',
    };
    addHabit(habitName, habitCat, accentMap[habitCat]);
    setHabitName('');
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[var(--bg-canvas)]">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Distraction-free mode</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Focus Pomodoro Engine */}
        <section className="lg:col-span-5 rounded-2xl border bg-[var(--bg-surface)] p-5 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[15px]">Pomodoro Session</h2>
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
                  className="px-2.5 py-1 rounded-md text-[11.5px] font-mono-num font-medium"
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

          <div className="flex flex-col items-center py-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="var(--rule-strong)"
                  strokeWidth="6"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - pct)}
                />
              </svg>
              <div className="absolute text-center">
                <div className="font-mono-num text-[34px] font-bold tracking-tight">
                  {formatClock(focusSecondsLeft)}
                </div>
                <div className="text-[11.5px] text-[var(--ink-muted)] mt-0.5">
                  {focusMode === 'focus' ? 'Deep work active' : 'Recovery interval'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <select
              value={activeFocusTaskId ?? ''}
              onChange={(e) => setActiveFocusTaskId(e.target.value || null)}
              aria-label="Linked focus task"
              className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-inset)] text-[12.5px] focus:outline-none focus:border-[var(--accent-primary)]"
            >
              <option value="">Free focus session</option>
              {snapshot.tasks
                .filter((t) => !t.completed)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.estimatedMinutes}m)
                  </option>
                ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFocusRunning(!focusRunning)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
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
                className="px-3 py-2.5 rounded-xl border hover:bg-[var(--bg-hover)] text-[12px] font-medium"
              >
                Log now
              </button>
            </div>
          </div>
        </section>

        {/* Habit Streak Matrix */}
        <section className="lg:col-span-7 rounded-2xl border bg-[var(--bg-surface)] p-5 space-y-4">
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
                className="p-1.5 rounded-lg bg-[var(--accent-primary)] text-white"
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
                      <th key={dKey} className="py-2 px-1.5 text-center font-medium">
                        <div>{WEEKDAY_TWO[d.getDay()]}</div>
                        <div className={dKey === todayKey ? 'text-[var(--accent-primary)] font-bold' : ''}>
                          {d.getDate()}
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-2 pl-3 text-right font-medium">Streak</th>
                  <th className="py-2 w-8" />
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
                    <tr key={h.id} className="hover:bg-[var(--bg-hover)]/35">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: h.accent }} />
                          <span className="text-[13px] font-medium">{h.name}</span>
                        </div>
                      </td>
                      {last7Days.map((dKey) => {
                        const checked = Boolean(h.history[dKey]);
                        return (
                          <td key={dKey} className="py-2 px-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleHabitDate(h.id, dKey)}
                              aria-label={`${h.name} on ${dKey}`}
                              className="w-7 h-7 mx-auto rounded-lg border flex items-center justify-center transition-all"
                              style={{
                                backgroundColor: checked ? h.accent : 'var(--bg-inset)',
                                borderColor: checked ? h.accent : 'var(--rule-hairline)',
                              }}
                            >
                              {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                            </button>
                          </td>
                        );
                      })}
                      <td className="py-3 pl-3 text-right font-mono-num text-[12.5px]">
                        <span className="inline-flex items-center gap-1 text-[var(--accent-amber)]">
                          <Flame className="w-3.5 h-3.5" />
                          {streak}d
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteHabit(h.id)}
                          className="p-1 text-[var(--ink-muted)] hover:text-[var(--accent-coral)]"
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
        </section>
      </div>

      {/* Rich Daily Journal & Session Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 rounded-2xl border bg-[var(--bg-surface)] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-[15px]">
                Daily Journal: {formatReadableDate(selectedDate)}
              </h2>
              <p className="text-[12px] text-[var(--ink-muted)]">
                Write notes or action items, then send any line straight to your task queue.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[12px]">
              <label className="flex items-center gap-1.5">
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
          </div>

          <textarea
            rows={5}
            value={note.content}
            onChange={(e) => updateDailyNote(selectedDate, { content: e.target.value })}
            placeholder="Capture meeting notes, decisions, or open loops..."
            className="w-full px-3.5 py-2.5 rounded-xl border bg-[var(--bg-inset)] text-[13px] leading-relaxed focus:outline-none focus:border-[var(--accent-primary)]"
          />

          <div className="flex flex-wrap gap-2">
            {note.content
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .slice(0, 4)
              .map((line, i) => {
                const done = note.extractedLines.includes(line);
                return (
                  <button
                    key={`${i}-${line.slice(0, 8)}`}
                    type="button"
                    disabled={done}
                    onClick={() => extractLineToTask(selectedDate, line)}
                    className="px-2.5 py-1 rounded-lg border text-[11.5px] bg-[var(--bg-elevated)] hover:border-[var(--accent-amber)] disabled:opacity-45 truncate max-w-xs"
                  >
                    {done ? 'Captured: ' : '+ To-Do: '}
                    {line}
                  </button>
                );
              })}
          </div>
        </section>

        <section className="lg:col-span-5 rounded-2xl border bg-[var(--bg-surface)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[15px]">Recent Focus Log</h2>
            <span className="font-mono-num text-[11.5px] text-[var(--ink-muted)]">
              {snapshot.focusHistory.length} sessions
            </span>
          </div>
          <ul className="divide-y">
            {snapshot.focusHistory.slice(0, 5).map((s) => (
              <li key={s.id} className="py-2.5 flex items-center justify-between gap-3 text-[12.5px]">
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.taskTitle}</p>
                  <p className="text-[11px] font-mono-num text-[var(--ink-muted)]">{s.date}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[11.5px] shrink-0">
                  {s.durationMinutes}m
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
