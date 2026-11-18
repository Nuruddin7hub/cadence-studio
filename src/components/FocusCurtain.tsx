import React from 'react';
import { CheckCircle2, Pause, Play, RotateCcw, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Counter, ElectricBorder, GlareHover, LineWaves } from '../lib/reactbits';

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

  const isDark = snapshot.preferences.theme === 'dark';
  const task = snapshot.tasks.find((t) => t.id === activeFocusTaskId);
  const totalSec =
    (focusMode === 'focus'
      ? snapshot.preferences.focusMinutes
      : focusMode === 'short_break'
        ? snapshot.preferences.shortBreakMinutes
        : snapshot.preferences.longBreakMinutes) * 60;
  const pct = Math.max(0, Math.min(1, 1 - focusSecondsLeft / Math.max(1, totalSec)));
  const mins = Math.floor(focusSecondsLeft / 60);
  const secs = focusSecondsLeft % 60;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <LineWaves
          color1="#E74004"
          color2="#F4C46C"
          color3="#14A4FC"
          speed={focusRunning ? 0.55 : 0.25}
          lineCount={54}
          opacity={isDark ? 0.34 : 0.14}
          lightMode={!isDark}
        />
      </div>

      <button
        type="button"
        onClick={() => setFocusCurtainOpen(false)}
        className="absolute z-20 top-5 right-5 p-2.5 rounded-xl border bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
        aria-label="Exit focus curtain"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <p className="text-[13px] font-medium text-[var(--accent-primary)]">
            {focusMode === 'focus' ? 'Deep Work Session' : 'Recovery Interval'}
          </p>
          <h2 className="font-display font-bold text-[24px] tracking-tight text-[var(--ink-primary)]">
            {task ? task.title : 'Uninterrupted Focus Block'}
          </h2>
        </div>

        <ElectricBorder
          color="#E74004"
          speed={focusRunning ? 1.4 : 0.5}
          intensity={focusRunning ? 0.85 : 0.35}
          glow={focusRunning ? 0.7 : 0.25}
          borderRadius={160}
          theme={isDark ? 'dark' : 'light'}
          className="w-64 h-64 mx-auto"
        >
          <div className="relative w-64 h-64 rounded-full flex items-center justify-center bg-[var(--bg-canvas)]/75 backdrop-blur-md">
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
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute inline-flex items-center font-mono-num text-[50px] font-bold tracking-tight text-[var(--ink-primary)]">
              <Counter value={mins} minDigits={2} fontSize={48} fontWeight={700} textColor="var(--ink-primary)" />
              <span className="px-0.5 pb-1 text-[var(--accent-primary)]">:</span>
              <Counter value={secs} minDigits={2} fontSize={48} fontWeight={700} textColor="var(--ink-primary)" />
            </span>
          </div>
        </ElectricBorder>

        <div className="flex items-center justify-center gap-3">
          <GlareHover glareColor="#ffffff" glareOpacity={0.25} borderRadius="9999px" className="inline-flex">
            <button
              type="button"
              onClick={() => setFocusRunning(!focusRunning)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {focusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{focusRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
          </GlareHover>
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
            <span>Complete Sprint</span>
          </button>
        </div>
      </div>
    </div>
  );
};
