import React, { useMemo } from 'react';
import { ArrowRight, Calendar, CheckSquare, Flame, Keyboard, Layers, Timer } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

const SHORTCUTS = [
  { keys: 'Ctrl+K', desc: 'Open global command palette' },
  { keys: 'D / W / M / A', desc: 'Switch Day, Week, Month, or Agenda view' },
  { keys: 'T', desc: 'Jump calendar directly back to Today' },
  { keys: '1 - 5', desc: 'Switch Planner, Tasks, Focus, Analytics, Overview' },
  { keys: 'Ctrl+Z', desc: 'Undo last schedule or task change' },
  { keys: 'Left / Right', desc: 'Step previous or next day / week' },
];

export const ProductivityOverview: React.FC = () => {
  const { snapshot, setActiveTab, setCommandOpen, toggleTheme } = useWorkspace();

  const metrics = useMemo(() => {
    const activeTasks = snapshot.tasks.filter((t) => !t.completed).length;
    const scheduledCount = snapshot.events.length;
    const habitCount = snapshot.habits.length;
    const focusSessions = snapshot.focusHistory.length;
    return [
      { value: String(scheduledCount), label: 'Calendar blocks active' },
      { value: String(activeTasks), label: 'Open tasks queued' },
      { value: String(habitCount), label: 'Tracked daily habits' },
      { value: String(focusSessions), label: 'Logged focus sprints' },
    ];
  }, [snapshot.events.length, snapshot.focusHistory.length, snapshot.habits.length, snapshot.tasks]);

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--bg-canvas)]">
      {/* Editorial Hero Section matching R01 Cron + R02 Morgen + R05 Linear scale */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pt-16 pb-20 border-b">
        <div className="max-w-3xl space-y-6">
          <h1
            className="font-display font-extrabold tracking-tight leading-[0.96] text-[var(--ink-primary)]"
            style={{ fontSize: 'clamp(2.75rem, 6vw, 4.75rem)', letterSpacing: '-0.035em' }}
          >
            Calendar, tasks, and focus.{' '}
            <span style={{ color: 'var(--accent-primary)' }}>Unified in one studio.</span>
          </h1>
          <p className="text-[17px] leading-relaxed text-[var(--ink-secondary)] max-w-2xl">
            Cadence joins multi-view time blocking, natural-language task capture, Kanban and Eisenhower
            prioritization, Pomodoro deep work, habit streaks, and daily meeting notes inside one fast keyboard-driven workspace.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <span>Open Live Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-[13.5px] font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
            >
              <span>Launch Command Bar (Ctrl+K)</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-[13px] text-[var(--ink-secondary)] hover:bg-[var(--bg-hover)]"
            >
              <span>Switch to {snapshot.preferences.theme === 'dark' ? 'Daylight Paper' : 'Obsidian Dark'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4-Stat Live Telemetry Strip (inspo-mcp stat/row) */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-14 border-b">
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10">
          {metrics.map((m) => (
            <li key={m.label}>
              <p
                className="font-display font-bold leading-none tracking-tight tabular-nums"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}
              >
                {m.value}
              </p>
              <p className="mt-3 text-[13px] text-[var(--ink-secondary)]">{m.label}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Asymmetric Feature Bento Grid (inspo-mcp features/bento pattern) */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-20 border-b">
        <div className="mb-10">
          <h2 className="font-display font-bold text-[30px] tracking-tight">
            Built so every minute and every commitment shares one source of truth
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="md:col-span-2 rounded-2xl border bg-[var(--bg-surface)] p-7 flex flex-col justify-between min-h-[240px]">
            <div className="flex items-center justify-between">
              <Calendar className="w-5 h-5 text-[var(--accent-primary)]" />
              <span className="font-mono-num text-[11.5px] text-[var(--ink-muted)]">Day · 3-Day · Week · Month · Agenda</span>
            </div>
            <div className="mt-10 space-y-2">
              <h3 className="font-display font-bold text-[22px] tracking-tight">
                Drag tasks straight from your backlog onto any hour slot
              </h3>
              <p className="text-[14px] text-[var(--ink-secondary)] max-w-xl leading-relaxed">
                Time-blocked tasks keep live checkboxes inside the calendar grid, support bottom-edge duration resizing, dual timezone rulers, and one-click availability sharing.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border bg-[var(--bg-surface)] p-7 flex flex-col justify-between">
            <CheckSquare className="w-5 h-5 text-[var(--accent-sky)]" />
            <div className="mt-8 space-y-2">
              <h3 className="font-display font-bold text-[19px]">Smart Lists, Kanban & Matrix</h3>
              <p className="text-[13.5px] text-[var(--ink-secondary)] leading-relaxed">
                Switch effortlessly between a natural-language list, draggable Kanban columns, and an Eisenhower urgency matrix.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border bg-[var(--bg-surface)] p-7 flex flex-col justify-between">
            <Timer className="w-5 h-5 text-[var(--accent-amber)]" />
            <div className="mt-8 space-y-2">
              <h3 className="font-display font-bold text-[19px]">Pomodoro Focus Engine</h3>
              <p className="text-[13.5px] text-[var(--ink-secondary)] leading-relaxed">
                Attach any task to a 25m or 50m sprint, enter distraction-free Focus Curtain mode, and log real focus hours automatically.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border bg-[var(--bg-surface)] p-7 flex flex-col justify-between">
            <Flame className="w-5 h-5 text-[var(--accent-emerald)]" />
            <div className="mt-8 space-y-2">
              <h3 className="font-display font-bold text-[19px]">Habits & Daily Notes</h3>
              <p className="text-[13.5px] text-[var(--ink-secondary)] leading-relaxed">
                Track 7-day habit streaks alongside daily journal notes that extract action items into your to-do inbox in one click.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border bg-[var(--bg-surface)] p-7 flex flex-col justify-between">
            <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
            <div className="mt-8 space-y-2">
              <h3 className="font-display font-bold text-[19px]">.ics Export & Local Ownership</h3>
              <p className="text-[13.5px] text-[var(--ink-secondary)] leading-relaxed">
                Everything persists locally with instant Undo, RFC 5545 .ics calendar export, and full JSON backup/restore.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Keyboard Shortcuts Spec Sheet */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-16">
        <div className="flex items-center gap-2.5 mb-6">
          <Keyboard className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="font-display font-bold text-[22px] tracking-tight">Keyboard Command Reference</h2>
        </div>

        <div className="rounded-2xl border bg-[var(--bg-surface)] divide-y">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--bg-hover)]/35">
              <span className="text-[13.5px] text-[var(--ink-primary)]">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-md border bg-[var(--bg-inset)] font-mono-num text-[12px] text-[var(--accent-amber)] shrink-0">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
