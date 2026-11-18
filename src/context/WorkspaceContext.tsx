import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createEmptyWorkspace, createSeedWorkspace, createStarterChecklist } from '../data/seed';
import type {
  AccountProfile,
  AvailabilitySlot,
  CalendarEvent,
  CalendarLayerId,
  CalendarMode,
  DailyNote,
  EisenhowerQuadrant,
  FocusSessionRecord,
  HabitItem,
  PortableAccountBundle,
  StorageStats,
  TaskListId,
  TaskPriority,
  TaskStatus,
  TaskViewMode,
  ThemeMode,
  ToastItem,
  TodoTask,
  WorkspaceSnapshot,
  WorkspaceTab,
} from '../types/workspace';
import {
  addDays,
  formatMinutes,
  formatReadableDate,
  getLocalNowMinutes,
  getLocalTodayKey,
  SEED_TODAY,
} from '../utils/date';
import {
  buildPortableAccountBundle,
  changeLocalPassword,
  computeStorageStats,
  createLocalAccount,
  deleteLocalAccount,
  GUEST_ACCOUNT_ID,
  loadVaultBootstrap,
  normalizeSnapshot,
  readSyncAccounts,
  readSyncSessionMeta,
  readSyncWorkspace,
  saveWorkspaceForAccount,
  setStarterBannerDismissed as persistStarterDismissed,
  signInLocalAccount,
  switchToGuestWorkspace,
  updateLocalProfile,
} from '../utils/authStorage';
import { triggerFileDownload } from '../utils/ics';
import { parseQuickInput } from '../utils/nlp';
import { playSubtleChime } from '../utils/sound';

export type AccountModalTab = 'signin' | 'signup' | 'profile';

interface SelectionState {
  type: 'event' | 'task';
  id: string;
}

interface WorkspaceContextValue {
  snapshot: WorkspaceSnapshot;
  todayKey: string;
  nowMinutes: number;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
  taskViewMode: TaskViewMode;
  setTaskViewMode: (mode: TaskViewMode) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeList: TaskListId;
  setActiveList: (list: TaskListId) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tagFilter: string | null;
  setTagFilter: (tag: string | null) => void;
  selection: SelectionState | null;
  setSelection: (sel: SelectionState | null) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  availabilityMode: boolean;
  setAvailabilityMode: (on: boolean) => void;
  availabilitySlots: AvailabilitySlot[];
  toggleAvailabilitySlot: (date: string, startMinutes: number, durationMinutes?: number) => void;
  clearAvailabilitySlots: () => void;
  focusCurtainOpen: boolean;
  setFocusCurtainOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  mobileInspectorOpen: boolean;
  setMobileInspectorOpen: (open: boolean) => void;

