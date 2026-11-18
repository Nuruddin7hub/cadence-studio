import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import type { WorkspaceSnapshot } from '../types/workspace';
import { normalizeSnapshot } from './authStorage';

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export interface FirebaseAuthUserInfo {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'firebase';
}

const LS_FIREBASE_CONFIG_KEY = 'cadence_firebase_config_v1';
const LS_DEVICE_ID_KEY = 'cadence_device_id_v1';

let cachedSignature = '';
let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'dev-server';
  try {
    const existing = window.localStorage.getItem(LS_DEVICE_ID_KEY);
    if (existing) return existing;
    const created = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    window.localStorage.setItem(LS_DEVICE_ID_KEY, created);
    return created;
  } catch {
    return `dev-${Date.now().toString(36)}`;
  }
}

export function hasBuiltInFirebaseConfig(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY?.trim() &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() &&
      import.meta.env.VITE_FIREBASE_APP_ID?.trim()
  );
}

export function getConfiguredFirebaseConfig(): FirebaseWebConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();

  if (apiKey && authDomain && projectId && appId) {
    return {
      apiKey,
      authDomain,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || undefined,
      appId,
    };
  }

  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LS_FIREBASE_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FirebaseWebConfig>;
    if (parsed.apiKey && parsed.authDomain && parsed.projectId && parsed.appId) {
      return parsed as FirebaseWebConfig;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Accepts either strict JSON or a raw `const firebaseConfig = { ... };` snippet pasted from Firebase Console.
 */
export function parseFirebaseConfigInput(rawInput: string): FirebaseWebConfig | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  try {
    const direct = JSON.parse(trimmed) as Partial<FirebaseWebConfig>;
    if (direct.apiKey && direct.authDomain && direct.projectId && direct.appId) {
      return {
        apiKey: String(direct.apiKey).trim(),
        authDomain: String(direct.authDomain).trim(),
        projectId: String(direct.projectId).trim(),
        storageBucket: direct.storageBucket ? String(direct.storageBucket).trim() : undefined,
        messagingSenderId: direct.messagingSenderId ? String(direct.messagingSenderId).trim() : undefined,
        appId: String(direct.appId).trim(),
      };
    }
  } catch {
    // Parse JS object literal syntax cleanly via regex extraction
  }

  const pick = (field: keyof FirebaseWebConfig): string => {
    const match = trimmed.match(new RegExp(`${field}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`));
    return match ? match[1].trim() : '';
  };

  const apiKey = pick('apiKey');
  const authDomain = pick('authDomain');
  const projectId = pick('projectId');
  const appId = pick('appId');
  if (!apiKey || !authDomain || !projectId || !appId) return null;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: pick('storageBucket') || undefined,
    messagingSenderId: pick('messagingSenderId') || undefined,
    appId,
  };
}

export function saveCustomFirebaseConfig(rawInput: string): {
  ok: boolean;
  config?: FirebaseWebConfig;
  error?: string;
} {
  const parsed = parseFirebaseConfigInput(rawInput);
  if (!parsed) {
    return {
      ok: false,
      error: 'Could not find apiKey, authDomain, projectId, and appId. Paste the full firebaseConfig object.',
    };
  }
  try {
    window.localStorage.setItem(LS_FIREBASE_CONFIG_KEY, JSON.stringify(parsed));
    cachedSignature = '';
    cachedApp = null;
    cachedAuth = null;
    cachedDb = null;
    return { ok: true, config: parsed };
  } catch {
    return { ok: false, error: 'Failed to store Firebase config in browser storage.' };
  }
}

export function clearCustomFirebaseConfig(): void {
  try {
    window.localStorage.removeItem(LS_FIREBASE_CONFIG_KEY);
    cachedSignature = '';
    cachedApp = null;
    cachedAuth = null;
    cachedDb = null;
  } catch {
    // ignore
  }
}

function ensureFirebaseClients(): { app: FirebaseApp; auth: Auth; db: Firestore; config: FirebaseWebConfig } | null {
  const config = getConfiguredFirebaseConfig();
  if (!config) return null;

  const sig = `${config.projectId}:${config.apiKey}:${config.appId}`;
  if (cachedApp && cachedAuth && cachedDb && cachedSignature === sig) {
    return { app: cachedApp, auth: cachedAuth, db: cachedDb, config };
  }

  const existing = getApps().find((a) => a.name === 'cadence-cloud');
  const app = existing ?? initializeApp(config, 'cadence-cloud');
  const auth = getAuth(app);
  const db = getFirestore(app);

  cachedSignature = sig;
  cachedApp = app;
  cachedAuth = auth;
  cachedDb = db;
  return { app, auth, db, config };
}

function mapFirebaseUser(user: User): FirebaseAuthUserInfo {
  const usedGoogle = user.providerData.some((p) => p.providerId === 'google.com');
  return {
    uid: user.uid,
    email: (user.email ?? `${user.uid}@firebase.local`).toLowerCase(),
    name: user.displayName || user.email?.split('@')[0] || 'Cadence User',
    picture: user.photoURL ?? undefined,
    provider: usedGoogle ? 'google' : 'firebase',
  };
}

