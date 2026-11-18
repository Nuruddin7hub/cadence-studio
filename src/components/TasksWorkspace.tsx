import React, { useMemo, useState } from 'react';
import {
  CalendarPlus,
  Check,
  Columns3,
  Filter,
  Grid2x2,
  ListTodo,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { EisenhowerQuadrant, TaskStatus, TaskViewMode } from '../types/workspace';
import { formatMinutes, formatReadableDate } from '../utils/date';
import { parseQuickInput } from '../utils/nlp';
import { PRIORITY_META } from '../utils/themeTokens';
import { GlareHover, SpotlightCard } from '../lib/reactbits';

const KANBAN_COLS: { id: TaskStatus; label: string; accent: string }[] = [
  { id: 'backlog', label: 'Backlog', accent: '#848F9F' },
  { id: 'todo', label: 'Planned Today', accent: '#14A4FC' },
  { id: 'in_progress', label: 'In Focus', accent: '#E74004' },
  { id: 'done', label: 'Completed', accent: '#2CCC74' },
];

const MATRIX_QUADS: { id: EisenhowerQuadrant; title: string; subtitle: string; accent: string }[] = [
  { id: 'do', title: 'Do First', subtitle: 'Urgent and high impact', accent: '#E74004' },
  { id: 'schedule', title: 'Schedule', subtitle: 'Strategic deep work', accent: '#14A4FC' },
  { id: 'delegate', title: 'Delegate', subtitle: 'Quick coordination & ops', accent: '#F4C46C' },
  { id: 'eliminate', title: 'Backlog / Trim', subtitle: 'Low leverage or someday', accent: '#848F9F' },
];

export const TasksWorkspace: React.FC = () => {
  const {
    snapshot,
    todayKey,
    activeList,
    setActiveList,
    taskViewMode,
    setTaskViewMode,
    searchQuery,
    setSearchQuery,
    tagFilter,
    setTagFilter,
    addTask,
    addTaskFromText,
    toggleTaskComplete,
    toggleSubtask,
    addSubtask,
    deleteTask,
    scheduleTaskToCalendar,
    moveTaskKanban,
    moveTaskQuadrant,
    setSelection,
    pushToast,
  } = useWorkspace();

  const [draft, setDraft] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('task-1');
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<string, string>>({});
  const [quadDrafts, setQuadDrafts] = useState<Record<string, string>>({});
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const isDark = snapshot.preferences.theme === 'dark';

  const parsedPreview = useMemo(
    () => (draft.trim() ? parseQuickInput(draft, todayKey) : null),
    [draft, todayKey]
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    snapshot.tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [snapshot.tasks]);

  const filteredTasks = useMemo(() => {
    return snapshot.tasks.filter((t) => {
      if (tagFilter && !t.tags.includes(tagFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hit =
          t.title.toLowerCase().includes(q) ||
          (t.notes?.toLowerCase().includes(q) ?? false) ||
          t.tags.some((tg) => tg.includes(q));
        if (!hit) return false;
      }

      if (taskViewMode !== 'list') return true;

      if (activeList === 'today') return !t.completed && t.dueDate === todayKey;
      if (activeList === 'inbox') return !t.completed && t.listId === 'inbox';
      if (activeList === 'upcoming') return !t.completed && Boolean(t.dueDate && t.dueDate > todayKey);
      if (activeList === 'overdue') return !t.completed && Boolean(t.dueDate && t.dueDate < todayKey);
      if (activeList === 'completed') return t.completed;
      return !t.completed && t.listId === activeList;
    });
  }, [activeList, searchQuery, snapshot.tasks, tagFilter, taskViewMode, todayKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    addTaskFromText(draft);
    setDraft('');
  };

  const handleQuadAdd = (quad: EisenhowerQuadrant, e: React.FormEvent) => {
    e.preventDefault();
    const text = (quadDrafts[quad] ?? '').trim();
    if (!text) return;
    const priorityMap = { do: 'p1', schedule: 'p2', delegate: 'p3', eliminate: 'p4' } as const;
    addTask({
      title: text,
      listId: 'inbox',
      priority: priorityMap[quad],
      status: quad === 'do' ? 'todo' : 'backlog',
      quadrant: quad,
      dueDate: quad === 'do' ? todayKey : undefined,
      estimatedMinutes: 30,
      tags: [],
      subtasks: [],
      recurrence: 'none',
      completed: false,
    });
    setQuadDrafts((prev) => ({ ...prev, [quad]: '' }));
    pushToast('Added to matrix', text, true, 'success');
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-5 sm:p-6 bg-[var(--bg-canvas)] studio-spotlight-dark">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-[22px] tracking-tight text-[var(--ink-primary)]">
              Tasks, Kanban & Priority Matrix
            </h1>
            <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
              Capture with natural language, break into subtasks, or drag into time blocks.
            </p>
          </div>

          <div className="flex items-center rounded-lg border bg-[var(--bg-inset)] p-0.5">
            {([
              ['list', 'Smart List', ListTodo],
              ['kanban', 'Kanban Board', Columns3],
              ['matrix', 'Eisenhower Matrix', Grid2x2],
            ] as [TaskViewMode, string, React.ComponentType<{ className?: string }>][]).map(
              ([id, label, Icon]) => {
                const active = taskViewMode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTaskViewMode(id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                      color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                      boxShadow: active ? 'inset 0 0 0 1px var(--rule-hairline)' : 'none',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Natural Language Capture + Search & Single Filter Popover */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 studio-card flex items-center gap-2.5 px-3.5 py-2 rounded-xl focus-within:border-[var(--accent-primary)]"
          >
            <Plus className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add task: 'Review deck tomorrow 2pm 45m !p1 #work'"
              className="flex-1 min-w-0 bg-transparent text-[13px] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
            />
            {parsedPreview && (
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                {parsedPreview.date && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono-num bg-[var(--bg-elevated)] text-[var(--ink-secondary)]">
                    {parsedPreview.date}
                  </span>
                )}
                {parsedPreview.startMinutes !== undefined && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono-num bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                    {formatMinutes(parsedPreview.startMinutes, true)}
                  </span>
                )}
                {parsedPreview.priority && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono-num bg-[var(--accent-amber-soft)] text-[var(--accent-amber)]">
                    {parsedPreview.priority.toUpperCase()}
                  </span>
                )}
              </div>
            )}
            <GlareHover glareColor="#ffffff" glareOpacity={0.22} borderRadius="8px" className="inline-flex shrink-0">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white shrink-0 transition-colors"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Add task
              </button>
            </GlareHover>
          </form>

          <div className="lg:col-span-5 flex items-center gap-2 relative">
            <div className="flex-1 studio-card flex items-center gap-2 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-[var(--ink-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter tasks or notes..."
                className="flex-1 min-w-0 bg-transparent text-[13px] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setTagMenuOpen((v) => !v)}
                className="studio-card inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-medium hover:bg-[var(--bg-hover)]"
                style={{
                  color: tagFilter ? 'var(--accent-sky)' : 'var(--ink-secondary)',
                }}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{tagFilter ? `#${tagFilter}` : 'Tags'}</span>
              </button>

              {tagMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl border p-2.5 z-30 space-y-2"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--rule-strong)',
                    boxShadow: 'var(--shadow-panel)',
                  }}
                >
                  <div className="flex items-center justify-between text-[11.5px] font-semibold px-1">
                    <span>Filter by tag</span>
                    {tagFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          setTagFilter(null);
                          setTagMenuOpen(false);
                        }}
                        className="text-[var(--accent-primary)]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setTagFilter(tagFilter === tag ? null : tag);
                          setTagMenuOpen(false);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px]"
                        style={{
                          borderColor: tagFilter === tag ? 'var(--accent-sky)' : 'var(--rule-hairline)',
                          backgroundColor: tagFilter === tag ? 'var(--accent-sky-soft)' : 'var(--bg-inset)',
                          color: tagFilter === tag ? 'var(--accent-sky)' : 'var(--ink-secondary)',
                        }}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List Context Filter Row */}
        {taskViewMode === 'list' && (
          <div className="flex flex-wrap items-center gap-1.5">
            {([
              ['today', 'Today'],
              ['inbox', 'Inbox'],
              ['upcoming', 'Upcoming'],
              ['overdue', 'Overdue'],
              ['work', 'Product & Eng'],
              ['design', 'Design'],
              ['personal', 'Personal'],
              ['completed', 'Completed'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveList(id)}
                className="px-2.5 py-1 rounded-lg border text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: activeList === id ? 'var(--bg-elevated)' : 'transparent',
                  borderColor: activeList === id ? 'var(--rule-strong)' : 'var(--rule-hairline)',
                  color: activeList === id ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* MODE 1: SMART LIST */}
        {taskViewMode === 'list' && (
          <div className="studio-card rounded-xl divide-y">
            {filteredTasks.map((task) => {
              const pMeta = PRIORITY_META[task.priority];
              const isExpanded = expandedId === task.id;
              const doneSubs = task.subtasks.filter((s) => s.done).length;

              return (
                <div key={task.id} className="p-3.5 hover:bg-[var(--bg-hover)]/35 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      aria-label={`Complete ${task.title}`}
                      className="mt-0.5 w-4.5 h-4.5 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        borderColor: pMeta.color,
                        backgroundColor: task.completed ? pMeta.color : 'transparent',
                      }}
                    >
                      {task.completed && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        setSelection({ type: 'task', id: task.id });
                        setExpandedId(isExpanded ? null : task.id);
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[14px] font-medium ${
                            task.completed ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--ink-primary)]'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10.5px] font-mono-num font-semibold"
                          style={{ backgroundColor: pMeta.bg, color: pMeta.color }}
                        >
                          {pMeta.short}
                        </span>
                        {task.tags.map((tg) => (
                          <span
                            key={tg}
                            className="px-1.5 py-0.5 rounded text-[11px] bg-[var(--bg-elevated)] text-[var(--ink-secondary)]"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>

                      {task.notes && <p className="text-[12.5px] text-[var(--ink-secondary)] mt-1">{task.notes}</p>}

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-[var(--ink-muted)] font-mono-num">
                        {task.dueDate && <span>Due {formatReadableDate(task.dueDate)}</span>}
                        {task.scheduledDate && task.scheduledStartMinutes !== undefined && (
                          <span className="text-[var(--accent-sky)]">
                            Scheduled {formatMinutes(task.scheduledStartMinutes, true)}
                          </span>
                        )}
                        <span>{task.estimatedMinutes}m</span>
                        {task.subtasks.length > 0 && (
                          <span>
                            {doneSubs}/{task.subtasks.length} subtasks
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!task.scheduledDate && !task.completed && (
                        <button
                          type="button"
                          onClick={() => scheduleTaskToCalendar(task.id, todayKey, 16 * 60)}
                          title="Time-block on today's calendar at 4 PM"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11.5px] hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                          <span className="hidden sm:inline">Time-block</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--ink-muted)] hover:text-[var(--accent-coral)]"
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 ml-7 pl-3 border-l space-y-1.5">
                      {task.subtasks.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => toggleSubtask(task.id, st.id)}
                          className="w-full flex items-center gap-2 text-left text-[12.5px] py-1"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0"
                            style={{
                              borderColor: st.done ? 'var(--accent-emerald)' : 'var(--rule-strong)',
                              backgroundColor: st.done ? 'var(--accent-emerald)' : 'transparent',
                            }}
                          >
                            {st.done && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                          </span>
                          <span className={st.done ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--ink-secondary)]'}>
                            {st.title}
                          </span>
                        </button>
                      ))}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          addSubtask(task.id, subtaskDrafts[task.id] ?? '');
                          setSubtaskDrafts((prev) => ({ ...prev, [task.id]: '' }));
                        }}
                        className="pt-1 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={subtaskDrafts[task.id] ?? ''}
                          onChange={(e) => setSubtaskDrafts((prev) => ({ ...prev, [task.id]: e.target.value }))}
                          placeholder="Add subtask and press Enter..."
                          className="flex-1 max-w-sm px-2.5 py-1 rounded-md border bg-[var(--bg-inset)] text-[12px] focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredTasks.length === 0 && (
              <div className="p-10 text-center text-[13px] text-[var(--ink-muted)]">
                No tasks match this filter yet. Add one above using natural language.
              </div>
            )}
          </div>
        )}

        {/* MODE 2: KANBAN BOARD */}
        {taskViewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {KANBAN_COLS.map((col) => {
              const items = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData('text/cadence-kanban-task');
                    if (id) moveTaskKanban(id, col.id);
                  }}
                  className="studio-card rounded-xl p-3.5 flex flex-col min-h-[360px]"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.accent }} />
                      <h3 className="font-display font-semibold text-[13.5px]">{col.label}</h3>
                    </div>
                    <span className="font-mono-num text-[11.5px] text-[var(--ink-secondary)]">{items.length}</span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {items.map((task) => {
                      const pMeta = PRIORITY_META[task.priority];
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/cadence-kanban-task', task.id)}
                          onClick={() => setSelection({ type: 'task', id: task.id })}
                          className="p-3 rounded-lg border bg-[var(--bg-elevated)]/80 hover:border-[var(--rule-strong)] cursor-grab active:cursor-grabbing space-y-2"
                          style={{ boxShadow: 'var(--surface-sheen)' }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[13px] font-medium leading-snug">{task.title}</span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono-num font-semibold shrink-0"
                              style={{ backgroundColor: pMeta.bg, color: pMeta.color }}
                            >
                              {pMeta.short}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono-num text-[var(--ink-muted)]">
                            <span>{task.estimatedMinutes}m</span>
                            {task.dueDate && <span>{task.dueDate.slice(5)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODE 3: EISENHOWER PRIORITY MATRIX (Content-hugging hairline rows + bottom telemetry strip) */}
        {taskViewMode === 'matrix' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {MATRIX_QUADS.map((q) => {
                const items = filteredTasks.filter((t) => !t.completed && t.quadrant === q.id);
                return (
                  <SpotlightCard
                    key={q.id}
                    theme={isDark ? 'dark' : 'light'}
                    spotlightColor={isDark ? 'rgba(231, 64, 4, 0.11)' : 'rgba(231, 64, 4, 0.06)'}
                    intensity={isDark ? 0.1 : 0.05}
                    borderGlow={0.5}
                    onDragOver={(e: React.DragEvent) => e.preventDefault()}
                    onDrop={(e: React.DragEvent) => {
                      const id = e.dataTransfer.getData('text/cadence-matrix-task');
                      if (id) moveTaskQuadrant(id, q.id);
                    }}
                    className="studio-card rounded-2xl overflow-hidden flex flex-col"
                  >
                    <div className="px-4 py-3.5 border-b flex items-center justify-between bg-[var(--bg-elevated)]/40">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: q.accent }} />
                        <div>
                          <h3 className="font-display font-bold text-[15px] leading-tight">{q.title}</h3>
                          <p className="text-[12px] text-[var(--ink-secondary)]">{q.subtitle}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] font-mono-num text-[11.5px] text-[var(--ink-primary)]">
                        {items.length}
                      </span>
                    </div>

                    <div className="divide-y">
                      {items.map((task) => {
                        const doneSubs = task.subtasks.filter((s) => s.done).length;
                        const isOverdue = Boolean(task.dueDate && task.dueDate < todayKey);
                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/cadence-matrix-task', task.id)}
                            className="group flex items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--bg-hover)]/45 cursor-grab active:cursor-grabbing transition-colors"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <button
                                type="button"
                                onClick={() => toggleTaskComplete(task.id)}
                                className="mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                                style={{ borderColor: q.accent }}
                                aria-label={`Complete ${task.title}`}
                              />
                              <div className="min-w-0">
                                <p
                                  className="text-[13.5px] font-medium leading-snug"
                                  style={{ color: isOverdue ? 'var(--accent-coral)' : 'var(--ink-primary)' }}
                                >
                                  {task.title}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-mono-num">
                                  <span className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--ink-secondary)]">
                                    {task.estimatedMinutes}m
                                  </span>
                                  {task.dueDate && (
                                    <span
                                      className="px-1.5 py-0.5 rounded"
                                      style={{
                                        backgroundColor: isOverdue ? 'var(--accent-coral-soft)' : 'var(--bg-elevated)',
                                        color: isOverdue ? 'var(--accent-coral)' : 'var(--ink-secondary)',
                                      }}
                                    >
                                      {isOverdue ? `Overdue ${task.dueDate.slice(5)}` : `Due ${task.dueDate.slice(5)}`}
                                    </span>
                                  )}
                                  {task.subtasks.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--ink-secondary)]">
                                      {doneSubs}/{task.subtasks.length} subtasks
                                    </span>
                                  )}
                                  {task.tags.slice(0, 2).map((tg) => (
                                    <span
                                      key={tg}
                                      className="px-1.5 py-0.5 rounded bg-[var(--bg-inset)] text-[var(--ink-secondary)]"
                                    >
                                      #{tg}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!task.scheduledDate && (
                                <button
                                  type="button"
                                  onClick={() => scheduleTaskToCalendar(task.id, todayKey, 15 * 60)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-[var(--ink-secondary)] group-hover:text-[var(--ink-primary)] bg-[var(--bg-elevated)]/60 group-hover:bg-[var(--bg-elevated)] transition-colors"
                                  title="Block onto today's calendar"
                                >
                                  <CalendarPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                                  <span className="hidden xl:inline opacity-75 group-hover:opacity-100">Block</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form
                      onSubmit={(e) => handleQuadAdd(q.id, e)}
                      className="px-4 py-2.5 border-t bg-[var(--bg-inset)]/45"
                    >
                      <input
                        type="text"
                        value={quadDrafts[q.id] ?? ''}
                        onChange={(e) => setQuadDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder={`+ Add directly to ${q.title}...`}
                        className="w-full bg-transparent text-[12px] text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)]/75 focus:outline-none"
                      />
                    </form>
                  </SpotlightCard>
                );
              })}
            </div>

            <div className="studio-card rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--ink-secondary)]">
              <span>Drag any task row between quadrants to reprioritize or click Block to schedule onto today&apos;s timeline.</span>
              <span className="font-mono-num text-[var(--ink-muted)]">
                {filteredTasks.filter((t) => !t.completed).length} active ·{' '}
                {filteredTasks.filter((t) => !t.completed && t.scheduledDate).length} time-blocked
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