  // Accounts & persistent storage vault
  currentUser: AccountProfile | null;
  savedAccounts: AccountProfile[];
  storageStats: StorageStats;
  accountModalOpen: boolean;
  setAccountModalOpen: (open: boolean) => void;
  accountModalTab: AccountModalTab;
  openAccountModal: (tab?: AccountModalTab) => void;
  starterBannerDismissed: boolean;
  dismissStarterBanner: () => void;
  importStarterChecklist: () => void;
  signUp: (params: {
    name: string;
    email: string;
    password: string;
    avatarColor?: string;
    roleTitle?: string;
    carryGuestData: boolean;
    includeStarter?: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  switchToGuest: () => Promise<void>;
  updateProfile: (
    patch: Partial<Pick<AccountProfile, 'name' | 'email' | 'avatarColor' | 'roleTitle'>>
  ) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  deleteAccount: (accountId: string) => Promise<void>;
  exportAccountBundle: () => void;

  // Theme & preferences
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  updatePreferences: (patch: Partial<WorkspaceSnapshot['preferences']>) => void;
  toggleLayer: (layer: CalendarLayerId) => void;

  // Event actions
  addEvent: (ev: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;

  // Task actions
  addTaskFromText: (raw: string, listOverride?: TodoTask['listId']) => { kind: 'task' | 'event'; id: string };
  addTask: (task: Omit<TodoTask, 'id' | 'createdAt' | 'order'>) => TodoTask;
  updateTask: (id: string, patch: Partial<TodoTask>) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  scheduleTaskToCalendar: (taskId: string, date: string, startMinutes: number) => void;
  moveTaskKanban: (taskId: string, status: TaskStatus) => void;
  moveTaskQuadrant: (taskId: string, quadrant: EisenhowerQuadrant) => void;

  // Habit & Note actions
  toggleHabitDate: (habitId: string, date: string) => void;
  addHabit: (name: string, category: HabitItem['category'], accent: string) => void;
  deleteHabit: (habitId: string) => void;
  updateDailyNote: (date: string, patch: Partial<DailyNote>) => void;
  extractLineToTask: (date: string, lineText: string) => void;

  // Focus timer
  focusMode: 'focus' | 'short_break' | 'long_break';
  setFocusMode: (m: 'focus' | 'short_break' | 'long_break') => void;
  focusSecondsLeft: number;
  focusRunning: boolean;
  setFocusRunning: (r: boolean) => void;
  resetFocusTimer: (modeOverride?: 'focus' | 'short_break' | 'long_break') => void;
  completeFocusNow: () => void;
  activeFocusTaskId: string | null;
  setActiveFocusTaskId: (id: string | null) => void;

  // Undo, toast, import/export
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
  pushToast: (message: string, detail?: string, canUndo?: boolean, tone?: ToastItem['tone']) => void;
  undoLast: () => void;
  importWorkspaceJson: (jsonStr: string) => boolean;
  resetToSeed: () => void;
  shotPreset: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function getShotParam(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('shot');
}

function loadInitialVaultState(shot: string | null): {
  accountId: string;
  activeAccount: AccountProfile | null;
  savedAccounts: AccountProfile[];
  snapshot: WorkspaceSnapshot;
  starterDismissed: boolean;
} {
  if (shot) {
    const base = createSeedWorkspace();
    if (shot === 'focus-light' || shot === 'studio-light') {
      base.preferences.theme = 'light';
    }
    return {
      accountId: GUEST_ACCOUNT_ID,
      activeAccount: null,
      savedAccounts: [],
      snapshot: base,
      starterDismissed: true,
    };
  }

  const session = readSyncSessionMeta();
  const savedAccounts = readSyncAccounts();
  const matched =
    session.activeAccountId !== GUEST_ACCOUNT_ID
      ? savedAccounts.find((a) => a.id === session.activeAccountId) ?? null
      : null;
  const accountId = matched ? matched.id : GUEST_ACCOUNT_ID;

  return {
    accountId,
    activeAccount: matched,
    savedAccounts,
    snapshot: readSyncWorkspace(accountId),
    starterDismissed: Boolean(session.dismissedStarterIds?.[accountId]),
  };
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shotPreset = useMemo(() => getShotParam(), []);
  const initialVault = useMemo(() => loadInitialVaultState(shotPreset), [shotPreset]);

  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(initialVault.snapshot);
  const [currentUser, setCurrentUser] = useState<AccountProfile | null>(initialVault.activeAccount);
  const [savedAccounts, setSavedAccounts] = useState<AccountProfile[]>(initialVault.savedAccounts);
  const [starterBannerDismissed, setStarterBannerDismissed] = useState<boolean>(
    initialVault.starterDismissed
  );
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<AccountModalTab>(
    initialVault.activeAccount ? 'profile' : 'signup'
  );
  const [storageStats, setStorageStats] = useState<StorageStats>({
    engine: 'IndexedDB Vault',
    persisted: false,
    bytesUsed: 0,
    savedAt: null,
    accountCount: initialVault.savedAccounts.length,
  });

  const undoStackRef = useRef<WorkspaceSnapshot[]>([]);
  const activeAccountIdRef = useRef<string>(initialVault.accountId);
  const initialPersistDoneRef = useRef(false);
  const hasLocalMutationRef = useRef(false);
  const tabIdRef = useRef<string>(makeId('tab'));
  const channelRef = useRef<BroadcastChannel | null>(null);

  const initialTab: WorkspaceTab = useMemo(() => {
    if (shotPreset === 'planner-dark' || shotPreset === 'studio-light' || shotPreset === 'mobile-dark') return 'planner';
    if (shotPreset === 'tasks-dark') return 'tasks';
    if (shotPreset === 'focus-light') return 'focus';
    if (shotPreset === 'analytics-dark') return 'analytics';
    if (shotPreset === 'overview-dark') return 'overview';
    return 'overview';
  }, [shotPreset]);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>(() => {
    if (shotPreset === 'mobile-dark') return 'day';
    if (!shotPreset && typeof window !== 'undefined' && window.innerWidth < 640) return 'day';
    return 'week';
  });
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>(
    shotPreset === 'tasks-dark' ? 'matrix' : 'list'
  );

  // Live real-world date & time clock (deterministic only during ?shot= renders)
  const [clockState, setClockState] = useState(() => ({
    todayKey: shotPreset ? SEED_TODAY : getLocalTodayKey(),
    nowMinutes: shotPreset ? 11 * 60 + 45 : getLocalNowMinutes(),
  }));

  useEffect(() => {
    if (shotPreset) return;
    const tickClock = () => {
      setClockState({
        todayKey: getLocalTodayKey(),
        nowMinutes: getLocalNowMinutes(),
      });
    };
    const id = window.setInterval(tickClock, 30000);
    return () => window.clearInterval(id);
  }, [shotPreset]);

  const todayKey = clockState.todayKey;
  const nowMinutes = clockState.nowMinutes;

  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [activeList, setActiveList] = useState<TaskListId>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(() =>
    shotPreset ? { type: 'event', id: 'ev-8' } : null
  );
  const [commandOpen, setCommandOpen] = useState(shotPreset === 'cmd-dark');
  const [availabilityMode, setAvailabilityMode] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [focusCurtainOpen, setFocusCurtainOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  // Focus timer state
  const [focusMode, setFocusModeState] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [focusSecondsLeft, setFocusSecondsLeft] = useState<number>(
    initialVault.snapshot.preferences.focusMinutes * 60
  );
  const [focusRunning, setFocusRunning] = useState<boolean>(false);
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(
    shotPreset ? 'task-1' : null
  );

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Reconcile durable IndexedDB storage cleanly on mount & listen for cross-tab sync
  useEffect(() => {
    if (shotPreset) return;
    let alive = true;
    void loadVaultBootstrap().then((boot) => {
      if (!alive) return;
      initialPersistDoneRef.current = true;
      setSavedAccounts(boot.accounts);
      setStorageStats(boot.stats);
      if (!hasLocalMutationRef.current) {
        const nextAccountId = boot.activeAccount?.id ?? GUEST_ACCOUNT_ID;
        activeAccountIdRef.current = nextAccountId;
        setCurrentUser(boot.activeAccount);
        setSnapshot(boot.snapshot);
        setStarterBannerDismissed(boot.starterDismissed);
      }
    });

    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cadence_vault_sync') : null;
    channelRef.current = channel;
    if (channel) {
      channel.onmessage = (msg) => {
        const data = msg.data as { senderTabId?: string; accountId?: string; snapshot?: WorkspaceSnapshot } | undefined;
        if (!data || data.senderTabId === tabIdRef.current) return;
        if (!data.accountId || data.accountId !== activeAccountIdRef.current || !data.snapshot) return;
        setSnapshot(normalizeSnapshot(data.snapshot));
      };
    }

    return () => {
      alive = false;
      channel?.close();
      channelRef.current = null;
    };
  }, [shotPreset]);

  // Sync HTML theme class
  useEffect(() => {
    const root = document.documentElement;
    if (snapshot.preferences.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [snapshot.preferences.theme]);

  // Persist workspace to IndexedDB + localStorage mirror on changes (after bootstrap or user mutation)
  useEffect(() => {
    if (shotPreset) return;
    if (!initialPersistDoneRef.current && !hasLocalMutationRef.current) return;
    const accountId = activeAccountIdRef.current;
    let cancelled = false;
    void saveWorkspaceForAccount(accountId, snapshot).then(async (savedAt) => {
      if (cancelled) return;
      const stats = await computeStorageStats(accountId, snapshot, savedAccounts.length, savedAt);
      if (!cancelled) setStorageStats(stats);
      if (channelRef.current && hasLocalMutationRef.current) {
        channelRef.current.postMessage({
          senderTabId: tabIdRef.current,
          accountId,
          snapshot,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [snapshot, shotPreset, savedAccounts.length]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, detail?: string, canUndo = false, tone: ToastItem['tone'] = 'default') => {
      const id = makeId('toast');
      setToasts((prev) => [...prev.slice(-2), { id, message, detail, canUndo, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const commit = useCallback((updater: (prev: WorkspaceSnapshot) => WorkspaceSnapshot) => {
    hasLocalMutationRef.current = true;
    setSnapshot((prev) => {
      undoStackRef.current = [...undoStackRef.current.slice(-19), prev];
      return updater(prev);
    });
  }, []);

  const undoLast = useCallback(() => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    hasLocalMutationRef.current = true;
    const previous = stack[stack.length - 1];
    undoStackRef.current = stack.slice(0, -1);
    setSnapshot(previous);
    pushToast('Action undone', undefined, false, 'default');
  }, [pushToast]);

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      commit((prev) => ({ ...prev, preferences: { ...prev.preferences, theme } }));
    },
    [commit]
  );

  const toggleTheme = useCallback(() => {
    setTheme(snapshot.preferences.theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, snapshot.preferences.theme]);

  const updatePreferences = useCallback(
    (patch: Partial<WorkspaceSnapshot['preferences']>) => {
      commit((prev) => ({ ...prev, preferences: { ...prev.preferences, ...patch } }));
    },
    [commit]
  );

  const toggleLayer = useCallback(
    (layer: CalendarLayerId) => {
      commit((prev) => ({
        ...prev,
        enabledLayers: { ...prev.enabledLayers, [layer]: !prev.enabledLayers[layer] },
      }));
    },
    [commit]
  );

  const addEvent = useCallback(
    (ev: Omit<CalendarEvent, 'id'>): CalendarEvent => {
      const created: CalendarEvent = { ...ev, id: makeId('ev') };
      commit((prev) => ({ ...prev, events: [...prev.events, created] }));
      setSelection({ type: 'event', id: created.id });
      pushToast('Event scheduled', `${created.title} (${formatReadableDate(created.date)})`, true, 'success');
      return created;
    },
    [commit, pushToast]
  );

  const updateEvent = useCallback(
    (id: string, patch: Partial<CalendarEvent>) => {
      const target = snapshot.events.find((e) => e.id === id);
      commit((prev) => ({
        ...prev,
        events: prev.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        tasks:
          target?.linkedTaskId && (patch.date !== undefined || patch.startMinutes !== undefined || patch.durationMinutes !== undefined)
            ? prev.tasks.map((t) =>
                t.id === target.linkedTaskId
                  ? {
                      ...t,
                      scheduledDate: patch.date ?? t.scheduledDate,
                      scheduledStartMinutes: patch.startMinutes ?? t.scheduledStartMinutes,
                      estimatedMinutes: patch.durationMinutes ?? t.estimatedMinutes,
                    }
                  : t
              )
            : prev.tasks,
      }));
    },
    [commit, snapshot.events]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      const target = snapshot.events.find((e) => e.id === id);
      commit((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== id),
        tasks: target?.linkedTaskId
          ? prev.tasks.map((t) =>
              t.id === target.linkedTaskId
                ? { ...t, scheduledDate: undefined, scheduledStartMinutes: undefined }
                : t
            )
          : prev.tasks,
      }));
      setSelection((prev) => (prev?.id === id ? null : prev));
      setMobileInspectorOpen(false);
      if (target) pushToast('Event removed', target.title, true);
    },
    [commit, pushToast, snapshot.events]
  );

  const duplicateEvent = useCallback(
    (id: string) => {
      const src = snapshot.events.find((e) => e.id === id);
      if (!src) return;
      const copy: CalendarEvent = {
        ...src,
        id: makeId('ev'),
        title: `${src.title} (Copy)`,
        startMinutes: Math.min(23 * 60, src.startMinutes + 30),
      };
      commit((prev) => ({ ...prev, events: [...prev.events, copy] }));
      setSelection({ type: 'event', id: copy.id });
      pushToast('Event duplicated', copy.title, true);
    },
    [commit, pushToast, snapshot.events]
  );

  const addTask = useCallback(
    (task: Omit<TodoTask, 'id' | 'createdAt' | 'order'>): TodoTask => {
      const created: TodoTask = {
        ...task,
        id: makeId('task'),
        createdAt: todayKey,
        order: snapshot.tasks.length + 1,
      };
      commit((prev) => ({ ...prev, tasks: [created, ...prev.tasks] }));
      setSelection({ type: 'task', id: created.id });
      return created;
    },
    [commit, snapshot.tasks.length, todayKey]
  );

  const addTaskFromText = useCallback(
    (raw: string, listOverride?: TodoTask['listId']): { kind: 'task' | 'event'; id: string } => {
      const parsed = parseQuickInput(raw, todayKey);
      const targetDate = parsed.date ?? (activeList === 'today' ? todayKey : undefined);
      const priority: TaskPriority = parsed.priority ?? 'p2';
      const quadrant: EisenhowerQuadrant =
        priority === 'p1' ? 'do' : priority === 'p2' ? 'schedule' : priority === 'p3' ? 'delegate' : 'eliminate';

      const newTask = addTask({
        title: parsed.title,
        listId: listOverride ?? (activeList === 'work' || activeList === 'design' || activeList === 'personal' ? activeList : 'inbox'),
        priority,
        status: targetDate === todayKey ? 'todo' : 'backlog',
        quadrant,
        dueDate: targetDate,
        scheduledDate: parsed.isEventIntent ? (targetDate ?? todayKey) : undefined,
        scheduledStartMinutes: parsed.startMinutes,
        estimatedMinutes: parsed.durationMinutes ?? 30,
        tags: parsed.tags,
        subtasks: [],
        recurrence: parsed.recurrence ?? 'none',
        completed: false,
      });

      if (parsed.isEventIntent && parsed.startMinutes !== undefined) {
        const ev = addEvent({
          title: parsed.title,
          date: targetDate ?? todayKey,
          startMinutes: parsed.startMinutes,
          durationMinutes: parsed.durationMinutes ?? 45,
          category: parsed.tags.includes('health') ? 'health' : parsed.tags.includes('meeting') ? 'meeting' : 'deep',
          calendarId: parsed.tags.includes('personal') ? 'personal' : 'work',
          recurrence: parsed.recurrence ?? 'none',
          linkedTaskId: newTask.id,
        });
        return { kind: 'event', id: ev.id };
      }

      pushToast('Task added', newTask.title, true, 'success');
      return { kind: 'task', id: newTask.id };
    },
    [activeList, addEvent, addTask, pushToast, todayKey]
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<TodoTask>) => {
      commit((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }));
    },
    [commit]
  );

  const toggleTaskComplete = useCallback(
    (id: string) => {
      const target = snapshot.tasks.find((t) => t.id === id);
      if (!target) return;
      const nextCompleted = !target.completed;
      playSubtleChime('complete', snapshot.preferences.soundEnabled);
      commit((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: nextCompleted,
                status: nextCompleted ? 'done' : 'todo',
                completedAt: nextCompleted ? todayKey : undefined,
              }
            : t
        ),
        events: prev.events.map((e) =>
          e.linkedTaskId === id ? { ...e, completed: nextCompleted } : e
        ),
      }));
      pushToast(
        nextCompleted ? 'Completed task' : 'Reopened task',
        target.title,
        true,
        nextCompleted ? 'success' : 'default'
      );
    },
    [commit, pushToast, snapshot.preferences.soundEnabled, snapshot.tasks, todayKey]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const target = snapshot.tasks.find((t) => t.id === id);
      commit((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
        events: prev.events.filter((e) => e.linkedTaskId !== id),
      }));
      setSelection((prev) => (prev?.id === id ? null : prev));
      if (target) pushToast('Task deleted', target.title, true);
    },
    [commit, pushToast, snapshot.tasks]
  );

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      commit((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((st) =>
                  st.id === subtaskId ? { ...st, done: !st.done } : st
                ),
              }
            : t
        ),
      }));
    },
    [commit]
  );

