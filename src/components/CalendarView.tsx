import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Flame,
  Globe,
  GripHorizontal,
  Pause,
  Play,
  Plus,
  Repeat,
  Share2,
  SlidersHorizontal,
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
import { AnimatedContent, GlareHover, RubberSegment, ShinyText, SpotlightCard, SquishSwitch } from '../lib/reactbits';

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
    focusRunning,
    focusSecondsLeft,
    activeFocusTaskId,
    setActiveFocusTaskId,
    setFocusRunning,
    setFocusCurtainOpen,
    setMobileInspectorOpen,
  } = useWorkspace();

  const [quickSlot, setQuickSlot] = useState<{ date: string; startMinutes: number } | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState<EventCategory>('deep');
  const [draftDuration, setDraftDuration] = useState(60);
  const [dragHoverCell, setDragHoverCell] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ id: string; date: string; startMinutes: number } | null>(null);

  const resizeRef = useRef<{ id: string; origDuration: number; startY: number } | null>(null);
  const gridBodyRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const didInitialScrollRef = useRef(false);
  const suppressClickRef = useRef(false);
  const isDark = snapshot.preferences.theme === 'dark';

  useEffect(() => {
    if (didInitialScrollRef.current) return;
    const scroller = scrollContainerRef.current;
    if (!scroller) return;
    didInitialScrollRef.current = true;
    const todayTimed = snapshot.events.filter((e) => !e.allDay && e.date === selectedDate);
    const earliestMins =
      todayTimed.length > 0
        ? Math.min(...todayTimed.map((e) => e.startMinutes))
        : nowMinutes;
    const targetHour = Math.max(START_HOUR, Math.floor(earliestMins / 60) - 1);
    scroller.scrollTop = Math.max(0, (targetHour - START_HOUR) * HOUR_HEIGHT);
  }, [nowMinutes, selectedDate, snapshot.events]);

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

  const startResize = (e: React.PointerEvent, ev: CalendarEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = { id: ev.id, origDuration: ev.durationMinutes, startY: e.clientY };

    const onMove = (moveEvt: PointerEvent) => {
      if (!resizeRef.current) return;
      const dy = moveEvt.clientY - resizeRef.current.startY;
      const deltaMinutes = Math.round(((dy / HOUR_HEIGHT) * 60) / 15) * 15;
      const nextDur = Math.max(15, Math.min(480, resizeRef.current.origDuration + deltaMinutes));
      updateEvent(resizeRef.current.id, { durationMinutes: nextDur });
    };

    const onUp = () => {
      resizeRef.current = null;
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 90);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const startDragBlock = (e: React.PointerEvent, ev: CalendarEvent, forceImmediate = false) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (forceImmediate) e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const isMouse = e.pointerType === 'mouse';
    const gutterWidth = snapshot.preferences.showSecondaryTz ? 72 : 52;
    let dragActive = forceImmediate;
    let cancelled = false;
    let latestTarget = { date: ev.date, startMinutes: ev.startMinutes };
    let holdTimer: number | null = null;

    const activateDrag = () => {
      if (cancelled || dragActive) return;
      dragActive = true;
      setDragPreview({ id: ev.id, date: ev.date, startMinutes: ev.startMinutes });
    };

    if (!isMouse && !forceImmediate) {
      holdTimer = window.setTimeout(activateDrag, 190);
    }

    const onMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startX;
      const dy = moveEvt.clientY - startY;
      if (!dragActive) {
        if (isMouse && Math.hypot(dx, dy) > 5) {
          activateDrag();
        } else if (!isMouse && Math.hypot(dx, dy) > 9) {
          // Allow native vertical/horizontal touch scroll when not gripping handle or long-pressing
          cancelled = true;
          cleanup();
          return;
        }
      }
      if (!dragActive) return;

      const deltaMins = Math.round(((dy / HOUR_HEIGHT) * 60) / 15) * 15;
      const snappedStart = Math.max(
        START_HOUR * 60,
        Math.min((END_HOUR + 1) * 60 - Math.max(30, ev.durationMinutes), ev.startMinutes + deltaMins)
      );

      let targetDate = ev.date;
      const rect = gridBodyRef.current?.getBoundingClientRect();
      if (rect && visibleDates.length > 1) {
        const colsLeft = rect.left + gutterWidth;
        const colsWidth = Math.max(1, rect.width - gutterWidth);
        const rawIdx = Math.floor(((moveEvt.clientX - colsLeft) / colsWidth) * visibleDates.length);
        const clampedIdx = Math.max(0, Math.min(visibleDates.length - 1, rawIdx));
        targetDate = visibleDates[clampedIdx] ?? ev.date;
      }

      latestTarget = { date: targetDate, startMinutes: snappedStart };
      setDragPreview({ id: ev.id, date: targetDate, startMinutes: snappedStart });
    };

    const cleanup = () => {
      if (holdTimer !== null) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    const onUp = () => {
      cleanup();
      setDragPreview(null);
      if (dragActive && (latestTarget.date !== ev.date || latestTarget.startMinutes !== ev.startMinutes)) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 120);
        updateEvent(ev.id, { date: latestTarget.date, startMinutes: latestTarget.startMinutes });
        pushToast(
          'Block rescheduled',
          `${ev.title} (${formatReadableDate(latestTarget.date)} at ${formatMinutes(latestTarget.startMinutes, true)})`,
          true
        );
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const showTimeGrid = calendarMode !== 'month' && calendarMode !== 'agenda';
  // Pixel-exact coordinate aligned cleanly with hour rows (no double pt offset!)
  const nowTopPx = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;

  const visibleDateSet = useMemo(() => new Set(visibleDates), [visibleDates]);
  const visibleEvents = useMemo(
    () => filteredEvents.filter((e) => visibleDateSet.has(e.date)),
    [filteredEvents, visibleDateSet]
  );

  const categoryCounts = useMemo(() => {
    const map: Record<EventCategory, number> = {
      deep: 0,
      meeting: 0,
      personal: 0,
      health: 0,
      deadline: 0,
    };
    for (const ev of visibleEvents) {
      map[ev.category] = (map[ev.category] ?? 0) + 1;
    }
    return map;
  }, [visibleEvents]);

  const selectedDayBookedMins = useMemo(
    () =>
      filteredEvents
        .filter((e) => e.date === selectedDate && !e.allDay)
        .reduce((acc, e) => acc + e.durationMinutes, 0),
    [filteredEvents, selectedDate]
  );

  const todayOpenTasks = useMemo(
    () => snapshot.tasks.filter((t) => !t.completed && t.dueDate === todayKey).length,
    [snapshot.tasks, todayKey]
  );

  const focusTimerLabel = `${String(Math.floor(focusSecondsLeft / 60)).padStart(2, '0')}:${String(
    focusSecondsLeft % 60
  ).padStart(2, '0')}`;

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-[var(--bg-canvas)] overflow-hidden relative">
      {/* Calendar Header Toolbar */}
      <div
        className="px-3 sm:px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 bg-[var(--bg-surface)]"
        style={{ borderColor: 'var(--rule-hairline)' }}
      >
        <div className="flex items-center justify-between gap-2 min-w-0 w-full sm:w-auto">
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

            <h2 className="font-display font-bold text-[15px] sm:text-[18px] tracking-tight text-[var(--ink-primary)] truncate">
              {headerTitle}
            </h2>
          </div>

          <div className="flex sm:hidden items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setAvailabilityMode(!availabilityMode);
                if (!availabilityMode) pushToast('Pick open slots', 'Tap hours on grid to share');
              }}
              aria-label="Share open times"
              className="p-1.5 rounded-lg border text-[var(--ink-secondary)]"
              style={{
                backgroundColor: availabilityMode ? 'var(--accent-primary-soft)' : 'var(--bg-inset)',
                borderColor: availabilityMode ? 'var(--accent-primary)' : 'var(--rule-hairline)',
                color: availabilityMode ? 'var(--accent-primary)' : 'var(--ink-secondary)',
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen((v) => !v)}
              aria-label="Filter calendar categories"
              className="p-1.5 rounded-lg border relative text-[var(--ink-secondary)]"
              style={{
                backgroundColor: mobileFilterOpen || categoryFilter ? 'var(--bg-elevated)' : 'var(--bg-inset)',
                borderColor: categoryFilter ? 'var(--accent-primary)' : 'var(--rule-hairline)',
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {categoryFilter && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
              )}
            </button>
          </div>
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

          <div
            className="hidden md:inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11.5px] font-mono-num text-[var(--ink-secondary)]"
            title="Toggle secondary timezone ruler"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
            <span>{snapshot.preferences.showSecondaryTz ? snapshot.preferences.secondaryTimezone : 'UTC'}</span>
            <SquishSwitch
              checked={snapshot.preferences.showSecondaryTz}
              onChange={(next: boolean) => updatePreferences({ showSecondaryTz: next })}
              ariaLabel="Toggle secondary timezone ruler"
              width={40}
              height={22}
              radius={11}
              trackColor={isDark ? '#272a36' : '#d4d8e2'}
              trackOnColor="#E74004"
              thumbColor={isDark ? '#e2e6ef' : '#ffffff'}
              thumbOnColor="#ffffff"
              stretch={45}
            />
          </div>

          <div className="flex sm:hidden items-center rounded-lg border bg-[var(--bg-inset)] p-0.5 w-full justify-between">
            {MODE_OPTIONS.map((m) => {
              const active = calendarMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCalendarMode(m.id)}
                  className="flex-1 px-2 py-1.5 rounded-md text-[11.5px] font-medium transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                    color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                    boxShadow: active ? 'inset 0 0 0 1px var(--rule-hairline)' : 'none',
                  }}
                >
                  {m.short}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block">
            <RubberSegment
              items={MODE_OPTIONS.map((m) => ({ value: m.id, label: m.label }))}
              value={calendarMode}
              onChange={(val: string) => setCalendarMode(val as CalendarMode)}
              size="sm"
              equalSlots={false}
              radius={10}
              stretch={34}
              squash={22}
              trackColor={isDark ? '#151821' : '#eaedf3'}
              thumbColor={isDark ? '#242938' : '#ffffff'}
              textColor={isDark ? '#b4bccb' : '#4b5563'}
              activeTextColor={isDark ? '#ffffff' : '#0f1115'}
              ariaLabel="Calendar layout mode"
              className="border"
            />
          </div>

          <div className="hidden sm:inline-flex">
            <GlareHover glareColor="#ffffff" glareOpacity={0.2} borderRadius="8px" className="inline-flex">
              <button
                type="button"
                onClick={() => setQuickSlot({ date: selectedDate, startMinutes: 10 * 60 })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg studio-card text-[12px] font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>New block</span>
              </button>
            </GlareHover>
          </div>
        </div>
      </div>

      {/* Scannable Category Spotlight & Live Today Status Strip */}
      <div
        className={`${
          mobileFilterOpen ? 'flex flex-wrap' : 'hidden sm:flex'
        } px-3 sm:px-4 py-1.5 border-b items-center justify-between gap-2 bg-[var(--bg-surface)]/55 shrink-0`}
        style={{ borderColor: 'var(--rule-hairline)' }}
      >
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 min-w-0">
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border transition-all"
            style={{
              backgroundColor: categoryFilter === null ? 'var(--bg-elevated)' : 'transparent',
              borderColor: categoryFilter === null ? 'var(--rule-strong)' : 'var(--rule-hairline)',
              color: categoryFilter === null ? 'var(--ink-primary)' : 'var(--ink-secondary)',
            }}
          >
            <span>All</span>
            <span className="font-mono-num text-[10px] opacity-75">{visibleEvents.length}</span>
          </button>

          {(Object.keys(EVENT_CATEGORY_STYLES) as EventCategory[]).map((cat) => {
            const meta = EVENT_CATEGORY_STYLES[cat];
            const active = categoryFilter === cat;
            const count = categoryCounts[cat];
            if (count === 0 && !active) return null;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(active ? null : cat)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: active ? (isDark ? meta.bgDark : meta.bgLight) : 'transparent',
                  borderColor: active ? meta.bar : 'var(--rule-hairline)',
                  color: active ? (isDark ? meta.textDark : meta.textLight) : 'var(--ink-secondary)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.bar }} />
                <span>{meta.label}</span>
                <span className="font-mono-num text-[10px] opacity-80">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0 text-[11px]">
          {focusRunning && (
            <button
              type="button"
              onClick={() => setFocusCurtainOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10.5px] font-medium transition-colors"
              style={{
                borderColor: 'rgba(231, 64, 4, 0.45)',
                backgroundColor: 'rgba(231, 64, 4, 0.14)',
                color: 'var(--ink-primary)',
              }}
              title="Open distraction-free Focus Curtain"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent-primary)]" />
              </span>
              <Flame className="w-3 h-3 text-[var(--accent-primary)]" />
              <ShinyText text={`Focus ${focusTimerLabel}`} color="var(--ink-primary)" shineColor="#FFFFFF" speed={2.2} />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[var(--ink-secondary)]">
            <span className="font-mono-num">
              {selectedDate === todayKey ? 'Today' : SHORT_MONTH_NAMES[selectedDateObj.getMonth()] + ' ' + selectedDateObj.getDate()}:{' '}
              <strong className="text-[var(--ink-primary)] font-semibold">
                {Math.round((selectedDayBookedMins / 60) * 10) / 10}h
              </strong>
            </span>
            <div className="w-10 h-1.5 rounded-full bg-[var(--bg-inset)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((selectedDayBookedMins / 480) * 100))}%`,
                  backgroundColor: selectedDayBookedMins >= 360 ? 'var(--accent-primary)' : 'var(--accent-sky)',
                }}
              />
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] font-mono-num text-[10px] text-[var(--ink-secondary)]">
              {todayOpenTasks} due
            </span>
          </div>
        </div>
      </div>

      {/* TIME GRID VIEWS */}
      {showTimeGrid && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div ref={scrollContainerRef} className="flex-1 overflow-auto relative">
            <div
              className={`flex flex-col min-h-full ${
                calendarMode === 'week' || calendarMode === 'workweek' ? 'min-w-[630px] md:min-w-0' : 'w-full'
              }`}
            >
              {/* Opaque Sticky Day Headers aligned to columns */}
              <div
                className="sticky top-0 grid border-b bg-[var(--bg-surface)] shrink-0 z-30"
                style={{
                  gridTemplateColumns: `${snapshot.preferences.showSecondaryTz ? '72px' : '52px'} repeat(${visibleDates.length}, minmax(0, 1fr))`,
                  borderColor: 'var(--rule-hairline)',
                }}
              >
            <div className="border-r px-1.5 py-2 pb-2.5 flex items-end justify-end gap-1 text-[9.5px] font-mono-num text-[var(--ink-muted)] bg-[var(--bg-surface)]">
              {snapshot.preferences.showSecondaryTz && <span className="hidden sm:inline opacity-75">UTC</span>}
              <span>
                {(() => {
                  const mins = -new Date().getTimezoneOffset();
                  const sign = mins >= 0 ? '+' : '-';
                  const absH = Math.floor(Math.abs(mins) / 60);
                  return mins === 0 ? 'UTC' : `GMT${sign}${absH}`;
                })()}
              </span>
            </div>

            {visibleDates.map((dKey) => {
              const d = fromDateKey(dKey);
              const isToday = dKey === todayKey;
              const isSel = dKey === selectedDate;
              const allDayEvents = filteredEvents.filter((e) => e.date === dKey && e.allDay);
              const dayHours =
                Math.round(
                  (filteredEvents
                    .filter((e) => e.date === dKey && !e.allDay)
                    .reduce((acc, e) => acc + e.durationMinutes, 0) /
                    60) *
                    10
                ) / 10;

              return (
                <div
                  key={dKey}
                  onClick={() => setSelectedDate(dKey)}
                  className="border-r last:border-r-0 px-2 py-2 cursor-pointer transition-colors hover:bg-[var(--bg-hover)]/40"
                  style={{
                    backgroundColor: isToday
                      ? isDark
                        ? 'rgba(231,64,4,0.05)'
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
                    {dayHours > 0 && (
                      <span className="hidden lg:inline text-[10px] font-mono-num text-[var(--ink-muted)]">
                        {dayHours}h
                      </span>
                    )}
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

          {/* Scrollable Hourly Grid Body */}
          <div className="relative pt-3 pb-20 sm:pb-6">
            <div
              ref={gridBodyRef}
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
                const dayEvents = [
                  ...filteredEvents.filter((e) => e.date === dKey && !(dragPreview && dragPreview.id === e.id)),
                  ...(dragPreview && dragPreview.date === dKey
                    ? filteredEvents
                        .filter((e) => e.id === dragPreview.id)
                        .map((e) => ({ ...e, date: dragPreview.date, startMinutes: dragPreview.startMinutes }))
                    : []),
                ];
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
                      const isPrimeHour = h >= 9 && h <= 17;
                      const isCellHovered = hoveredCell === cellId;
                      const avail = availabilitySlots.find(
                        (s) => s.date === dKey && s.startMinutes === startMins
                      );
                      return (
                        <div
                          key={h}
                          onMouseEnter={() => setHoveredCell(cellId)}
                          onMouseLeave={() => setHoveredCell(null)}
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
                          className="relative border-b transition-colors cursor-pointer group/cell"
                          style={{
                            height: `${HOUR_HEIGHT}px`,
                            borderColor: isDark ? 'rgba(255,255,255,0.065)' : 'rgba(15,23,42,0.07)',
                            backgroundColor: avail
                              ? 'var(--accent-emerald-soft)'
                              : dragHoverCell === cellId
                                ? 'var(--accent-primary-soft)'
                                : isCellHovered
                                  ? isDark
                                    ? 'rgba(231, 64, 4, 0.055)'
                                    : 'rgba(231, 64, 4, 0.04)'
                                  : isPrimeHour
                                    ? isDark
                                      ? 'rgba(255,255,255,0.012)'
                                      : 'rgba(15,23,42,0.008)'
                                    : 'transparent',
                          }}
                        >
                          {/* Crisp subtle 30-minute guide rule */}
                          <div
                            className="pointer-events-none absolute left-0 right-0 top-1/2 border-t border-dashed"
                            style={{ borderColor: isDark ? 'rgba(255,255,255,0.032)' : 'rgba(15,23,42,0.035)' }}
                          />

                          {avail && (
                            <div className="px-2 py-1 text-[10.5px] font-medium text-[var(--accent-emerald)]">
                              Open slot
                            </div>
                          )}

                          {!avail && isCellHovered && (
                            <div className="pointer-events-none px-1.5 py-1 flex items-center gap-1 text-[10px] font-mono-num text-[var(--accent-primary)] opacity-90">
                              <Plus className="w-2.5 h-2.5" />
                              <span>{availabilityMode ? 'Pick open' : formatMinutes(startMins, true)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Live Pulsing Current Time Indicator */}
                    {isToday && nowTopPx >= 0 && nowTopPx <= hours.length * HOUR_HEIGHT && (
                      <div
                        className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                        style={{ top: `${nowTopPx}px` }}
                      >
                        <span className="relative flex items-center justify-center ml-1 shrink-0">
                          <span
                            className="motion-safe:animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-60"
                            style={{ backgroundColor: 'var(--accent-primary)' }}
                          />
                          <span
                            className="relative w-2 h-2 rounded-full"
                            style={{ backgroundColor: 'var(--accent-primary)' }}
                          />
                        </span>
                        <span
                          className="ml-1 px-1 py-0 rounded text-[9px] font-mono-num font-bold text-white leading-tight shrink-0"
                          style={{ backgroundColor: 'var(--accent-primary)' }}
                        >
                          {formatMinutes(nowMinutes, true)}
                        </span>
                        <div className="flex-1 h-[1.5px]" style={{ backgroundColor: 'var(--accent-primary)' }} />
                      </div>
                    )}

                    {/* Positioned Event Blocks (vivid scannable cards + hover focus launch + overlap lanes) */}
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
                      const isFocusLinked =
                        focusRunning &&
                        ((linkedTask && activeFocusTaskId === linkedTask.id) ||
                          (!activeFocusTaskId && isToday && event.category === 'deep' && event.id === 'ev-wed-1'));
                      const isDimmed = categoryFilter !== null && event.category !== categoryFilter;
                      const isDragging = dragPreview?.id === event.id;
                      const edgeTone = isDragging || isFocusLinked
                        ? 'var(--accent-primary)'
                        : isDark
                          ? style.borderDark
                          : style.borderLight;

                      return (
                        <div
                          key={event.id}
                          title={`${event.title} (${formatTimeRange(event.startMinutes, event.durationMinutes)})`}
                          onPointerDown={(e) => startDragBlock(e, event, false)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (suppressClickRef.current) return;
                            setSelection({ type: 'event', id: event.id });
                            setMobileInspectorOpen(true);
                          }}
                          className={`group absolute rounded-lg px-2 py-1 overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all duration-150 hover:-translate-y-[1px] hover:z-30 flex flex-col gap-1 backdrop-blur-[3px] ${
                            isDragging ? 'z-40 scale-[1.03] shadow-2xl' : 'z-20'
                          }`}
                          style={{
                            top: `${top + 1}px`,
                            height: `${height}px`,
                            left: leftExpr,
                            width: widthExpr,
                            background: isDark
                              ? `linear-gradient(155deg, ${style.bgDark} 0%, rgba(17, 19, 25, 0.72) 100%)`
                              : `linear-gradient(155deg, ${style.bgLight} 0%, rgba(255, 255, 255, 0.85) 100%)`,
                            borderTop: `1px solid ${edgeTone}`,
                            borderRight: `1px solid ${edgeTone}`,
                            borderBottom: `1px solid ${edgeTone}`,
                            borderLeft: `3px solid ${style.bar}`,
                            color: isDark ? style.textDark : style.textLight,
                            opacity: isDone ? 0.58 : isDimmed ? 0.22 : 1,
                            boxShadow: isDragging
                              ? '0 0 0 2px rgba(231,64,4,0.85), 0 14px 32px rgba(0,0,0,0.55)'
                              : isFocusLinked
                                ? '0 0 0 1px rgba(231,64,4,0.6), 0 8px 24px -6px rgba(231,64,4,0.45)'
                                : isSelected
                                  ? `0 0 0 1px ${style.bar}, 0 8px 20px -6px ${isDark ? style.glowDark : 'rgba(15,23,42,0.16)'}`
                                  : `0 2px 8px -2px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(15,23,42,0.06)'}`,
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
                                className="mt-0.5 w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 transition-transform active:scale-75 hover:scale-110"
                                style={{
                                  borderColor: style.bar,
                                  backgroundColor: isDone ? style.bar : 'transparent',
                                }}
                              >
                                {isDone && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                              </button>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-1">
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

                                {height >= 36 && (
                                  <div className="shrink-0 flex items-center gap-1">
                                    {totalCols === 1 && calendarMode !== 'week' && (
                                      <span
                                        className="px-1.5 py-0 rounded text-[9px] font-semibold group-hover:opacity-0 transition-opacity"
                                        style={{
                                          backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)',
                                          color: style.bar,
                                        }}
                                      >
                                        {isFocusLinked ? 'LIVE' : style.shortLabel}
                                      </span>
                                    )}
                                    <span
                                      onPointerDown={(e) => startDragBlock(e, event, true)}
                                      onClick={(e) => e.stopPropagation()}
                                      title="Drag to move"
                                      style={{ touchAction: 'none' }}
                                      className="sm:hidden inline-flex items-center justify-center w-4 h-4 rounded text-[var(--ink-secondary)] opacity-75"
                                    >
                                      <GripHorizontal className="w-3 h-3" />
                                    </span>
                                  </div>
                                )}
                              </div>

                              {height >= 36 && totalCols === 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (linkedTask) setActiveFocusTaskId(linkedTask.id);
                                    setSelection({ type: 'event', id: event.id });
                                    setFocusRunning(isFocusLinked ? !focusRunning : true);
                                  }}
                                  title={isFocusLinked ? 'Pause focus timer' : 'Start focus timer on this block'}
                                  aria-label={isFocusLinked ? `Pause focus for ${event.title}` : `Focus on ${event.title}`}
                                  className="hidden group-hover:inline-flex items-center justify-center absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-white shadow-sm transition-transform hover:scale-110 z-10"
                                  style={{ backgroundColor: style.bar }}
                                >
                                  {isFocusLinked ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                                </button>
                              )}

                              {height >= 34 && (
                                <div className="mt-0.5 flex items-center justify-between gap-1 text-[10px] opacity-90 font-mono-num">
                                  <div className="flex items-center gap-1 truncate">
                                    <span>
                                      {calendarMode !== 'week' && height >= 92
                                        ? formatTimeRange(event.startMinutes, event.durationMinutes)
                                        : formatMinutes(event.startMinutes, true)}
                                    </span>
                                    {event.videoLink && <Video className="w-2.5 h-2.5 shrink-0" />}
                                    {event.recurrence !== 'none' && <Repeat className="w-2.5 h-2.5 shrink-0" />}
                                  </div>
                                  {calendarMode === 'week' && totalCols === 1 && (
                                    <span
                                      className="text-[9px] font-sans font-semibold shrink-0 opacity-85"
                                      style={{ color: style.bar }}
                                    >
                                      {isFocusLinked ? 'LIVE' : style.shortLabel}
                                    </span>
                                  )}
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
                            onPointerDown={(e) => startResize(e, event)}
                            onClick={(e) => e.stopPropagation()}
                            title="Drag to adjust duration"
                            style={{ touchAction: 'none' }}
                            className="absolute bottom-0 left-0 right-0 h-2.5 cursor-ns-resize flex items-center justify-center opacity-60 sm:opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
                          >
                            <span className="w-6 h-0.5 rounded-full bg-white/35" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
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
        <AnimatedContent
          key="month-view"
          trigger="load"
          distance={10}
          duration={0.26}
          ease="power2.out"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="grid grid-cols-7 border-b bg-[var(--bg-surface)]">
            {(snapshot.preferences.weekStartsOn === 1
              ? [...WEEKDAY_SHORT.slice(1), WEEKDAY_SHORT[0]]
              : WEEKDAY_SHORT
            ).map((wd) => (
              <div key={wd} className="px-1.5 sm:px-3 py-2 text-center sm:text-left text-[11px] sm:text-[11.5px] font-medium text-[var(--ink-secondary)] border-r last:border-r-0">
                {wd}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-y-auto">
            {visibleDates.map((dKey) => {
              const d = fromDateKey(dKey);
              const inMonth = d.getMonth() === selectedDateObj.getMonth();
              const isToday = dKey === todayKey;
              const isSel = dKey === selectedDate;
              const dayEvents = filteredEvents.filter((e) => e.date === dKey);
              const dayTasks = snapshot.tasks.filter((t) => !t.completed && t.dueDate === dKey);

              return (
                <div
                  key={dKey}
                  onClick={() => setSelectedDate(dKey)}
                  onDoubleClick={() => setQuickSlot({ date: dKey, startMinutes: 10 * 60 })}
                  className="border-r border-b last:border-r-0 p-1 sm:p-2 min-h-[58px] sm:min-h-[104px] flex flex-col gap-1 cursor-pointer hover:bg-[var(--bg-hover)]/35 transition-colors"
                  style={{
                    opacity: inMonth ? 1 : 0.45,
                    backgroundColor: isSel && !isToday ? 'var(--bg-elevated)' : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[11.5px] sm:text-[12px] font-mono-num font-semibold"
                      style={{
                        backgroundColor: isToday ? 'var(--accent-primary)' : 'transparent',
                        color: isToday ? '#FFFFFF' : 'var(--ink-primary)',
                      }}
                    >
                      {d.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="hidden sm:inline text-[10px] font-mono-num text-[var(--accent-amber)]">
                        {dayTasks.length} due
                      </span>
                    )}
                  </div>

                  {/* Mobile Month compact dots */}
                  <div className="flex sm:hidden flex-wrap gap-1 px-0.5">
                    {dayEvents.slice(0, 4).map((ev) => (
                      <span
                        key={ev.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: EVENT_CATEGORY_STYLES[ev.category].bar }}
                      />
                    ))}
                  </div>

                  <div className="hidden sm:block space-y-1 overflow-hidden">
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

          {/* Mobile Selected Day Schedule Strip in Month view */}
          <div className="sm:hidden border-t bg-[var(--bg-surface)] p-3 pb-16 space-y-2 max-h-[210px] overflow-y-auto shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-display font-semibold text-[13px]">{formatReadableDate(selectedDate)}</span>
              <button
                type="button"
                onClick={() => setQuickSlot({ date: selectedDate, startMinutes: 10 * 60 })}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Plus className="w-3 h-3" />
                <span>Add block</span>
              </button>
            </div>
            {filteredEvents.filter((e) => e.date === selectedDate).map((ev) => {
              const style = EVENT_CATEGORY_STYLES[ev.category];
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    setSelection({ type: 'event', id: ev.id });
                    setMobileInspectorOpen(true);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border-l-2 bg-[var(--bg-elevated)] text-left"
                  style={{ borderLeftColor: style.bar }}
                >
                  <span className="text-[12.5px] font-medium truncate">{ev.title}</span>
                  <span className="text-[11px] font-mono-num text-[var(--ink-secondary)] shrink-0">
                    {ev.allDay ? 'All day' : formatMinutes(ev.startMinutes, true)}
                  </span>
                </button>
              );
            })}
            {filteredEvents.filter((e) => e.date === selectedDate).length === 0 && (
              <p className="text-[12px] text-[var(--ink-muted)]">No events scheduled for this date.</p>
            )}
          </div>
        </AnimatedContent>
      )}

      {/* AGENDA TIMELINE VIEW */}
      {calendarMode === 'agenda' && (
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatedContent
            key="agenda-view"
            trigger="load"
            distance={12}
            duration={0.32}
            stagger={0.04}
            ease="back.out(1.2)"
            className="space-y-5 max-w-4xl"
          >
            {Array.from({ length: 10 }, (_, idx) => addDays(selectedDate, idx)).map((dKey) => {
              const d = fromDateKey(dKey);
              const dayEvents = filteredEvents
                .filter((e) => e.date === dKey)
                .sort((a, b) => a.startMinutes - b.startMinutes);
              const dayTasks = snapshot.tasks.filter((t) => t.dueDate === dKey);
              if (dayEvents.length === 0 && dayTasks.length === 0) return null;

              return (
                <SpotlightCard
                  key={dKey}
                  theme={isDark ? 'dark' : 'light'}
                  spotlightColor={isDark ? 'rgba(231, 64, 4, 0.12)' : 'rgba(231, 64, 4, 0.06)'}
                  intensity={isDark ? 0.1 : 0.05}
                  className="studio-card rounded-xl overflow-hidden"
                >
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
                          onClick={() => {
                            setSelection({ type: 'event', id: ev.id });
                            setMobileInspectorOpen(true);
                          }}
                          className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-[var(--bg-hover)]/40 transition-colors"
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
                </SpotlightCard>
              );
            })}
          </AnimatedContent>
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
