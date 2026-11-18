import { createEmptyWorkspace } from '../data/seed';
import type {
  AccountProfile,
  PortableAccountBundle,
  StorageStats,
  ThemeMode,
  WorkspaceSnapshot,
} from '../types/workspace';

export const GUEST_ACCOUNT_ID = 'guest';

const DB_NAME = 'cadence_studio_vault';
const DB_VERSION = 1;
const STORE_ACCOUNTS = 'accounts';
const STORE_WORKSPACES = 'workspaces';
const STORE_META = 'meta';

const LS_ACCOUNTS_KEY = 'cadence_vault_accounts_v2';
const LS_SESSION_KEY = 'cadence_vault_session_v2';
const LS_WS_PREFIX = 'cadence_vault_ws_v2_';

export const AVATAR_COLORS = [
  '#E74004',
  '#14A4FC',
  '#2CCC74',
  '#F4C46C',
  '#9B72CF',
  '#EC4899',
];

interface StoredAccountRecord extends AccountProfile {
  passwordHash?: string;
  salt?: string;
}

interface StoredWorkspaceRecord {
  accountId: string;
  snapshot: WorkspaceSnapshot;
  updatedAt: string;
}

interface SessionMeta {
  activeAccountId: string;
  dismissedStarterIds: Record<string, boolean>;
  savedAt: string | null;
}

const DEFAULT_SESSION: SessionMeta = {
  activeAccountId: GUEST_ACCOUNT_ID,
  dismissedStarterIds: {},
  savedAt: null,
};

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openVaultDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_ACCOUNTS)) {
          db.createObjectStore(STORE_ACCOUNTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_WORKSPACES)) {
          db.createObjectStore(STORE_WORKSPACES, { keyPath: 'accountId' });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function idbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openVaultDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) ?? []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openVaultDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPut<T>(storeName: string, value: T): Promise<void> {
  const db = await openVaultDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function idbDelete(storeName: string, key: string): Promise<void> {
  const db = await openVaultDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

function requestPersistentStorageOnce(): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      void navigator.storage.persist();
    }
  } catch {
    // ignore unsupported environments
  }
}

function readLsJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLsJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota overflow is safely covered by IndexedDB
  }
}

function toPublicAccount(rec: StoredAccountRecord): AccountProfile {
  return {
    id: rec.id,
    name: rec.name,
    email: rec.email,
    avatarColor: rec.avatarColor,
    avatarUrl: rec.avatarUrl,
    authProvider: rec.authProvider ?? (rec.firebaseUid ? 'firebase' : rec.googleSub ? 'google' : 'local'),
    googleSub: rec.googleSub,
    firebaseUid: rec.firebaseUid,
    roleTitle: rec.roleTitle,
    createdAt: rec.createdAt,
    updatedAt: rec.updatedAt,
    lastLoginAt: rec.lastLoginAt,
    hasPassword: Boolean(rec.passwordHash && rec.salt),
  };
}

async function readWorkspaceRecord(accountId: string, fallbackTheme: ThemeMode = 'dark'): Promise<WorkspaceSnapshot> {
  const idbWs = await idbGet<StoredWorkspaceRecord>(STORE_WORKSPACES, accountId);
  const lsWs = readLsJson<StoredWorkspaceRecord | null>(`${LS_WS_PREFIX}${accountId}`, null);
  const chosen = idbWs && lsWs ? (idbWs.updatedAt >= lsWs.updatedAt ? idbWs : lsWs) : idbWs ?? lsWs;
  return normalizeSnapshot(chosen?.snapshot, fallbackTheme);
}