  const addSubtask = useCallback(
    (taskId: string, title: string) => {
      const clean = title.trim();
      if (!clean) return;
      commit((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: [...t.subtasks, { id: makeId('st'), title: clean, done: false }] }
            : t
        ),
      }));
    },
    [commit]
  );

  const scheduleTaskToCalendar = useCallback(
    (taskId: string, date: string, startMinutes: number) => {
      const task = snapshot.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const existingEvent = snapshot.events.find((e) => e.linkedTaskId === taskId);
      commit((prev) => {
        const updatedTasks = prev.tasks.map((t) =>
          t.id === taskId
            ? { ...t, scheduledDate: date, scheduledStartMinutes: startMinutes, dueDate: t.dueDate ?? date }
            : t
        );
        const updatedEvents = existingEvent
          ? prev.events.map((e) =>
              e.id === existingEvent.id ? { ...e, date, startMinutes } : e
            )
          : [
              ...prev.events,
              {
                id: makeId('ev'),
                title: task.title,
                date,
                startMinutes,
                durationMinutes: Math.max(30, task.estimatedMinutes || 45),
                category: 'deep' as const,
                calendarId: task.listId === 'personal' ? ('personal' as const) : ('work' as const),
                recurrence: task.recurrence,
                linkedTaskId: task.id,
                completed: task.completed,
              },
            ];
        return { ...prev, tasks: updatedTasks, events: updatedEvents };
      });
      pushToast(
        'Task time-blocked',
        `${task.title} on ${formatReadableDate(date)} at ${formatMinutes(startMinutes)}`,
        true,
        'success'
      );
    },
    [commit, pushToast, snapshot.events, snapshot.tasks]
  );

  const moveTaskKanban = useCallback(
    (taskId: string, status: TaskStatus) => {
      const nextDone = status === 'done';
      commit((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status,
                completed: nextDone,
                completedAt: nextDone ? todayKey : undefined,
              }
            : t
        ),
        events: prev.events.map((e) =>
          e.linkedTaskId === taskId ? { ...e, completed: nextDone } : e
        ),
      }));
    },
    [commit, todayKey]
  );

  const moveTaskQuadrant = useCallback(
    (taskId: string, quadrant: EisenhowerQuadrant) => {
      const priorityMap: Record<EisenhowerQuadrant, TaskPriority> = {
        do: 'p1',
        schedule: 'p2',
        delegate: 'p3',
        eliminate: 'p4',
      };
      commit((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, quadrant, priority: priorityMap[quadrant] } : t
        ),
      }));
    },
    [commit]
  );

  const toggleHabitDate = useCallback(
    (habitId: string, date: string) => {
      playSubtleChime('complete', snapshot.preferences.soundEnabled);
      commit((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === habitId
            ? { ...h, history: { ...h.history, [date]: !h.history[date] } }
            : h
        ),
      }));
    },
    [commit, snapshot.preferences.soundEnabled]
  );

  const addHabit = useCallback(
    (name: string, category: HabitItem['category'], accent: string) => {
      const clean = name.trim();
      if (!clean) return;
      commit((prev) => ({
        ...prev,
        habits: [
          ...prev.habits,
          { id: makeId('hab'), name: clean, category, targetPerWeek: 5, accent, history: {} },
        ],
      }));
      pushToast('Habit created', clean, true, 'success');
    },
    [commit, pushToast]
  );

  const deleteHabit = useCallback(
    (habitId: string) => {
      commit((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== habitId) }));
    },
    [commit]
  );

  const updateDailyNote = useCallback(
    (date: string, patch: Partial<DailyNote>) => {
      hasLocalMutationRef.current = true;
      setSnapshot((prev) => {
        const existing: DailyNote = prev.notes[date] ?? {
          date,
          content: '',
          mood: 4,
          energy: 4,
          extractedLines: [],
        };
        return {
          ...prev,
          notes: { ...prev.notes, [date]: { ...existing, ...patch } },
        };
      });
    },
    []
  );

  const extractLineToTask = useCallback(
    (date: string, lineText: string) => {
      const clean = lineText.replace(/^[-*•\s]+/, '').trim();
      if (!clean) return;
      const created = addTask({
        title: clean,
        listId: 'inbox',
        priority: 'p2',
        status: 'todo',
        quadrant: 'schedule',
        dueDate: date,
        estimatedMinutes: 30,
        tags: ['note'],
        subtasks: [],
        recurrence: 'none',
        completed: false,
      });
      setSnapshot((prev) => {
        const note = prev.notes[date] ?? { date, content: '', mood: 4, energy: 4, extractedLines: [] };
        return {
          ...prev,
          notes: {
            ...prev.notes,
            [date]: { ...note, extractedLines: [...note.extractedLines, clean] },
          },
        };
      });
      pushToast('Action item captured', created.title, true, 'success');
    },
    [addTask, pushToast]
  );

  const setFocusMode = useCallback(
    (m: 'focus' | 'short_break' | 'long_break') => {
      setFocusRunning(false);
      setFocusModeState(m);
      const mins =
        m === 'focus'
          ? snapshot.preferences.focusMinutes
          : m === 'short_break'
            ? snapshot.preferences.shortBreakMinutes
            : snapshot.preferences.longBreakMinutes;
      setFocusSecondsLeft(mins * 60);
    },
    [snapshot.preferences.focusMinutes, snapshot.preferences.longBreakMinutes, snapshot.preferences.shortBreakMinutes]
  );

  const resetFocusTimer = useCallback(
    (modeOverride?: 'focus' | 'short_break' | 'long_break') => {
      const m = modeOverride ?? focusMode;
      setFocusMode(m);
    },
    [focusMode, setFocusMode]
  );

  const completeFocusNow = useCallback(() => {
    setFocusRunning(false);
    playSubtleChime('focus_end', snapshot.preferences.soundEnabled);
    const linkedTask = snapshot.tasks.find((t) => t.id === activeFocusTaskId);
    const duration =
      focusMode === 'focus'
        ? snapshot.preferences.focusMinutes
        : focusMode === 'short_break'
          ? snapshot.preferences.shortBreakMinutes
          : snapshot.preferences.longBreakMinutes;

    const entry: FocusSessionRecord = {
      id: makeId('fs'),
      taskId: linkedTask?.id,
      taskTitle: linkedTask?.title ?? 'Unassigned Focus Block',
      date: todayKey,
      durationMinutes: duration,
      mode: focusMode,
      completedAt: new Date().toISOString(),
    };

    commit((prev) => ({ ...prev, focusHistory: [entry, ...prev.focusHistory] }));
    pushToast(
      focusMode === 'focus' ? 'Focus session logged' : 'Break finished',
      `${duration} min · ${entry.taskTitle}`,
      false,
      'success'
    );
    const nextMode = focusMode === 'focus' ? 'short_break' : 'focus';
    setFocusMode(nextMode);
  }, [
    activeFocusTaskId,
    commit,
    focusMode,
    pushToast,
    setFocusMode,
    snapshot.preferences.focusMinutes,
    snapshot.preferences.longBreakMinutes,
    snapshot.preferences.shortBreakMinutes,
    snapshot.preferences.soundEnabled,
    snapshot.tasks,
    todayKey,
  ]);

  useEffect(() => {
    if (!focusRunning) return;
    const timer = window.setInterval(() => {
      setFocusSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          completeFocusNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [focusRunning, completeFocusNow]);

  const toggleAvailabilitySlot = useCallback((date: string, startMinutes: number, durationMinutes = 60) => {
    setAvailabilitySlots((prev) => {
      const exists = prev.find((s) => s.date === date && s.startMinutes === startMinutes);
      if (exists) return prev.filter((s) => s.id !== exists.id);
      return [...prev, { id: makeId('avail'), date, startMinutes, durationMinutes }];
    });
  }, []);

  const clearAvailabilitySlots = useCallback(() => setAvailabilitySlots([]), []);

  const importWorkspaceJson = useCallback(
    (jsonStr: string): boolean => {
      try {
        const parsed = JSON.parse(jsonStr) as Partial<PortableAccountBundle> & Partial<WorkspaceSnapshot>;
        const targetSnap =
          parsed.bundleVersion === 2 && parsed.snapshot
            ? parsed.snapshot
            : parsed;
        if (!Array.isArray(targetSnap.events) || !Array.isArray(targetSnap.tasks)) return false;
        const normalized = normalizeSnapshot(targetSnap, snapshot.preferences.theme);
        commit(() => normalized);
        pushToast(
          'Workspace restored',
          `${normalized.events.length} events, ${normalized.tasks.length} tasks saved to storage`,
          true,
          'success'
        );
        return true;
      } catch {
        return false;
      }
    },
    [commit, pushToast, snapshot.preferences.theme]
  );

  const resetToSeed = useCallback(() => {
    commit((prev) => createEmptyWorkspace(prev.preferences.theme));
    setSelection(null);
    setActiveFocusTaskId(null);
    setSelectedDate(todayKey);
    pushToast('Workspace cleared to blank slate', 'Undo with Ctrl+Z if needed', true);
  }, [commit, pushToast, todayKey]);

  const openAccountModal = useCallback((tab?: AccountModalTab) => {
    if (tab) {
      setAccountModalTab(tab);
    } else {
      setAccountModalTab(currentUser ? 'profile' : savedAccounts.length > 0 ? 'signin' : 'signup');
    }
    setAccountModalOpen(true);
  }, [currentUser, savedAccounts.length]);

  const dismissStarterBanner = useCallback(() => {
    setStarterBannerDismissed(true);
    persistStarterDismissed(activeAccountIdRef.current, true);
  }, []);

  const importStarterChecklist = useCallback(() => {
    const starter = createStarterChecklist(todayKey, nowMinutes);
    commit((prev) => ({
      ...prev,
      events: [...prev.events, ...starter.events],
      tasks: [...starter.tasks, ...prev.tasks],
      habits: prev.habits.length === 0 ? starter.habits : prev.habits,
    }));
    setStarterBannerDismissed(true);
    persistStarterDismissed(activeAccountIdRef.current, true);
    setSelection({ type: 'event', id: starter.events[0].id });
    pushToast('Starter checklist added', '3 tasks & 1 block added for today', true, 'success');
  }, [commit, nowMinutes, pushToast, todayKey]);

  const signUp = useCallback(
    async (params: {
      name: string;
      email: string;
      password: string;
      avatarColor?: string;
      roleTitle?: string;
      carryGuestData: boolean;
      includeStarter?: boolean;
    }): Promise<{ ok: boolean; error?: string }> => {
      let baseSnapshot = snapshot;
      if (params.includeStarter && baseSnapshot.tasks.length === 0 && baseSnapshot.events.length === 0) {
        const starter = createStarterChecklist(todayKey, nowMinutes);
        baseSnapshot = {
          ...baseSnapshot,
          events: starter.events,
          tasks: starter.tasks,
          habits: starter.habits,
        };
      }
      const res = await createLocalAccount({
        ...params,
        initialSnapshot: params.includeStarter
          ? baseSnapshot
          : params.carryGuestData
            ? snapshot
            : createEmptyWorkspace(snapshot.preferences.theme),
      });
      if (!res.ok) return { ok: false, error: res.error };

      activeAccountIdRef.current = res.account.id;
      hasLocalMutationRef.current = true;
      undoStackRef.current = [];
      setCurrentUser(res.account);
      setSavedAccounts(res.accounts);
      setSnapshot(res.snapshot);
      setSelection(null);
      setActiveFocusTaskId(null);
      setSelectedDate(todayKey);
      const dismissed = Boolean(readSyncSessionMeta().dismissedStarterIds?.[res.account.id]);
      setStarterBannerDismissed(Boolean(params.includeStarter) || dismissed);
      setAccountModalTab('profile');
      setAccountModalOpen(false);
      pushToast(`Welcome, ${res.account.name}`, 'Your encrypted browser vault is active', false, 'success');
      return { ok: true };
    },
    [nowMinutes, pushToast, snapshot, todayKey]
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      const res = await signInLocalAccount({ email, password });
      if (!res.ok) return { ok: false, error: res.error };

      activeAccountIdRef.current = res.account.id;
      hasLocalMutationRef.current = true;
      undoStackRef.current = [];
      setCurrentUser(res.account);
      setSavedAccounts(res.accounts);
      setSnapshot(res.snapshot);
      setSelection(null);
      setActiveFocusTaskId(null);
      setSelectedDate(todayKey);
      setStarterBannerDismissed(Boolean(readSyncSessionMeta().dismissedStarterIds?.[res.account.id]));
      setAccountModalTab('profile');
      setAccountModalOpen(false);
      pushToast(`Signed in as ${res.account.name}`, 'Workspace loaded from browser vault', false, 'success');
      return { ok: true };
    },
    [pushToast, todayKey]
  );

  const switchToGuest = useCallback(async () => {
    const guestSnap = await switchToGuestWorkspace();
    activeAccountIdRef.current = GUEST_ACCOUNT_ID;
    hasLocalMutationRef.current = true;
    undoStackRef.current = [];
    setCurrentUser(null);
    setSnapshot(guestSnap);
    setSelection(null);
    setActiveFocusTaskId(null);
    setSelectedDate(todayKey);
    setStarterBannerDismissed(Boolean(readSyncSessionMeta().dismissedStarterIds?.[GUEST_ACCOUNT_ID]));
    setAccountModalTab('signin');
    pushToast('Switched to Guest Vault', 'Your signed-in account stays saved in storage');
  }, [pushToast, todayKey]);

  const updateProfile = useCallback(
    async (
      patch: Partial<Pick<AccountProfile, 'name' | 'email' | 'avatarColor' | 'roleTitle'>>
    ): Promise<{ ok: boolean; error?: string }> => {
      if (!currentUser) return { ok: false, error: 'Sign in to edit profile settings.' };
      const res = await updateLocalProfile(currentUser.id, patch);
      if (!res.ok) return { ok: false, error: res.error };
      setCurrentUser(res.account);
      setSavedAccounts(res.accounts);
      pushToast('Profile updated', res.account.name, false, 'success');
      return { ok: true };
    },
    [currentUser, pushToast]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<{ ok: boolean; error?: string }> => {
      if (!currentUser) return { ok: false, error: 'Sign in first to update your password.' };
      const res = await changeLocalPassword(currentUser.id, currentPassword, newPassword);
      if (!res.ok) return { ok: false, error: res.error };
      pushToast('Password updated cleanly', undefined, false, 'success');
      return { ok: true };
    },
    [currentUser, pushToast]
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      const res = await deleteLocalAccount(accountId);
      setSavedAccounts(res.accounts);
      if (activeAccountIdRef.current === accountId) {
        activeAccountIdRef.current = GUEST_ACCOUNT_ID;
        undoStackRef.current = [];
        setCurrentUser(null);
        setSnapshot(res.fallbackSnapshot);
        setSelection(null);
        setActiveFocusTaskId(null);
        setAccountModalTab('signup');
      }
      pushToast('Account removed from this browser', undefined, false, 'warning');
    },
    [pushToast]
  );

  const exportAccountBundle = useCallback(() => {
    const json = buildPortableAccountBundle(currentUser, snapshot);
    const slug = (currentUser?.name || 'guest').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    triggerFileDownload(`cadence-${slug}-backup.json`, json, 'application/json');
    pushToast('Portable account backup downloaded', 'Includes profile, tasks, calendar, habits & notes', false, 'success');
  }, [currentUser, pushToast, snapshot]);

  // Global keyboard shortcuts (Linear & Cron speed)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((o) => !o);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !isInput) {
        e.preventDefault();
        undoLast();
        return;
      }

      if (e.key === 'Escape') {
        setCommandOpen(false);
        setAccountModalOpen(false);
        setFocusCurtainOpen(false);
        setMobileSidebarOpen(false);
        setMobileInspectorOpen(false);
        return;
      }

      if (isInput || e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 't':
          setSelectedDate(todayKey);
          break;
        case 'd':
          setActiveTab('planner');
          setCalendarMode('day');
          break;
        case 'w':
          setActiveTab('planner');
          setCalendarMode('week');
          break;
        case 'm':
          setActiveTab('planner');
          setCalendarMode('month');
          break;
        case 'a':
          setActiveTab('planner');
          setCalendarMode('agenda');
          break;
        case '1':
          setActiveTab('planner');
          break;
        case '2':
          setActiveTab('tasks');
          break;
        case '3':
          setActiveTab('focus');
          break;
        case '4':
          setActiveTab('analytics');
          break;
        case '5':
          setActiveTab('overview');
          break;
        case 'arrowleft':
          if (activeTab === 'planner') setSelectedDate((d) => addDays(d, calendarMode === 'day' ? -1 : -7));
          break;
        case 'arrowright':
          if (activeTab === 'planner') setSelectedDate((d) => addDays(d, calendarMode === 'day' ? 1 : 7));
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, calendarMode, todayKey, undoLast]);

  const value: WorkspaceContextValue = {
    snapshot,
    todayKey,
    nowMinutes,
    activeTab,
    setActiveTab,
    calendarMode,
    setCalendarMode,
    taskViewMode,
    setTaskViewMode,
    selectedDate,
    setSelectedDate,
    activeList,
    setActiveList,
    searchQuery,
    setSearchQuery,
    tagFilter,
    setTagFilter,
    selection,
    setSelection,
    commandOpen,
    setCommandOpen,
    availabilityMode,
    setAvailabilityMode,
    availabilitySlots,
    toggleAvailabilitySlot,
    clearAvailabilitySlots,
    focusCurtainOpen,
    setFocusCurtainOpen,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    mobileInspectorOpen,
    setMobileInspectorOpen,
    currentUser,
    savedAccounts,
    storageStats,
    accountModalOpen,
    setAccountModalOpen,
    accountModalTab,
    openAccountModal,
    starterBannerDismissed,
    dismissStarterBanner,
    importStarterChecklist,
    signUp,
    signIn,
    switchToGuest,
    updateProfile,
    changePassword,
    deleteAccount,
    exportAccountBundle,
    setTheme,
    toggleTheme,
    updatePreferences,
    toggleLayer,
    addEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    addTaskFromText,
    addTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    toggleSubtask,
    addSubtask,
    scheduleTaskToCalendar,
    moveTaskKanban,
    moveTaskQuadrant,
    toggleHabitDate,
    addHabit,
    deleteHabit,
    updateDailyNote,
    extractLineToTask,
    focusMode,
    setFocusMode,
    focusSecondsLeft,
    focusRunning,
    setFocusRunning,
    resetFocusTimer,
    completeFocusNow,
    activeFocusTaskId,
    setActiveFocusTaskId,
    toasts,
    dismissToast,
    pushToast,
    undoLast,
    importWorkspaceJson,
    resetToSeed,
    shotPreset,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
