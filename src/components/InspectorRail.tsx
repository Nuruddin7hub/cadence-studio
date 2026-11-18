import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CalendarPlus,
  Clock,
  Copy,
  Maximize2,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { CalendarEvent, EisenhowerQuadrant, RecurrenceRule, TaskPriority, TaskStatus } from '../types/workspace';
import { formatDurationHuman, formatMinutes, formatTimeRange, minutesToTimeInput, timeInputToMinutes } from '../utils/date';
import { PRIORITY_META } from '../utils/themeTokens';
import { CategoryLabelSelector, DurationSelector } from './CustomOptionControls';
import {
  AnimatedContent,
  Counter,
  ElectricBorder,
  GlareHover,
  RubberSegment,
  ShinyText,
  SpotlightCard,
  SpringCheck,
} from '../lib/reactbits';

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
    unscheduleTaskFromCalendar,
    customLabels,
    customTaskLists,
    saveCustomLabel,
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
  const isDark = snapshot.preferences.theme === 'dark';
  const focusMins = Math.floor(focusSecondsLeft / 60);
  const focusSecs = focusSecondsLeft % 60;

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
            <span className="relative flex h-2 w-2">
              {focusRunning && (
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75" />
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-primary)]" />
            </span>
            <h3 className="font-display font-semibold text-[13px]">
              {focusRunning ? (
                <ShinyText text="Focus Active" color="var(--ink-primary)" shineColor="#E74004" speed={2.2} />
              ) : (
                'Focus Timer'
              )}
            </h3>
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

        <div className="mb-2.5">
          <RubberSegment
            items={[
              { value: 'focus', label: `${snapshot.preferences.focusMinutes}m` },
              { value: 'short_break', label: `${snapshot.preferences.shortBreakMinutes}m` },
              { value: 'long_break', label: `${snapshot.preferences.longBreakMinutes}m` },
            ]}
            value={focusMode}
            onChange={(val: string) => setFocusMode(val as 'focus' | 'short_break' | 'long_break')}
            size="sm"
            equalSlots
            radius={9}
            stretch={32}
            squash={20}
            trackColor={isDark ? '#151821' : '#eaedf3'}
            thumbColor={isDark ? '#242938' : '#ffffff'}
            textColor={isDark ? '#adb6c4' : '#4b5563'}
            activeTextColor={isDark ? '#ffffff' : '#0f1115'}
            ariaLabel="Inspector timer interval"
            className="w-full border"
          />
        </div>

        <ElectricBorder
          active={focusRunning}
          color="#E74004"
          speed={1.55}
          chaos={0.24}
          strands={2}
          intensity={0.95}
          glow={0.5}
          thickness={1.2}
          borderRadius={12}
          theme={isDark ? 'dark' : 'light'}
        >
          <div
            className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-elevated)]/90 border"
            style={{
              borderColor: focusRunning ? 'rgba(231, 64, 4, 0.35)' : 'var(--rule-hairline)',
              boxShadow: 'var(--surface-sheen)',
            }}
          >
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
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inline-flex items-center font-mono-num text-[11px] font-bold text-[var(--ink-primary)]">
                <Counter value={focusMins} minDigits={2} fontSize={11} fontWeight={700} textColor="var(--ink-primary)" intro={false} fade={0} motionBlur={false} duration={0.28} />
                <span className="text-[var(--accent-primary)]">:</span>
                <Counter value={focusSecs} minDigits={2} fontSize={11} fontWeight={700} textColor="var(--ink-primary)" intro={false} fade={0} motionBlur={false} duration={0.28} />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11.5px] font-medium text-[var(--ink-primary)] line-clamp-2 leading-snug">
                {activeTaskObj ? activeTaskObj.title : 'Free focus block'}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <GlareHover glareColor="#ffffff" glareOpacity={0.22} borderRadius="6px" className="inline-flex">
                  <button
                    type="button"
                    onClick={() => setFocusRunning(!focusRunning)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white transition-transform active:scale-95"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    {focusRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{focusRunning ? 'Pause' : 'Start'}</span>
                  </button>
                </GlareHover>
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
        </ElectricBorder>

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
      <div className="px-3 py-2 border-b shrink-0 bg-[var(--bg-inset)]/35">
        <RubberSegment
          items={[
            { value: 'inspect', label: selectedEvent ? 'Block Details' : 'Task Details' },
            {
              value: 'notes',
              label: 'Daily Notes',
              icon: <Sparkles className="w-3 h-3 text-[var(--accent-amber)]" />,
            },
          ]}
          value={railTab}
          onChange={(val: string) => setRailTab(val as 'inspect' | 'notes')}
          size="sm"
          equalSlots
          radius={9}
          stretch={32}
          squash={20}
          trackColor={isDark ? '#151821' : '#eaedf3'}
          thumbColor={isDark ? '#242938' : '#ffffff'}
          textColor={isDark ? '#adb6c4' : '#4b5563'}
          activeTextColor={isDark ? '#ffffff' : '#0f1115'}
          ariaLabel="Inspector panel tab"
          className="w-full border"
        />
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 pb-8">
        <AnimatedContent
          key={`${railTab}-${selectedEvent?.id ?? selectedTask?.id ?? 'empty'}`}
          trigger="load"
          distance={8}
          duration={0.24}
          ease="power2.out"
        >
        {railTab === 'inspect' ? (
          <div className="space-y-2.5 text-[12.5px]">
            {selectedEvent && (
              <SpotlightCard
                theme={isDark ? 'dark' : 'light'}
                spotlightColor={isDark ? 'rgba(231, 64, 4, 0.12)' : 'rgba(231, 64, 4, 0.06)'}
                intensity={isDark ? 0.1 : 0.05}
                className="p-2.5 rounded-xl border bg-[var(--bg-elevated)]/45 space-y-2"
              >
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
                    <span className="text-[11px] text-[var(--ink-muted)]">Start time</span>
                    <input
                      type="time"
                      disabled={Boolean(selectedEvent.allDay)}
                      value={minutesToTimeInput(selectedEvent.startMinutes)}
                      onChange={(e) => {
                        const mins = timeInputToMinutes(e.target.value);
                        if (mins !== null) updateEvent(selectedEvent.id, { startMinutes: mins });
                      }}
                      className="w-full px-2 py-1 rounded bg-[var(--bg-inset)] font-mono-num text-[11px] disabled:opacity-45"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--ink-secondary)]">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedEvent.allDay)}
                      onChange={(e) => updateEvent(selectedEvent.id, { allDay: e.target.checked || undefined })}
                      className="rounded border"
                    />
                    <span>All-day block</span>
                  </label>
                  <select
                    value={selectedEvent.recurrence}
                    onChange={(e) => updateEvent(selectedEvent.id, { recurrence: e.target.value as RecurrenceRule })}
                    aria-label="Repeat cadence"
                    className="px-2 py-1 rounded bg-[var(--bg-inset)] text-[11px] focus:outline-none"
                  >
                    <option value="none" className="bg-[var(--bg-surface)]">No repeat</option>
                    <option value="daily" className="bg-[var(--bg-surface)]">Daily</option>
                    <option value="weekdays" className="bg-[var(--bg-surface)]">Weekdays</option>
                    <option value="weekly" className="bg-[var(--bg-surface)]">Weekly</option>
                    <option value="monthly" className="bg-[var(--bg-surface)]">Monthly</option>
                  </select>
                </div>

                {!selectedEvent.allDay && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-[var(--ink-muted)] block">
                      Duration ({formatDurationHuman(selectedEvent.durationMinutes)})
                    </span>
                    <DurationSelector
                      compact
                      presets={[15, 30, 45, 60, 90, 120]}
                      value={selectedEvent.durationMinutes}
                      onChange={(mins) => updateEvent(selectedEvent.id, { durationMinutes: mins })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--ink-secondary)]">
                  <span>Reminder</span>
                  <div className="flex items-center gap-1">
                    <select
                      value={
                        selectedEvent.reminderMinutes === undefined
                          ? 'none'
                          : [5, 10, 15, 30].includes(selectedEvent.reminderMinutes)
                            ? String(selectedEvent.reminderMinutes)
                            : 'custom'
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === 'none') updateEvent(selectedEvent.id, { reminderMinutes: undefined });
                        else if (v === 'custom') updateEvent(selectedEvent.id, { reminderMinutes: 20 });
                        else updateEvent(selectedEvent.id, { reminderMinutes: Number(v) });
                      }}
                      className="px-2 py-1 rounded bg-[var(--bg-inset)] text-[11px] focus:outline-none"
                    >
                      <option value="none" className="bg-[var(--bg-surface)]">No alert</option>
                      <option value="5" className="bg-[var(--bg-surface)]">5m before</option>
                      <option value="10" className="bg-[var(--bg-surface)]">10m before</option>
                      <option value="15" className="bg-[var(--bg-surface)]">15m before</option>
                      <option value="30" className="bg-[var(--bg-surface)]">30m before</option>
                      <option value="custom" className="bg-[var(--bg-surface)]">Custom...</option>
                    </select>
                    {selectedEvent.reminderMinutes !== undefined &&
                      ![5, 10, 15, 30].includes(selectedEvent.reminderMinutes) && (
                        <input
                          type="number"
                          min={1}
                          max={240}
                          value={selectedEvent.reminderMinutes}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(240, Math.round(Number(e.target.value) || 1)));
                            updateEvent(selectedEvent.id, { reminderMinutes: val });
                          }}
                          aria-label="Custom reminder minutes"
                          className="w-12 px-1.5 py-1 rounded bg-[var(--bg-inset)] font-mono-num text-[11px]"
                        />
                      )}
                  </div>
                </div>

                <div className="space-y-1 pt-0.5">
                  <span className="text-[11px] text-[var(--ink-muted)] block">Label / Category</span>
                  <CategoryLabelSelector
                    compact
                    category={selectedEvent.category}
                    customLabel={selectedEvent.customLabel}
                    customColor={selectedEvent.customColor}
                    savedCustomLabels={customLabels}
                    isDark={isDark}
                    onSelectPreset={(cat) =>
                      updateEvent(selectedEvent.id, {
                        category: cat,
                        customLabel: undefined,
                        customColor: undefined,
                        calendarId:
                          cat === 'meeting'
                            ? 'team'
                            : cat === 'health'
                              ? 'wellness'
                              : cat === 'personal'
                                ? 'personal'
                                : 'work',
                      })
                    }
                    onSelectCustom={(label, color) =>
                      updateEvent(selectedEvent.id, {
                        category: 'custom',
                        customLabel: label,
                        customColor: color,
                        calendarId: 'custom',
                      })
                    }
                    onSaveCustomLabel={saveCustomLabel}
                  />
                </div>

                <textarea
                  rows={2}
                  value={selectedEvent.notes ?? ''}
                  onChange={(e) => updateEvent(selectedEvent.id, { notes: e.target.value })}
                  placeholder="Block notes..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-inset)] text-[12px] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
                />
              </SpotlightCard>
            )}

            {selectedTask && (
              <div className="pt-2.5 border-t space-y-2">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    <SpringCheck
                      checked={selectedTask.completed}
                      onChange={() => toggleTaskComplete(selectedTask.id)}
                      label=""
                      strike="none"
                      boxSize={16}
                      boxRadius={4}
                      color="var(--ink-primary)"
                      fillColor={PRIORITY_META[selectedTask.priority].color}
                      checkColor="#ffffff"
                      ariaLabel={`Complete ${selectedTask.title}`}
                      className="[&]:min-h-0 [&]:gap-0"
                    />
                  </div>
                  <span className={`flex-1 font-medium text-[12.5px] leading-snug ${selectedTask.completed ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--ink-primary)]'}`}>
                    {selectedTask.title}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as TaskPriority })}
                    className="px-2 py-1 rounded bg-[var(--bg-inset)] text-[11px]"
                  >
                    <option value="p1" className="bg-[var(--bg-surface)]">Critical</option>
                    <option value="p2" className="bg-[var(--bg-surface)]">High</option>
                    <option value="p3" className="bg-[var(--bg-surface)]">Normal</option>
                    <option value="p4" className="bg-[var(--bg-surface)]">Low</option>
                  </select>

                  <select
                    value={selectedTask.listId}
                    onChange={(e) => updateTask(selectedTask.id, { listId: e.target.value })}
                    aria-label="Task work area"
                    className="px-2 py-1 rounded bg-[var(--bg-inset)] text-[11px]"
                  >
                    <option value="inbox" className="bg-[var(--bg-surface)]">Inbox</option>
                    <option value="work" className="bg-[var(--bg-surface)]">Product & Eng</option>
                    <option value="design" className="bg-[var(--bg-surface)]">Design</option>
                    <option value="personal" className="bg-[var(--bg-surface)]">Personal</option>
                    {customTaskLists.map((cl) => (
                      <option key={cl.id} value={cl.id} className="bg-[var(--bg-surface)]">
                        {cl.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <label className="space-y-0.5">
                    <span className="text-[10.5px] text-[var(--ink-muted)] block">Due Date</span>
                    <input
                      type="date"
                      value={selectedTask.dueDate ?? ''}
                      onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value || undefined })}
                      className="w-full px-1.5 py-1 rounded bg-[var(--bg-inset)] font-mono-num text-[11px]"
                    />
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-[10.5px] text-[var(--ink-muted)] block">Calendar Time</span>
                    <input
                      type="time"
                      value={
                        selectedTask.scheduledStartMinutes !== undefined
                          ? minutesToTimeInput(selectedTask.scheduledStartMinutes)
                          : ''
                      }
                      onChange={(e) => {
                        const mins = timeInputToMinutes(e.target.value);
                        if (mins !== null) {
                          scheduleTaskToCalendar(selectedTask.id, selectedTask.dueDate ?? selectedDate, mins);
                        }
                      }}
                      className="w-full px-1.5 py-1 rounded bg-[var(--bg-inset)] font-mono-num text-[11px]"
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <span className="text-[10.5px] text-[var(--ink-muted)] block">
                    Work Length ({formatDurationHuman(selectedTask.estimatedMinutes)})
                  </span>
                  <DurationSelector
                    compact
                    presets={[15, 30, 45, 60, 90]}
                    value={selectedTask.estimatedMinutes}
                    onChange={(mins) => updateTask(selectedTask.id, { estimatedMinutes: mins })}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  {selectedTask.scheduledDate ? (
                    <button
                      type="button"
                      onClick={() => unscheduleTaskFromCalendar(selectedTask.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-elevated)] text-[11px] text-[var(--ink-secondary)] hover:bg-[var(--bg-hover)]"
                    >
                      <span>Remove from calendar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        scheduleTaskToCalendar(
                          selectedTask.id,
                          selectedTask.dueDate ?? selectedDate,
                          selectedTask.scheduledStartMinutes ?? 9 * 60
                        )
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-elevated)] text-[11px] hover:bg-[var(--bg-hover)]"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>Schedule at {formatMinutes(selectedTask.scheduledStartMinutes ?? 9 * 60, true)}</span>
                    </button>
                  )}
                  {!selectedEvent && (
                    <button
                      type="button"
                      onClick={() => deleteTask(selectedTask.id)}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--accent-coral)] ml-auto"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {selectedTask.subtasks.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => toggleSubtask(selectedTask.id, st.id)}
                      className="w-full flex items-center gap-2 text-left py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] text-[11.5px] cursor-pointer"
                    >
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <SpringCheck
                          checked={st.done}
                          onChange={() => toggleSubtask(selectedTask.id, st.id)}
                          label=""
                          strike="none"
                          boxSize={14}
                          boxRadius={4}
                          color="var(--ink-primary)"
                          fillColor="var(--accent-emerald)"
                          checkColor="#ffffff"
                          ariaLabel={`Toggle subtask ${st.title}`}
                          className="[&]:min-h-0 [&]:gap-0"
                        />
                      </div>
                      <span className={st.done ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--ink-secondary)]'}>
                        {st.title}
                      </span>
                    </div>
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
              <div className="py-5 px-2 text-center space-y-3">
                <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed">
                  Select any calendar block or queued task to edit schedule, recurrence, and subtasks, or click any open hour slot on the grid.
                </p>
                <button
                  type="button"
                  onClick={() => setRailTab('notes')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11.5px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                  <span>Open Daily Journal</span>
                </button>
              </div>
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
        </AnimatedContent>
      </div>
    </aside>
  );
};

