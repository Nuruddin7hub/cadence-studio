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

  const previewTasks = snapshot.tasks.slice(0, 5);
  const isDark = snapshot.preferences.theme === 'dark';

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--bg-canvas)] studio-spotlight-dark">
      {/* Centered Cron + Linear Inspired Hero Sized Cleanly Within 844px (100vh - 56px) */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pt-9 pb-12 min-h-[calc(100vh-56px)] flex flex-col items-center justify-between text-center">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[12px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] bg-[var(--bg-surface)]/85 mb-5 transition-colors"
            style={{ borderColor: 'var(--rule-strong)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
            <span>Cadence Studio · Unified Calendar & To-Do</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          </button>

          <h1
            className="font-display font-extrabold tracking-tight leading-[1.0] max-w-4xl"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.3rem)',
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

          <p className="mt-4 text-[15.5px] leading-relaxed text-[var(--ink-secondary)] max-w-xl">
            Time-blocking calendar, natural-language task lists, Kanban and Eisenhower prioritization,
            Pomodoro deep work, and habit streaks in one keyboard-first workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
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
              className="studio-card inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-medium hover:bg-[var(--bg-hover)]"
            >
              <span>Command Bar (Ctrl+K)</span>
            </button>
          </div>
        </div>

        {/* Richly Populated Framed Studio + Mobile Companion Showcase (Cron R01 inspiration) */}
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
              ? '0 28px 72px rgba(0, 0, 0, 0.7), 0 0 80px -20px rgba(231, 64, 4, 0.22), inset 0 1px 0 rgba(255,255,255,0.1)'
              : 'var(--shadow-panel)',
          }}
        >
          {/* Window Chrome */}
          <div className="px-4 py-2.5 border-b flex items-center justify-between bg-[var(--bg-elevated)]/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-strong)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-strong)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-strong)]" />
              <span className="ml-2 text-[12px] font-medium text-[var(--ink-secondary)]">
                November 2026 · Week 47 · Wednesday 18
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono-num text-[var(--ink-muted)]">
              <span className="hidden sm:inline">25:00 Focus active</span>
              <span className="text-[var(--accent-primary)] font-medium">Enter live studio →</span>
            </div>
          </div>

          {/* 3-Zone Product Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x h-[285px]">
            {/* Left Task Queue */}
            <div className="md:col-span-3 p-3.5 space-y-2.5 bg-[var(--bg-surface)]">
              <div className="flex items-center justify-between text-[11.5px] font-semibold text-[var(--ink-secondary)]">
                <span>Today Queue</span>
                <span className="font-mono-num text-[var(--accent-primary)]">4</span>
              </div>
              <div className="space-y-1.5">
                {previewTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[var(--bg-elevated)]/65 text-[11.5px]">
                    <span
                      className="w-3 h-3 rounded border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: t.completed ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                        backgroundColor: t.completed ? 'var(--accent-emerald)' : 'transparent',
                      }}
                    >
                      {t.completed && <Check className="w-2 h-2 text-white stroke-[3]" />}
                    </span>
                    <span className={`truncate ${t.completed ? 'opacity-50' : 'text-[var(--ink-primary)]'}`}>
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Time-Blocked Timeline */}
            <div className="md:col-span-6 p-3.5 grid grid-cols-3 gap-2.5 bg-[var(--bg-canvas)]/75 relative">
              {[
                {
                  day: 'Tue 17',
                  blocks: [
                    { time: '9:30 AM', title: 'Q4 Roadmap Alignment', color: '#14A4FC', h: 'h-16' },
                    { time: '1:30 PM', title: 'Ship NLP Quick Parser', color: '#E74004', h: 'h-20' },
                    { time: '6:00 PM', title: 'Strength Conditioning', color: '#2CCC74', h: 'h-12' },
                  ],
                },
                {
                  day: 'Wed 18 · Today',
                  today: true,
                  blocks: [
                    { time: '9:00 AM', title: 'Deep Work: Unified Timeline', color: '#E74004', h: 'h-20' },
                    { time: '12:00 PM', title: 'Design Systems Review', color: '#14A4FC', h: 'h-14' },
                    { time: '2:30 PM', title: 'Focus Block: Analytics', color: '#E74004', h: 'h-16' },
                  ],
                },
                {
                  day: 'Thu 19',
                  blocks: [
                    { time: '10:00 AM', title: 'Architecture Walkthrough', color: '#14A4FC', h: 'h-16' },
                    { time: '1:00 PM', title: 'Deep Focus: Cmd+K Flows', color: '#E74004', h: 'h-20' },
                    { time: '7:00 PM', title: 'Dinner with Sam', color: '#F4C46C', h: 'h-12' },
                  ],
                },
              ].map((col) => (
                <div key={col.day} className="space-y-1.5">
                  <div
                    className="text-[11px] font-semibold pb-1 border-b"
                    style={{ color: col.today ? 'var(--accent-primary)' : 'var(--ink-secondary)' }}
                  >
                    {col.day}
                  </div>
                  <div className="space-y-1.5">
                    {col.blocks.map((b) => (
                      <div
                        key={b.title}
                        className={`p-2 rounded-md border-l-2 bg-[var(--bg-surface)] text-left ${b.h}`}
                        style={{ borderLeftColor: b.color }}
                      >
                        <div className="font-mono-num text-[9.5px] text-[var(--ink-muted)]">{b.time}</div>
                        <div className="text-[11px] font-medium text-[var(--ink-primary)] line-clamp-2 leading-tight mt-0.5">
                          {b.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Focus & Habits Mini-Panel */}
            <div className="hidden md:flex md:col-span-3 p-3.5 flex-col justify-between bg-[var(--bg-surface)]">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11.5px] font-semibold text-[var(--ink-secondary)]">
                  <span>Deep Focus</span>
                  <span className="font-mono-num text-[var(--accent-amber)]">25:00</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] space-y-1.5">
                  <div className="text-[11px] font-medium text-[var(--ink-primary)]">
                    Finalize unified timeline grid
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-[var(--accent-primary)]" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t">
                <div className="text-[11px] font-medium text-[var(--ink-muted)]">Habit streaks</div>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span>2h Deep Work</span>
                  <span className="font-mono-num text-[var(--accent-emerald)]">2d</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span>Movement Session</span>
                  <span className="font-mono-num text-[var(--accent-emerald)]">2d</span>
                </div>
              </div>
            </div>
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