export function getFriendlyFirebaseError(err: unknown): string {
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code?: unknown }).code) : '';
  if (code === 'auth/popup-closed-by-user') return 'Sign-in popup was closed before finishing.';
  if (code === 'auth/popup-blocked') return 'Sign-in popup was blocked by browser settings. Please allow popups for this site.';
  if (code === 'auth/unauthorized-domain') {
    return `Domain not authorized yet. Add ${window.location.hostname} in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
  }
  if (code === 'auth/email-already-in-use') return 'An account with that email already exists. Try Sign In instead.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Invalid email or password.';
  }
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
  if (code === 'permission-denied') {
    return 'Firestore blocked access. Verify your Firestore Security Rules allow request.auth.uid == userId.';
  }
  return err instanceof Error ? err.message : 'Firebase request failed.';
}

export async function signInWithFirebaseGoogle(): Promise<FirebaseAuthUserInfo> {
  const clients = ensureFirebaseClients();
  if (!clients) throw new Error('Firebase is not configured yet.');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(clients.auth, provider);
  return mapFirebaseUser(cred.user);
}

export async function signUpWithFirebaseEmail(
  name: string,
  email: string,
  password: string
): Promise<FirebaseAuthUserInfo> {
  const clients = ensureFirebaseClients();
  if (!clients) throw new Error('Firebase is not configured yet.');
  const cred = await createUserWithEmailAndPassword(clients.auth, email.trim(), password);
  if (name.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
  }
  return {
    ...mapFirebaseUser(cred.user),
    name: name.trim() || mapFirebaseUser(cred.user).name,
  };
}

export async function signInWithFirebaseEmail(
  email: string,
  password: string
): Promise<FirebaseAuthUserInfo> {
  const clients = ensureFirebaseClients();
  if (!clients) throw new Error('Firebase is not configured yet.');
  const cred = await signInWithEmailAndPassword(clients.auth, email.trim(), password);
  return mapFirebaseUser(cred.user);
}

export async function signOutFirebaseUser(): Promise<void> {
  const clients = ensureFirebaseClients();
  if (!clients) return;
  await signOut(clients.auth);
}

export function subscribeFirebaseAuthState(
  onChange: (user: FirebaseAuthUserInfo | null) => void
): () => void {
  const clients = ensureFirebaseClients();
  if (!clients) return () => {};
  return onAuthStateChanged(clients.auth, (fbUser) => {
    onChange(fbUser ? mapFirebaseUser(fbUser) : null);
  });
}

function sanitizeForFirestore(snapshot: WorkspaceSnapshot): WorkspaceSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as WorkspaceSnapshot;
}

export async function bootstrapCloudWorkspace(
  uid: string,
  deviceId: string,
  localCandidate: WorkspaceSnapshot,
  shouldSeedLocalIfMissing: boolean
): Promise<{ snapshot: WorkspaceSnapshot; syncedAt: string | null }> {
  const clients = ensureFirebaseClients();
  if (!clients) return { snapshot: localCandidate, syncedAt: null };

  const ref = doc(clients.db, 'workspaces', uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data() as { snapshot?: Partial<WorkspaceSnapshot>; updatedAtIso?: string } | undefined;
    if (data?.snapshot) {
      return {
        snapshot: normalizeSnapshot(data.snapshot, localCandidate.preferences.theme),
        syncedAt: data.updatedAtIso ?? new Date().toISOString(),
      };
    }
  }

  if (shouldSeedLocalIfMissing) {
    const clean = sanitizeForFirestore(localCandidate);
    const updatedAtIso = new Date().toISOString();
    await setDoc(ref, {
      snapshot: clean,
      updatedAtMs: Date.now(),
      updatedAtIso,
      deviceId,
    });
    return { snapshot: clean, syncedAt: updatedAtIso };
  }

  return { snapshot: localCandidate, syncedAt: null };
}

export async function pushCloudWorkspace(
  uid: string,
  deviceId: string,
  snapshot: WorkspaceSnapshot
): Promise<string> {
  const clients = ensureFirebaseClients();
  if (!clients) throw new Error('Firebase is not configured.');

  const ref = doc(clients.db, 'workspaces', uid);
  const updatedAtIso = new Date().toISOString();
  const clean = sanitizeForFirestore(snapshot);
  await setDoc(ref, {
    snapshot: clean,
    updatedAtMs: Date.now(),
    updatedAtIso,
    deviceId,
  });
  return updatedAtIso;
}

export function subscribeCloudWorkspace(
  uid: string,
  localDeviceId: string,
  fallbackTheme: 'dark' | 'light',
  onRemoteSnapshot: (snapshot: WorkspaceSnapshot, syncedAt: string) => void,
  onSyncError: (message: string) => void
): () => void {
  const clients = ensureFirebaseClients();
  if (!clients) return () => {};

  const ref = doc(clients.db, 'workspaces', uid);
  return onSnapshot(
    ref,
    (docSnap) => {
      if (docSnap.metadata.hasPendingWrites || !docSnap.exists()) return;
      const data = docSnap.data() as {
        snapshot?: Partial<WorkspaceSnapshot>;
        deviceId?: string;
        updatedAtIso?: string;
      } | undefined;
      if (!data?.snapshot) return;
      if (data.deviceId && data.deviceId === localDeviceId) return;
      onRemoteSnapshot(normalizeSnapshot(data.snapshot, fallbackTheme), data.updatedAtIso ?? new Date().toISOString());
    },
    (err) => {
      onSyncError(getFriendlyFirebaseError(err));
    }
  );
}
