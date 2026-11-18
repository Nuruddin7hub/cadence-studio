import React, { useMemo } from 'react';
import { ArrowRight, Calendar, Check, CheckSquare, Flame, Keyboard, Layers, Timer } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

const SHORTCUTS = [
  { keys: 'Ctrl+K', desc: 'Open global command palette' },
  { keys: 'D / W / M / A', desc: 'Switch Day, Week, Month, or Agenda view' },
  { keys: 'T', desc: 'Jump calendar directly back to Today' },
  { keys: '1 - 5', desc: 'Switch Planner, Tasks, Focus, Analytics, Overview' },
  { keys: 'Ctrl+Z', desc: 'Undo last schedule or task change' },
  { keys: 'Left / Right', desc: 'Step previous or next day or week' },
];

const SHOWCASE_TASKS = [
  { title: 'Timeline drag & 15m snap', done: false },
  { title: 'NLP quick task parser', done: true },
  { title: 'Weekly time analytics', done: false },
  { title: 'Cmd+K command flows', done: false },
  { title: 'Board metrics snapshot', done: false },
];

export const ProductivityOverview: React.FC = () => {
  const { snapshot, setActiveTab, setCommandOpen } = useWorkspace();

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

  const isDark = snapshot.preferences.theme === 'dark';

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--bg-canvas)] studio-spotlight-dark">
      {/* Centered Cron + Linear Inspired Hero Framed Cleanly Within Viewport (Zero Eyebrow Pill) */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pt-10 pb-8 min-h-[calc(100vh-56px)] flex flex-col items-center justify-between text-center">
        <div className="flex flex-col items-center pt-1">
          <h1
            className="font-display font-extrabold tracking-tight leading-[1.0] max-w-4xl"
            style={{
              fontSize: 'clamp(2.45rem, 4.35vw, 3.85rem)',
              letterSpacing: '-0.035em',
              background: isDark
                ? 'linear-gradient(180deg, #FFFFFF 45%, #A6AEBC 100%)'
                : 'linear-gradient(180deg, #0F1115 45%, #48505E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Calendar, tasks, and focus.
            <br />
            Finally in one studio.
          </h1>

          <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-secondary)] max-w-2xl">
            Time-blocking calendar, natural-language task lists, Kanban, Pomodoro sprints, and habits in one workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <span>Open Live Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13.5px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface)]/70 transition-colors"
            >
              <span>Command Bar (⌘K)</span>
            </button>
          </div>
        </div>

        {/* Richly Illuminated Framed Studio Showcase with Authentic Time-Axis & Bottom Vignette */}
        <div
          onClick={() => setActiveTab('planner')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setActiveTab('planner');
          }}
          className="relative mt-7 w-full max-w-5xl rounded-2xl border bg-[var(--bg-surface)] overflow-hidden text-left cursor-pointer"
          style={{
            borderColor: 'var(--rule-strong)',
            boxShadow: isDark
              ? '0 32px 80px rgba(0, 0, 0, 0.75), 0 0 90px -18px rgba(231, 64, 4, 0.28), inset 0 1px 0 rgba(255,255,255,0.12)'
              : 'var(--shadow-panel)',
          }}
        >
          {/* Window Chrome */}
          <div className="px-4 py-2.5 border-b flex items-center justify-between bg-[var(--bg-elevated)]/75">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-strong)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-strong)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-strong)]" />
              <span className="ml-2 text-[12px] font-medium text-[var(--ink-secondary)]">
                November 2026 · Week 47 · Wednesday 18
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono-num text-[var(--ink-muted)]">
              <span className="text-[var(--ink-secondary)]">25:00 Deep Focus</span>
              <span className="text-[var(--ink-primary)] font-medium">Live workspace →</span>
            </div>
          </div>

          {/* 3-Zone Product Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x h-[335px] relative">
            {/* Left Task Queue (Clean untruncated copy) */}
            <div className="md:col-span-3 p-3.5 space-y-2.5 bg-[var(--bg-surface)]">
              <div className="flex items-center justify-between text-[11.5px] font-semibold text-[var(--ink-secondary)]">
                <span>Today Queue</span>
                <span className="font-mono-num text-[var(--accent-primary)]">4</span>
              </div>
              <div className="space-y-1.5">
                {SHOWCASE_TASKS.map((t) => (
                  <div key={t.title} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[var(--bg-elevated)]/65 text-[11.5px]">
                    <span
                      className="w-3 h-3 rounded border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: t.done ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                        backgroundColor: t.done ? 'var(--accent-emerald)' : 'transparent',
                      }}
                    >
                      {t.done && <Check className="w-2 h-2 text-white stroke-[3]" />}
                    </span>
                    <span className={`truncate ${t.done ? 'opacity-50' : 'text-[var(--ink-primary)]'}`}>
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Time-Blocked Timeline with Authentic Hour Gridlines & Vertical Day Rules */}
            <div className="md:col-span-6 p-3.5 bg-[var(--bg-canvas)]/85 relative flex flex-col">
              <div className="grid grid-cols-3 gap-2.5 pb-2 border-b text-[11px] font-semibold">
                <div className="text-[var(--ink-secondary)] pl-8">Tue 17</div>
                <div className="text-[var(--accent-primary)]">Wed 18 · Today</div>
                <div className="text-[var(--ink-secondary)]">Thu 19</div>
              </div>

              <div className="relative flex-1 mt-1 pl-8">
                {/* Faint hour lines */}
                {[
                  { label: '9 AM', top: '4%' },
                  { label: '11 AM', top: '28%' },
                  { label: '1 PM', top: '52%' },
                  { label: '3 PM', top: '76%' },
                ].map((line) => (
                  <div
                    key={line.label}
                    className="absolute left-0 right-0 flex items-center pointer-events-none"
                    style={{ top: line.top }}
                  >
                    <span className="w-8 text-[9px] font-mono-num text-[var(--ink-secondary)] opacity-75">
                      {line.label}
                    </span>
                    <div className="flex-1 border-t border-[var(--rule-hairline)]" />
                  </div>
                ))}

                {/* Current time indicator */}
                <div className="absolute left-8 right-0 top-[34%] flex items-center z-20 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] -ml-0.5" />
                  <div className="flex-1 h-[1.5px] bg-[var(--accent-primary)]" />
                </div>

                {/* 3 Day Columns with clean subtle column hairlines */}
                <div className="grid grid-cols-3 gap-2.5 h-full relative z-10 border-l border-[var(--rule-hairline)] pl-1.5">
                  <div className="relative h-full border-r border-[var(--rule-hairline)] pr-1.5">
                    <div className="absolute inset-x-0 right-1.5 top-[8%] h-[28%] p-1.5 rounded-md border-l-2 bg-[rgba(20,164,252,0.1)]" style={{ borderLeftColor: '#14A4FC' }}>
                      <div className="font-mono-num text-[9px] text-[var(--ink-secondary)]">9:30 AM</div>
                      <div className="text-[11px] font-medium text-[var(--ink-primary)] leading-tight">Q4 Roadmap Sync</div>
                    </div>
                    <div className="absolute inset-x-0 right-1.5 top-[56%] h-[32%] p-1.5 rounded-md border-l-2 bg-[rgba(231,64,4,0.11)]" style={{ borderLeftColor: '#E74004' }}>
                      <div className="font-mono-num text-[9px] text-[var(--ink-secondary)]">1:30 PM</div>
                      <div className="text-[11px] font-medium text-[var(--ink-primary)] leading-tight">Ship NLP Parser</div>
                    </div>
                  </div>

                  <div className="relative h-full border-r border-[var(--rule-hairline)] pr-1.5 bg-[rgba(231,64,4,0.025)] rounded-sm">
                    <div className="absolute inset-x-0 right-1.5 top-[4%] h-[36%] p-1.5 rounded-md border-l-2 bg-[rgba(231,64,4,0.12)]" style={{ borderLeftColor: '#E74004' }}>
                      <div className="font-mono-num text-[9px] text-[var(--ink-secondary)]">9:00 AM</div>
                      <div className="text-[11px] font-medium text-[var(--ink-primary)] leading-tight">Unified Timeline UI</div>
                    </div>
                    <div className="absolute inset-x-0 right-1.5 top-[44%] h-[22%] p-1.5 rounded-md border-l-2 bg-[rgba(20,164,252,0.1)]" style={{ borderLeftColor: '#14A4FC' }}>
                      <div className="font-mono-num text-[9px] text-[var(--ink-secondary)]">12:00 PM</div>
                      <div className="text-[11px] font-medium text-[var(--ink-primary)] leading-tight">Design Review</div>
                    </div>
                    <div className="absolute inset-x-0 right-1.5 top-[70%] h-[26%] p-1.5 rounded-md border-l-2 bg-[rgba(231,64,4,0.11)]" style={{ borderLeftColor: '#E74004' }}>
                      <div className="font-mono-num text-[9px] text-[var(--ink-secondary)]">2:30 PM</div>
                      <div className="text-[11px] font-medium text-[var(--ink-primary)] leading-tight">Analytics Curves</div>
                    </div>
                  </div>

                  <div className="relative h-full">
                    <div className="absolute inset-x-0 top-[14%] h-[24%] p-1.5 rounded-md border-l-2 bg-[rgba(20,164,252,0.1)]" style={{ borderLeftColor: '#14A4FC' }}>
                      <div className="font-mono-num text-[9px] text-[var(--ink-secondary)]">10:00 AM</div>
                      <div className="text-[11px] font-medium text-[var(--ink-primary)] leading-tight">Arch Walkthrough</div>
                    </div>
                    <div className="absolute inset-x-0 top-[52%] h-[34%] p-1.5 rounded-md border-l-2 bg-[rgba(231,64,4,0.11)]" style={{ borderLeftColor: '#E74004' }}>
                      <div className="font-mono-num text-[9px] text-[var(--ink-secondary)]">1:00 PM</div>
                      <div className="text-[11px] font-medium text-[var(--ink-primary)] leading-tight">Cmd+K Shortcuts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Focus & Habits Mini-Panel */}
            <div className="hidden md:flex md:col-span-3 p-3.5 flex-col justify-between bg-[var(--bg-surface)]">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11.5px] font-semibold text-[var(--ink-secondary)]">
                  <span>Deep Focus</span>
                  <span className="font-mono-num text-[var(--accent-primary)]">25:00</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] space-y-2 border border-[var(--rule-hairline)]">
                  <div className="text-[11px] font-medium text-[var(--ink-primary)]">
                    Timeline drag & 15m snap
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-[var(--accent-primary)]" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono-num text-[var(--ink-secondary)]">
                    <span>Sprint 2 of 4</span>
                    <span>50 / 120m</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2.5 border-t border-[var(--rule-hairline)]">
                <div className="text-[11px] font-medium text-[var(--ink-secondary)]">Habit streaks</div>
                <div className="flex items-center justify-between text-[11.5px] text-[var(--ink-primary)]">
                  <span>2h Deep Work</span>
                  <span className="font-mono-num text-[var(--accent-primary)]">2d</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px] text-[var(--ink-primary)]">
                  <span>Inbox Zero</span>
                  <span className="font-mono-num text-[var(--accent-sky)]">1d</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px] text-[var(--ink-primary)]">
                  <span>Movement Session</span>
                  <span className="font-mono-num text-[var(--accent-emerald)]">2d</span>
                </div>
              </div>
            </div>

            {/* Smooth Bottom Vignette Fade */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 z-30"
              style={{ background: 'linear-gradient(to top, var(--bg-surface), transparent)' }}
            />
          </div>
        </div>
      </section>

      {/* 4-Stat Live Telemetry Strip Cleanly Below the Fold */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-16 border-y">
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10">
          {metrics.map((m) => (
            <li key={m.label}>
              <p
                className="font-display font-bold leading-none tracking-tight tabular-nums"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)' }}
              >
                {m.value}
              </p>
              <p className="mt-3 text-[13px] text-[var(--ink-secondary)]">{m.label}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Asymmetric Feature Bento Grid */}
      <section id="overview-features" className="max-w-6xl mx-auto px-6 sm:px-10 py-20 border-b">
        <div className="mb-10">
          <h2 className="font-display font-bold text-[30px] tracking-tight">
            Built so every minute and every commitment shares one source of truth
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="md:col-span-2 studio-card rounded-2xl p-7 flex flex-col justify-between min-h-[240px]">
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

          <article className="studio-card rounded-2xl p-7 flex flex-col justify-between">
            <CheckSquare className="w-5 h-5 text-[var(--accent-sky)]" />
            <div className="mt-8 space-y-2">
              <h3 className="font-display font-bold text-[19px]">Smart Lists, Kanban & Matrix</h3>
              <p className="text-[13.5px] text-[var(--ink-secondary)] leading-relaxed">
                Switch effortlessly between a natural-language list, draggable Kanban columns, and an Eisenhower urgency matrix.
              </p>
            </div>
          </article>

          <article className="studio-card rounded-2xl p-7 flex flex-col justify-between">
            <Timer className="w-5 h-5 text-[var(--accent-amber)]" />
            <div className="mt-8 space-y-2">
              <h3 className="font-display font-bold text-[19px]">Pomodoro Focus Engine</h3>
              <p className="text-[13.5px] text-[var(--ink-secondary)] leading-relaxed">
                Attach any task to a 25m or 50m sprint, enter distraction-free Focus Curtain mode, and log real focus hours automatically.
              </p>
            </div>
          </article>

          <article className="studio-card rounded-2xl p-7 flex flex-col justify-between">
            <Flame className="w-5 h-5 text-[var(--accent-emerald)]" />
            <div className="mt-8 space-y-2">
              <h3 className="font-display font-bold text-[19px]">Habits & Daily Notes</h3>
              <p className="text-[13.5px] text-[var(--ink-secondary)] leading-relaxed">
                Track 7-day habit streaks alongside daily journal notes that extract action items into your to-do inbox in one click.
              </p>
            </div>
          </article>

          <article className="studio-card rounded-2xl p-7 flex flex-col justify-between">
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
      <section id="overview-shortcuts" className="max-w-6xl mx-auto px-6 sm:px-10 py-16">
        <div className="flex items-center gap-2.5 mb-6">
          <Keyboard className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="font-display font-bold text-[22px] tracking-tight">Keyboard Command Reference</h2>
        </div>

        <div className="studio-card rounded-2xl divide-y">
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
