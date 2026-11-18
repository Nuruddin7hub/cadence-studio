import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CalendarPlus,
  Check,
  Copy,
  Maximize2,
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

  const [newSubtask, setNewSubtask] = useState('');

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

  return (
    <aside
      className="hidden xl:flex w-[308px] shrink-0 border-l bg-[var(--bg-surface)] flex-col overflow-y-auto"
      style={{ borderColor: 'var(--rule-hairline)' }}
    >
      {/* Docked Focus Timer Engine */}
      <section className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
            <h3 className="font-display font-semibold text-[13px]">Focus Timer</h3>
          </div>
          <button
            type="button"
            onClick={() => setFocusCurtainOpen(true)}
            className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
            title="Expand full-screen Focus Curtain"
            aria-label="Expand focus mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg border bg-[var(--bg-inset)] mb-3">
          {([
            ['focus', 'Focus'],
            ['short_break', 'Short Break'],
            ['long_break', 'Deep Rest'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFocusMode(id)}
              className="flex-1 py-1 rounded-md text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: focusMode === id ? 'var(--bg-elevated)' : 'transparent',
                color: focusMode === id ? 'var(--ink-primary)' : 'var(--ink-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-[var(--bg-elevated)]/65">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="23"
                fill="none"
                stroke="var(--rule-strong)"
                strokeWidth="3.5"
              />
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
            <span className="absolute font-mono-num text-[11.5px] font-semibold">
              {formatTimer(focusSecondsLeft)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <select
              value={activeFocusTaskId ?? ''}
              onChange={(e) => setActiveFocusTaskId(e.target.value || null)}
              aria-label="Focus task selector"
              className="w-full text-[12px] font-medium bg-transparent text-[var(--ink-primary)] truncate focus:outline-none cursor-pointer"
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
            <p className="text-[11px] text-[var(--ink-muted)] mt-0.5 truncate">
              {activeTaskObj ? `${activeTaskObj.estimatedMinutes}m planned` : 'No task attached'}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFocusRunning(!focusRunning)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                {focusRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{focusRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                type="button"
                onClick={() => resetFocusTimer()}
                className="p-1.5 rounded-md border hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
                aria-label="Reset focus timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Event or Task Inspector */}
      <section className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-[13px]">
            {selectedEvent ? 'Block Inspector' : selectedTask ? 'Task Inspector' : 'Inspector'}
          </h3>
          {selectedEvent && (
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
          )}
          {!selectedEvent && selectedTask && (
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

        {selectedEvent ? (
          <div className="space-y-2.5 text-[12.5px]">
            <input
              type="text"
              value={selectedEvent.title}
              onChange={(e) => updateEvent(selectedEvent.id, { title: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border bg-[var(--bg-inset)] font-semibold text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-[11px] text-[var(--ink-muted)]">Date</span>
                <input
                  type="date"
                  value={selectedEvent.date}
                  onChange={(e) => updateEvent(selectedEvent.id, { date: e.target.value })}
                  className="w-full px-2 py-1 rounded border bg-[var(--bg-inset)] font-mono-num text-[11.5px]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-[var(--ink-muted)]">Duration</span>
                <select
                  value={selectedEvent.durationMinutes}
                  onChange={(e) => updateEvent(selectedEvent.id, { durationMinutes: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded border bg-[var(--bg-inset)] text-[12px]"
                >
                  {[30, 45, 60, 90, 120, 135, 180].map((m) => (
                    <option key={m} value={m} className="bg-[var(--bg-surface)]">
                      {m} min
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between text-[11.5px] text-[var(--ink-secondary)] px-1">
              <span className="font-mono-num">
                {selectedEvent.allDay ? 'All day' : formatTimeRange(selectedEvent.startMinutes, selectedEvent.durationMinutes)}
              </span>
              <select
                value={selectedEvent.recurrence}
                onChange={(e) => updateEvent(selectedEvent.id, { recurrence: e.target.value as RecurrenceRule })}
                className="bg-transparent text-[11.5px] text-[var(--ink-secondary)] focus:outline-none"
              >
                <option value="none" className="bg-[var(--bg-surface)]">No repeat</option>
                <option value="daily" className="bg-[var(--bg-surface)]">Daily</option>
                <option value="weekdays" className="bg-[var(--bg-surface)]">Weekdays</option>
                <option value="weekly" className="bg-[var(--bg-surface)]">Weekly</option>
                <option value="monthly" className="bg-[var(--bg-surface)]">Monthly</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-1">
              {(Object.keys(EVENT_CATEGORY_STYLES) as EventCategory[]).map((cat) => {
                const m = EVENT_CATEGORY_STYLES[cat];
                const active = selectedEvent.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateEvent(selectedEvent.id, { category: cat })}
                    className="px-2 py-0.5 rounded-full text-[11px] border"
                    style={{
                      borderColor: active ? m.bar : 'var(--rule-hairline)',
                      color: active ? m.bar : 'var(--ink-muted)',
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
              placeholder="Meeting notes or block checklist..."
              className="w-full px-2.5 py-1.5 rounded-lg border bg-[var(--bg-inset)] text-[12px] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        ) : null}

        {selectedTask && (
          <div className="pt-2 border-t space-y-2.5 text-[12.5px]">
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
              <input
                type="text"
                value={selectedTask.title}
                onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
                className="flex-1 bg-transparent font-medium text-[var(--ink-primary)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <select
                value={selectedTask.priority}
                onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as TaskPriority })}
                className="px-2 py-1 rounded border bg-[var(--bg-inset)] text-[11.5px]"
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
                  className="inline-flex items-center gap-1 px-2 py-1 rounded border text-[11.5px] hover:bg-[var(--bg-hover)]"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>Block {formatMinutes(15 * 60, true)}</span>
                </button>
              )}
            </div>

            {/* Subtasks */}
            <div className="space-y-1">
              {selectedTask.subtasks.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => toggleSubtask(selectedTask.id, st.id)}
                  className="w-full flex items-center gap-2 text-left py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] text-[12px]"
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
                className="flex items-center gap-1.5 pt-1"
              >
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="+ Add subtask"
                  className="flex-1 px-2 py-1 rounded border bg-[var(--bg-inset)] text-[11.5px] placeholder:text-[var(--ink-muted)] focus:outline-none"
                />
              </form>
            </div>
          </div>
        )}

        {!selectedEvent && !selectedTask && (
          <p className="text-[12px] text-[var(--ink-muted)] py-2">
            Click any calendar block or task to inspect details, recurrence, and subtasks.
          </p>
        )}
      </section>

      {/* Daily Reflection & One-Click Action Extractor (Amie + Superlist style) */}
      <section className="p-4 space-y-2.5 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-[13px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
            <span>Daily Notes</span>
          </h3>
          <span className="font-mono-num text-[11px] text-[var(--ink-muted)]">{selectedDate}</span>
        </div>

        <textarea
          rows={4}
          value={dailyNote.content}
          onChange={(e) => updateDailyNote(selectedDate, { content: e.target.value })}
          placeholder="Jot down thoughts, decisions, or meeting action items..."
          className="w-full px-2.5 py-2 rounded-lg border bg-[var(--bg-inset)] text-[12px] leading-relaxed text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
        />

        {noteLines.length > 0 && (
          <div className="space-y-1">
            <p className="text-[11px] text-[var(--ink-muted)]">Convert line to To-Do:</p>
            {noteLines.slice(0, 3).map((line, i) => {
              const extracted = dailyNote.extractedLines.includes(line);
              return (
                <button
                  key={`${i}-${line.slice(0, 10)}`}
                  type="button"
                  disabled={extracted}
                  onClick={() => extractLineToTask(selectedDate, line)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-md border text-left text-[11.5px] transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-45"
                >
                  <span className="truncate text-[var(--ink-secondary)]">{line}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[var(--accent-amber)]" />
                </button>
              );
            })}
          </div>
        )}
      </section>
    </aside>
  );
};
