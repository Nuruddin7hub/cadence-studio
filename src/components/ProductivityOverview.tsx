import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckSquare,
  Cloud,
  Command,
  Flame,
  Keyboard,
  Layers,
  ShieldCheck,
  Sparkles,
  Timer,
  UserPlus,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  addDays,
  formatMinutes,
  formatReadableDate,
  fromDateKey,
  getIsoWeekNumber,
  getWeekDates,
  MONTH_NAMES,
  WEEKDAY_SHORT,
} from '../utils/date';
import { formatBytes } from '../utils/authStorage';
import { EVENT_CATEGORY_STYLES } from '../utils/themeTokens';
import {
  AnimatedContent,
  Aurora,
  BlurText,
  BorderGlow,
  CardSwap,
  CountUp,
  Counter,
  DecryptedText,
  Dock,
  DotGrid,
  FadeContent,
  Folder,
  GlareHover,
  GradientText,
  LineWaves,
  MagicBento,
  Magnet,
  RotatingText,
  ScrollVelocity,
  ShinyText,
  SpotlightCard,
  TextType,
  TiltedCard,
} from '../lib/reactbits';

const SHORTCUTS = [
  { keys: 'Ctrl+K', desc: 'Open global command palette' },
  { keys: 'D / W / M / A', desc: 'Switch Day, Week, Month, or Agenda view' },
  { keys: 'T', desc: 'Jump calendar directly back to Today' },
  { keys: '1 - 5', desc: 'Switch Planner, Tasks, Focus, Analytics, Overview' },
  { keys: 'Ctrl+Z', desc: 'Undo last schedule or task change' },
  { keys: 'Left / Right', desc: 'Step previous or next day or week' },
];

