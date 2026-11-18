import React, { useMemo, useRef } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { EventCategory } from '../types/workspace';
import { addDays, getWeekDates, WEEKDAY_SHORT } from '../utils/date';
import { buildIcsExport, buildJsonBackup, triggerFileDownload } from '../utils/ics';
import { EVENT_CATEGORY_STYLES } from '../utils/themeTokens';

export const AnalyticsSuite: React.FC = () => {
  const {
    snapshot,
    selectedDate,
    todayKey,
    importWorkspaceJson,
    resetToSeed,
    pushToast,
  } = useWorkspace();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const weekDates = useMemo(
    () => getWeekDates(selectedDate, snapshot.preferences.weekStartsOn),
    [selectedDate, snapshot.preferences.weekStartsOn]
  );

  const stats = useMemo(() => {
    const totalTasks = snapshot.tasks.length;
    const completedTasks = snapshot.tasks.filter((t) => t.completed).length;
    const weekEvents = snapshot.events.filter((e) => !e.allDay && weekDates.includes(e.date));
    const scheduledHours =
      weekEvents.reduce((acc, ev) => acc + ev.durationMinutes, 0) / 60;
    const focusHours =
      snapshot.focusHistory.reduce((acc, s) => acc + s.durationMinutes, 0) / 60;

    const byCategory = (Object.keys(EVENT_CATEGORY_STYLES) as EventCategory[]).map((cat) => {
      const mins = weekEvents
        .filter((e) => e.category === cat)
        .reduce((a, e) => a + e.durationMinutes, 0);
      return {
        cat,
        label: EVENT_CATEGORY_STYLES[cat].label,
        color: EVENT_CATEGORY_STYLES[cat].bar,
        hours: Math.round((mins / 60) * 10) / 10,
      };
    });

    const dailyBars = weekDates.map((dKey) => {
      const d = new Date(`${dKey}T00:00:00`);
      const mins = weekEvents
        .filter((e) => e.date === dKey)
        .reduce((a, e) => a + e.durationMinutes, 0);
      const deepMins = weekEvents
        .filter((e) => e.date === dKey && e.category === 'deep')
        .reduce((a, e) => a + e.durationMinutes, 0);
      return {
        date: dKey,
        label: WEEKDAY_SHORT[d.getDay()],
        totalHours: Math.round((mins / 60) * 10) / 10,
        deepHours: Math.round((deepMins / 60) * 10) / 10,
      };
    });

    const habitCompletionPct = (() => {
      let hit = 0;
      let possible = snapshot.habits.length * 7;
      for (const h of snapshot.habits) {
        for (let i = 0; i < 7; i++) {
          if (h.history[addDays(todayKey, -i)]) hit++;
        }
      }
      return possible ? Math.round((hit / possible) * 100) : 0;
    })();

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      scheduledHours: Math.round(scheduledHours * 10) / 10,
      focusHours: Math.round(focusHours * 10) / 10,
      byCategory,
      dailyBars,
      habitCompletionPct,
    };
  }, [snapshot.events, snapshot.focusHistory, snapshot.habits, snapshot.tasks, todayKey, weekDates]);

  const maxDayHours = Math.max(6, ...stats.dailyBars.map((b) => b.totalHours));
  const maxCatHours = Math.max(1, ...stats.byCategory.map((c) => c.hours));

  const handleExportIcs = () => {
    const ics = buildIcsExport(snapshot.events);
    triggerFileDownload('cadence-calendar.ics', ics, 'text/calendar;charset=utf-8');
    pushToast('Exported .ics calendar', `${snapshot.events.length} events packaged`, false, 'success');
  };

  const handleExportJson = () => {
    const json = buildJsonBackup(snapshot);
    triggerFileDownload('cadence-workspace-backup.json', json, 'application/json');
    pushToast('Exported workspace JSON backup', undefined, false, 'success');
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[var(--bg-canvas)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-[22px] tracking-tight text-[var(--ink-primary)]">
            Time Analytics & Portability
          </h1>
          <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
            Real numbers computed directly from your scheduled blocks, completed tasks, and focus logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportIcs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Export .ics</span>
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              file.text().then((txt) => importWorkspaceJson(txt));
            }}
          />
          <button
            type="button"
            onClick={resetToSeed}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] text-[var(--ink-secondary)] hover:bg-[var(--bg-hover)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset demo</span>
          </button>
        </div>
      </div>

      {/* 4-Stat KPI Row (inspo-mcp stat/row precision) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled this week', value: `${stats.scheduledHours}h`, tone: 'var(--accent-primary)' },
          { label: 'Task completion rate', value: `${stats.completionRate}%`, tone: 'var(--accent-emerald)' },
          { label: 'Deep focus logged', value: `${stats.focusHours}h`, tone: 'var(--accent-amber)' },
          { label: '7-day habit consistency', value: `${stats.habitCompletionPct}%`, tone: 'var(--accent-sky)' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border bg-[var(--bg-surface)] p-4">
            <div
              className="font-display font-bold text-[30px] leading-none tracking-tight tabular-nums"
              style={{ color: kpi.tone }}
            >
              {kpi.value}
            </div>
            <p className="mt-2.5 text-[12.5px] text-[var(--ink-secondary)]">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Planned vs Deep Focus Bars */}
        <section className="lg:col-span-7 rounded-2xl border bg-[var(--bg-surface)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[15px]">Weekly Load & Deep Focus Balance</h2>
            <div className="flex items-center gap-3 text-[11.5px] text-[var(--ink-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-primary)]" />
                Deep focus
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--ink-muted)]/40" />
                Total scheduled
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 pt-4 items-end h-52 border-b pb-3">
            {stats.dailyBars.map((bar) => {
              const totalPct = Math.round((bar.totalHours / maxDayHours) * 100);
              const deepPct = Math.round((bar.deepHours / maxDayHours) * 100);
              return (
                <div key={bar.date} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="font-mono-num text-[11px] text-[var(--ink-muted)]">
                    {bar.totalHours}h
                  </span>
                  <div className="w-full max-w-[38px] h-36 rounded-lg bg-[var(--bg-inset)] relative overflow-hidden flex flex-col justify-end">
                    <div
                      className="w-full rounded-t-md transition-all relative"
                      style={{
                        height: `${Math.max(4, totalPct)}%`,
                        backgroundColor: 'var(--rule-strong)',
                      }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-sm"
                        style={{
                          height: bar.totalHours > 0 ? `${Math.round((deepPct / Math.max(1, totalPct)) * 100)}%` : '0%',
                          backgroundColor: 'var(--accent-primary)',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[12px] font-medium text-[var(--ink-secondary)]">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Category Breakdown (inspo-mcp pure bar chart style) */}
        <section className="lg:col-span-5 rounded-2xl border bg-[var(--bg-surface)] p-5 space-y-4">
          <h2 className="font-display font-bold text-[15px]">Time Allocation by Category</h2>
          <div className="space-y-3.5 pt-1">
            {stats.byCategory.map((item) => (
              <div key={item.cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-[var(--ink-primary)]">{item.label}</span>
                  <span className="font-mono-num text-[var(--ink-secondary)]">{item.hours}h</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(4, Math.round((item.hours / maxCatHours) * 100))}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
