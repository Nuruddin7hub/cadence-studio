import React from 'react';
import { CheckCircle2, Pause, Play, RotateCcw, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const FocusCurtain: React.FC = () => {
  const {
    snapshot,
    focusCurtainOpen,
    setFocusCurtainOpen,
    focusMode,
    focusSecondsLeft,
    focusRunning,
    setFocusRunning,
    resetFocusTimer,
    completeFocusNow,
    activeFocusTaskId,
  } = useWorkspace();

  if (!focusCurtainOpen) return null;

  const task = snapshot.tasks.find((t) => t.id === activeFocusTaskId);
  const totalSec =
    (focusMode === 'focus'
      ? snapshot.preferences.focusMinutes
      : focusMode === 'short_break'
        ? snapshot.preferences.shortBreakMinutes
        : snapshot.preferences.longBreakMinutes) * 60;
  const pct = Math.max(0, Math.min(1, 1 - focusSecondsLeft / Math.max(1, totalSec)));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <button
        type="button"
        onClick={() => setFocusCurtainOpen(false)}
        className="absolute top-5 right-5 p-2.5 rounded-xl border bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
        aria-label="Exit focus curtain"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <p className="text-[13px] font-medium text-[var(--accent-primary)]">
            {focusMode === 'focus' ? 'Deep Work Session' : 'Recovery Interval'}
          </p>
          <h2 className="font-display font-bold text-[24px] tracking-tight text-[var(--ink-primary)]">
            {task ? task.title : 'Uninterrupted Focus Block'}
          </h2>
        </div>

        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="w-64 h-64 -rotate-90" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="96" fill="none" stroke="var(--rule-strong)" strokeWidth="7" />
            <circle
              cx="110"
              cy="110"
              r="96"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 96}
              strokeDashoffset={2 * Math.PI * 96 * (1 - pct)}
            />
          </svg>
          <span className="absolute font-mono-num text-[52px] font-bold tracking-tight">
            {fmt(focusSecondsLeft)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setFocusRunning(!focusRunning)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            {focusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{focusRunning ? 'Pause' : 'Start Focus'}</span>
          </button>
          <button
            type="button"
            onClick={() => resetFocusTimer()}
            className="p-3 rounded-full border bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
            aria-label="Reset session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={completeFocusNow}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full border bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[13px] font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-emerald)]" />
            <span>Finish & Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
