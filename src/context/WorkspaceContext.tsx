import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createEmptyWorkspace, createSeedWorkspace, createStarterChecklist } from '../data/seed';
import type {
  AccountProfile,
  AvailabilitySlot,
  CalendarEvent,
  CalendarLayerId,
  CalendarMode,
  CloudSyncState,
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
  signInOrRegisterFirebaseAccount,
  signInOrRegisterGoogleAccount,
  switchToGuestWorkspace,
  updateLocalProfile,
} from '../utils/authStorage';
import {
  bootstrapCloudWorkspace,
  clearCustomFirebaseConfig,
  type FirebaseAuthUserInfo,
  type FirebaseWebConfig,
  getConfiguredFirebaseConfig,
  getFriendlyFirebaseError,
  getOrCreateDeviceId,
  isFirebaseEmailProviderDisabled,
  pushCloudWorkspace,
  saveCustomFirebaseConfig,
  signInWithFirebaseEmail,
  signInWithFirebaseGoogle,
  signOutFirebaseUser,
  signUpWithFirebaseEmail,
  subscribeCloudWorkspace,
  subscribeFirebaseAuthState,
} from '../utils/firebaseSync';
import {
  clearCustomGoogleClientId,
  getConfiguredGoogleClientId,
  type GoogleUserClaims,
  saveCustomGoogleClientId,
} from '../utils/googleAuth';
import { triggerFileDownload } from '../utils/ics';
import {
  type EvaluatedProgression,
  evaluateProgression,
  normalizeProgression,
} from '../utils/gamification';
import {
  type BeforeInstallPromptEvent,
  detectPwaPlatform,
  isRunningAsInstalledPwa,
  type PwaPlatform,
} from '../utils/pwaInstall';
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
  googleClientId: string;
  setCustomGoogleClientId: (clientId: string) => { ok: boolean; error?: string };
  clearGoogleClientIdConfig: () => void;
  signInWithGoogleUser: (
    claims: GoogleUserClaims,
    carryGuestData?: boolean
  ) => Promise<void>;
  firebaseConfig: FirebaseWebConfig | null;
  cloudSync: CloudSyncState;
  saveFirebaseConfig: (rawInput: string) => { ok: boolean; error?: string };
  clearFirebaseConfig: () => void;
  signInWithFirebaseGooglePopup: (carryGuestData?: boolean) => Promise<{ ok: boolean; error?: string }>;
  syncCloudNow: () => Promise<void>;
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

  // Progression, streaks & achievements
  progression: EvaluatedProgression;
  claimDailyCheckIn: () => void;
  setTomorrowAnchor: (title: string) => void;
  promoteTodayAnchorToTask: () => void;
  toggleDailyReminder: (enabled: boolean, hour?: number) => Promise<void>;

  // PWA Install promotion & offline app shell
  pwaInstalled: boolean;
  pwaCanPrompt: boolean;
  pwaPlatform: PwaPlatform;
  installModalOpen: boolean;
  setInstallModalOpen: (open: boolean) => void;
  installBannerDismissed: boolean;
  dismissInstallBanner: () => void;
  triggerPwaInstall: () => Promise<void>;

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
  const [googleClientId, setGoogleClientIdState] = useState<string>(() => getConfiguredGoogleClientId());
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseWebConfig | null>(() =>
    getConfiguredFirebaseConfig()
  );
  const [cloudSync, setCloudSync] = useState<CloudSyncState>(() => {
    const cfg = getConfiguredFirebaseConfig();
    return {
      configured: Boolean(cfg),
      status: 'local',
      lastSyncedAt: null,
      projectId: cfg?.projectId,
    };
  });
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
  const deviceIdRef = useRef<string>(getOrCreateDeviceId());
  const snapshotRef = useRef<WorkspaceSnapshot>(snapshot);
  snapshotRef.current = snapshot;
  const skipNextCloudPushRef = useRef(false);
  const boundCloudUidRef = useRef<string | null>(null);
  const explicitAuthInFlightRef = useRef(false);
  const cloudUnsubRef = useRef<(() => void) | null>(null);
  const carryGuestForNextCloudRef = useRef<boolean>(false);

  const initialTab: WorkspaceTab = useMemo(() => {
    if (shotPreset === 'planner-dark' || shotPreset === 'studio-light' || shotPreset === 'mobile-dark') return 'planner';
    if (shotPreset === 'tasks-dark') return 'tasks';
    if (shotPreset === 'focus-light') return 'focus';
    if (shotPreset === 'analytics-dark') return 'analytics';
    if (shotPreset === 'overview-dark') return 'overview';
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam === 'planner' || tabParam === 'tasks' || tabParam === 'focus' || tabParam === 'analytics' || tabParam === 'overview') {
        return tabParam;
      }
    }
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

  // Listen for native PWA install prompt & appinstalled transition
  useEffect(() => {
    if (typeof window === 'undefined' || shotPreset) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredInstallPromptRef.current = e as BeforeInstallPromptEvent;
      setPwaCanPrompt(true);
    };

    const handleAppInstalled = () => {
      deferredInstallPromptRef.current = null;
      setPwaCanPrompt(false);
      setPwaInstalled(true);
      setInstallModalOpen(false);
    };

    const media = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayChange = () => {
      if (isRunningAsInstalledPwa()) {
        setPwaInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    media?.addEventListener?.('change', handleDisplayChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      media?.removeEventListener?.('change', handleDisplayChange);
    };
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

  // PWA Web App Installability & Standalone detection
  const deferredInstallPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(() => isRunningAsInstalledPwa());
  const [pwaCanPrompt, setPwaCanPrompt] = useState<boolean>(false);
  const [pwaPlatform] = useState<PwaPlatform>(() => detectPwaPlatform());
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [installBannerDismissed, setInstallBannerDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('cadence_install_banner_dismissed') === '1';
    } catch {
      return false;
    }
  });

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

  const snapshotHasContent = useCallback((snap: WorkspaceSnapshot): boolean => {
    return (
      snap.events.length > 0 ||
      snap.tasks.length > 0 ||
      snap.habits.length > 0 ||
      Object.keys(snap.notes).length > 0 ||
      snap.focusHistory.length > 0
    );
  }, []);

  const attachFirebaseSession = useCallback(
    async (
      fbUser: FirebaseAuthUserInfo,
      opts?: { carryGuestData?: boolean; seedSnapshot?: WorkspaceSnapshot }
    ) => {
      if (boundCloudUidRef.current === fbUser.uid) return;
      boundCloudUidRef.current = fbUser.uid;
      cloudUnsubRef.current?.();
      cloudUnsubRef.current = null;

      const candidateLocal = opts?.seedSnapshot ?? snapshotRef.current;
      const carryGuest = opts?.carryGuestData ?? carryGuestForNextCloudRef.current;
      carryGuestForNextCloudRef.current = false;

      const res = await signInOrRegisterFirebaseAccount({
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.name,
        picture: fbUser.picture,
        provider: fbUser.provider,
        initialSnapshot: candidateLocal,
        carryGuestData: carryGuest,
      });

      const localBase = opts?.seedSnapshot ?? res.snapshot;
      setCloudSync((prev) => ({
        ...prev,
        configured: true,
        status: 'syncing',
        projectId: firebaseConfig?.projectId,
        errorMessage: undefined,
      }));

      try {
        const boot = await bootstrapCloudWorkspace(
          fbUser.uid,
          deviceIdRef.current,
          localBase,
          snapshotHasContent(localBase)
        );
        activeAccountIdRef.current = res.account.id;
        hasLocalMutationRef.current = true;
        undoStackRef.current = [];
        skipNextCloudPushRef.current = true;
        setCurrentUser(res.account);
        setSavedAccounts(res.accounts);
        setSnapshot(boot.snapshot);
        setCloudSync({
          configured: true,
          status: 'synced',
          lastSyncedAt: boot.syncedAt,
          projectId: firebaseConfig?.projectId,
        });
      } catch (err) {
        activeAccountIdRef.current = res.account.id;
        hasLocalMutationRef.current = true;
        undoStackRef.current = [];
        skipNextCloudPushRef.current = true;
        setCurrentUser(res.account);
        setSavedAccounts(res.accounts);
        setSnapshot(localBase);
        setCloudSync({
          configured: true,
          status: 'error',
          lastSyncedAt: null,
          projectId: firebaseConfig?.projectId,
          errorMessage: getFriendlyFirebaseError(err),
        });
      }

      cloudUnsubRef.current = subscribeCloudWorkspace(
        fbUser.uid,
        deviceIdRef.current,
        localBase.preferences.theme,
        (remoteSnap, syncedAt) => {
          skipNextCloudPushRef.current = true;
          hasLocalMutationRef.current = true;
          setSnapshot(remoteSnap);
          setCloudSync({
            configured: true,
            status: 'synced',
            lastSyncedAt: syncedAt,
            projectId: firebaseConfig?.projectId,
          });
        },
        (msg) => {
          setCloudSync((prev) => ({
            ...prev,
            configured: true,
            status: 'error',
            errorMessage: msg,
          }));
        }
      );
    },
    [firebaseConfig?.projectId, snapshotHasContent]
  );

  // Bind Firebase Auth session observer when Firebase config is present
  useEffect(() => {
    if (shotPreset || !firebaseConfig) {
      cloudUnsubRef.current?.();
      cloudUnsubRef.current = null;
      boundCloudUidRef.current = null;
      setCloudSync({
        configured: false,
        status: 'local',
        lastSyncedAt: null,
      });
      return;
    }

    setCloudSync((prev) => ({
      ...prev,
      configured: true,
      projectId: firebaseConfig.projectId,
    }));

    const unsubAuth = subscribeFirebaseAuthState((fbUser) => {
      if (explicitAuthInFlightRef.current) return;
      if (!fbUser) {
        cloudUnsubRef.current?.();
        cloudUnsubRef.current = null;
        boundCloudUidRef.current = null;
        return;
      }
      if (boundCloudUidRef.current !== fbUser.uid) {
        void attachFirebaseSession(fbUser);
      }
    });

    return () => {
      unsubAuth();
      cloudUnsubRef.current?.();
      cloudUnsubRef.current = null;
    };
  }, [attachFirebaseSession, firebaseConfig, shotPreset]);

  // Debounced cloud push to Firestore whenever active workspace updates
  useEffect(() => {
    if (shotPreset || !firebaseConfig) return;
    const uid = currentUser?.firebaseUid;
    if (!uid) return;
    if (skipNextCloudPushRef.current) {
      skipNextCloudPushRef.current = false;
      return;
    }

    setCloudSync((prev) => ({ ...prev, configured: true, status: 'syncing', errorMessage: undefined }));
    const timer = window.setTimeout(() => {
      void pushCloudWorkspace(uid, deviceIdRef.current, snapshot)
        .then((syncedAt) => {
          setCloudSync({
            configured: true,
            status: 'synced',
            lastSyncedAt: syncedAt,
            projectId: firebaseConfig.projectId,
          });
        })
        .catch((err) => {
          setCloudSync((prev) => ({
            ...prev,
            configured: true,
            status: 'error',
            errorMessage: getFriendlyFirebaseError(err),
          }));
        });
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser?.firebaseUid, firebaseConfig, shotPreset, snapshot]);

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

  // Evaluation engine: streaks, streak freezes, daily quests, anchors & 12-week heatmap
  const progression = useMemo(
    () => evaluateProgression(snapshot, todayKey, pwaInstalled),
    [pwaInstalled, snapshot, todayKey]
  );

  // Automatic achievement unlock + XP grant (fires only when genuine actions meet milestone)
  useEffect(() => {
    if (shotPreset) return;
    const needsPwaSync = pwaInstalled && !snapshot.progression?.pwaInstalled;
    if (progression.newlyUnlocked.length === 0 && !needsPwaSync) return;

    const nowIso = new Date().toISOString();
    const newlyEarned = progression.newlyUnlocked;

    hasLocalMutationRef.current = true;
    setSnapshot((prev) => {
      const prevProg = normalizeProgression(prev.progression);
      const nextUnlocked = { ...prevProg.unlockedAchievements };
      let addedXp = 0;
      let shieldBonus = 0;
      for (const def of newlyEarned) {
        if (!nextUnlocked[def.id]) {
          nextUnlocked[def.id] = nowIso;
          addedXp += def.xpReward;
          if (def.id === 'streak-3' || def.id === 'streak-7' || def.id === 'daily-trio') {
            shieldBonus += 1;
          }
        }
      }
      return {
        ...prev,
        progression: {
          ...prevProg,
          xp: Math.max(prevProg.xp, progression.totalXp) + addedXp,
          streakFreezes: Math.min(3, prevProg.streakFreezes + shieldBonus),
          unlockedAchievements: nextUnlocked,
          pwaInstalled: prevProg.pwaInstalled || pwaInstalled,
        },
      };
    });

    if (newlyEarned.length > 0) {
      const first = newlyEarned[0];
      const extra = newlyEarned.length > 1 ? ` (+${newlyEarned.length - 1} more)` : '';
      pushToast(
        `Achievement unlocked: ${first.title}${extra}`,
        `+${first.xpReward} XP · ${first.description}`,
        false,
        'success'
      );
      playSubtleChime('complete', snapshot.preferences.soundEnabled);
    }
  }, [progression.newlyUnlocked, progression.totalXp, pwaInstalled, pushToast, shotPreset, snapshot.preferences.soundEnabled, snapshot.progression?.pwaInstalled]);

  // Auto-apply a Streak Freeze Shield if user had a run ending 2 days ago and skipped yesterday
  useEffect(() => {
    if (shotPreset) return;
    const prog = normalizeProgression(snapshot.progression);
    const yesterdayKey = addDays(todayKey, -1);
    const twoDaysAgoKey = addDays(todayKey, -2);
    const hadPriorRun =
      (progression.activityByDate[twoDaysAgoKey] ?? 0) > 0 || prog.streakFreezeDates.includes(twoDaysAgoKey);
    const missedYesterday = (progression.activityByDate[yesterdayKey] ?? 0) === 0;
    const alreadyProtected = prog.streakFreezeDates.includes(yesterdayKey);

    if (hadPriorRun && missedYesterday && !alreadyProtected && prog.streakFreezes > 0) {
      hasLocalMutationRef.current = true;
      setSnapshot((prev) => {
        const curProg = normalizeProgression(prev.progression);
        if (curProg.streakFreezeDates.includes(yesterdayKey) || curProg.streakFreezes <= 0) return prev;
        return {
          ...prev,
          progression: {
            ...curProg,
            streakFreezes: curProg.streakFreezes - 1,
            streakFreezeDates: [...curProg.streakFreezeDates, yesterdayKey],
          },
        };
      });
      pushToast(
        'Streak Freeze Shield protected yesterday',
        'Complete 1 small action today to keep your momentum rolling',
        false,
        'success'
      );
    }
  }, [progression.activityByDate, pushToast, shotPreset, snapshot.progression, todayKey]);

  // Opt-in daily reminder notification when enabled by user
  useEffect(() => {
    if (shotPreset || typeof window === 'undefined') return;
    const prog = normalizeProgression(snapshot.progression);
    if (!prog.reminderEnabled) return;
    if (prog.lastRemindedDate === todayKey) return;
    if (progression.todayQuestsCompletedCount === progression.todayQuests.length) return;
    const currentHour = Math.floor(nowMinutes / 60);
    if (currentHour < prog.reminderHour) return;

    hasLocalMutationRef.current = true;
    setSnapshot((prev) => ({
      ...prev,
      progression: {
        ...normalizeProgression(prev.progression),
        lastRemindedDate: todayKey,
      },
    }));

    if ('Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification('Cadence Studio Daily Check-In', {
          body: progression.todayAnchor
            ? `Today's Anchor: ${progression.todayAnchor}`
            : `Keep your ${progression.currentStreak}d momentum streak alive with 1 quick task.`,
          icon: './icons/icon-192.png',
        });
      } catch {
        // Ignore browsers blocking background notification constructors
      }
    }
  }, [
    nowMinutes,
    progression.currentStreak,
    progression.todayAnchor,
    progression.todayQuests.length,
    progression.todayQuestsCompletedCount,
    shotPreset,
    snapshot.progression,
    todayKey,
  ]);

  const dismissInstallBanner = useCallback(() => {
    setInstallBannerDismissed(true);
    try {
      window.localStorage.setItem('cadence_install_banner_dismissed', '1');
    } catch {
      // ignore
    }
  }, []);

  const triggerPwaInstall = useCallback(async () => {
    const promptEv = deferredInstallPromptRef.current;
    if (promptEv) {
      try {
        await promptEv.prompt();
        const choice = await promptEv.userChoice;
        if (choice.outcome === 'accepted') {
          deferredInstallPromptRef.current = null;
          setPwaCanPrompt(false);
          setPwaInstalled(true);
          pushToast('Cadence Studio installed', 'Launch directly from your home screen or desktop dock', false, 'success');
          return;
        }
      } catch {
        // Fallback to manual install guide modal below
      }
    }
    setInstallModalOpen(true);
  }, [pushToast]);

  const claimDailyCheckIn = useCallback(() => {
    commit((prev) => {
      const prog = normalizeProgression(prev.progression);
      if (prog.checkInDates.includes(todayKey)) return prev;
      return {
        ...prev,
        progression: {
          ...prog,
          xp: prog.xp + 15,
          checkInDates: [...prog.checkInDates, todayKey],
        },
      };
    });
    playSubtleChime('complete', snapshot.preferences.soundEnabled);
    pushToast('Daily check-in claimed (+15 XP)', 'Your streak stays locked for today', false, 'success');
  }, [commit, pushToast, snapshot.preferences.soundEnabled, todayKey]);

  const setTomorrowAnchor = useCallback(
    (title: string) => {
      const tomorrowKey = addDays(todayKey, 1);
      const clean = title.trim();
      commit((prev) => {
        const prog = normalizeProgression(prev.progression);
        const nextAnchors = { ...prog.dailyAnchors };
        if (clean) nextAnchors[tomorrowKey] = clean;
        else delete nextAnchors[tomorrowKey];
        return {
          ...prev,
          progression: {
            ...prog,
            dailyAnchors: nextAnchors,
          },
        };
      });
      if (clean) {
        pushToast('Tomorrow’s #1 anchor saved', `"${clean}" will greet you first thing tomorrow`, false, 'success');
      }
    },
    [commit, pushToast, todayKey]
  );

  const promoteTodayAnchorToTask = useCallback(() => {
    const text = progression.todayAnchor.trim();
    if (!text) return;
    addTaskFromText(`${text} today !p1`);
    setActiveTab('focus');
  }, [addTaskFromText, progression.todayAnchor]);

  const toggleDailyReminder = useCallback(
    async (enabled: boolean, hour = 9) => {
      if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
        if (window.Notification.permission === 'default') {
          try {
            const res = await window.Notification.requestPermission();
            if (res === 'denied') {
              pushToast('Notifications blocked in browser', 'Allow notifications in browser settings for reminders', false, 'warning');
            }
          } catch {
            // proceed saving preference cleanly
          }
        }
      }
      commit((prev) => ({
        ...prev,
        progression: {
          ...normalizeProgression(prev.progression),
          reminderEnabled: enabled,
          reminderHour: hour,
        },
      }));
      pushToast(
        enabled ? `Daily reminder set (${String(hour).padStart(2, '0')}:00)` : 'Daily reminder paused',
        enabled ? 'Cadence will prompt your daily check-in when open' : undefined,
        false,
        enabled ? 'success' : 'default'
      );
    },
    [commit, pushToast]
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
      const chosenSnapshot = params.includeStarter
        ? baseSnapshot
        : params.carryGuestData
          ? snapshot
          : createEmptyWorkspace(snapshot.preferences.theme);

      let localFallbackNote: string | null = null;
      if (firebaseConfig) {
        explicitAuthInFlightRef.current = true;
        try {
          carryGuestForNextCloudRef.current = Boolean(params.carryGuestData || params.includeStarter);
          const fbUser = await signUpWithFirebaseEmail(params.name, params.email, params.password);
          await attachFirebaseSession(fbUser, {
            carryGuestData: Boolean(params.carryGuestData || params.includeStarter),
            seedSnapshot: chosenSnapshot,
          });
          setSelection(null);
          setActiveFocusTaskId(null);
          setSelectedDate(todayKey);
          setStarterBannerDismissed(Boolean(params.includeStarter));
          setAccountModalTab('profile');
          setAccountModalOpen(false);
          pushToast(`Welcome, ${fbUser.name}`, 'Cloud Sync vault active across your devices', false, 'success');
          return { ok: true };
        } catch (err) {
          if (!isFirebaseEmailProviderDisabled(err)) {
            return { ok: false, error: getFriendlyFirebaseError(err) };
          }
          localFallbackNote = 'Saved in this browser vault (enable Email/Password in Firebase for cloud sync)';
        } finally {
          explicitAuthInFlightRef.current = false;
        }
      }

      const res = await createLocalAccount({
        ...params,
        initialSnapshot: chosenSnapshot,
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
      pushToast(
        `Welcome, ${res.account.name}`,
        localFallbackNote ?? 'Your encrypted browser vault is active',
        false,
        'success'
      );
      return { ok: true };
    },
    [attachFirebaseSession, firebaseConfig, nowMinutes, pushToast, snapshot, todayKey]
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      if (firebaseConfig) {
        explicitAuthInFlightRef.current = true;
        try {
          const fbUser = await signInWithFirebaseEmail(email, password);
          await attachFirebaseSession(fbUser, { carryGuestData: false });
          setSelection(null);
          setActiveFocusTaskId(null);
          setSelectedDate(todayKey);
          setAccountModalTab('profile');
          setAccountModalOpen(false);
          pushToast(`Signed in as ${fbUser.name}`, 'Cloud Sync vault loaded', false, 'success');
          return { ok: true };
        } catch (err) {
          // Allow signing into existing local-only email accounts too
          const localAttempt = await signInLocalAccount({ email, password });
          if (localAttempt.ok) {
            activeAccountIdRef.current = localAttempt.account.id;
            hasLocalMutationRef.current = true;
            undoStackRef.current = [];
            setCurrentUser(localAttempt.account);
            setSavedAccounts(localAttempt.accounts);
            setSnapshot(localAttempt.snapshot);
            setSelection(null);
            setActiveFocusTaskId(null);
            setSelectedDate(todayKey);
            setStarterBannerDismissed(
              Boolean(readSyncSessionMeta().dismissedStarterIds?.[localAttempt.account.id])
            );
            setAccountModalTab('profile');
            setAccountModalOpen(false);
            pushToast(
              `Signed in as ${localAttempt.account.name}`,
              'Loaded from this browser vault',
              false,
              'success'
            );
            return { ok: true };
          }
          if (!isFirebaseEmailProviderDisabled(err)) {
            return { ok: false, error: getFriendlyFirebaseError(err) };
          }
          return { ok: false, error: localAttempt.error };
        } finally {
          explicitAuthInFlightRef.current = false;
        }
      }

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
    [attachFirebaseSession, firebaseConfig, pushToast, todayKey]
  );

  const saveFirebaseConfig = useCallback(
    (rawInput: string): { ok: boolean; error?: string } => {
      const res = saveCustomFirebaseConfig(rawInput);
      if (!res.ok || !res.config) return { ok: false, error: res.error };
      setFirebaseConfigState(res.config);
      pushToast('Firebase Cloud Sync connected', `Project: ${res.config.projectId}`, false, 'success');
      return { ok: true };
    },
    [pushToast]
  );

  const clearFirebaseConfig = useCallback(() => {
    void signOutFirebaseUser();
    cloudUnsubRef.current?.();
    cloudUnsubRef.current = null;
    boundCloudUidRef.current = null;
    clearCustomFirebaseConfig();
    setFirebaseConfigState(getConfiguredFirebaseConfig());
    pushToast('Disconnected custom Firebase config');
  }, [pushToast]);

  const signInWithFirebaseGooglePopup = useCallback(
    async (carryGuestData = true): Promise<{ ok: boolean; error?: string }> => {
      explicitAuthInFlightRef.current = true;
      try {
        carryGuestForNextCloudRef.current = carryGuestData;
        const fbUser = await signInWithFirebaseGoogle();
        await attachFirebaseSession(fbUser, { carryGuestData });
        setSelection(null);
        setActiveFocusTaskId(null);
        setSelectedDate(todayKey);
        setAccountModalTab('profile');
        setAccountModalOpen(false);
        pushToast(`Signed in with Google (${fbUser.name})`, 'Cloud Sync enabled across devices', false, 'success');
        return { ok: true };
      } catch (err) {
        return { ok: false, error: getFriendlyFirebaseError(err) };
      } finally {
        explicitAuthInFlightRef.current = false;
      }
    },
    [attachFirebaseSession, pushToast, todayKey]
  );

  const syncCloudNow = useCallback(async () => {
    const uid = currentUser?.firebaseUid;
    if (!uid || !firebaseConfig) return;
    setCloudSync((prev) => ({ ...prev, configured: true, status: 'syncing', errorMessage: undefined }));
    try {
      const syncedAt = await pushCloudWorkspace(uid, deviceIdRef.current, snapshot);
      setCloudSync({
        configured: true,
        status: 'synced',
        lastSyncedAt: syncedAt,
        projectId: firebaseConfig.projectId,
      });
      pushToast('Cloud Sync complete', 'All blocks, tasks, and habits synced', false, 'success');
    } catch (err) {
      const msg = getFriendlyFirebaseError(err);
      setCloudSync((prev) => ({ ...prev, configured: true, status: 'error', errorMessage: msg }));
      pushToast('Cloud Sync failed', msg, false, 'warning');
    }
  }, [currentUser?.firebaseUid, firebaseConfig, pushToast, snapshot]);

  const setCustomGoogleClientId = useCallback(
    (clientId: string): { ok: boolean; error?: string } => {
      const res = saveCustomGoogleClientId(clientId);
      if (!res.ok) return { ok: false, error: res.error };
      setGoogleClientIdState(res.clientId);
      pushToast('Google Sign-In Client ID saved', 'Ready to sign in with Google', false, 'success');
      return { ok: true };
    },
    [pushToast]
  );

  const clearGoogleClientIdConfig = useCallback(() => {
    clearCustomGoogleClientId();
    setGoogleClientIdState(getConfiguredGoogleClientId());
    pushToast('Cleared custom Google Client ID');
  }, [pushToast]);

  const signInWithGoogleUser = useCallback(
    async (claims: GoogleUserClaims, carryGuestData = true) => {
      const res = await signInOrRegisterGoogleAccount({
        sub: claims.sub,
        email: claims.email,
        name: claims.name,
        picture: claims.picture,
        initialSnapshot: snapshot,
        carryGuestData,
      });

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
      pushToast(
        res.isNewAccount ? `Welcome, ${res.account.name}` : `Signed in with Google as ${res.account.name}`,
        res.account.email,
        false,
        'success'
      );
    },
    [pushToast, snapshot, todayKey]
  );

  const switchToGuest = useCallback(async () => {
    if (firebaseConfig) {
      await signOutFirebaseUser();
    }
    cloudUnsubRef.current?.();
    cloudUnsubRef.current = null;
    boundCloudUidRef.current = null;
    const guestSnap = await switchToGuestWorkspace();
    activeAccountIdRef.current = GUEST_ACCOUNT_ID;
    hasLocalMutationRef.current = true;
    undoStackRef.current = [];
    setCurrentUser(null);
    setSnapshot(guestSnap);
    setSelection(null);
    setActiveFocusTaskId(null);
    setSelectedDate(todayKey);
    setCloudSync((prev) => ({
      ...prev,
      status: 'local',
      lastSyncedAt: null,
      errorMessage: undefined,
    }));
    setStarterBannerDismissed(Boolean(readSyncSessionMeta().dismissedStarterIds?.[GUEST_ACCOUNT_ID]));
    setAccountModalTab('signin');
    pushToast('Switched to Guest Vault', 'Your signed-in account stays saved');
  }, [firebaseConfig, pushToast, todayKey]);

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
      setCurrentUser(res.account);
      setSavedAccounts(res.accounts);
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
    googleClientId,
    setCustomGoogleClientId,
    clearGoogleClientIdConfig,
    signInWithGoogleUser,
    firebaseConfig,
    cloudSync,
    saveFirebaseConfig,
    clearFirebaseConfig,
    signInWithFirebaseGooglePopup,
    syncCloudNow,
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
    progression,
    claimDailyCheckIn,
    setTomorrowAnchor,
    promoteTodayAnchorToTask,
    toggleDailyReminder,
    pwaInstalled,
    pwaCanPrompt,
    pwaPlatform,
    installModalOpen,
    setInstallModalOpen,
    installBannerDismissed,
    dismissInstallBanner,
    triggerPwaInstall,
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
