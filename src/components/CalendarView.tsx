import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Globe,
  Plus,
  Repeat,
  Video,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { CalendarEvent, CalendarMode, EventCategory } from '../types/workspace';
import {
  addDays,
  addMonths,
  formatMinutes,
  formatReadableDate,
  formatSecondaryTzHour,
  formatTimeRange,
  fromDateKey,
  getMonthGridDates,
  getWeekDates,
  layoutDayEvents,
  MONTH_NAMES,
  SHORT_MONTH_NAMES,
  WEEKDAY_SHORT,
} from '../utils/date';
import { EVENT_CATEGORY_STYLES } from '../utils/themeTokens';

const START_HOUR = 6;
const END_HOUR = 23;
const HOUR_HEIGHT = 56;

const MODE_OPTIONS: { id: CalendarMode; label: string; short: string }[] = [
  { id: 'day', label: 'Day', short: 'Day' },
  { id: 'three_day', label: '3-Day', short: '3D' },
  { id: 'workweek', label: 'Workweek', short: '5D' },
  { id: 'week', label: 'Week', short: 'Week' },
  { id: 'month', label: 'Month', short: 'Mo' },
  { id: 'agenda', label: 'Agenda', short: 'List' },
];

export const CalendarView: React.FC = () => {
  const {
    snapshot,
    todayKey,
    nowMinutes,
    calendarMode,
    setCalendarMode,
    selectedDate,
    setSelectedDate,
    selection,
    setSelection,
    addEvent,
    updateEvent,
    toggleTaskComplete,
    scheduleTaskToCalendar,
    availabilityMode,
    setAvailabilityMode,
    availabilitySlots,
    toggleAvailabilitySlot,
    clearAvailabilitySlots,
    updatePreferences,
    pushToast,
  } = useWorkspace();

  const [quickSlot, setQuickSlot] = useState<{ date: string; startMinutes: number } | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState<EventCategory>('deep');
  const [draftDuration, setDraftDuration] = useState(60);
  const [dragHoverCell, setDragHoverCell] = useState<string | null>(null);

  const resizeRef = useRef<{ id: string; origDuration: number; startY: number } | null>(null);
  const isDark = snapshot.preferences.theme === 'dark';

  const visibleDates = useMemo(() => {
    if (calendarMode === 'day') return [selectedDate];
    if (calendarMode === 'three_day') return [selectedDate, addDays(selectedDate, 1), addDays(selectedDate, 2)];
    if (calendarMode === 'workweek') return getWeekDates(selectedDate, 1).slice(0, 5);
    if (calendarMode === 'week') return getWeekDates(selectedDate, snapshot.preferences.weekStartsOn);
    return getMonthGridDates(selectedDate, snapshot.preferences.weekStartsOn);
  }, [calendarMode, selectedDate, snapshot.preferences.weekStartsOn]);

  const filteredEvents = useMemo(() => {
    return snapshot.events.filter((e) => snapshot.enabledLayers[e.calendarId]);
  }, [snapshot.events, snapshot.enabledLayers]);

  const selectedDateObj = fromDateKey(selectedDate);
  const headerTitle =
    calendarMode === 'day'
      ? formatReadableDate(selectedDate)
      : `${MONTH_NAMES[selectedDateObj.getMonth()]} ${selectedDateObj.getFullYear()}`;

  const shiftRange = (dir: -1 | 1) => {
    if (calendarMode === 'day') setSelectedDate(addDays(selectedDate, dir));
    else if (calendarMode === 'three_day') setSelectedDate(addDays(selectedDate, dir * 3));
    else if (calendarMode === 'month') setSelectedDate(addMonths(selectedDate, dir));
    else setSelectedDate(addDays(selectedDate, dir * 7));
  };

  const handleCreateQuickSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSlot || !draftTitle.trim()) return;
    addEvent({
      title: draftTitle.trim(),
      date: quickSlot.date,
      startMinutes: quickSlot.startMinutes,
      durationMinutes: draftDuration,
      category: draftCategory,
      calendarId:
        draftCategory === 'meeting'
          ? 'team'
          : draftCategory === 'health'
            ? 'wellness'
            : draftCategory === 'personal'
              ? 'personal'
              : 'work',
      recurrence: 'none',
    });
    setDraftTitle('');
    setQuickSlot(null);
  };

  const handleCopyAvailability = () => {
    if (availabilitySlots.length === 0) return;
    const sorted = availabilitySlots
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || a.startMinutes - b.startMinutes);
    const lines = sorted.map(
      (s) => `• ${formatReadableDate(s.date)}: ${formatTimeRange(s.startMinutes, s.durationMinutes)}`
    );
    const text = `My open availability (${snapshot.preferences.secondaryTimezone} / Local):\n${lines.join('\n')}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    pushToast('Availability copied to clipboard', `${sorted.length} time slots ready to paste`, false, 'success');
  };

  const startResize = (e: React.MouseEvent, ev: CalendarEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = { id: ev.id, origDuration: ev.durationMinutes, startY: e.clientY };

    const onMove = (moveEvt: MouseEvent) => {
      if (!resizeRef.current) return;
      const dy = moveEvt.clientY - resizeRef.current.startY;
      const deltaMinutes = Math.round(((dy / HOUR_HEIGHT) * 60) / 15) * 15;
      const nextDur = Math.max(15, Math.min(480, resizeRef.current.origDuration + deltaMinutes));
      updateEvent(resizeRef.current.id, { durationMinutes: nextDur });
    };

    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const showTimeGrid = calendarMode !== 'month' && calendarMode !== 'agenda';
  // Pixel-exact coordinate aligned cleanly with hour rows (no double pt offset!)
  const nowTopPx = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-[var(--bg-canvas)] overflow-hidden relative">
      {/* Calendar Header Toolbar */}
      <div
        className="px-3 sm:px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 bg-[var(--bg-surface)]"
        style={{ borderColor: 'var(--rule-hairline)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center rounded-lg border bg-[var(--bg-inset)] p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => shiftRange(-1)}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(todayKey)}
              className="px-2 py-1 rounded-md text-[12px] font-medium hover:bg-[var(--bg-hover)] text-[var(--ink-primary)]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftRange(1)}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
              aria-label="Next period"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className="font-display font-bold text-[15.5px] sm:text-[18px] tracking-tight text-[var(--ink-primary)] truncate">
            {headerTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {availabilityMode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[12px]">
              <span className="font-medium text-[var(--accent-primary)]">
                Pick open slots ({availabilitySlots.length})
              </span>
              {availabilitySlots.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyAvailability}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--accent-primary)] text-white text-[11px] font-medium"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  clearAvailabilitySlots();
                  setAvailabilityMode(false);
                }}
                className="p-0.5 rounded hover:bg-black/15 text-[var(--ink-primary)]"
                aria-label="Exit availability mode"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => updatePreferences({ showSecondaryTz: !snapshot.preferences.showSecondaryTz })}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11.5px] font-mono-num text-[var(--ink-secondary)] hover:bg-[var(--bg-hover)]"
            title="Toggle secondary timezone ruler"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{snapshot.preferences.showSecondaryTz ? snapshot.preferences.secondaryTimezone : '1 TZ'}</span>
          </button>

          <div className="flex items-center rounded-lg border bg-[var(--bg-inset)] p-0.5 w-full sm:w-auto justify-between sm:justify-start">
            {MODE_OPTIONS.map((m) => {
              const active = calendarMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCalendarMode(m.id)}
                  className="flex-1 sm:flex-initial px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-md text-[11.5px] sm:text-[12px] font-medium transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                    color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                    boxShadow: active ? 'inset 0 0 0 1px var(--rule-hairline)' : 'none',
                  }}
                >
                  <span className="sm:hidden">{m.short}</span>
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setQuickSlot({ date: selectedDate, startMinutes: 10 * 60 })}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg studio-card text-[12px] font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>New block</span>
          </button>
        </div>
      </div>

      {/* TIME GRID VIEWS */}
      {showTimeGrid && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Opaque Sticky Day Headers aligned to scrollable body scrollbar gutter */}
          <div
            className="grid border-b bg-[var(--bg-surface)] shrink-0 z-30 md:pr-[6px]"
            style={{
              gridTemplateColumns: `${snapshot.preferences.showSecondaryTz ? '72px' : '52px'} repeat(${visibleDates.length}, minmax(0, 1fr))`,
              borderColor: 'var(--rule-hairline)',
            }}
          >
            <div className="border-r px-1.5 py-2 pb-2.5 flex items-end justify-end gap-1 text-[9.5px] font-mono-num text-[var(--ink-muted)] bg-[var(--bg-surface)]">
              {snapshot.preferences.showSecondaryTz && <span className="hidden sm:inline opacity-75">UTC</span>}
              <span>GMT+8</span>
            </div>

            {visibleDates.map((dKey) => {
              const d = fromDateKey(dKey);
              const isToday = dKey === todayKey;
              const isSel = dKey === selectedDate;
              const allDayEvents = filteredEvents.filter((e) => e.date === dKey && e.allDay);

              return (
                <div
                  key={dKey}
                  onClick={() => setSelectedDate(dKey)}
                  className="border-r last:border-r-0 px-2 py-2 cursor-pointer transition-colors hover:bg-[var(--bg-hover)]/40"
                  style={{
                    backgroundColor: isToday
                      ? isDark
                        ? 'rgba(231,64,4,0.045)'
                        : 'rgba(231,64,4,0.035)'
                      : 'var(--bg-surface)',
                    borderColor: isDark ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.07)',
                  }}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="text-[11.5px] font-medium"
                      style={{ color: isToday ? 'var(--accent-primary)' : 'var(--ink-secondary)' }}
                    >
                      {WEEKDAY_SHORT[d.getDay()]}
                    </span>
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[12px] font-mono-num font-semibold"
                      style={{
                        backgroundColor: isToday
                          ? 'var(--accent-primary)'
                          : isSel
                            ? 'var(--bg-elevated)'
                            : 'transparent',
                        color: isToday ? '#FFFFFF' : 'var(--ink-primary)',
                      }}
                    >
                      {d.getDate()}
                    </span>
                  </div>

                  {allDayEvents.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {allDayEvents.map((ev) => {
                        const style = EVENT_CATEGORY_STYLES[ev.category];
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            title={ev.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelection({ type: 'event', id: ev.id });
                            }}
                            className="w-full text-left px-1.5 py-0.5 rounded text-[10.5px] font-medium truncate border-l-2"
                            style={{
                              backgroundColor: isDark ? style.bgDark : style.bgLight,
                              borderLeftColor: style.bar,
                              color: isDark ? style.textDark : style.textLight,
                            }}
                          >
                            {ev.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Scrollable Hourly Grid */}
          <div className="flex-1 overflow-y-scroll relative pt-3 pb-20 sm:pb-6">
            <div
              className="grid relative"
              style={{
                gridTemplateColumns: `${snapshot.preferences.showSecondaryTz ? '72px' : '52px'} repeat(${visibleDates.length}, minmax(0, 1fr))`,
                height: `${hours.length * HOUR_HEIGHT}px`,
              }}
            >
              {/* Time Gutter */}
              <div className="border-r relative bg-[var(--bg-surface)]/25">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="relative pr-2 flex items-start justify-end text-[10px] font-mono-num text-[var(--ink-muted)]"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  >
                    <span className="-translate-y-2 flex items-center gap-1">
                      {snapshot.preferences.showSecondaryTz && (
                        <span className="hidden sm:inline opacity-65 text-[9.5px]">
                          {formatSecondaryTzHour(h, snapshot.preferences.secondaryTimezone)}
                        </span>
                      )}
                      <span>{formatMinutes(h * 60, true)}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {visibleDates.map((dKey) => {
                const dayEvents = filteredEvents.filter((e) => e.date === dKey);
                const positioned = layoutDayEvents(dayEvents);
                const isToday = dKey === todayKey;

                return (
                  <div
                    key={dKey}
                    className="relative border-r last:border-r-0"
                    style={{
                      backgroundColor: isToday
                        ? isDark
                          ? 'rgba(231,64,4,0.025)'
                          : 'rgba(231,64,4,0.022)'
                        : 'transparent',
                      borderColor: isDark ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.07)',
                    }}
                  >
                    {hours.map((h) => {
                      const cellId = `${dKey}-${h}`;
                      const startMins = h * 60;
                      const avail = availabilitySlots.find(
                        (s) => s.date === dKey && s.startMinutes === startMins
                      );
                      return (
                        <div
                          key={h}
                          onClick={() => {
                            if (availabilityMode) {
                              toggleAvailabilitySlot(dKey, startMins, 60);
                            } else {
                              setSelectedDate(dKey);
                              setQuickSlot({ date: dKey, startMinutes: startMins });
                            }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragHoverCell(cellId);
                          }}
                          onDragLeave={() => setDragHoverCell(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragHoverCell(null);
                            const eventId = e.dataTransfer.getData('text/cadence-event-id');
                            const taskId = e.dataTransfer.getData('text/cadence-task-id');
                            if (eventId) {
                              updateEvent(eventId, { date: dKey, startMinutes: startMins });
                              pushToast('Event moved', `${formatReadableDate(dKey)} at ${formatMinutes(startMins)}`, true);
                            } else if (taskId) {
                              scheduleTaskToCalendar(taskId, dKey, startMins);
                            }
                          }}
                          className="border-b transition-colors cursor-pointer"
                          style={{
                            height: `${HOUR_HEIGHT}px`,
                            borderColor: isDark ? 'rgba(255,255,255,0.065)' : 'rgba(15,23,42,0.07)',
                            backgroundColor: avail
                              ? 'var(--accent-emerald-soft)'
                              : dragHoverCell === cellId
                                ? 'var(--accent-primary-soft)'
                                : 'transparent',
                          }}
                        >
                          {avail && (
                            <div className="px-2 py-1 text-[10.5px] font-medium text-[var(--accent-emerald)]">
                              Open slot
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Current Time Indicator */}
                    {isToday && nowTopPx >= 0 && nowTopPx <= hours.length * HOUR_HEIGHT && (
                      <div
                        className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
                        style={{ top: `${nowTopPx}px` }}
                      >
                        <span
                          className="w-2 h-2 rounded-full ml-0.5 shrink-0"
                          style={{ backgroundColor: 'var(--accent-primary)' }}
                        />
                        <div className="flex-1 h-[1.5px]" style={{ backgroundColor: 'var(--accent-primary)' }} />
                      </div>
                    )}

                    {/* Positioned Event Blocks (exact Y coordinates + clean side-by-side overlap lanes) */}
                    {positioned.map(({ event, col, totalCols }) => {
                      const style = EVENT_CATEGORY_STYLES[event.category];
                      const top = ((event.startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                      const height = Math.max(24, (event.durationMinutes / 60) * HOUR_HEIGHT - 2);
                      const leftExpr = `calc(${(col * 100) / totalCols}% + 2px)`;
                      const widthExpr = `calc(${100 / totalCols}% - 4px)`;

                      const isSelected = selection?.type === 'event' && selection.id === event.id;
                      const linkedTask = event.linkedTaskId
                        ? snapshot.tasks.find((t) => t.id === event.linkedTaskId)
                        : undefined;
                      const isDone = linkedTask ? linkedTask.completed : Boolean(event.completed);

                      return (
                        <div
                          key={event.id}
                          draggable
                          title={`${event.title} (${formatTimeRange(event.startMinutes, event.durationMinutes)})`}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/cadence-event-id', event.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelection({ type: 'event', id: event.id });
                          }}
                          className="group absolute z-20 rounded-md px-1.5 py-1 overflow-hidden cursor-pointer select-none transition-shadow flex flex-col gap-1.5 backdrop-blur-[2px]"
                          style={{
                            top: `${top + 1}px`,
                            height: `${height}px`,
                            left: leftExpr,
                            width: widthExpr,
                            backgroundColor: isDark ? style.bgDark : style.bgLight,
                            border: `1px solid ${isDark ? style.borderDark : style.borderLight}`,
                            borderLeftWidth: '2.5px',
                            borderLeftColor: style.bar,
                            color: isDark ? style.textDark : style.textLight,
                            opacity: isDone ? 0.65 : 1,
                            boxShadow: isSelected
                              ? '0 0 0 1px rgba(255,255,255,0.28), 0 4px 12px rgba(0,0,0,0.35)'
                              : 'none',
                          }}
                        >
                          <div className="flex items-start gap-1.5 min-w-0">
                            {linkedTask && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskComplete(linkedTask.id);
                                }}
                                aria-label={`Toggle ${linkedTask.title}`}
                                className="mt-0.5 w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0"
                                style={{
                                  borderColor: style.bar,
                                  backgroundColor: isDone ? style.bar : 'transparent',
                                }}
                              >
                                {isDone && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                              </button>
                            )}
                            <div className="min-w-0 flex-1">
                              <div
                                className={`text-[11px] font-semibold leading-[1.22] ${
                                  height >= 48 ? 'line-clamp-2' : 'truncate'
                                }`}
                              >
                                {event.title}
                                {!linkedTask && isDone && (
                                  <Check className="inline-block w-3 h-3 ml-1 text-[var(--accent-emerald)] align-text-bottom" />
                                )}
                              </div>
                              {height >= 34 && (
                                <div className="mt-0.5 flex items-center gap-1 text-[10px] opacity-85 font-mono-num truncate">
                                  <span>
                                    {calendarMode !== 'week' && height >= 92
                                      ? formatTimeRange(event.startMinutes, event.durationMinutes)
                                      : formatMinutes(event.startMinutes, true)}
                                  </span>
                                  {event.videoLink && <Video className="w-2.5 h-2.5 shrink-0" />}
                                  {event.recurrence !== 'none' && <Repeat className="w-2.5 h-2.5 shrink-0" />}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Rich Subtask List Inside Tall Blocks (e.g. 2h+ blocks) */}
                          {height >= 98 && linkedTask && linkedTask.subtasks.length > 0 && (
                            <div className="mt-1 pt-1 border-t border-white/10 space-y-0.5 overflow-hidden">
                              {linkedTask.subtasks.slice(0, 2).map((st) => (
                                <div key={st.id} className="flex items-center gap-1 text-[10px] opacity-80 truncate">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: st.done ? 'var(--accent-emerald)' : 'var(--ink-muted)' }}
                                  />
                                  <span className="truncate">{st.title}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div
                            onMouseDown={(e) => startResize(e, event)}
                            title="Drag to adjust duration"
                            className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize opacity-0 group-hover:opacity-100 bg-white/15"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom soft scroll gradient above mobile tab bar / bottom edge */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-20"
            style={{
              background: 'linear-gradient(to top, var(--bg-canvas), transparent)',
            }}
          />
        </div>
      )}

      {/* MONTH GRID VIEW */}
      {calendarMode === 'month' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 border-b bg-[var(--bg-surface)]">
            {(snapshot.preferences.weekStartsOn === 1
              ? [...WEEKDAY_SHORT.slice(1), WEEKDAY_SHORT[0]]
              : WEEKDAY_SHORT
            ).map((wd) => (
              <div key={wd} className="px-3 py-2 text-[11.5px] font-medium text-[var(--ink-secondary)] border-r last:border-r-0">
                {wd}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-y-auto">
            {visibleDates.map((dKey) => {
              const d = fromDateKey(dKey);
              const inMonth = d.getMonth() === selectedDateObj.getMonth();
              const isToday = dKey === todayKey;
              const dayEvents = filteredEvents.filter((e) => e.date === dKey);
              const dayTasks = snapshot.tasks.filter((t) => !t.completed && t.dueDate === dKey);

              return (
                <div
                  key={dKey}
                  onClick={() => {
                    setSelectedDate(dKey);
                    setQuickSlot({ date: dKey, startMinutes: 10 * 60 });
                  }}
                  className="border-r border-b last:border-r-0 p-2 min-h-[104px] flex flex-col gap-1 cursor-pointer hover:bg-[var(--bg-hover)]/35 transition-colors"
                  style={{ opacity: inMonth ? 1 : 0.45 }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[12px] font-mono-num font-semibold"
                      style={{
                        backgroundColor: isToday ? 'var(--accent-primary)' : 'transparent',
                        color: isToday ? '#FFFFFF' : 'var(--ink-primary)',
                      }}
                    >
                      {d.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-mono-num text-[var(--accent-amber)]">
                        {dayTasks.length} due
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const style = EVENT_CATEGORY_STYLES[ev.category];
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelection({ type: 'event', id: ev.id });
                          }}
                          className="w-full text-left px-1.5 py-0.5 rounded text-[11px] truncate border-l-2"
                          style={{
                            backgroundColor: isDark ? style.bgDark : style.bgLight,
                            borderLeftColor: style.bar,
                            color: isDark ? style.textDark : style.textLight,
                          }}
                        >
                          {ev.allDay ? ev.title : `${formatMinutes(ev.startMinutes, true)} ${ev.title}`}
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[10.5px] text-[var(--ink-muted)] pl-1">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA TIMELINE VIEW */}
      {calendarMode === 'agenda' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5 max-w-4xl">
          {Array.from({ length: 10 }, (_, idx) => addDays(selectedDate, idx)).map((dKey) => {
            const d = fromDateKey(dKey);
            const dayEvents = filteredEvents
              .filter((e) => e.date === dKey)
              .sort((a, b) => a.startMinutes - b.startMinutes);
            const dayTasks = snapshot.tasks.filter((t) => t.dueDate === dKey);
            if (dayEvents.length === 0 && dayTasks.length === 0) return null;

            return (
              <div key={dKey} className="studio-card rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b flex items-center justify-between bg-[var(--bg-elevated)]/60">
                  <div className="flex items-center gap-2.5">
                    <span className="font-display font-bold text-[14px]">
                      {WEEKDAY_SHORT[d.getDay()]}, {SHORT_MONTH_NAMES[d.getMonth()]} {d.getDate()}
                    </span>
                    {dKey === todayKey && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--accent-primary)] text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[11.5px] font-mono-num text-[var(--ink-muted)]">
                    {dayEvents.length} events · {dayTasks.length} tasks
                  </span>
                </div>
                <div className="divide-y">
                  {dayEvents.map((ev) => {
                    const style = EVENT_CATEGORY_STYLES[ev.category];
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelection({ type: 'event', id: ev.id })}
                        className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-[var(--bg-hover)]/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: style.bar }} />
                          <div className="min-w-0">
                            <p className="font-medium text-[13.5px] truncate">{ev.title}</p>
                            {ev.location && <p className="text-[12px] text-[var(--ink-muted)]">{ev.location}</p>}
                          </div>
                        </div>
                        <span className="font-mono-num text-[12px] text-[var(--ink-secondary)] shrink-0">
                          {ev.allDay ? 'All day' : formatTimeRange(ev.startMinutes, ev.durationMinutes)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Slot Creation Popover Modal */}
      {quickSlot && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateQuickSlot}
            className="w-full max-w-md rounded-2xl border p-5 space-y-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--rule-strong)',
              boxShadow: 'var(--shadow-panel)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-[16px]">Schedule calendar block</h3>
              <button
                type="button"
                onClick={() => setQuickSlot(null)}
                className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                autoFocus
                required
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Block title (e.g. Architecture deep focus)"
                className="w-full px-3 py-2 rounded-lg border text-[13.5px] bg-[var(--bg-inset)] focus:outline-none focus:border-[var(--accent-primary)]"
              />

              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <label className="space-y-1">
                  <span className="text-[var(--ink-secondary)] block">Date</span>
                  <input
                    type="date"
                    value={quickSlot.date}
                    onChange={(e) => setQuickSlot({ ...quickSlot, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border bg-[var(--bg-inset)] font-mono-num"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[var(--ink-secondary)] block">Duration</span>
                  <select
                    value={draftDuration}
                    onChange={(e) => setDraftDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border bg-[var(--bg-inset)]"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-2 text-[12px] text-[var(--ink-secondary)]">
                <Clock className="w-3.5 h-3.5" />
                <span>Starts at {formatMinutes(quickSlot.startMinutes)}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(EVENT_CATEGORY_STYLES) as EventCategory[]).map((cat) => {
                  const meta = EVENT_CATEGORY_STYLES[cat];
                  const active = draftCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDraftCategory(cat)}
                      className="px-2.5 py-1 rounded-full text-[11.5px] font-medium border transition-colors"
                      style={{
                        borderColor: active ? meta.bar : 'var(--rule-hairline)',
                        backgroundColor: active ? (isDark ? meta.bgDark : meta.bgLight) : 'transparent',
                        color: active ? (isDark ? meta.textDark : meta.textLight) : 'var(--ink-secondary)',
                      }}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setQuickSlot(null)}
                className="px-3 py-1.5 rounded-lg border text-[12.5px] hover:bg-[var(--bg-hover)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-[12.5px] font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Create block
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
