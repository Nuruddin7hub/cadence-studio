import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CalendarPlus,
  Check,
  Clock,
  Columns3,
  Filter,
  Grid2x2,
  ListTodo,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { EisenhowerQuadrant, TaskPriority, TaskStatus, TaskViewMode } from '../types/workspace';
import {
  addDays,
  formatDurationHuman,
  formatMinutes,
  formatReadableDate,
  minutesToTimeInput,
  timeInputToMinutes,
} from '../utils/date';
import { CUSTOM_COLOR_SWATCHES, PRIORITY_META } from '../utils/themeTokens';
import { AnimatedContent, GlareHover, RubberSegment, SpotlightCard, SpringCheck } from '../lib/reactbits';
import { DurationSelector } from './CustomOptionControls';

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
    toggleTaskComplete,
    toggleSubtask,
    addSubtask,
    deleteTask,
    scheduleTaskToCalendar,
    moveTaskKanban,
    moveTaskQuadrant,
    setSelection,
    setMobileInspectorOpen,
    importStarterChecklist,
    pushToast,
    addEvent,
    customTaskLists,
    addCustomTaskList,
    updateTask,
    unscheduleTaskFromCalendar,
  } = useWorkspace();

  const [draft, setDraft] = useState('');
  const [draftDueDate, setDraftDueDate] = useState<string>(todayKey);
  const [draftStartTime, setDraftStartTime] = useState<string>('');
  const [draftWorkMinutes, setDraftWorkMinutes] = useState<number>(30);
  const [draftPriority, setDraftPriority] = useState<TaskPriority>('p2');
  const [draftListId, setDraftListId] = useState<string>(
    activeList !== 'today' &&
      activeList !== 'inbox' &&
      activeList !== 'upcoming' &&
      activeList !== 'overdue' &&
      activeList !== 'completed'
      ? activeList
      : 'inbox'
  );
  const [draftAddToCalendar, setDraftAddToCalendar] = useState<boolean>(true);
  const [draftCustomWorkOpen, setDraftCustomWorkOpen] = useState(false);
  const [draftCustomWorkName, setDraftCustomWorkName] = useState('');
  const [draftCustomWorkColor, setDraftCustomWorkColor] = useState(CUSTOM_COLOR_SWATCHES[0]);
  const [customListOpen, setCustomListOpen] = useState(false);
  const [customListTitle, setCustomListTitle] = useState('');
  const [customListColor, setCustomListColor] = useState(CUSTOM_COLOR_SWATCHES[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<string, string>>({});
  const [quadDrafts, setQuadDrafts] = useState<Record<string, string>>({});
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const isDark = snapshot.preferences.theme === 'dark';

  const allTags = useMemo(() => {
    const set = new Set<string>();
    snapshot.tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [snapshot.tasks]);

  const listLabelMap = useMemo(() => {
    const map: Record<string, { label: string; color: string }> = {
      inbox: { label: 'Inbox', color: '#848F9F' },
      work: { label: 'Product & Eng', color: '#E74004' },
      design: { label: 'Design', color: '#14A4FC' },
      personal: { label: 'Personal', color: '#F4C46C' },
    };
    for (const cl of customTaskLists) {
      map[cl.id] = { label: cl.label, color: cl.color };
    }
    return map;
  }, [customTaskLists]);

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
    const clean = draft.trim();
    if (!clean) return;
    const startMins = draftStartTime ? timeInputToMinutes(draftStartTime) : null;
    const targetDate = draftDueDate || undefined;
    const quadrantMap: Record<TaskPriority, EisenhowerQuadrant> = {
      p1: 'do',
      p2: 'schedule',
      p3: 'delegate',
      p4: 'eliminate',
    };
    const isCustomList = !['inbox', 'work', 'design', 'personal'].includes(draftListId);
    const customListMeta = isCustomList ? listLabelMap[draftListId] : undefined;

    const created = addTask({
      title: clean,
      listId: draftListId || 'inbox',
      priority: draftPriority,
      status: targetDate === todayKey ? 'todo' : 'backlog',
      quadrant: quadrantMap[draftPriority],
      dueDate: targetDate,
      scheduledDate: startMins !== null && draftAddToCalendar ? (targetDate ?? todayKey) : undefined,
      scheduledStartMinutes: startMins !== null && draftAddToCalendar ? startMins : undefined,
      estimatedMinutes: Math.max(5, Math.min(720, draftWorkMinutes)),
      customLabel: customListMeta?.label,
      customColor: customListMeta?.color,
      tags: [],
      subtasks: [],
      recurrence: 'none',
      completed: false,
    });

    if (startMins !== null && draftAddToCalendar) {
      addEvent({
        title: clean,
        date: targetDate ?? todayKey,
        startMinutes: startMins,
        durationMinutes: Math.max(15, Math.min(720, draftWorkMinutes)),
        category: isCustomList ? 'custom' : 'deep',
        customLabel: customListMeta?.label,
        customColor: customListMeta?.color,
        calendarId: isCustomList ? 'custom' : draftListId === 'personal' ? 'personal' : 'work',
        recurrence: 'none',
        linkedTaskId: created.id,
      });
    } else {
      pushToast('Task added', clean, true, 'success');
    }

    setDraft('');
    setDraftStartTime('');
  };

  const handleCreateCustomWorkList = () => {
    const clean = customListTitle.trim();
    if (!clean) return;
    const created = addCustomTaskList(clean, customListColor);
    setActiveList(created.id);
    setDraftListId(created.id);
    setCustomListTitle('');
    setCustomListOpen(false);
  };

  const handleSaveComposerCustomWork = () => {
    const clean = draftCustomWorkName.trim();
    if (!clean) return;
    const created = addCustomTaskList(clean, draftCustomWorkColor);
    setDraftListId(created.id);
    setDraftCustomWorkName('');
    setDraftCustomWorkOpen(false);
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
              Pick your date, start time, work length, and work area with simple visual controls.
            </p>
          </div>

          <div className="sm:hidden grid grid-cols-3 rounded-lg border bg-[var(--bg-inset)] p-0.5 w-full">
            {([
              ['list', 'List'],
              ['kanban', 'Kanban'],
              ['matrix', 'Matrix'],
            ] as [TaskViewMode, string][]).map(([id, shortLabel]) => {
              const active = taskViewMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTaskViewMode(id)}
                  className="py-1.5 rounded-md text-[12px] font-medium transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                    color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                    boxShadow: active ? 'inset 0 0 0 1px var(--rule-hairline)' : 'none',
                  }}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block">
            <RubberSegment
              items={[
                { value: 'list', label: 'Smart List', icon: <ListTodo className="w-3.5 h-3.5" /> },
                { value: 'kanban', label: 'Kanban Board', icon: <Columns3 className="w-3.5 h-3.5" /> },
                { value: 'matrix', label: 'Eisenhower Matrix', icon: <Grid2x2 className="w-3.5 h-3.5" /> },
              ]}
              value={taskViewMode}
              onChange={(val: string) => setTaskViewMode(val as TaskViewMode)}
              size="sm"
              equalSlots={false}
              radius={10}
              stretch={34}
              squash={22}
              trackColor={isDark ? '#151821' : '#eaedf3'}
              thumbColor={isDark ? '#242938' : '#ffffff'}
              textColor={isDark ? '#b4bccb' : '#4b5563'}
              activeTextColor={isDark ? '#ffffff' : '#0f1115'}
              ariaLabel="Task workspace layout mode"
              className="border"
            />
          </div>
        </div>

        {/* Friendly Visual Task Composer + Search & Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-8 studio-card p-3.5 rounded-2xl space-y-3 focus-within:border-[var(--accent-primary)]"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a task (e.g. Finish presentation)"
                className="flex-1 min-w-0 bg-transparent text-[13.5px] font-medium text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
              />
              <GlareHover glareColor="#ffffff" glareOpacity={0.22} borderRadius="8px" className="inline-flex shrink-0">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white shrink-0 transition-colors"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Add task
                </button>
              </GlareHover>
            </div>

            {/* Plain-English Date, Time, Work Length & Label Controls (no coding syntax required!) */}
            <div className="pt-2.5 border-t border-[var(--rule-hairline)] space-y-2.5 text-[11.5px]">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 bg-[var(--bg-inset)] rounded-lg p-0.5 border border-[var(--rule-hairline)]">
                  <Calendar className="w-3.5 h-3.5 text-[var(--ink-muted)] ml-1.5" />
                  <button
                    type="button"
                    aria-label="Set due date to Today"
                    onClick={() => setDraftDueDate(todayKey)}
                    className="px-2 py-1 rounded-md font-medium transition-colors"
                    style={{
                      backgroundColor: draftDueDate === todayKey ? 'var(--bg-elevated)' : 'transparent',
                      color: draftDueDate === todayKey ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                    }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    aria-label="Set due date to Tomorrow"
                    onClick={() => setDraftDueDate(addDays(todayKey, 1))}
                    className="px-2 py-1 rounded-md font-medium transition-colors"
                    style={{
                      backgroundColor:
                        draftDueDate === addDays(todayKey, 1) ? 'var(--bg-elevated)' : 'transparent',
                      color:
                        draftDueDate === addDays(todayKey, 1) ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                    }}
                  >
                    Tomorrow
                  </button>
                  <input
                    type="date"
                    value={draftDueDate}
                    onChange={(e) => setDraftDueDate(e.target.value)}
                    aria-label="Task due date"
                    className="px-1.5 py-0.5 rounded bg-transparent font-mono-num text-[11px] text-[var(--ink-primary)] focus:outline-none"
                  />
                  {draftDueDate && (
                    <button
                      type="button"
                      onClick={() => setDraftDueDate('')}
                      className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
                      aria-label="Clear date"
                      title="No fixed date"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-inset)] border border-[var(--rule-hairline)]">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                  <span className="text-[var(--ink-secondary)]">Time</span>
                  <input
                    type="time"
                    value={draftStartTime}
                    onChange={(e) => setDraftStartTime(e.target.value)}
                    aria-label="Task start time"
                    className="bg-transparent font-mono-num text-[11.5px] text-[var(--ink-primary)] focus:outline-none"
                  />
                  {draftStartTime && (
                    <>
                      <label className="inline-flex items-center gap-1 text-[11px] text-[var(--ink-secondary)] pl-1 border-l border-[var(--rule-hairline)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draftAddToCalendar}
                          onChange={(e) => setDraftAddToCalendar(e.target.checked)}
                          className="rounded border"
                        />
                        <span>On Calendar</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setDraftStartTime('')}
                        className="p-0.5 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
                        aria-label="Clear start time"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>

                <select
                  value={draftPriority}
                  onChange={(e) => setDraftPriority(e.target.value as TaskPriority)}
                  aria-label="Task priority"
                  className="px-2.5 py-1 rounded-lg border bg-[var(--bg-inset)] text-[11.5px] font-medium text-[var(--ink-primary)]"
                >
                  <option value="p1">Priority: Critical</option>
                  <option value="p2">Priority: High</option>
                  <option value="p3">Priority: Normal</option>
                  <option value="p4">Priority: Low</option>
                </select>

                <div className="inline-flex items-center gap-1">
                  <select
                    value={draftListId}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setDraftCustomWorkOpen(true);
                      } else {
                        setDraftListId(e.target.value);
                      }
                    }}
                    aria-label="Task work area"
                    className="px-2.5 py-1 rounded-lg border bg-[var(--bg-inset)] text-[11.5px] font-medium text-[var(--ink-primary)]"
                  >
                    <option value="inbox">Work Area: Inbox</option>
                    <option value="work">Work Area: Product & Eng</option>
                    <option value="design">Work Area: Design</option>
                    <option value="personal">Work Area: Personal</option>
                    {customTaskLists.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        Work Area: {cl.label}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom Work Area...</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[var(--ink-secondary)] font-medium">Work length:</span>
                <DurationSelector
                  compact
                  presets={[15, 30, 45, 60, 90]}
                  value={draftWorkMinutes}
                  onChange={setDraftWorkMinutes}
                />
              </div>

              {draftCustomWorkOpen && (
                <div className="p-2.5 rounded-xl border bg-[var(--bg-inset)] flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={draftCustomWorkName}
                    onChange={(e) => setDraftCustomWorkName(e.target.value)}
                    placeholder="Custom work label (e.g. Study, Client Ops)"
                    aria-label="New custom work area name"
                    className="flex-1 min-w-[160px] px-2.5 py-1 rounded-lg border bg-[var(--bg-surface)] text-[12px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <div className="flex items-center gap-1">
                    {CUSTOM_COLOR_SWATCHES.slice(0, 6).map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setDraftCustomWorkColor(hex)}
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: hex,
                          boxShadow:
                            draftCustomWorkColor === hex
                              ? '0 0 0 2px var(--bg-surface), 0 0 0 3px var(--ink-primary)'
                              : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveComposerCustomWork}
                    className="px-2.5 py-1 rounded-lg text-[11.5px] font-semibold text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftCustomWorkOpen(false)}
                    className="px-2 py-1 rounded-lg border text-[11.5px] text-[var(--ink-secondary)]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>

          <div className="lg:col-span-4 flex items-center gap-2 relative">
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
                    {allTags.length === 0 && (
                      <p className="px-1 py-1.5 text-[11.5px] text-[var(--ink-muted)]">
                        No tags yet. Add #work or #urgent in quick capture.
                      </p>
                    )}
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

        {/* List Context Filter Row (including saved Custom lists & + Custom List) */}
        {taskViewMode === 'list' && (
          <div className="space-y-2">
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

              {customTaskLists.map((cl) => (
                <button
                  key={cl.id}
                  type="button"
                  onClick={() => setActiveList(cl.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[12px] font-medium transition-colors"
                  style={{
                    backgroundColor: activeList === cl.id ? 'var(--bg-elevated)' : 'transparent',
                    borderColor: activeList === cl.id ? cl.color : 'var(--rule-hairline)',
                    color: activeList === cl.id ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cl.color }} />
                  <span>{cl.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCustomListOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed text-[12px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--accent-primary)] transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Custom list</span>
              </button>
            </div>

            {customListOpen && (
              <div className="p-2.5 rounded-xl border bg-[var(--bg-surface)] flex flex-wrap items-center gap-2 max-w-lg">
                <input
                  type="text"
                  value={customListTitle}
                  onChange={(e) => setCustomListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCustomWorkList();
                    }
                  }}
                  placeholder="New list name (e.g. University, Client Work)"
                  aria-label="Custom task list name"
                  className="flex-1 min-w-[170px] px-2.5 py-1 rounded-lg border bg-[var(--bg-inset)] text-[12px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
                <div className="flex items-center gap-1">
                  {CUSTOM_COLOR_SWATCHES.slice(0, 6).map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setCustomListColor(hex)}
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: hex,
                        boxShadow:
                          customListColor === hex
                            ? '0 0 0 2px var(--bg-surface), 0 0 0 3px var(--ink-primary)'
                            : 'none',
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreateCustomWorkList}
                  className="px-2.5 py-1 rounded-lg text-[11.5px] font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Save List
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 1: SMART LIST */}
        {taskViewMode === 'list' && (
          <AnimatedContent
            key={`list-${activeList}-${tagFilter ?? 'all'}`}
            trigger="load"
            distance={10}
            duration={0.32}
            stagger={0.03}
            ease="power2.out"
            className="studio-card rounded-xl divide-y"
          >
            {filteredTasks.map((task) => {
              const pMeta = PRIORITY_META[task.priority];
              const isExpanded = expandedId === task.id;
              const doneSubs = task.subtasks.filter((s) => s.done).length;

              return (
                <div key={task.id} className="p-3.5 hover:bg-[var(--bg-hover)]/35 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <SpringCheck
                        checked={task.completed}
                        onChange={() => toggleTaskComplete(task.id)}
                        label=""
                        strike="none"
                        boxSize={18}
                        boxRadius={5}
                        color="var(--ink-primary)"
                        fillColor={pMeta.color}
                        checkColor="#ffffff"
                        ariaLabel={`Complete ${task.title}`}
                        className="[&]:min-h-0 [&]:gap-0"
                      />
                    </div>

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
                          className="px-1.5 py-0.5 rounded text-[10.5px] font-medium"
                          style={{ backgroundColor: pMeta.bg, color: pMeta.color }}
                        >
                          {pMeta.label.replace(/\s*\(P\d\)/, '')}
                        </span>
                        {listLabelMap[task.listId] && task.listId !== 'inbox' && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium bg-[var(--bg-elevated)] text-[var(--ink-secondary)]"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: listLabelMap[task.listId].color }}
                            />
                            <span>{listLabelMap[task.listId].label}</span>
                          </span>
                        )}
                        {task.tags.map((tg) => (
                          <span
                            key={tg}
                            className="px-1.5 py-0.5 rounded text-[11px] bg-[var(--bg-elevated)] text-[var(--ink-secondary)]"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>

                      {task.notes && <p className="text-[12.5px] text-[var(--ink-secondary)] mt-1">{task.notes}</p>}

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-[var(--ink-muted)]">
                        {task.dueDate && <span>Due {formatReadableDate(task.dueDate)}</span>}
                        {task.scheduledDate && task.scheduledStartMinutes !== undefined && (
                          <span className="text-[var(--accent-sky)] font-medium">
                            On calendar at {formatMinutes(task.scheduledStartMinutes, true)}
                          </span>
                        )}
                        <span>{formatDurationHuman(task.estimatedMinutes)} work</span>
                        {task.subtasks.length > 0 && (
                          <span>
                            {doneSubs}/{task.subtasks.length} subtasks
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (!task.scheduledDate && !task.completed) {
                            scheduleTaskToCalendar(
                              task.id,
                              task.dueDate ?? todayKey,
                              task.scheduledStartMinutes ?? 9 * 60
                            );
                          }
                          setExpandedId(task.id);
                        }}
                        title={task.scheduledDate ? 'Edit schedule & work settings' : 'Schedule onto calendar'}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11.5px] hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                        <span className="hidden sm:inline">{task.scheduledDate ? 'Edit time' : 'Schedule'}</span>
                      </button>
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
                    <div className="mt-3 ml-7 pl-3.5 border-l space-y-3">
                      {/* Friendly Inline Time, Work Length & Category Editor */}
                      <div className="p-3 rounded-xl border bg-[var(--bg-inset)] space-y-2.5 text-[11.5px]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          <label className="space-y-1">
                            <span className="text-[var(--ink-secondary)] block">Due Date</span>
                            <input
                              type="date"
                              value={task.dueDate ?? ''}
                              onChange={(e) => updateTask(task.id, { dueDate: e.target.value || undefined })}
                              className="w-full px-2 py-1 rounded-lg border bg-[var(--bg-surface)] font-mono-num text-[var(--ink-primary)]"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-[var(--ink-secondary)] block">Start Time on Calendar</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="time"
                                value={
                                  task.scheduledStartMinutes !== undefined
                                    ? minutesToTimeInput(task.scheduledStartMinutes)
                                    : ''
                                }
                                onChange={(e) => {
                                  const mins = timeInputToMinutes(e.target.value);
                                  if (mins !== null) {
                                    scheduleTaskToCalendar(task.id, task.dueDate ?? todayKey, mins);
                                  }
                                }}
                                className="flex-1 min-w-0 px-2 py-1 rounded-lg border bg-[var(--bg-surface)] font-mono-num text-[var(--ink-primary)]"
                              />
                              {task.scheduledDate && (
                                <button
                                  type="button"
                                  onClick={() => unscheduleTaskFromCalendar(task.id)}
                                  className="px-1.5 py-1 rounded border text-[10.5px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                                  title="Remove from calendar"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </label>
                          <label className="space-y-1">
                            <span className="text-[var(--ink-secondary)] block">Priority</span>
                            <select
                              value={task.priority}
                              onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                              className="w-full px-2 py-1 rounded-lg border bg-[var(--bg-surface)] text-[var(--ink-primary)]"
                            >
                              <option value="p1">Critical</option>
                              <option value="p2">High</option>
                              <option value="p3">Normal</option>
                              <option value="p4">Low</option>
                            </select>
                          </label>
                          <label className="space-y-1">
                            <span className="text-[var(--ink-secondary)] block">Work Area</span>
                            <select
                              value={task.listId}
                              onChange={(e) => {
                                const val = e.target.value;
                                const meta = listLabelMap[val];
                                const isCust = !['inbox', 'work', 'design', 'personal'].includes(val);
                                updateTask(task.id, {
                                  listId: val,
                                  customLabel: isCust ? meta?.label : undefined,
                                  customColor: isCust ? meta?.color : undefined,
                                });
                              }}
                              className="w-full px-2 py-1 rounded-lg border bg-[var(--bg-surface)] text-[var(--ink-primary)]"
                            >
                              <option value="inbox">Inbox</option>
                              <option value="work">Product & Eng</option>
                              <option value="design">Design</option>
                              <option value="personal">Personal</option>
                              {customTaskLists.map((cl) => (
                                <option key={cl.id} value={cl.id}>
                                  {cl.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="text-[var(--ink-secondary)]">Work length:</span>
                          <DurationSelector
                            compact
                            presets={[15, 30, 45, 60, 90]}
                            value={task.estimatedMinutes}
                            onChange={(mins) => updateTask(task.id, { estimatedMinutes: mins })}
                          />
                        </div>
                      </div>

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
              <div className="p-8 sm:p-10 text-center space-y-3">
                <p className="text-[13px] text-[var(--ink-muted)]">
                  No tasks match this view yet. Add a task above and pick its date, start time, or work length visually.
                </p>
                {snapshot.tasks.length === 0 && (
                  <button
                    type="button"
                    onClick={importStarterChecklist}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium text-[var(--accent-primary)] hover:bg-[var(--bg-hover)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add optional 3-task starter checklist</span>
                  </button>
                )}
              </div>
            )}
          </AnimatedContent>
        )}

        {/* MODE 2: KANBAN BOARD */}
        {taskViewMode === 'kanban' && (
          <AnimatedContent
            key="kanban-grid"
            trigger="load"
            distance={14}
            duration={0.34}
            stagger={0.05}
            ease="back.out(1.2)"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          >
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
                          onClick={() => {
                            setSelection({ type: 'task', id: task.id });
                            setMobileInspectorOpen(true);
                          }}
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
                          <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--ink-muted)]">
                            <span>{formatDurationHuman(task.estimatedMinutes)}{task.dueDate ? ` · ${task.dueDate.slice(5)}` : ''}</span>
                            <select
                              value={task.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => moveTaskKanban(task.id, e.target.value as TaskStatus)}
                              aria-label={`Move ${task.title} column`}
                              className="xl:hidden px-1.5 py-0.5 rounded border bg-[var(--bg-inset)] text-[10.5px] font-sans text-[var(--ink-secondary)]"
                            >
                              <option value="backlog">Backlog</option>
                              <option value="todo">Planned Today</option>
                              <option value="in_progress">In Focus</option>
                              <option value="done">Completed</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </AnimatedContent>
        )}

        {/* MODE 3: EISENHOWER PRIORITY MATRIX (Content-hugging hairline rows + bottom telemetry strip) */}
        {taskViewMode === 'matrix' && (
          <div className="space-y-4">
            <AnimatedContent
              key="matrix-grid"
              trigger="load"
              distance={14}
              duration={0.34}
              stagger={0.05}
              ease="back.out(1.2)"
              className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
            >
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
                              <div className="mt-0.5 shrink-0">
                                <SpringCheck
                                  checked={task.completed}
                                  onChange={() => toggleTaskComplete(task.id)}
                                  label=""
                                  strike="none"
                                  boxSize={16}
                                  boxRadius={4}
                                  color="var(--ink-primary)"
                                  fillColor={q.accent}
                                  checkColor="#ffffff"
                                  ariaLabel={`Complete ${task.title}`}
                                  className="[&]:min-h-0 [&]:gap-0"
                                />
                              </div>
                              <div
                                className="min-w-0 cursor-pointer"
                                onClick={() => {
                                  setSelection({ type: 'task', id: task.id });
                                  setMobileInspectorOpen(true);
                                }}
                              >
                                <p
                                  className="text-[13.5px] font-medium leading-snug"
                                  style={{ color: isOverdue ? 'var(--accent-coral)' : 'var(--ink-primary)' }}
                                >
                                  {task.title}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                                  <span className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--ink-secondary)]">
                                    {formatDurationHuman(task.estimatedMinutes)}
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
            </AnimatedContent>

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