function generateSalt(byteLen = 16): string {
  const bytes = new Uint8Array(byteLen);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLen; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function fallbackDigestHex(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const payload = `${salt}::cadence-vault::${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    let data: Uint8Array<ArrayBuffer> = new Uint8Array(encoder.encode(payload));
    for (let i = 0; i < 600; i++) {
      const digest = await crypto.subtle.digest('SHA-256', data);
      data = new Uint8Array(digest);
    }
    return Array.from(data, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  let digest = payload;
  for (let i = 0; i < 64; i++) {
    digest = fallbackDigestHex(`${salt}:${i}:${digest}`);
  }
  return digest;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function normalizeSnapshot(
  candidate: Partial<WorkspaceSnapshot> | null | undefined,
  fallbackTheme: ThemeMode = 'dark'
): WorkspaceSnapshot {
  const base = createEmptyWorkspace(fallbackTheme);
  if (!candidate || typeof candidate !== 'object') return base;
  const fallbackProgression = base.progression!;
  const candProg = candidate.progression;
  return {
    events: Array.isArray(candidate.events) ? candidate.events : [],
    tasks: Array.isArray(candidate.tasks) ? candidate.tasks : [],
    habits: Array.isArray(candidate.habits) ? candidate.habits : [],
    notes: candidate.notes && typeof candidate.notes === 'object' ? candidate.notes : {},
    focusHistory: Array.isArray(candidate.focusHistory) ? candidate.focusHistory : [],
    enabledLayers: { ...base.enabledLayers, ...(candidate.enabledLayers ?? {}) },
    preferences: { ...base.preferences, ...(candidate.preferences ?? {}) },
    progression: {
      ...fallbackProgression,
      ...(candProg && typeof candProg === 'object' ? candProg : {}),
      streakFreezeDates: Array.isArray(candProg?.streakFreezeDates) ? candProg.streakFreezeDates : [],
      checkInDates: Array.isArray(candProg?.checkInDates) ? candProg.checkInDates : [],
      claimedCrateDates: Array.isArray(candProg?.claimedCrateDates) ? candProg.claimedCrateDates : [],
      claimedComboDates: Array.isArray(candProg?.claimedComboDates) ? candProg.claimedComboDates : [],
      unlockedAchievements:
        candProg?.unlockedAchievements && typeof candProg.unlockedAchievements === 'object'
          ? candProg.unlockedAchievements
          : {},
      dailyAnchors:
        candProg?.dailyAnchors && typeof candProg.dailyAnchors === 'object'
          ? candProg.dailyAnchors
          : {},
      pinnedBadgeId: typeof candProg?.pinnedBadgeId === 'string' ? candProg.pinnedBadgeId : undefined,
      lastLootDrop: candProg?.lastLootDrop && typeof candProg.lastLootDrop === 'object' ? candProg.lastLootDrop : null,
    },
  };
}

export function readSyncSessionMeta(): SessionMeta {
  return {
    ...DEFAULT_SESSION,
    ...readLsJson<Partial<SessionMeta>>(LS_SESSION_KEY, DEFAULT_SESSION),
  };
}

function writeSyncSessionMeta(meta: SessionMeta): void {
  writeLsJson(LS_SESSION_KEY, meta);
  void idbPut(STORE_META, { key: 'session', ...meta });
}

export function readSyncAccounts(): AccountProfile[] {
  const records = readLsJson<StoredAccountRecord[]>(LS_ACCOUNTS_KEY, []);
  return records.map(toPublicAccount);
}

function readStoredAccountRecordsSync(): StoredAccountRecord[] {
  return readLsJson<StoredAccountRecord[]>(LS_ACCOUNTS_KEY, []);
}

function writeStoredAccountRecords(records: StoredAccountRecord[]): void {
  writeLsJson(LS_ACCOUNTS_KEY, records);
}

export function readSyncWorkspace(accountId: string, fallbackTheme: ThemeMode = 'dark'): WorkspaceSnapshot {
  const record = readLsJson<StoredWorkspaceRecord | null>(`${LS_WS_PREFIX}${accountId}`, null);
  if (!record?.snapshot) return createEmptyWorkspace(fallbackTheme);
  return normalizeSnapshot(record.snapshot, fallbackTheme);
}

export async function saveWorkspaceForAccount(
  accountId: string,
  snapshot: WorkspaceSnapshot
): Promise<string> {
  const savedAt = new Date().toISOString();
  const payload: StoredWorkspaceRecord = {
    accountId,
    snapshot,
    updatedAt: savedAt,
  };
  writeLsJson(`${LS_WS_PREFIX}${accountId}`, payload);
  await idbPut(STORE_WORKSPACES, payload);

  const meta = readSyncSessionMeta();
  meta.savedAt = savedAt;
  writeSyncSessionMeta(meta);
  requestPersistentStorageOnce();
  return savedAt;
}

export async function loadVaultBootstrap(): Promise<{
  activeAccount: AccountProfile | null;
  accounts: AccountProfile[];
  snapshot: WorkspaceSnapshot;
  starterDismissed: boolean;
  stats: StorageStats;
}> {
  const idbMeta = await idbGet<{ key: string } & SessionMeta>(STORE_META, 'session');
  const lsMeta = readSyncSessionMeta();
  const session: SessionMeta = idbMeta
    ? {
        activeAccountId: idbMeta.activeAccountId || lsMeta.activeAccountId || GUEST_ACCOUNT_ID,
        dismissedStarterIds: {
          ...lsMeta.dismissedStarterIds,
          ...(idbMeta.dismissedStarterIds ?? {}),
        },
        savedAt: idbMeta.savedAt ?? lsMeta.savedAt,
      }
    : lsMeta;

  const idbAccounts = await idbGetAll<StoredAccountRecord>(STORE_ACCOUNTS);
  const lsAccounts = readStoredAccountRecordsSync();
  const accountMap = new Map<string, StoredAccountRecord>();
  for (const acc of lsAccounts) accountMap.set(acc.id, acc);
  for (const acc of idbAccounts) accountMap.set(acc.id, acc);

  const mergedAccounts = Array.from(accountMap.values()).sort((a, b) =>
    b.lastLoginAt.localeCompare(a.lastLoginAt)
  );
  if (mergedAccounts.length > 0) {
    writeStoredAccountRecords(mergedAccounts);
    for (const rec of mergedAccounts) {
      await idbPut(STORE_ACCOUNTS, rec);
    }
  }

  let activeAccountId = session.activeAccountId || GUEST_ACCOUNT_ID;
  const activeRecord =
    activeAccountId !== GUEST_ACCOUNT_ID
      ? mergedAccounts.find((a) => a.id === activeAccountId) ?? null
      : null;

  if (activeAccountId !== GUEST_ACCOUNT_ID && !activeRecord) {
    activeAccountId = GUEST_ACCOUNT_ID;
    session.activeAccountId = GUEST_ACCOUNT_ID;
    writeSyncSessionMeta(session);
  }

  const idbWs = await idbGet<StoredWorkspaceRecord>(STORE_WORKSPACES, activeAccountId);
  const lsWs = readLsJson<StoredWorkspaceRecord | null>(`${LS_WS_PREFIX}${activeAccountId}`, null);

  let chosenWs: StoredWorkspaceRecord | null = null;
  if (idbWs && lsWs) {
    chosenWs = idbWs.updatedAt >= lsWs.updatedAt ? idbWs : lsWs;
  } else {
    chosenWs = idbWs ?? lsWs;
  }

  const snapshot = normalizeSnapshot(chosenWs?.snapshot);
  if (chosenWs) {
    writeLsJson(`${LS_WS_PREFIX}${activeAccountId}`, chosenWs);
    await idbPut(STORE_WORKSPACES, chosenWs);
  }

  const stats = await computeStorageStats(activeAccountId, snapshot, mergedAccounts.length, session.savedAt);
  return {
    activeAccount: activeRecord ? toPublicAccount(activeRecord) : null,
    accounts: mergedAccounts.map(toPublicAccount),
    snapshot,
    starterDismissed: Boolean(session.dismissedStarterIds?.[activeAccountId]),
    stats,
  };
}

export async function createLocalAccount(params: {
  name: string;
  email: string;
  password: string;
  avatarColor?: string;
  roleTitle?: string;
  initialSnapshot: WorkspaceSnapshot;
  carryGuestData: boolean;
}): Promise<
  | { ok: true; account: AccountProfile; accounts: AccountProfile[]; snapshot: WorkspaceSnapshot }
  | { ok: false; error: string }
> {
  const cleanName = params.name.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  if (cleanName.length < 2) {
    return { ok: false, error: 'Please enter a display name (at least 2 characters).' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (params.password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  const existing = readStoredAccountRecordsSync();
  if (existing.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: 'An account with that email already exists on this browser.' };
  }

  const now = new Date().toISOString();
  const salt = generateSalt();
  const passwordHash = await hashPassword(params.password, salt);

  const id = `acct-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const record: StoredAccountRecord = {
    id,
    name: cleanName,
    email: cleanEmail,
    avatarColor: params.avatarColor || AVATAR_COLORS[existing.length % AVATAR_COLORS.length],
    authProvider: 'local',
    roleTitle: params.roleTitle?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    hasPassword: true,
    salt,
    passwordHash,
  };

  const nextAccounts = [record, ...existing];
  writeStoredAccountRecords(nextAccounts);
  await idbPut(STORE_ACCOUNTS, record);

  const accountSnapshot = params.carryGuestData
    ? params.initialSnapshot
    : createEmptyWorkspace(params.initialSnapshot.preferences.theme);

  await saveWorkspaceForAccount(id, accountSnapshot);

  const session = readSyncSessionMeta();
  session.activeAccountId = id;
  writeSyncSessionMeta(session);
  requestPersistentStorageOnce();

  return {
    ok: true,
    account: toPublicAccount(record),
    accounts: nextAccounts.map(toPublicAccount),
    snapshot: accountSnapshot,
  };
}

export async function signInLocalAccount(params: {
  email: string;
  password: string;
}): Promise<
  | { ok: true; account: AccountProfile; accounts: AccountProfile[]; snapshot: WorkspaceSnapshot }
  | { ok: false; error: string }
> {
  const cleanEmail = params.email.trim().toLowerCase();
  const records = readStoredAccountRecordsSync();
  const target = records.find((a) => a.email.toLowerCase() === cleanEmail);
  if (!target) {
    return { ok: false, error: 'No account found for that email on this browser.' };
  }

  if (!target.passwordHash || !target.salt) {
    return { ok: false, error: 'This account uses Google Sign-In. Click Continue with Google above.' };
  }

  const attemptHash = await hashPassword(params.password, target.salt);
  if (!constantTimeEqual(attemptHash, target.passwordHash)) {
    return { ok: false, error: 'Incorrect password. Please try again.' };
  }

  const now = new Date().toISOString();
  const updatedRecord: StoredAccountRecord = { ...target, lastLoginAt: now };
  const nextRecords = records.map((r) => (r.id === target.id ? updatedRecord : r));
  writeStoredAccountRecords(nextRecords);
  await idbPut(STORE_ACCOUNTS, updatedRecord);

  const session = readSyncSessionMeta();
  session.activeAccountId = target.id;
  writeSyncSessionMeta(session);

  const snapshot = await readWorkspaceRecord(target.id);

  return {
    ok: true,
    account: toPublicAccount(updatedRecord),
    accounts: nextRecords.map(toPublicAccount),
    snapshot,
  };
}

async function upsertExternalAccount(params: {
  matchIdKey: 'googleSub' | 'firebaseUid';
  externalId: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'firebase';
  initialSnapshot: WorkspaceSnapshot;
  carryGuestData: boolean;
}): Promise<{
  account: AccountProfile;
  accounts: AccountProfile[];
  snapshot: WorkspaceSnapshot;
  isNewAccount: boolean;
}> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.name.trim() || cleanEmail.split('@')[0];
  const records = readStoredAccountRecordsSync();
  const existing = records.find(
    (a) =>
      (params.matchIdKey === 'firebaseUid' && a.firebaseUid === params.externalId) ||
      (params.matchIdKey === 'googleSub' && a.googleSub === params.externalId) ||
      a.email.toLowerCase() === cleanEmail
  );

  const now = new Date().toISOString();
  if (existing) {
    const updated: StoredAccountRecord = {
      ...existing,
      name: cleanName || existing.name,
      email: cleanEmail,
      avatarUrl: params.picture ?? existing.avatarUrl,
      googleSub: params.matchIdKey === 'googleSub' ? params.externalId : existing.googleSub,
      firebaseUid: params.matchIdKey === 'firebaseUid' ? params.externalId : existing.firebaseUid,
      authProvider: params.provider,
      lastLoginAt: now,
      updatedAt: now,
    };
    const nextRecords = records.map((r) => (r.id === existing.id ? updated : r));
    writeStoredAccountRecords(nextRecords);
    await idbPut(STORE_ACCOUNTS, updated);

    const session = readSyncSessionMeta();
    session.activeAccountId = existing.id;
    writeSyncSessionMeta(session);
    requestPersistentStorageOnce();

    const snapshot = await readWorkspaceRecord(existing.id, params.initialSnapshot.preferences.theme);
    return {
      account: toPublicAccount(updated),
      accounts: nextRecords.map(toPublicAccount),
      snapshot,
      isNewAccount: false,
    };
  }

  const prefix = params.matchIdKey === 'firebaseUid' ? 'acct-fb' : 'acct-g';
  const id = `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const created: StoredAccountRecord = {
    id,
    name: cleanName,
    email: cleanEmail,
    avatarColor: AVATAR_COLORS[records.length % AVATAR_COLORS.length],
    avatarUrl: params.picture,
    authProvider: params.provider,
    googleSub: params.matchIdKey === 'googleSub' ? params.externalId : undefined,
    firebaseUid: params.matchIdKey === 'firebaseUid' ? params.externalId : undefined,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    hasPassword: false,
  };

  const nextRecords = [created, ...records];
  writeStoredAccountRecords(nextRecords);
  await idbPut(STORE_ACCOUNTS, created);

  const accountSnapshot = params.carryGuestData
    ? params.initialSnapshot
    : createEmptyWorkspace(params.initialSnapshot.preferences.theme);
  await saveWorkspaceForAccount(id, accountSnapshot);

  const session = readSyncSessionMeta();
  session.activeAccountId = id;
  writeSyncSessionMeta(session);
  requestPersistentStorageOnce();

  return {
    account: toPublicAccount(created),
    accounts: nextRecords.map(toPublicAccount),
    snapshot: accountSnapshot,
    isNewAccount: true,
  };
}

export function signInOrRegisterGoogleAccount(params: {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  initialSnapshot: WorkspaceSnapshot;
  carryGuestData: boolean;
}) {
  return upsertExternalAccount({
    matchIdKey: 'googleSub',
    externalId: params.sub,
    email: params.email,
    name: params.name,
    picture: params.picture,
    provider: 'google',
    initialSnapshot: params.initialSnapshot,
    carryGuestData: params.carryGuestData,
  });
}

export function signInOrRegisterFirebaseAccount(params: {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'firebase';
  initialSnapshot: WorkspaceSnapshot;
  carryGuestData: boolean;
}) {
  return upsertExternalAccount({
    matchIdKey: 'firebaseUid',
    externalId: params.uid,
    email: params.email,
    name: params.name,
    picture: params.picture,
    provider: params.provider,
    initialSnapshot: params.initialSnapshot,
    carryGuestData: params.carryGuestData,
  });
}

export async function switchToGuestWorkspace(): Promise<WorkspaceSnapshot> {
  const session = readSyncSessionMeta();
  session.activeAccountId = GUEST_ACCOUNT_ID;
  writeSyncSessionMeta(session);
  return readWorkspaceRecord(GUEST_ACCOUNT_ID);
}

export async function updateLocalProfile(
  accountId: string,
  patch: Partial<Pick<AccountProfile, 'name' | 'email' | 'avatarColor' | 'roleTitle'>>
): Promise<
  | { ok: true; account: AccountProfile; accounts: AccountProfile[] }
  | { ok: false; error: string }
> {
  const records = readStoredAccountRecordsSync();
  const target = records.find((r) => r.id === accountId);
  if (!target) return { ok: false, error: 'Account not found.' };

  const nextEmail = patch.email !== undefined ? patch.email.trim().toLowerCase() : target.email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
    return { ok: false, error: 'Invalid email address.' };
  }
  if (records.some((r) => r.id !== accountId && r.email.toLowerCase() === nextEmail)) {
    return { ok: false, error: 'Another local account already uses that email.' };
  }

  const nextName = patch.name !== undefined ? patch.name.trim() : target.name;
  if (nextName.length < 2) {
    return { ok: false, error: 'Display name must be at least 2 characters.' };
  }

  const updated: StoredAccountRecord = {
    ...target,
    name: nextName,
    email: nextEmail,
    avatarColor: patch.avatarColor ?? target.avatarColor,
    roleTitle: patch.roleTitle !== undefined ? patch.roleTitle.trim() || undefined : target.roleTitle,
    updatedAt: new Date().toISOString(),
  };

  const nextRecords = records.map((r) => (r.id === accountId ? updated : r));
  writeStoredAccountRecords(nextRecords);
  await idbPut(STORE_ACCOUNTS, updated);
  return {
    ok: true,
    account: toPublicAccount(updated),
    accounts: nextRecords.map(toPublicAccount),
  };
}

export async function changeLocalPassword(
  accountId: string,
  currentPassword: string,
  newPassword: string
): Promise<
  | { ok: true; account: AccountProfile; accounts: AccountProfile[] }
  | { ok: false; error: string }
> {
  if (newPassword.length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters.' };
  }
  const records = readStoredAccountRecordsSync();
  const target = records.find((r) => r.id === accountId);
  if (!target) return { ok: false, error: 'Account not found.' };

  if (target.passwordHash && target.salt) {
    const verifyHash = await hashPassword(currentPassword, target.salt);
    if (!constantTimeEqual(verifyHash, target.passwordHash)) {
      return { ok: false, error: 'Current password does not match.' };
    }
  }

  const nextSalt = generateSalt();
  const nextHash = await hashPassword(newPassword, nextSalt);
  const updated: StoredAccountRecord = {
    ...target,
    salt: nextSalt,
    passwordHash: nextHash,
    hasPassword: true,
    updatedAt: new Date().toISOString(),
  };
  const nextRecords = records.map((r) => (r.id === accountId ? updated : r));
  writeStoredAccountRecords(nextRecords);
  await idbPut(STORE_ACCOUNTS, updated);
  return {
    ok: true,
    account: toPublicAccount(updated),
    accounts: nextRecords.map(toPublicAccount),
  };
}

export async function deleteLocalAccount(accountId: string): Promise<{
  accounts: AccountProfile[];
  fallbackSnapshot: WorkspaceSnapshot;
}> {
  const records = readStoredAccountRecordsSync().filter((r) => r.id !== accountId);
  writeStoredAccountRecords(records);
  await idbDelete(STORE_ACCOUNTS, accountId);
  await idbDelete(STORE_WORKSPACES, accountId);
  try {
    window.localStorage.removeItem(`${LS_WS_PREFIX}${accountId}`);
  } catch {
    // ignore
  }

  const fallbackSnapshot = await switchToGuestWorkspace();
  return {
    accounts: records.map(toPublicAccount),
    fallbackSnapshot,
  };
}

export function setStarterBannerDismissed(accountId: string, dismissed: boolean): void {
  const session = readSyncSessionMeta();
  session.dismissedStarterIds = {
    ...(session.dismissedStarterIds ?? {}),
    [accountId]: dismissed,
  };
  writeSyncSessionMeta(session);
}

export async function computeStorageStats(
  accountId: string,
  snapshot: WorkspaceSnapshot,
  accountCount: number,
  savedAt: string | null
): Promise<StorageStats> {
  const serialized = JSON.stringify(snapshot);
  const bytesUsed = new TextEncoder().encode(serialized).byteLength;
  let persisted = false;
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persisted) {
      persisted = await navigator.storage.persisted();
    }
  } catch {
    // ignore
  }
  const hasIdb = typeof window !== 'undefined' && 'indexedDB' in window;
  return {
    engine: hasIdb ? `IndexedDB (${accountId === GUEST_ACCOUNT_ID ? 'Guest Vault' : 'Account Vault'})` : 'localStorage',
    persisted,
    bytesUsed,
    savedAt,
    accountCount,
  };
}

export function buildPortableAccountBundle(
  account: AccountProfile | null,
  snapshot: WorkspaceSnapshot
): string {
  const bundle: PortableAccountBundle = {
    bundleVersion: 2,
    exportedAt: new Date().toISOString(),
    profile: account
      ? {
          name: account.name,
          email: account.email,
          avatarColor: account.avatarColor,
          roleTitle: account.roleTitle,
        }
      : null,
    snapshot,
  };
  return JSON.stringify(bundle, null, 2);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
