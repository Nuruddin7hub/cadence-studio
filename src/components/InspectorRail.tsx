import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CalendarPlus,
  Check,
  Copy,
  Maximize2,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { EventCategory, RecurrenceRule, TaskPriority } from '../types/workspace';
import { formatMinutes, formatTimeRange } from '../utils/date';
import { EVENT_CATEGORY_STYLES, PRIORITY_META } from '../utils/themeTokens';

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const InspectorRail: React.FC = () => {
  const {
    snapshot,
    selectedDate,
    selection,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleSubtask,
    addSubtask,
    scheduleTaskToCalendar,
    focusMode,
    setFocusMode,
    focusSecondsLeft,
    focusRunning,
    setFocusRunning,
    resetFocusTimer,
    setFocusCurtainOpen,
    activeFocusTaskId,
    setActiveFocusTaskId,
    updateDailyNote,
    extractLineToTask,
  } = useWorkspace();

  const [collapsed, setCollapsed] = useState(false);
  const [railTab, setRailTab] = useState<'inspect' | 'notes'>('inspect');
  const [newSubtask, setNewSubtask] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedEvent = useMemo(
    () => (selection?.type === 'event' ? snapshot.events.find((e) => e.id === selection.id) : undefined),
    [selection, snapshot.events]
  );

  const selectedTask = useMemo(() => {
    if (selection?.type === 'task') return snapshot.tasks.find((t) => t.id === selection.id);
    if (selectedEvent?.linkedTaskId) return snapshot.tasks.find((t) => t.id === selectedEvent.linkedTaskId);
    return undefined;
  }, [selection, selectedEvent, snapshot.tasks]);

  const dailyNote = snapshot.notes[selectedDate] ?? {
    date: selectedDate,
    content: '',
    mood: 4,
    energy: 4,
    extractedLines: [],
  };

  const noteLines = useMemo(
    () => dailyNote.content.split('\n').map((l) => l.trim()).filter(Boolean),
    [dailyNote.content]
  );

  const totalFocusMinutes =
    (focusMode === 'focus'
      ? snapshot.preferences.focusMinutes
      : focusMode === 'short_break'
        ? snapshot.preferences.shortBreakMinutes
        : snapshot.preferences.longBreakMinutes) * 60;
  const progress = Math.max(0, Math.min(1, 1 - focusSecondsLeft / Math.max(1, totalFocusMinutes)));
  const activeTaskObj = snapshot.tasks.find((t) => t.id === activeFocusTaskId);

  if (collapsed) {
    return (
      <aside className="hidden xl:flex w-11 shrink-0 border-l bg-[var(--bg-surface)] flex-col items-center py-3 gap-3">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
          title="Expand inspector"
          aria-label="Expand inspector"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="hidden xl:flex w-[264px] shrink-0 border-l bg-[var(--bg-surface)] flex-col overflow-hidden"
      style={{ borderColor: 'var(--rule-hairline)' }}
    >
      {/* Compact Docked Focus Mini-Engine */}
      <section className="p-3 border-b shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
            <h3 className="font-display font-semibold text-[13px]">Focus Timer</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFocusCurtainOpen(true)}
              className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
              title="Expand Focus Curtain"
              aria-label="Expand focus mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--ink-muted)]"
              title="Collapse inspector"
              aria-label="Collapse inspector"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-inset)] mb-2.5">
          {([
            ['focus', '25m'],
            ['short_break', '5m'],
            ['long_break', '15m'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFocusMode(id)}
              className="flex-1 py-1 rounded-md text-[11px] font-mono-num font-medium transition-colors"
              style={{
                backgroundColor: focusMode === id ? 'var(--bg-elevated)' : 'transparent',
                color: focusMode === id ? 'var(--ink-primary)' : 'var(--ink-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-elevated)]/70" style={{ boxShadow: 'var(--surface-sheen)' }}>
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="23" fill="none" stroke="var(--rule-strong)" strokeWidth="3.5" />
              <circle
                cx="28"
                cy="28"
                r="23"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 23}
                strokeDashoffset={2 * Math.PI * 23 * (1 - progress)}
              />
            </svg>
            <span className="absolute font-mono-num text-[11px] font-semibold">
              {formatTimer(focusSecondsLeft)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11.5px] font-medium text-[var(--ink-primary)] line-clamp-2 leading-snug">
              {activeTaskObj ? activeTaskObj.title : 'Free focus block'}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFocusRunning(!focusRunning)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                {focusRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{focusRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                type="button"
                onClick={() => resetFocusTimer()}
                className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
                aria-label="Reset focus timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="ml-auto text-[10.5px] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
              >
                Switch
              </button>
            </div>
          </div>
        </div>

        {pickerOpen && (
          <select
            value={activeFocusTaskId ?? ''}
            onChange={(e) => {
              setActiveFocusTaskId(e.target.value || null);
              setPickerOpen(false);
            }}
            aria-label="Focus task selector"
            className="mt-2 w-full px-2 py-1 rounded-md bg-[var(--bg-inset)] text-[11px] text-[var(--ink-secondary)] focus:outline-none cursor-pointer"
          >
            <option value="">Free focus block</option>
            {snapshot.tasks
              .filter((t) => !t.completed)
              .map((t) => (
                <option key={t.id} value={t.id} className="bg-[var(--bg-surface)] text-[var(--ink-primary)]">
                  {t.title}
                </option>
              ))}
          </select>
        )}
      </section>

      {/* Inspector vs Daily Notes Switcher */}
      <div className="px-3 pt-2 pb-1.5 border-b flex items-center gap-1 shrink-0 bg-[var(--bg-inset)]/40">
        <button
          type="button"
          onClick={() => setRailTab('inspect')}
          className="flex-1 py-1 rounded-md text-[11.5px] font-medium transition-colors"
          style={{
            backgroundColor: railTab === 'inspect' ? 'var(--bg-elevated)' : 'transparent',
            color: railTab === 'inspect' ? 'var(--ink-primary)' : 'var(--ink-muted)',
            boxShadow: railTab === 'inspect' ? 'inset 0 0 0 1px var(--rule-hairline)' : 'none',
          }}
        >
          {selectedEvent ? 'Block Details' : 'Task Details'}
        </button>
        <button
          type="button"
          onClick={() => setRailTab('notes')}
          className="flex-1 py-1 rounded-md text-[11.5px] font-medium transition-colors inline-flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: railTab === 'notes' ? 'var(--bg-elevated)' : 'transparent',
            color: railTab === 'notes' ? 'var(--ink-primary)' : 'var(--ink-muted)',
            boxShadow: railTab === 'notes' ? 'inset 0 0 0 1px var(--rule-hairline)' : 'none',
          }}
        >
          <Sparkles className="w-3 h-3 text-[var(--accent-amber)]" />
          <span>Daily Notes</span>
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 pb-8">
        {railTab === 'inspect' ? (
          <div className="space-y-2.5 text-[12.5px]">
            {selectedEvent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono-num text-[var(--ink-muted)]">
                    {selectedEvent.allDay ? 'All day' : formatTimeRange(selectedEvent.startMinutes, selectedEvent.durationMinutes)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => duplicateEvent(selectedEvent.id)}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
                      title="Duplicate event"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEvent(selectedEvent.id)}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--accent-coral)]"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={selectedEvent.title}
                  onChange={(e) => updateEvent(selectedEvent.id, { title: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-inset)] font-semibold text-[var(--ink-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                />

                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-[11px] text-[var(--ink-muted)]">Date</span>
                    <input
                      type="date"
                      value={selectedEvent.date}
                      onChange={(e) => updateEvent(selectedEvent.id, { date: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-[var(--bg-inset)] font-mono-num text-[11px]"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] text-[var(--ink-muted)]">Duration</span>
                    <select
                      value={selectedEvent.durationMinutes}
                      onChange={(e) => updateEvent(selectedEvent.id, { durationMinutes: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded bg-[var(--bg-inset)] text-[11.5px]"
                    >
                      {[30, 45, 60, 90, 120, 135, 180].map((m) => (
                        <option key={m} value={m} className="bg-[var(--bg-surface)]">
                          {m} min
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex items-center justify-between text-[11.5px] text-[var(--ink-secondary)]">
                  <span>Repeat</span>
                  <select
                    value={selectedEvent.recurrence}
                    onChange={(e) => updateEvent(selectedEvent.id, { recurrence: e.target.value as RecurrenceRule })}
                    className="px-2 py-1 rounded bg-[var(--bg-inset)] text-[11px] focus:outline-none"
                  >
                    <option value="none" className="bg-[var(--bg-surface)]">No repeat</option>
                    <option value="daily" className="bg-[var(--bg-surface)]">Daily</option>
                    <option value="weekdays" className="bg-[var(--bg-surface)]">Weekdays</option>
                    <option value="weekly" className="bg-[var(--bg-surface)]">Weekly</option>
                    <option value="monthly" className="bg-[var(--bg-surface)]">Monthly</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-1 pt-0.5">
                  {(Object.keys(EVENT_CATEGORY_STYLES) as EventCategory[]).map((cat) => {
                    const m = EVENT_CATEGORY_STYLES[cat];
                    const active = selectedEvent.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updateEvent(selectedEvent.id, { category: cat })}
                        className="px-2 py-0.5 rounded-full text-[10.5px] transition-colors"
                        style={{
                          backgroundColor: active ? m.bgDark : 'var(--bg-inset)',
                          color: active ? m.bar : 'var(--ink-secondary)',
                          boxShadow: active ? `inset 0 0 0 1px ${m.bar}` : 'none',
                        }}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={2}
                  value={selectedEvent.notes ?? ''}
                  onChange={(e) => updateEvent(selectedEvent.id, { notes: e.target.value })}
                  placeholder="Block notes..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-inset)] text-[12px] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
                />
              </div>
            )}

            {selectedTask && (
              <div className="pt-2.5 border-t space-y-2">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTaskComplete(selectedTask.id)}
                    className="mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0"
                    style={{
                      borderColor: PRIORITY_META[selectedTask.priority].color,
                      backgroundColor: selectedTask.completed ? 'var(--accent-primary)' : 'transparent',
                    }}
                  >
                    {selectedTask.completed && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </button>
                  <span className="flex-1 font-medium text-[12.5px] leading-snug text-[var(--ink-primary)]">
                    {selectedTask.title}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as TaskPriority })}
                    className="px-2 py-1 rounded bg-[var(--bg-inset)] text-[11px]"
                  >
                    <option value="p1" className="bg-[var(--bg-surface)]">P1 Critical</option>
                    <option value="p2" className="bg-[var(--bg-surface)]">P2 High</option>
                    <option value="p3" className="bg-[var(--bg-surface)]">P3 Normal</option>
                    <option value="p4" className="bg-[var(--bg-surface)]">P4 Low</option>
                  </select>

                  {!selectedTask.scheduledDate && (
                    <button
                      type="button"
                      onClick={() => scheduleTaskToCalendar(selectedTask.id, selectedDate, 15 * 60)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-elevated)] text-[11px] hover:bg-[var(--bg-hover)]"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>Block {formatMinutes(15 * 60, true)}</span>
                    </button>
                  )}
                  {!selectedEvent && (
                    <button
                      type="button"
                      onClick={() => deleteTask(selectedTask.id)}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--accent-coral)]"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {selectedTask.subtasks.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleSubtask(selectedTask.id, st.id)}
                      className="w-full flex items-center gap-2 text-left py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] text-[11.5px]"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: st.done ? 'var(--accent-emerald)' : 'transparent',
                          borderColor: st.done ? 'var(--accent-emerald)' : 'var(--rule-strong)',
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
                      addSubtask(selectedTask.id, newSubtask);
                      setNewSubtask('');
                    }}
                    className="pt-1"
                  >
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="+ Add subtask"
                      className="w-full px-2.5 py-1.5 rounded-md bg-[var(--bg-inset)] text-[11.5px] placeholder:text-[var(--ink-muted)] focus:outline-none"
                    />
                  </form>
                </div>
              </div>
            )}

            {!selectedEvent && !selectedTask && (
              <p className="text-[12px] text-[var(--ink-muted)] py-4 text-center">
                Select any calendar block or task to edit schedule, recurrence, and subtasks.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[var(--ink-secondary)]">Journal entry</span>
              <span className="font-mono-num text-[11px] text-[var(--ink-muted)]">{selectedDate}</span>
            </div>

            <textarea
              rows={6}
              value={dailyNote.content}
              onChange={(e) => updateDailyNote(selectedDate, { content: e.target.value })}
              placeholder="Jot down thoughts, decisions, or meeting action items..."
              className="w-full px-2.5 py-2 rounded-lg bg-[var(--bg-inset)] text-[12px] leading-relaxed text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
            />

            {noteLines.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-[var(--ink-muted)]">Send line to To-Do Inbox:</p>
                {noteLines.map((line, i) => {
                  const extracted = dailyNote.extractedLines.includes(line);
                  return (
                    <button
                      key={`${i}-${line.slice(0, 10)}`}
                      type="button"
                      disabled={extracted}
                      onClick={() => extractLineToTask(selectedDate, line)}
                      className="w-full flex items-start justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-left text-[11.5px] transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-45"
                    >
                      <span className="text-[var(--ink-secondary)] leading-snug">{line}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--accent-amber)]" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
