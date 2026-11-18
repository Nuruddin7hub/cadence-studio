import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  GripVertical,
  Inbox,
  Layers,
  Plus,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { TaskListId } from '../types/workspace';
import {
  addMonths,
  fromDateKey,
  getIsoWeekNumber,
  getMonthGridDates,
  MONTH_NAMES,
  WEEKDAY_TWO,
} from '../utils/date';
import { CALENDAR_LAYERS, PRIORITY_META } from '../utils/themeTokens';

export const Sidebar: React.FC = () => {
  const {
    snapshot,
    todayKey,
    selectedDate,
    setSelectedDate,
    activeList,
    setActiveList,
    activeTab,
    setActiveTab,
    toggleLayer,
    toggleTaskComplete,
    addTaskFromText,
    setSelection,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useWorkspace();

  const [miniMonthAnchor, setMiniMonthAnchor] = useState<string>(selectedDate);
  const [sidebarDraft, setSidebarDraft] = useState('');

  const miniDates = useMemo(
    () => getMonthGridDates(miniMonthAnchor, snapshot.preferences.weekStartsOn),
    [miniMonthAnchor, snapshot.preferences.weekStartsOn]
  );

  const miniMonthDate = fromDateKey(miniMonthAnchor);
  const activeMonth = miniMonthDate.getMonth();
  const activeYear = miniMonthDate.getFullYear();

  const eventsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const ev of snapshot.events) {
      if (!snapshot.enabledLayers[ev.calendarId]) continue;
      map.set(ev.date, (map.get(ev.date) ?? 0) + 1);
    }
    return map;
  }, [snapshot.events, snapshot.enabledLayers]);

  const counts = useMemo(() => {
    const tasks = snapshot.tasks;
    return {
      inbox: tasks.filter((t) => !t.completed && t.listId === 'inbox').length,
      today: tasks.filter((t) => !t.completed && t.dueDate === todayKey).length,
      upcoming: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > todayKey).length,
      overdue: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayKey).length,
      completed: tasks.filter((t) => t.completed).length,
      work: tasks.filter((t) => !t.completed && t.listId === 'work').length,
      design: tasks.filter((t) => !t.completed && t.listId === 'design').length,
      personal: tasks.filter((t) => !t.completed && t.listId === 'personal').length,
    };
  }, [snapshot.tasks, todayKey]);

  const unscheduledQueue = useMemo(() => {
    return snapshot.tasks
      .filter((t) => !t.completed && !t.scheduledDate)
      .slice(0, 5);
  }, [snapshot.tasks]);

  const smartLists: {
    id: TaskListId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    tone?: string;
  }[] = [
    { id: 'today', label: 'Today', icon: Sun, count: counts.today, tone: 'var(--accent-primary)' },
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: counts.inbox },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarClock, count: counts.upcoming },
    { id: 'overdue', label: 'Overdue', icon: AlertCircle, count: counts.overdue, tone: counts.overdue > 0 ? 'var(--accent-amber)' : undefined },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: counts.completed },
  ];

  const projectLists: { id: TaskListId; label: string; dot: string; count: number }[] = [
    { id: 'work', label: 'Product & Engineering', dot: '#E74004', count: counts.work },
    { id: 'design', label: 'Design Systems', dot: '#14A4FC', count: counts.design },
    { id: 'personal', label: 'Personal & Life', dot: '#F4C46C', count: counts.personal },
  ];

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sidebarDraft.trim()) return;
    addTaskFromText(sidebarDraft);
    setSidebarDraft('');
  };

  const weekdayHeaders =
    snapshot.preferences.weekStartsOn === 1
      ? [...WEEKDAY_TWO.slice(1), WEEKDAY_TWO[0]]
      : WEEKDAY_TWO;

  const content = (
    <div className="h-full flex flex-col overflow-y-auto px-3 py-3.5 space-y-5 text-[12.5px]">
      {/* Mini Calendar (Cron style) */}
      <section aria-label="Mini calendar">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="font-display font-semibold text-[13px] text-[var(--ink-primary)]">
            {MONTH_NAMES[activeMonth]} {activeYear}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setMiniMonthAnchor((m) => addMonths(m, -1))}
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMiniMonthAnchor(todayKey);
                setSelectedDate(todayKey);
              }}
              className="px-1.5 py-0.5 rounded text-[11px] font-medium hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setMiniMonthAnchor((m) => addMonths(m, 1))}
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
              aria-label="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-y-0.5 text-center items-center">
          <span className="text-[10px] font-mono-num text-[var(--ink-muted)] py-1">W</span>
          {weekdayHeaders.map((wd) => (
            <span key={wd} className="text-[10.5px] font-medium text-[var(--ink-muted)] py-1">
              {wd}
            </span>
          ))}

          {Array.from({ length: 6 }, (_, rowIdx) => {
            const rowDates = miniDates.slice(rowIdx * 7, rowIdx * 7 + 7);
            const weekNum = getIsoWeekNumber(rowDates[0]);
            return (
              <React.Fragment key={rowDates[0]}>
                <span className="text-[10px] font-mono-num text-[var(--ink-muted)] opacity-60">
                  {weekNum}
                </span>
                {rowDates.map((dKey) => {
                  const d = fromDateKey(dKey);
                  const inMonth = d.getMonth() === activeMonth;
                  const isToday = dKey === todayKey;
                  const isSelected = dKey === selectedDate;
                  const hasEvents = (eventsByDate.get(dKey) ?? 0) > 0;
                  return (
                    <button
                      key={dKey}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dKey);
                        setActiveTab('planner');
                      }}
                      className="relative mx-auto w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-mono-num transition-colors"
                      style={{
                        backgroundColor: isToday
                          ? 'var(--accent-primary)'
                          : isSelected
                            ? 'var(--bg-hover)'
                            : 'transparent',
                        color: isToday
                          ? '#FFFFFF'
                          : inMonth
                            ? 'var(--ink-primary)'
                            : 'var(--ink-muted)',
                        opacity: inMonth || isToday ? 1 : 0.45,
                        boxShadow:
                          isSelected && !isToday ? 'inset 0 0 0 1px var(--rule-strong)' : 'none',
                      }}
                    >
                      {d.getDate()}
                      {hasEvents && !isToday && (
                        <span
                          className="absolute bottom-0.5 w-1 h-1 rounded-full"
                          style={{ backgroundColor: 'var(--accent-amber)' }}
                        />
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* Smart Task Views (Morgen + Superlist) */}
      <section aria-label="Task lists">
        <div className="flex items-center justify-between px-1.5 mb-1.5">
          <span className="text-[12px] font-semibold text-[var(--ink-secondary)]">Task Lists</span>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className="text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
          >
            All views
          </button>
        </div>

        <ul className="space-y-0.5">
          {smartLists.map((item) => {
            const Icon = item.icon;
            const active = activeList === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveList(item.id);
                    if (activeTab === 'overview' || activeTab === 'analytics') setActiveTab('tasks');
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-left"
                  style={{
                    backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
                    color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span style={{ color: item.tone ?? 'inherit' }}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                  </span>
                  <span className="font-mono-num text-[11px] text-[var(--ink-muted)]">{item.count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-1.5 px-1.5 mb-1.5 text-[12px] font-semibold text-[var(--ink-secondary)]">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects</span>
          </div>
          <ul className="space-y-0.5">
            {projectLists.map((proj) => {
              const active = activeList === proj.id;
              return (
                <li key={proj.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveList(proj.id);
                      if (activeTab === 'overview' || activeTab === 'analytics') setActiveTab('tasks');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
                      color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                    }}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proj.dot }} />
                      <span className="truncate">{proj.label}</span>
                    </span>
                    <span className="font-mono-num text-[11px] text-[var(--ink-muted)]">{proj.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Drag-to-Calendar Time-Blocking Queue */}
      <section aria-label="Drag to time block" className="pt-3 border-t">
        <div className="flex items-center justify-between px-1.5 mb-2">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--ink-secondary)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
            <span>Time-block queue</span>
          </span>
          <span className="text-[10.5px] text-[var(--ink-muted)]">Drag to grid</span>
        </div>

        <form onSubmit={handleQuickAdd} className="mb-2 flex items-center gap-1.5">
          <input
            type="text"
            value={sidebarDraft}
            onChange={(e) => setSidebarDraft(e.target.value)}
            placeholder="Quick task..."
            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border text-[12px] bg-[var(--bg-inset)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <button
            type="submit"
            aria-label="Add quick task"
            className="p-1.5 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)]"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        <ul className="space-y-1">
          {unscheduledQueue.map((task) => {
            const pMeta = PRIORITY_META[task.priority];
            return (
              <li
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/cadence-task-id', task.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => setSelection({ type: 'task', id: task.id })}
                className="group flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-grab active:cursor-grabbing hover:bg-[var(--bg-hover)] transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--rule-hairline)',
                }}
              >
                <GripVertical className="w-3 h-3 text-[var(--ink-muted)] shrink-0 opacity-60 group-hover:opacity-100" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskComplete(task.id);
                  }}
                  aria-label={`Complete ${task.title}`}
                  className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 hover:border-[var(--accent-primary)]"
                  style={{ borderColor: pMeta.color }}
                >
                  {task.completed && <Check className="w-2.5 h-2.5 text-[var(--accent-primary)]" />}
                </button>
                <span className="flex-1 truncate text-[12px] text-[var(--ink-primary)]">{task.title}</span>
                <span className="font-mono-num text-[10.5px] text-[var(--ink-muted)] shrink-0">
                  {task.estimatedMinutes}m
                </span>
              </li>
            );
          })}
          {unscheduledQueue.length === 0 && (
            <li className="px-2 py-2 text-[11.5px] text-[var(--ink-muted)] text-center rounded-lg border border-dashed">
              Every active task is scheduled.
            </li>
          )}
        </ul>
      </section>

      {/* Calendar Layers */}
      <section aria-label="Calendar layers" className="pt-3 border-t">
        <div className="flex items-center gap-1.5 px-1.5 mb-2 text-[12px] font-semibold text-[var(--ink-secondary)]">
          <Layers className="w-3.5 h-3.5" />
          <span>Calendars</span>
        </div>
        <ul className="space-y-1">
          {CALENDAR_LAYERS.map((layer) => {
            const on = snapshot.enabledLayers[layer.id];
            return (
              <li key={layer.id}>
                <button
                  type="button"
                  onClick={() => toggleLayer(layer.id)}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[var(--bg-hover)] text-[12px]"
                  style={{ color: on ? 'var(--ink-primary)' : 'var(--ink-muted)' }}
                >
                  <span
                    className="w-3 h-3 rounded-[4px] border flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: on ? layer.color : 'transparent',
                      borderColor: on ? layer.color : 'var(--rule-strong)',
                    }}
                  >
                    {on && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </span>
                  <span className="truncate">{layer.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );

  return (
    <>
      <aside
        className="hidden lg:block w-[258px] shrink-0 border-r bg-[var(--bg-surface)]"
        style={{ borderColor: 'var(--rule-hairline)' }}
      >
        {content}
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative w-[280px] max-w-[85vw] h-full bg-[var(--bg-surface)] border-r z-10 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-display font-bold text-[14px]">Cadence Studio</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
          </aside>
        </div>
      )}
    </>
  );
};