export const ProductivityOverview: React.FC = () => {
  const {
    snapshot,
    todayKey,
    nowMinutes,
    setActiveTab,
    setCommandOpen,
    currentUser,
    cloudSync,
    storageStats,
    openAccountModal,
    starterBannerDismissed,
    dismissStarterBanner,
    importStarterChecklist,
    focusSecondsLeft,
    activeFocusTaskId,
  } = useWorkspace();

  const isDark = snapshot.preferences.theme === 'dark';
  const [isNarrow, setIsNarrow] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 480 : false
  );

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 480);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isBlankWorkspace =
    snapshot.events.length === 0 &&
    snapshot.tasks.length === 0 &&
    snapshot.habits.length === 0;

  const todayObj = useMemo(() => fromDateKey(todayKey), [todayKey]);
  const isoWeek = useMemo(() => getIsoWeekNumber(todayKey), [todayKey]);
  const weekDates = useMemo(
    () => getWeekDates(todayKey, snapshot.preferences.weekStartsOn),
    [todayKey, snapshot.preferences.weekStartsOn]
  );

  const liveStats = useMemo(() => {
    const activeTasks = snapshot.tasks.filter((t) => !t.completed);
    const weekEvents = snapshot.events.filter((e) => !e.allDay && weekDates.includes(e.date));
    const totalMinutes = weekEvents.reduce((sum, e) => sum + e.durationMinutes, 0);
    const deepMinutes = weekEvents
      .filter((e) => e.category === 'deep')
      .reduce((sum, e) => sum + e.durationMinutes, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const deepHours = Math.round((deepMinutes / 60) * 10) / 10;
    const deepPct = totalMinutes > 0 ? Math.round((deepMinutes / totalMinutes) * 100) : 0;

    const dayMinutes = weekDates.map((dKey) =>
      weekEvents.filter((e) => e.date === dKey).reduce((sum, e) => sum + e.durationMinutes, 0)
    );
    const maxDayMins = Math.max(60, ...dayMinutes);
    const dayBarPcts = dayMinutes.map((mins) => (mins > 0 ? Math.max(12, Math.round((mins / maxDayMins) * 100)) : 6));
    const todayIndex = weekDates.indexOf(todayKey);

    const nextTimedToday = snapshot.events
      .filter((e) => e.date === todayKey && !e.allDay && e.startMinutes >= nowMinutes - 15)
      .sort((a, b) => a.startMinutes - b.startMinutes)[0];

    const todayFocusMins = snapshot.focusHistory
      .filter((s) => s.date === todayKey || s.completedAt.startsWith(todayKey))
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      activeTasks,
      totalHours,
      deepHours,
      deepPct,
      dayBarPcts,
      dayMinutes,
      todayIndex,
      nextTimedToday,
      todayFocusMins,
    };
  }, [nowMinutes, snapshot.events, snapshot.focusHistory, snapshot.tasks, todayKey, weekDates]);

  const threeDayCols = useMemo(() => {
    const keys = [addDays(todayKey, -1), todayKey, addDays(todayKey, 1)];
    return keys.map((key) => {
      const d = fromDateKey(key);
      const dayEvents = snapshot.events
        .filter((e) => e.date === key && !e.allDay && snapshot.enabledLayers[e.calendarId])
        .sort((a, b) => a.startMinutes - b.startMinutes)
        .slice(0, 4);
      return {
        key,
        isToday: key === todayKey,
        label: `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()}${key === todayKey ? ' · Today' : ''}`,
        events: dayEvents,
      };
    });
  }, [snapshot.enabledLayers, snapshot.events, todayKey]);

  const showcaseHabits = useMemo(() => {
    return snapshot.habits.slice(0, 3).map((h) => {
      let streak = 0;
      for (let i = 0; i < 21; i++) {
        if (h.history[addDays(todayKey, -i)]) streak++;
        else if (i > 0) break;
      }
      const accent =
        h.category === 'health'
          ? 'var(--accent-emerald)'
          : h.category === 'craft'
            ? 'var(--accent-sky)'
            : 'var(--accent-primary)';
      return { id: h.id, name: h.name, streak, accent };
    });
  }, [snapshot.habits, todayKey]);

  const activeFocusTask = useMemo(
    () => snapshot.tasks.find((t) => t.id === activeFocusTaskId) ?? liveStats.activeTasks[0],
    [activeFocusTaskId, liveStats.activeTasks, snapshot.tasks]
  );

  const metrics = useMemo(() => {
    return [
      { value: snapshot.events.length, label: 'Calendar blocks active' },
      { value: liveStats.activeTasks.length, label: 'Open tasks queued' },
      { value: snapshot.habits.length, label: 'Tracked daily habits' },
      { value: snapshot.focusHistory.length, label: 'Logged focus sprints' },
    ];
  }, [liveStats.activeTasks.length, snapshot.events.length, snapshot.focusHistory.length, snapshot.habits.length]);

  const bentoItems = useMemo(
    () => [
      {
        id: 'timeline',
        label: 'Time Blocking',
        title: 'Unified 15m Timeline Grid',
        description: 'Drag unscheduled tasks straight onto hour slots, resize bottom edges, and inspect overlaps side-by-side.',
        colSpan: 2,
        rowSpan: 2,
        onClick: () => setActiveTab('planner'),
        visual: (
          <div className="w-full h-full flex flex-col justify-between p-3.5 rounded-xl border bg-[var(--bg-canvas)]/70 border-[var(--rule-hairline)]">
            <div className="flex items-center justify-between text-[11px] font-mono-num text-[var(--ink-secondary)]">
              <span>Week {isoWeek} Schedule Balance</span>
              <span className="text-[var(--accent-primary)] font-semibold">{liveStats.totalHours}h planned</span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
              {liveStats.dayBarPcts.map((h, i) => (
                <div key={weekDates[i]} className="h-full flex flex-col justify-end gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${h}%`,
                      backgroundColor:
                        i === liveStats.todayIndex
                          ? 'var(--accent-primary)'
                          : liveStats.dayMinutes[i] > 0
                            ? 'rgba(231, 64, 4, 0.3)'
                            : 'var(--bg-elevated)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'analytics',
        label: 'Telemetry',
        title: 'Capacity & Focus Balance',
        description: 'Live planned vs deep work ratios computed directly from your calendar blocks.',
        colSpan: 1,
        rowSpan: 1,
        onClick: () => setActiveTab('analytics'),
        visual: (
          <div className="flex items-baseline justify-between px-3 py-2 rounded-lg border bg-[var(--bg-canvas)]/60 border-[var(--rule-hairline)]">
            <span className="font-display font-bold text-[18px] tabular-nums text-[var(--ink-primary)]">
              {liveStats.deepPct}%
            </span>
            <span className="font-mono-num text-[11px] text-[var(--accent-primary)]">
              {liveStats.deepHours}h deep work
            </span>
          </div>
        ),
      },
      {
        id: 'automation',
        label: 'Quick Capture',
        title: 'Natural-Language Task Parser',
        description: 'Type "Review 2pm 45m !p1 #work" once to schedule and tag.',
        colSpan: 1,
        rowSpan: 1,
        onClick: () => setActiveTab('tasks'),
        visual: (
          <div className="px-2.5 py-2 rounded-lg border bg-[var(--bg-canvas)]/60 border-[var(--rule-hairline)] flex items-center justify-between gap-2 text-[11px] font-mono-num">
            <span className="text-[var(--ink-primary)] truncate">
              {liveStats.activeTasks.length} open · {snapshot.tasks.filter((t) => t.completed).length} done
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] shrink-0">
              NLP
            </span>
          </div>
        ),
      },
      {
        id: 'notes',
        label: 'Daily Rhythm',
        title: 'Pomodoro, Habits & Notes',
        description: 'Turn journal decisions into queued tasks with zero friction.',
        icon: <Flame className="w-4 h-4 text-[var(--accent-primary)]" />,
        colSpan: 1,
        rowSpan: 1,
        onClick: () => setActiveTab('focus'),
      },
      {
        id: 'portability',
        label: 'Ownership',
        title: 'IndexedDB Vault & .ics Export',
        description: 'Local multi-account storage, instant Ctrl+Z undo, JSON account bundle, and calendar export.',
        icon: <Layers className="w-4 h-4 text-[var(--accent-sky)]" />,
        colSpan: 2,
        rowSpan: 1,
        onClick: () => openAccountModal(currentUser ? 'profile' : 'signup'),
      },
    ],
    [
      currentUser,
      isoWeek,
      liveStats.activeTasks.length,
      liveStats.dayBarPcts,
      liveStats.dayMinutes,
      liveStats.deepHours,
      liveStats.deepPct,
      liveStats.todayIndex,
      liveStats.totalHours,
      openAccountModal,
      setActiveTab,
      snapshot.tasks,
      weekDates,
    ]
  );

  const folderCards = useMemo(() => {
    const buildItems = (listId: 'work' | 'design' | 'personal', fallback: { title: string; description: string }[]) => {
      const items = snapshot.tasks
        .filter((t) => t.listId === listId && !t.completed)
        .slice(0, 3)
        .map((t) => ({
          title: t.title.slice(0, 26),
          description: `${t.estimatedMinutes}m · ${t.priority.toUpperCase()}`,
        }));
      return items.length > 0 ? items : fallback;
    };

    return [
      {
        color: '#E74004',
        label: 'Product & Eng',
        count: snapshot.tasks.filter((t) => t.listId === 'work' && !t.completed).length,
        items: buildItems('work', [
          { title: 'Add #work tasks', description: 'Capture sprints & code reviews' },
          { title: 'Schedule deep blocks', description: 'Drag from sidebar onto calendar' },
          { title: 'Track milestones', description: 'Monitor effort in Analytics' },
        ]),
      },
      {
        color: '#14A4FC',
        label: 'Design Systems',
        count: snapshot.tasks.filter((t) => t.listId === 'design' && !t.completed).length,
        items: buildItems('design', [
          { title: 'Collect UI critiques', description: 'Organize specs under Design' },
          { title: 'Time-block reviews', description: 'Lock uninterrupted review hours' },
          { title: 'Kanban status flow', description: 'Track from backlog to shipped' },
        ]),
      },
      {
        color: '#2CCC74',
        label: 'Personal & Health',
        count: snapshot.tasks.filter((t) => t.listId === 'personal' && !t.completed).length,
        items: buildItems('personal', [
          { title: 'Routines & workouts', description: 'Toggle the Wellness calendar layer' },
          { title: '7-day habit streaks', description: 'Log daily wins in Focus Studio' },
          { title: 'Evening journal', description: 'Turn notes directly into tasks' },
        ]),
      },
    ];
  }, [snapshot.tasks]);

  const dockItems = useMemo(
    () => [
      {
        id: 'planner',
        label: 'Planner Timeline',
        icon: <Calendar className="w-5 h-5" />,
        onClick: () => setActiveTab('planner'),
      },
      {
        id: 'tasks',
        label: 'Tasks & Matrix',
        icon: <CheckSquare className="w-5 h-5" />,
        onClick: () => setActiveTab('tasks'),
      },
      {
        id: 'focus',
        label: 'Focus & Habits',
        icon: <Timer className="w-5 h-5" />,
        onClick: () => setActiveTab('focus'),
      },
      {
        id: 'analytics',
        label: 'Time Analytics',
        icon: <BarChart3 className="w-5 h-5" />,
        onClick: () => setActiveTab('analytics'),
      },
      {
        id: 'command',
        label: 'Command Bar (Ctrl+K)',
        icon: <Command className="w-5 h-5" />,
        onClick: () => setCommandOpen(true),
      },
    ],
    [setActiveTab, setCommandOpen]
  );

  return (
    <div id="overview-scroll" className="relative flex-1 min-w-0 overflow-y-auto bg-[var(--bg-canvas)] studio-spotlight-dark">
      {/* Subtle Atmospheric Aurora + DotGrid Backdrop Masked Above the Fold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden z-0"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 20%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 20%, transparent 100%)',
        }}
      >
        <div className="absolute inset-0">
          <DotGrid
            dotSize={2.5}
            gap={24}
            baseColor={isDark ? '#1E2436' : '#CDD2DF'}
            activeColor="#E74004"
            opacity={isDark ? 0.65 : 0.4}
            glow={0.6}
            swell={1.0}
            clickShock
          />
        </div>
        <Aurora
          colorStops={['#E74004', '#F4C46C', '#14A4FC']}
          amplitude={0.85}
          blend={0.62}
          speed={0.85}
          height={0.48}
          opacity={isDark ? 0.42 : 0.14}
          lightMode={!isDark}
        />
      </div>

      {/* Centered Cron + Linear Hero Framed Cleanly Above the Fold (Zero Eyebrow Pill) */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-11 pb-10 flex flex-col items-center justify-center gap-7 text-center">
        <div className="flex flex-col items-center pt-1">
          <h1
            className="font-extrabold tracking-tight leading-[1.02] max-w-4xl flex flex-col items-center"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 'clamp(2.5rem, 4.4vw, 3.9rem)',
              letterSpacing: '-0.04em',
            }}
          >
            <BlurText
              text="Calendar, tasks, and focus."
              animateBy="words"
              delay={25}
              stepDuration={0.22}
              blur={4}
              distance={10}
              trigger="load"
              className="justify-center"
              color={isDark ? '#F6F7F9' : '#0F1115'}
            />
            <GradientText
              colors={
                isDark
                  ? ['#FFFFFF', '#F6EEDF', '#F4C46C', '#E74004', '#FFFFFF']
                  : ['#0F1115', '#48505E', '#E74004', '#0F1115']
              }
              animationSpeed={7}
              scale={2.4}
              className="mt-0.5"
            >
              Finally in one studio.
            </GradientText>
          </h1>

          <div className="mt-4 text-[16px] leading-relaxed text-[var(--ink-secondary)] max-w-2xl flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
            <span>One unified workspace built around</span>
            <RotatingText
              texts={[
                'Time-Blocking Calendars',
                'Natural-Language Tasks',
                'Pomodoro Sprints',
                '7-Day Habit Streaks',
                '.ics Ownership',
              ]}
              effect="flip"
              rotationInterval={2200}
              staggerDuration={0.015}
              splitBy="words"
              highlight
              highlightColor="#E74004"
              mainClassName="px-2.5 py-0.5 rounded-md text-[13.5px] font-semibold"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
            <Magnet padding={36} magnetStrength={4}>
              <GlareHover glareColor="#ffffff" glareOpacity={0.22} borderRadius="9999px" className="inline-flex">
                <button
                  type="button"
                  onClick={() => setActiveTab('planner')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <span>Open Live Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </GlareHover>
            </Magnet>

            {currentUser ? (
              <button
                type="button"
                onClick={() => openAccountModal('profile')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-[13px] font-medium text-[var(--ink-primary)] bg-[var(--bg-surface)]/75 hover:bg-[var(--bg-surface)] transition-colors"
                style={{ borderColor: 'var(--rule-strong)' }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: currentUser.avatarColor }}
                />
                <span>{currentUser.name} Vault</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAccountModal('signup')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-[13px] font-medium text-[var(--ink-primary)] bg-[var(--bg-surface)]/75 hover:bg-[var(--bg-surface)] transition-colors"
                style={{ borderColor: 'var(--rule-strong)' }}
              >
                <UserPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Create Free Account</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-[13px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] bg-[var(--bg-surface)]/65 hover:bg-[var(--bg-surface)] transition-colors"
              style={{ borderColor: 'var(--rule-strong)' }}
            >
              <span>Command Bar</span>
              <kbd className="px-1.5 py-0.5 rounded border text-[11px] font-mono-num text-[var(--ink-primary)] bg-[var(--bg-elevated)]">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Clean Slate Status + Optional 1-Click Starter Banner */}
          {isBlankWorkspace && !starterBannerDismissed ? (
            <div
              className="mt-2 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3.5 py-2 rounded-2xl border text-[12px] bg-[var(--bg-surface)]/80 backdrop-blur-sm max-w-full"
              style={{ borderColor: 'var(--rule-hairline)' }}
            >
              <span className="inline-flex items-center gap-1.5 text-[var(--ink-secondary)]">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-emerald)] shrink-0" />
                <span>
                  Clean workspace active for <strong className="text-[var(--ink-primary)]">{formatReadableDate(todayKey)}</strong> · Auto-saved locally
                </span>
              </span>
              <button
                type="button"
                onClick={importStarterChecklist}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium text-[11.5px] text-white transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Sparkles className="w-3 h-3" />
                <span>Import starter checklist</span>
              </button>
              <button
                type="button"
                onClick={dismissStarterBanner}
                className="p-1 rounded-md text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
                aria-label="Dismiss starter suggestion"
                title="Keep blank workspace"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="mt-1 inline-flex items-center gap-2 text-[11.5px] font-mono-num text-[var(--ink-muted)]">
              {currentUser?.firebaseUid ? (
                <Cloud className="w-3.5 h-3.5 text-[var(--accent-emerald)]" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-emerald)]" />
              )}
              <span>
                {currentUser ? `${currentUser.name} · ` : 'Guest Vault · '}
                {currentUser?.firebaseUid
                  ? cloudSync.status === 'syncing'
                    ? 'Syncing across devices...'
                    : `Firebase Cloud Sync · ${formatBytes(storageStats.bytesUsed)}`
                  : `${storageStats.engine} · ${formatBytes(storageStats.bytesUsed)} saved`}
              </span>
            </div>
          )}
        </div>

        {/* Floating 3D TiltedCard + Animated BorderGlow Live Studio Showcase */}
        <div className="w-full max-w-5xl">
          <TiltedCard
            containerWidth="100%"
            containerHeight="382px"
            imageWidth="100%"
            imageHeight="382px"
            rotateAmplitude={4.5}
            scaleOnHover={1.015}
            glare={0.28}
            floating
            flipOnClick={false}
            showTooltip={false}
            radius={16}
            altText="Open Live Studio calendar workspace"
            onClick={() => setActiveTab('planner')}
          >
            <BorderGlow
              animated
              className="w-full h-full"
              colors={['#E74004', '#F4C46C', '#14A4FC']}
              glowColor="18 92 52"
              backgroundColor="var(--bg-surface)"
              borderRadius={16}
              glowRadius={36}
              glowIntensity={isDark ? 0.72 : 0.35}
              fillOpacity={0.28}
            >
              <div
                className="relative w-full h-full rounded-2xl border bg-[var(--bg-surface)] overflow-hidden text-left cursor-pointer"
                style={{
                  borderColor: 'var(--rule-strong)',
                  boxShadow: isDark
                    ? '0 32px 80px rgba(0, 0, 0, 0.72), 0 0 80px -22px rgba(231, 64, 4, 0.22), inset 0 1px 0 rgba(255,255,255,0.12)'
                    : 'var(--shadow-panel)',
                }}
              >
            {/* Window Chrome */}
            <div className="px-4 py-2.5 border-b flex items-center justify-between bg-[var(--bg-elevated)]/75">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-strong)] shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-strong)] shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-strong)] shrink-0" />
                <span className="ml-2 text-[12px] font-medium text-[var(--ink-secondary)] truncate">
                  <span className="sm:hidden">{formatReadableDate(todayKey)} · Live</span>
                  <span className="hidden sm:inline">
                    {MONTH_NAMES[todayObj.getMonth()]} {todayObj.getFullYear()} · Week {isoWeek} · {formatReadableDate(todayKey)}
                  </span>
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono-num text-[var(--ink-muted)] shrink-0">
                <span className="hidden sm:inline text-[var(--ink-secondary)] whitespace-nowrap">
                  <TextType
                    text={
                      liveStats.nextTimedToday
                        ? `Next: ${formatMinutes(liveStats.nextTimedToday.startMinutes, true)} · ${liveStats.activeTasks.length} open tasks`
                        : `${snapshot.preferences.focusMinutes}:00 Focus · ${snapshot.events.length} scheduled blocks`
                    }
                    as="span"
                    typingSpeed={4}
                    loop={false}
                    showCursor={false}
                  />
                </span>
                <ShinyText
                  text="Live workspace →"
                  color={isDark ? '#E2E6EF' : '#1F2937'}
                  shineColor={isDark ? '#FFFFFF' : '#E74004'}
                  speed={3.2}
                  className="font-medium"
                />
              </div>
            </div>

            {/* 3-Zone Live Product Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x h-[335px] relative">
              {/* Left Task Queue */}
              <div className="hidden md:block md:col-span-3 p-3.5 space-y-2.5 bg-[var(--bg-surface)]">
                <div className="flex items-center justify-between text-[11.5px] font-semibold text-[var(--ink-secondary)]">
                  <span>Task Queue</span>
                  <span className="font-mono-num text-[var(--accent-primary)]">
                    {liveStats.activeTasks.length} open
                  </span>
                </div>
                <div className="space-y-1.5">
                  {snapshot.tasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[var(--bg-elevated)]/65 text-[11.5px]">
                      <span
                        className="w-3 h-3 rounded border flex items-center justify-center shrink-0"
                        style={{
                          borderColor: t.completed ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                          backgroundColor: t.completed ? 'var(--accent-emerald)' : 'transparent',
                        }}
                      >
                        {t.completed && <Check className="w-2 h-2 text-white stroke-[3]" />}
                      </span>
                      <span className={`truncate ${t.completed ? 'opacity-50 line-through' : 'text-[var(--ink-primary)]'}`}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                  {snapshot.tasks.length === 0 && (
                    <div className="p-3 rounded-lg border border-dashed text-[11px] text-[var(--ink-muted)] leading-relaxed">
                      Queue is empty. Press <strong className="text-[var(--ink-primary)]">Ctrl+K</strong> or open Tasks to capture your first item.
                    </div>
                  )}
                </div>
              </div>

              {/* Center Live 3-Day Time-Blocked Timeline */}
              <div className="md:col-span-6 p-3.5 bg-[var(--bg-canvas)]/85 relative flex flex-col">
                <div className="grid grid-cols-3 gap-2.5 pb-2 border-b text-[11px] font-semibold pl-8">
                  {threeDayCols.map((col) => (
                    <div
                      key={col.key}
                      className={col.isToday ? 'text-[var(--accent-primary)] truncate' : 'text-[var(--ink-secondary)] truncate'}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>

                <div className="relative flex-1 mt-1 pl-8">
                  {[
                    { label: '8 AM', top: '6%' },
                    { label: '11 AM', top: '30%' },
                    { label: '2 PM', top: '54%' },
                    { label: '5 PM', top: '78%' },
                  ].map((line) => (
                    <div
                      key={line.label}
                      className="absolute left-0 right-0 flex items-center pointer-events-none"
                      style={{ top: line.top }}
                    >
                      <span className="w-8 text-[9px] font-mono-num text-[var(--ink-secondary)] opacity-75">
                        {line.label}
                      </span>
                      <div className="flex-1 border-t border-[var(--rule-hairline)]" />
                    </div>
                  ))}

                  <div
                    className="absolute left-8 right-0 flex items-center z-20 pointer-events-none"
                    style={{
                      top: `${Math.max(4, Math.min(90, ((nowMinutes - 420) / (14 * 60)) * 100))}%`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] ml-0.5" />
                    <div className="flex-1 h-[1.5px] bg-[var(--accent-primary)]" />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 h-full relative z-10 border-l border-[var(--rule-hairline)] pl-1.5">
                    {threeDayCols.map((col, idx) => (
                      <div
                        key={col.key}
                        className={`relative h-full ${idx < 2 ? 'border-r border-[var(--rule-hairline)] pr-1.5' : ''} ${
                          col.isToday ? 'bg-[rgba(231,64,4,0.025)] rounded-sm' : ''
                        }`}
                      >
                        {col.events.map((ev) => {
                          const cat = EVENT_CATEGORY_STYLES[ev.category];
                          const topPct = Math.max(4, Math.min(82, ((ev.startMinutes - 420) / (14 * 60)) * 100));
                          const heightPct = Math.max(16, Math.min(46, (ev.durationMinutes / (14 * 60)) * 100));
                          return (
                            <div
                              key={ev.id}
                              className="absolute inset-x-0 right-1.5 p-1.5 rounded-md border-l-2 overflow-hidden"
                              style={{
                                top: `${topPct}%`,
                                height: `${heightPct}%`,
                                borderLeftColor: cat.bar,
                                backgroundColor: isDark ? cat.bgDark : cat.bgLight,
                              }}
                            >
                              <div className="font-mono-num text-[9px] text-[var(--ink-secondary)]">
                                {formatMinutes(ev.startMinutes, true)}
                              </div>
                              <div className="text-[10.5px] font-medium text-[var(--ink-primary)] leading-tight truncate">
                                {ev.title}
                              </div>
                            </div>
                          );
                        })}
                        {col.isToday && col.events.length === 0 && (
                          <div className="absolute inset-x-1.5 top-[22%] p-2 rounded-lg border border-dashed text-center text-[10.5px] text-[var(--ink-muted)]">
                            Click to schedule today
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Live Focus & Habits Mini-Panel */}
              <div className="hidden md:flex md:col-span-3 p-3.5 flex-col justify-between bg-[var(--bg-surface)]">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11.5px] font-semibold text-[var(--ink-secondary)]">
                    <span>Deep Focus</span>
                    <span className="inline-flex items-center font-mono-num text-[var(--accent-primary)]">
                      <Counter
                        value={Math.floor(focusSecondsLeft / 60)}
                        minDigits={2}
                        fontSize={12}
                        fontWeight={700}
                        textColor="var(--accent-primary)"
                        intro={false}
                        fade={0}
                        motionBlur={false}
                        duration={0.28}
                      />
                      <span>:{String(focusSecondsLeft % 60).padStart(2, '0')}</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] space-y-2 border border-[var(--rule-hairline)]">
                    <div className="text-[11px] font-medium text-[var(--ink-primary)] truncate">
                      {activeFocusTask ? activeFocusTask.title : 'Ready for next sprint'}
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-primary)] transition-all"
                        style={{
                          width: `${Math.min(100, Math.round((liveStats.todayFocusMins / 120) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono-num text-[var(--ink-secondary)]">
                      <span>{snapshot.focusHistory.length} sessions</span>
                      <span>{liveStats.todayFocusMins} / 120m</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2.5 border-t border-[var(--rule-hairline)]">
                  <div className="text-[11px] font-medium text-[var(--ink-secondary)]">Habit streaks</div>
                  {showcaseHabits.length > 0 ? (
                    showcaseHabits.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-[11.5px] text-[var(--ink-primary)] gap-2">
                        <span className="truncate">{h.name}</span>
                        <span className="font-mono-num shrink-0" style={{ color: h.accent }}>
                          {h.streak}d
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-[var(--ink-muted)]">
                      No habits tracked yet · Set streaks in Focus Studio
                    </div>
                  )}
                </div>
              </div>

              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 z-30"
                style={{ background: 'linear-gradient(to top, var(--bg-surface), transparent)' }}
              />
            </div>
          </div>
            </BorderGlow>
          </TiltedCard>
        </div>
      </section>

      {/* 4-Stat Live Telemetry Strip with React Bits CountUp & FadeContent */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-14 border-y">
        <FadeContent duration={0.4} threshold={0.02}>
          <AnimatedContent
            container="#overview-scroll"
            distance={14}
            duration={0.38}
            stagger={0.05}
            ease="back.out(1.2)"
          >
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10">
              {metrics.map((m) => (
                <li key={m.label}>
                  <p
                    className="font-display font-bold leading-none tracking-tight tabular-nums"
                    style={{ fontSize: 'clamp(2.4rem, 5vw, 3.4rem)' }}
                  >
                    <CountUp to={m.value} duration={0.85} />
                  </p>
                  <p className="mt-3 text-[13px] text-[var(--ink-secondary)]">{m.label}</p>
                </li>
              ))}
            </ul>
          </AnimatedContent>
        </FadeContent>
      </section>

      {/* Kinetic Feature Ticker Marquee */}
      <div className="border-b py-3.5 bg-[var(--bg-surface)]/50 overflow-hidden select-none">
        <ScrollVelocity
          texts={[
            '15m Snap Timeline · Natural-Language Capture · Kanban & Matrix · ',
            'Pomodoro Sprint Engine · 7-Day Habit Streaks · .ics Ownership · ',
          ]}
          velocity={48}
          numCopies={4}
          fadeEdges
          pauseOnHover
          outlineAlternate
          className="font-display font-bold tracking-tight text-[19px] sm:text-[22px] px-2 text-[var(--ink-secondary)] opacity-75"
        />
      </div>

      {/* MagicBento Interactive Feature Grid */}
      <section id="overview-features" className="max-w-6xl mx-auto px-6 sm:px-10 py-16 border-b space-y-8">
        <AnimatedContent container="#overview-scroll" distance={18} duration={0.4} ease="power2.out">
          <div>
            <h2 className="font-display font-bold text-[30px] tracking-tight">
              Built so every minute and every commitment shares one source of truth
            </h2>
            <p className="text-[14px] text-[var(--ink-secondary)] mt-1.5">
              Select any tile to jump directly into the live tool inside Cadence Studio.
            </p>
          </div>
        </AnimatedContent>

        <MagicBento
          items={bentoItems}
          columns={3}
          rowHeight={185}
          gap={14}
          radius={16}
          theme={isDark ? 'dark' : 'light'}
          glowColor="231, 64, 4"
          enableSpotlight
          enableBorderGlow
          enableStars
          enableTilt
          clickEffect
          intro={false}
        />
      </section>

      {/* Interactive Workspace Spaces (Folder) + Workflow Card Deck (CardSwap) with LineWaves Backdrop */}
      <section className="relative overflow-hidden border-b">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <LineWaves
            color1="#E74004"
            color2="#F4C46C"
            color3="#14A4FC"
            speed={0.42}
            lineCount={40}
            opacity={isDark ? 0.22 : 0.08}
            lightMode={!isDark}
          />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="font-display font-bold text-[26px] tracking-tight">
                Structured workspaces that stay out of your way
              </h2>
              <p className="text-[14px] text-[var(--ink-secondary)] mt-2 leading-relaxed">
                Inspect your live projects as physical studio folders or flip through the active workflow stack.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-20 pt-14 sm:gap-6 sm:pt-12">
              {folderCards.map((folder) => (
                <div key={folder.label} className="flex flex-col items-center gap-3 text-center">
                  <Folder
                    color={folder.color}
                    theme={isDark ? 'dark' : 'light'}
                    size={0.82}
                    items={folder.items}
                  />
                  <p className="text-[12px] font-medium text-[var(--ink-secondary)]">
                    {folder.label} · <span className="font-mono-num">{folder.count}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center min-h-[260px] sm:min-h-[280px] overflow-hidden">
            <CardSwap
              width={isNarrow ? 286 : 360}
              height={isNarrow ? 196 : 220}
              cardDistance={isNarrow ? 18 : 36}
              verticalDistance={isNarrow ? 14 : 26}
              skewAmount={2}
              delay={4200}
              pauseOnHover
              theme={isDark ? 'dark' : 'light'}
            >
              <SpotlightCard
                theme={isDark ? 'dark' : 'light'}
                spotlightColor="rgba(231, 64, 4, 0.14)"
                className="w-full h-full p-5 rounded-2xl border flex flex-col justify-between bg-[var(--bg-surface)]"
              >
                <div className="flex items-center justify-between">
                  <Calendar className="w-5 h-5 text-[var(--accent-primary)]" />
                  <span className="font-mono-num text-[11px] text-[var(--ink-muted)]">Planner · Day & Week</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-[18px]">Direct Calendar Blocking</h3>
                  <p className="text-[13px] text-[var(--ink-secondary)] mt-1">
                    Click or drag tasks directly onto any hour slot with 15-minute snapping and side-by-side overlap lanes.
                  </p>
                </div>
              </SpotlightCard>

              <SpotlightCard
                theme={isDark ? 'dark' : 'light'}
                spotlightColor="rgba(20, 164, 252, 0.14)"
                className="w-full h-full p-5 rounded-2xl border flex flex-col justify-between bg-[var(--bg-surface)]"
              >
                <div className="flex items-center justify-between">
                  <CheckSquare className="w-5 h-5 text-[var(--accent-sky)]" />
                  <span className="font-mono-num text-[11px] text-[var(--ink-muted)]">Tasks · List, Kanban & Matrix</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-[18px]">Three-Way Task Triage</h3>
                  <p className="text-[13px] text-[var(--ink-secondary)] mt-1">
                    Parse priority and due dates inline, move across status columns, or drag into Eisenhower quadrants.
                  </p>
                </div>
              </SpotlightCard>

              <SpotlightCard
                theme={isDark ? 'dark' : 'light'}
                spotlightColor="rgba(44, 204, 116, 0.14)"
                className="w-full h-full p-5 rounded-2xl border flex flex-col justify-between bg-[var(--bg-surface)]"
              >
                <div className="flex items-center justify-between">
                  <Timer className="w-5 h-5 text-[var(--accent-emerald)]" />
                  <span className="font-mono-num text-[11px] text-[var(--ink-muted)]">Focus · Sprints & Streaks</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-[18px]">Protected Deep Work Loops</h3>
                  <p className="text-[13px] text-[var(--ink-secondary)] mt-1">
                    Couple adjustable Pomodoro blocks with a 7-day habit grid and actionable daily notes.
                  </p>
                </div>
              </SpotlightCard>
            </CardSwap>
          </div>
          </div>
        </div>
      </section>

      {/* Interactive Workspace Launcher Dock + DecryptedText Keyboard Reference */}
      <section id="overview-shortcuts" className="max-w-6xl mx-auto px-6 sm:px-10 py-16 space-y-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Keyboard className="w-5 h-5 text-[var(--accent-primary)]" />
              <h2 className="font-display font-bold text-[22px] tracking-tight">Quick Launch Dock & Shortcuts</h2>
            </div>
            <span className="text-[12.5px] text-[var(--ink-muted)]">Hover keycaps or click dock icons to jump right in</span>
          </div>

          <div
            className="relative h-28 rounded-2xl border overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--rule-hairline)',
            }}
          >
            <Dock
              items={dockItems}
              theme={isDark ? 'dark' : 'light'}
              accentColor="#E74004"
              badgeColor="#E74004"
              baseItemSize={isNarrow ? 38 : 46}
              magnification={isNarrow ? 48 : 64}
              panelHeight={isNarrow ? 54 : 64}
            />
          </div>
        </div>

        <SpotlightCard
          theme={isDark ? 'dark' : 'light'}
          spotlightColor={isDark ? 'rgba(231, 64, 4, 0.1)' : 'rgba(231, 64, 4, 0.05)'}
          className="studio-card rounded-2xl divide-y"
        >
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--bg-hover)]/35">
              <span className="text-[13.5px] text-[var(--ink-primary)]">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-md border bg-[var(--bg-inset)] font-mono-num text-[12px] text-[var(--accent-primary)] shrink-0">
                <DecryptedText text={s.keys} animateOn="hover" speed={35} maxIterations={7} />
              </kbd>
            </div>
          ))}
        </SpotlightCard>
      </section>
    </div>
  );
};
