import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckSquare,
  Download,
  Moon,
  Plus,
  Search,
  Sun,
  Timer,
  Undo2,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { formatMinutes } from '../utils/date';
import { buildIcsExport, triggerFileDownload } from '../utils/ics';

export const CommandPalette: React.FC = () => {
  const {
    snapshot,
    commandOpen,
    setCommandOpen,
    setActiveTab,
    setCalendarMode,
    setTaskViewMode,
    toggleTheme,
    addTaskFromText,
    setSelection,
    setFocusRunning,
    setFocusCurtainOpen,
    availabilityMode,
    setAvailabilityMode,
    undoLast,
  } = useWorkspace();

  const [query, setQuery] = useState('');

  const actions = useMemo(() => {
    return [
      {
        id: 'act-planner',
        label: 'Go to Calendar & Time-Block Studio',
        hint: '1',
        icon: Calendar,
        run: () => setActiveTab('planner'),
      },
      {
        id: 'act-tasks',
        label: 'Open Tasks & Eisenhower Matrix',
        hint: '2',
        icon: CheckSquare,
        run: () => {
          setActiveTab('tasks');
          setTaskViewMode('matrix');
        },
      },
      {
        id: 'act-focus',
        label: 'Start Distraction-Free Focus Curtain',
        hint: 'Timer',
        icon: Timer,
        run: () => {
          setFocusRunning(true);
          setFocusCurtainOpen(true);
        },
      },
      {
        id: 'act-day',
        label: 'Switch Calendar to Day View',
        hint: 'D',
        icon: Calendar,
        run: () => {
          setActiveTab('planner');
          setCalendarMode('day');
        },
      },
      {
        id: 'act-week',
        label: 'Switch Calendar to Week View',
        hint: 'W',
        icon: Calendar,
        run: () => {
          setActiveTab('planner');
          setCalendarMode('week');
        },
      },
      {
        id: 'act-month',
        label: 'Switch Calendar to Month View',
        hint: 'M',
        icon: Calendar,
        run: () => {
          setActiveTab('planner');
          setCalendarMode('month');
        },
      },
      {
        id: 'act-share',
        label: availabilityMode ? 'Exit Share Open Times Mode' : 'Pick Open Slots (Share Times)',
        hint: 'Share',
        icon: Calendar,
        run: () => {
          setActiveTab('planner');
          setAvailabilityMode(!availabilityMode);
        },
      },
      {
        id: 'act-theme',
        label: `Switch to ${snapshot.preferences.theme === 'dark' ? 'Daylight Paper' : 'Obsidian Studio'} Theme`,
        hint: 'Theme',
        icon: snapshot.preferences.theme === 'dark' ? Sun : Moon,
        run: () => toggleTheme(),
      },
      {
        id: 'act-ics',
        label: 'Export Calendar as .ics File',
        hint: 'ICS',
        icon: Download,
        run: () => triggerFileDownload('cadence-calendar.ics', buildIcsExport(snapshot.events), 'text/calendar'),
      },
      {
        id: 'act-undo',
        label: 'Undo Last Change',
        hint: 'Ctrl+Z',
        icon: Undo2,
        run: () => undoLast(),
      },
    ];
  }, [
    availabilityMode,
    setActiveTab,
    setAvailabilityMode,
    setCalendarMode,
    setFocusCurtainOpen,
    setFocusRunning,
    setTaskViewMode,
    snapshot.events,
    snapshot.preferences.theme,
    toggleTheme,
    undoLast,
  ]);

  const q = query.trim().toLowerCase();

  const matchingActions = useMemo(
    () => (q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions),
    [actions, q]
  );

  const matchingItems = useMemo(() => {
    if (!q) return [];
    const tasks = snapshot.tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({ type: 'task' as const, id: t.id, title: t.title, sub: t.dueDate ?? 'Task' }));
    const events = snapshot.events
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((e) => ({
        type: 'event' as const,
        id: e.id,
        title: e.title,
        sub: `${e.date} · ${formatMinutes(e.startMinutes)}`,
      }));
    return [...events, ...tasks];
  }, [q, snapshot.events, snapshot.tasks]);

  if (!commandOpen) return null;

  const handleQuickCreate = () => {
    if (!query.trim()) return;
    addTaskFromText(query.trim());
    setQuery('');
    setCommandOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-[12vh] p-4"
      onClick={() => setCommandOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--rule-strong)',
          boxShadow: 'var(--shadow-panel)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b">
          <Search className="w-4 h-4 text-[var(--ink-muted)] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim() && matchingActions.length === 0 && matchingItems.length === 0) {
                e.preventDefault();
                handleQuickCreate();
              }
            }}
            placeholder="Search events, tasks, commands or type a new task (e.g. 'Sync tomorrow 2pm')..."
            className="flex-1 bg-transparent text-[14px] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setCommandOpen(false)}
            className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--ink-muted)]"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-2">
          {query.trim() && (
            <button
              type="button"
              onClick={handleQuickCreate}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--accent-primary-soft)] text-left hover:opacity-90"
            >
              <span className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--accent-primary)]">
                <Plus className="w-4 h-4" />
                <span>Quick add "{query.trim()}"</span>
              </span>
              <span className="font-mono-num text-[11px] text-[var(--accent-primary)]">Enter</span>
            </button>
          )}

          {matchingItems.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-medium text-[var(--ink-muted)]">Matching schedule & tasks</p>
              {matchingItems.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => {
                    setSelection({ type: item.type, id: item.id });
                    setActiveTab(item.type === 'event' ? 'planner' : 'tasks');
                    setCommandOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] text-left"
                >
                  <span className="text-[13px] font-medium truncate">{item.title}</span>
                  <span className="text-[11.5px] font-mono-num text-[var(--ink-muted)] shrink-0">{item.sub}</span>
                </button>
              ))}
            </div>
          )}

          <div>
            <p className="px-3 py-1 text-[11px] font-medium text-[var(--ink-muted)]">Commands</p>
            {matchingActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    act.run();
                    setCommandOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] text-left group"
                >
                  <span className="flex items-center gap-2.5 text-[13px] text-[var(--ink-primary)]">
                    <Icon className="w-4 h-4 text-[var(--ink-secondary)] group-hover:text-[var(--accent-primary)]" />
                    <span>{act.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-mono-num text-[11px] text-[var(--ink-muted)]">
                    <span>{act.hint}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