export const MobileInspectorSheet: React.FC = () => {
  const {
    snapshot,
    selectedDate,
    selection,
    mobileInspectorOpen,
    setMobileInspectorOpen,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleSubtask,
    addSubtask,
    scheduleTaskToCalendar,
    unscheduleTaskFromCalendar,
    customLabels,
    customTaskLists,
    saveCustomLabel,
    moveTaskKanban,
    moveTaskQuadrant,
    setActiveFocusTaskId,
    setFocusRunning,
    setActiveTab,
    pushToast,
  } = useWorkspace();

  const [newSubtask, setNewSubtask] = useState('');

  if (!mobileInspectorOpen || !selection) return null;

  const isDark = snapshot.preferences.theme === 'dark';
  const selectedEvent: CalendarEvent | undefined =
    selection.type === 'event' ? snapshot.events.find((e) => e.id === selection.id) : undefined;
  const selectedTask =
    selection.type === 'task'
      ? snapshot.tasks.find((t) => t.id === selection.id)
      : selectedEvent?.linkedTaskId
        ? snapshot.tasks.find((t) => t.id === selectedEvent.linkedTaskId)
        : undefined;

  if (!selectedEvent && !selectedTask) return null;

  const nudgeTime = (deltaMins: number) => {
    if (!selectedEvent) return;
    const nextStart = Math.max(6 * 60, Math.min(22 * 60 + 30, selectedEvent.startMinutes + deltaMins));
    updateEvent(selectedEvent.id, { startMinutes: nextStart });
  };

  return (
    <div
      className="fixed inset-0 z-50 xl:hidden bg-black/60 backdrop-blur-[2px] flex items-end justify-center"
      onClick={() => setMobileInspectorOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl border-t p-4 pb-6 space-y-3.5 max-h-[82vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--rule-strong)',
          boxShadow: 'var(--shadow-panel)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[var(--rule-strong)] mx-auto mb-1" />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[12px] font-mono-num text-[var(--ink-secondary)]">
            <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>
              {selectedEvent
                ? selectedEvent.allDay
                  ? 'All day event'
                  : formatTimeRange(selectedEvent.startMinutes, selectedEvent.durationMinutes)
                : 'Task inspector'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileInspectorOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
            aria-label="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {selectedEvent && (
          <div className="space-y-3">
            <input
              type="text"
              value={selectedEvent.title}
              onChange={(e) => updateEvent(selectedEvent.id, { title: e.target.value })}
              aria-label="Event title"
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-inset)] border font-semibold text-[14px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => nudgeTime(-30)}
                className="px-2.5 py-1.5 rounded-lg border bg-[var(--bg-elevated)] text-[11.5px] font-mono-num"
              >
                -30m
              </button>
              <button
                type="button"
                onClick={() => nudgeTime(30)}
                className="px-2.5 py-1.5 rounded-lg border bg-[var(--bg-elevated)] text-[11.5px] font-mono-num"
              >
                +30m
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedTask) setActiveFocusTaskId(selectedTask.id);
                  setFocusRunning(true);
                  setMobileInspectorOpen(false);
                  setActiveTab('focus');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Play className="w-3 h-3" />
                <span>Focus block</span>
              </button>
              <button
                type="button"
                onClick={() => duplicateEvent(selectedEvent.id)}
                className="p-1.5 rounded-lg border bg-[var(--bg-elevated)] text-[var(--ink-secondary)]"
                aria-label="Duplicate block"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => deleteEvent(selectedEvent.id)}
                className="ml-auto p-1.5 rounded-lg border bg-[var(--bg-elevated)] text-[var(--accent-coral)]"
                aria-label="Delete block"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <label className="space-y-1">
                <span className="text-[var(--ink-muted)] block">Date</span>
                <input
                  type="date"
                  value={selectedEvent.date}
                  onChange={(e) => updateEvent(selectedEvent.id, { date: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border bg-[var(--bg-inset)] font-mono-num text-[11px]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[var(--ink-muted)] block">Start Time</span>
                <input
                  type="time"
                  disabled={Boolean(selectedEvent.allDay)}
                  value={minutesToTimeInput(selectedEvent.startMinutes)}
                  onChange={(e) => {
                    const mins = timeInputToMinutes(e.target.value);
                    if (mins !== null) updateEvent(selectedEvent.id, { startMinutes: mins });
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border bg-[var(--bg-inset)] font-mono-num text-[11px] disabled:opacity-45"
                />
              </label>
            </div>

            {!selectedEvent.allDay && (
              <div className="space-y-1">
                <span className="text-[11px] text-[var(--ink-muted)] block">
                  Duration ({formatDurationHuman(selectedEvent.durationMinutes)})
                </span>
                <DurationSelector
                  compact
                  presets={[15, 30, 45, 60, 90, 120]}
                  value={selectedEvent.durationMinutes}
                  onChange={(mins) => updateEvent(selectedEvent.id, { durationMinutes: mins })}
                />
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[11px] text-[var(--ink-muted)] block">Label / Category</span>
              <CategoryLabelSelector
                compact
                category={selectedEvent.category}
                customLabel={selectedEvent.customLabel}
                customColor={selectedEvent.customColor}
                savedCustomLabels={customLabels}
                isDark={isDark}
                onSelectPreset={(cat) =>
                  updateEvent(selectedEvent.id, {
                    category: cat,
                    customLabel: undefined,
                    customColor: undefined,
                    calendarId:
                      cat === 'meeting'
                        ? 'team'
                        : cat === 'health'
                          ? 'wellness'
                          : cat === 'personal'
                            ? 'personal'
                            : 'work',
                  })
                }
                onSelectCustom={(label, color) =>
                  updateEvent(selectedEvent.id, {
                    category: 'custom',
                    customLabel: label,
                    customColor: color,
                    calendarId: 'custom',
                  })
                }
                onSaveCustomLabel={saveCustomLabel}
              />
            </div>
          </div>
        )}

        {selectedTask && (
          <div className="pt-2.5 border-t space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                <SpringCheck
                  checked={selectedTask.completed}
                  onChange={() => toggleTaskComplete(selectedTask.id)}
                  label=""
                  strike="none"
                  boxSize={18}
                  boxRadius={5}
                  color="var(--ink-primary)"
                  fillColor={PRIORITY_META[selectedTask.priority].color}
                  checkColor="#ffffff"
                  ariaLabel={`Complete ${selectedTask.title}`}
                  className="[&]:min-h-0 [&]:gap-0"
                />
              </div>
              <span className="flex-1 font-medium text-[13.5px] leading-snug">{selectedTask.title}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <select
                value={selectedTask.priority}
                onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as TaskPriority })}
                className="px-2 py-1.5 rounded-lg border bg-[var(--bg-inset)]"
              >
                <option value="p1">P1 Critical</option>
                <option value="p2">P2 High</option>
                <option value="p3">P3 Normal</option>
                <option value="p4">P4 Low</option>
              </select>
              <select
                value={selectedTask.status}
                onChange={(e) => moveTaskKanban(selectedTask.id, e.target.value as TaskStatus)}
                className="px-2 py-1.5 rounded-lg border bg-[var(--bg-inset)]"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Planned Today</option>
                <option value="in_progress">In Focus</option>
                <option value="done">Completed</option>
              </select>
              <select
                value={selectedTask.quadrant}
                onChange={(e) => moveTaskQuadrant(selectedTask.id, e.target.value as EisenhowerQuadrant)}
                className="px-2 py-1.5 rounded-lg border bg-[var(--bg-inset)]"
              >
                <option value="do">Do First</option>
                <option value="schedule">Schedule</option>
                <option value="delegate">Delegate</option>
                <option value="eliminate">Trim</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="space-y-1">
                <span className="text-[var(--ink-muted)] block">Due Date</span>
                <input
                  type="date"
                  value={selectedTask.dueDate ?? ''}
                  onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 rounded-lg border bg-[var(--bg-inset)] font-mono-num"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[var(--ink-muted)] block">Calendar Time</span>
                <input
                  type="time"
                  value={
                    selectedTask.scheduledStartMinutes !== undefined
                      ? minutesToTimeInput(selectedTask.scheduledStartMinutes)
                      : ''
                  }
                  onChange={(e) => {
                    const mins = timeInputToMinutes(e.target.value);
                    if (mins !== null) {
                      scheduleTaskToCalendar(selectedTask.id, selectedTask.dueDate ?? selectedDate, mins);
                    }
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border bg-[var(--bg-inset)] font-mono-num"
                />
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-[var(--ink-muted)] block">
                Work Duration ({formatDurationHuman(selectedTask.estimatedMinutes)})
              </span>
              <DurationSelector
                compact
                presets={[15, 30, 45, 60, 90]}
                value={selectedTask.estimatedMinutes}
                onChange={(mins) => updateTask(selectedTask.id, { estimatedMinutes: mins })}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedTask.scheduledDate ? (
                <button
                  type="button"
                  onClick={() => unscheduleTaskFromCalendar(selectedTask.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-[var(--bg-elevated)] text-[11.5px] font-medium text-[var(--ink-secondary)]"
                >
                  <span>Unschedule</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    scheduleTaskToCalendar(
                      selectedTask.id,
                      selectedTask.dueDate ?? selectedDate,
                      selectedTask.scheduledStartMinutes ?? 9 * 60
                    );
                    setMobileInspectorOpen(false);
                    setActiveTab('planner');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-[var(--bg-elevated)] text-[11.5px] font-medium"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>Add to Calendar ({formatMinutes(selectedTask.scheduledStartMinutes ?? 9 * 60, true)})</span>
                </button>
              )}
              <select
                value={selectedTask.listId}
                onChange={(e) => updateTask(selectedTask.id, { listId: e.target.value })}
                aria-label="Mobile task list"
                className="px-2.5 py-1.5 rounded-lg border bg-[var(--bg-inset)] text-[11.5px]"
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
              {!selectedEvent && (
                <button
                  type="button"
                  onClick={() => {
                    deleteTask(selectedTask.id);
                    setMobileInspectorOpen(false);
                    pushToast('Task deleted', selectedTask.title, true);
                  }}
                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11.5px] text-[var(--accent-coral)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              {selectedTask.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => toggleSubtask(selectedTask.id, st.id)}
                  className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] text-[12px] cursor-pointer"
                >
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <SpringCheck
                      checked={st.done}
                      onChange={() => toggleSubtask(selectedTask.id, st.id)}
                      label=""
                      strike="none"
                      boxSize={15}
                      boxRadius={4}
                      color="var(--ink-primary)"
                      fillColor="var(--accent-emerald)"
                      checkColor="#ffffff"
                      ariaLabel={`Toggle subtask ${st.title}`}
                      className="[&]:min-h-0 [&]:gap-0"
                    />
                  </div>
                  <span className={st.done ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--ink-secondary)]'}>
                    {st.title}
                  </span>
                </div>
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
                  className="w-full px-3 py-1.5 rounded-lg border bg-[var(--bg-inset)] text-[12px] placeholder:text-[var(--ink-muted)] focus:outline-none"
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
