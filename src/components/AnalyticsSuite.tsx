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
    const scheduledHours = weekEvents.reduce((acc, ev) => acc + ev.durationMinutes, 0) / 60;
    const focusHours = snapshot.focusHistory.reduce((acc, s) => acc + s.durationMinutes, 0) / 60;

    const byCategory = (Object.keys(EVENT_CATEGORY_STYLES) as EventCategory[]).map((cat) => {
      const mins = weekEvents.filter((e) => e.category === cat).reduce((a, e) => a + e.durationMinutes, 0);
      const count = weekEvents.filter((e) => e.category === cat).length;
      return {
        cat,
        label: EVENT_CATEGORY_STYLES[cat].label,
        hours: Math.round((mins / 60) * 10) / 10,
        count,
      };
    });

    const timedCount = weekEvents.length;

    const dailyBars = weekDates.map((dKey) => {
      const d = new Date(`${dKey}T00:00:00`);
      const mins = weekEvents.filter((e) => e.date === dKey).reduce((a, e) => a + e.durationMinutes, 0);
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
      const possible = snapshot.habits.length * 7;
      for (const h of snapshot.habits) {
        for (let i = 0; i < 7; i++) {
          if (h.history[addDays(todayKey, -i)]) hit++;
        }
      }
      return possible ? Math.round((hit / possible) * 100) : 0;
    })();

    const listBreakdown = (['work', 'design', 'inbox', 'personal'] as const).map((list) => {
      const items = snapshot.tasks.filter((t) => t.listId === list);
      const done = items.filter((t) => t.completed).length;
      const mins = items.filter((t) => !t.completed).reduce((a, t) => a + t.estimatedMinutes, 0);
      const color =
        list === 'work' ? '#E74004' : list === 'design' ? '#14A4FC' : list === 'inbox' ? '#848F9F' : '#F4C46C';
      return {
        list,
        color,
        label:
          list === 'work'
            ? 'Product & Engineering'
            : list === 'design'
              ? 'Design Systems'
              : list === 'inbox'
                ? 'Inbox Triage'
                : 'Personal & Life',
        total: items.length,
        done,
        pct: items.length ? Math.round((done / items.length) * 100) : 0,
        remainingMins: mins,
      };
    });

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      scheduledHours: Math.round(scheduledHours * 10) / 10,
      focusHours: Math.round(focusHours * 10) / 10,
      byCategory,
      dailyBars,
      habitCompletionPct,
      listBreakdown,
      timedCount,
    };
  }, [snapshot.events, snapshot.focusHistory, snapshot.habits, snapshot.tasks, todayKey, weekDates]);

  const maxDayHours = 8;
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

  const isDark = snapshot.preferences.theme === 'dark';

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[var(--bg-canvas)] studio-spotlight-dark">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header & Restrained Linear-Style Portability Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-[22px] tracking-tight text-[var(--ink-primary)]">
              Time Analytics & Portability
            </h1>
            <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
              Telemetry computed directly from your scheduled blocks, completed tasks, and focus logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportIcs}
              className="studio-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Export .ics</span>
            </button>

            <div className="flex items-center rounded-lg border bg-[var(--bg-surface)] p-0.5">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
              <button
                type="button"
                onClick={resetToSeed}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
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
          </div>
        </div>

        {/* Monochrome Obsidian KPI Row with inline progress strips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Scheduled this week',
              value: `${stats.scheduledHours}h`,
              delta: `${stats.timedCount} blocks`,
              pct: Math.min(100, Math.round((stats.scheduledHours / 40) * 100)),
              accent: 'var(--accent-primary)',
            },
            {
              label: 'Task completion rate',
              value: `${stats.completionRate}%`,
              delta: `${stats.completedTasks}/${stats.totalTasks} done`,
              pct: stats.completionRate,
              accent: 'var(--ink-secondary)',
            },
            {
              label: 'Deep focus logged',
              value: `${stats.focusHours}h`,
              delta: `${snapshot.focusHistory.length} sprints`,
              pct: Math.min(100, Math.round((stats.focusHours / 10) * 100)),
              accent: 'var(--accent-primary)',
            },
            {
              label: '7-day habit consistency',
              value: `${stats.habitCompletionPct}%`,
              delta: `${snapshot.habits.length} habits`,
              pct: stats.habitCompletionPct,
              accent: 'var(--ink-secondary)',
            },
          ].map((kpi) => (
            <div key={kpi.label} className="studio-card rounded-xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-display font-bold text-[28px] leading-none tracking-tight tabular-nums text-[var(--ink-primary)]">
                  {kpi.value}
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] font-mono-num text-[11px] text-[var(--ink-secondary)]">
                  {kpi.delta}
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-1 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${kpi.pct}%`, backgroundColor: kpi.accent }} />
                </div>
                <p className="text-[12.5px] text-[var(--ink-secondary)]">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Weekly Load with Exact Percentage Y-Axis Lines & Directly Anchored Bar Labels */}
          <section className="lg:col-span-7 studio-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-[15px]">Weekly Load & Deep Focus Balance</h2>
              <div className="flex items-center gap-4 text-[11.5px] text-[var(--ink-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-primary)]" />
                  Deep focus
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: isDark ? 'rgba(148,163,184,0.34)' : 'rgba(15,23,42,0.18)' }}
                  />
                  Total scheduled
                </span>
              </div>
            </div>

            <div className="pl-9 pt-5">
              <div className="relative h-40">
                {/* Exact Mathematical Percentage Y-Axis Guide Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {[8, 6, 4, 2, 0].map((tick) => {
                    const bottomPct = (tick / maxDayHours) * 100;
                    return (
                      <div
                        key={tick}
                        className="absolute left-0 right-0 flex items-center"
                        style={{ bottom: `${bottomPct}%` }}
                      >
                        <span className="-ml-9 w-7 text-right font-mono-num text-[10.5px] text-[var(--ink-secondary)] opacity-80 translate-y-1/2">
                          {tick}h
                        </span>
                        <div className="flex-1 border-t border-dashed border-[var(--rule-hairline)] ml-2" />
                      </div>
                    );
                  })}
                </div>

                <div className="relative z-10 grid grid-cols-7 gap-3 h-full items-end">
                  {stats.dailyBars.map((bar) => {
                    const totalPct = Math.min(100, (bar.totalHours / maxDayHours) * 100);
                    const deepPct = Math.min(100, (bar.deepHours / maxDayHours) * 100);
                    return (
                      <div key={bar.date} className="relative flex flex-col items-center h-full justify-end">
                        <div
                          className="w-full max-w-[38px] rounded-t-md relative transition-all"
                          style={{
                            height: `${totalPct}%`,
                            minHeight: bar.totalHours > 0 ? '4px' : '0px',
                            backgroundColor: isDark ? 'rgba(148,163,184,0.34)' : 'rgba(15,23,42,0.18)',
                            boxShadow: isDark
                              ? 'inset 0 1px 0 rgba(255,255,255,0.22)'
                              : 'inset 0 1px 0 rgba(255,255,255,0.6)',
                          }}
                        >
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono-num text-[10.5px] font-medium text-[var(--ink-primary)] whitespace-nowrap">
                            {bar.totalHours}h
                          </span>
                          {bar.deepHours > 0 && (
                            <div
                              className="absolute bottom-0 left-0 right-0 rounded-t-sm"
                              style={{
                                height: `${Math.min(100, (deepPct / Math.max(0.01, totalPct)) * 100)}%`,
                                backgroundColor: 'var(--accent-primary)',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3 pt-2.5 text-center">
                {stats.dailyBars.map((bar) => (
                  <span key={`lbl-${bar.date}`} className="text-[12px] font-medium text-[var(--ink-secondary)]">
                    {bar.label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Disciplined Category Breakdown */}
          <section className="lg:col-span-5 studio-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-[15px]">Time Allocation by Category</h2>
              <span className="font-mono-num text-[11.5px] text-[var(--ink-muted)]">
                {stats.scheduledHours}h total
              </span>
            </div>

            <div className="space-y-3.5">
              {stats.byCategory.map((item) => (
                <div key={item.cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="font-medium text-[var(--ink-primary)]">{item.label}</span>
                    <span className="font-mono-num text-[var(--ink-secondary)]">
                      {item.hours}h · {item.count} {item.count === 1 ? 'block' : 'blocks'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(6, Math.round((item.hours / maxCatHours) * 100))}%`,
                        backgroundColor: item.cat === 'deep' ? 'var(--accent-primary)' : '#8E99AB',
                        opacity: item.cat === 'deep' ? 1 : 0.78,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Rich Executive Backlog Table with Progress Bars & Color Indicators */}
        <section className="studio-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center justify-between">
            <h2 className="font-display font-bold text-[14.5px]">Project Backlog & Remaining Effort</h2>
            <span className="font-mono-num text-[11.5px] text-[var(--ink-muted)]">Live workspace totals</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b text-[11.5px] text-[var(--ink-muted)]">
                  <th className="py-2.5 px-5 font-medium">Workspace List</th>
                  <th className="py-2.5 px-4 font-medium">Progress</th>
                  <th className="py-2.5 px-4 font-medium text-right">Completed</th>
                  <th className="py-2.5 px-4 font-medium text-right">Open Tasks</th>
                  <th className="py-2.5 px-5 text-right font-medium">Queued Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.listBreakdown.map((row) => (
                  <tr key={row.list} className="hover:bg-[var(--bg-hover)]/35 transition-colors">
                    <td className="py-3 px-5 font-medium text-[var(--ink-primary)]">
                      <span className="inline-flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                        <span>{row.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 w-52">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-inset)] border overflow-hidden">
                          {row.pct > 0 && (
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                            />
                          )}
                        </div>
                        <span className="font-mono-num text-[11.5px] text-[var(--ink-secondary)] w-9 text-right">
                          {row.pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num text-[var(--ink-secondary)]">{row.done}</td>
                    <td className="py-3 px-4 text-right font-mono-num text-[var(--ink-secondary)]">{row.total - row.done}</td>
                    <td className="py-3 px-5 text-right font-mono-num text-[var(--ink-primary)]">
                      {row.remainingMins} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
