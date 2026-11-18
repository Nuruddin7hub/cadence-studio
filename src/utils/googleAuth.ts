export interface GoogleUserClaims {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleAccountsApi {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (res: GoogleCredentialResponse) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
    }) => void;
    renderButton: (
      parent: HTMLElement,
      options: {
        theme?: 'outline' | 'filled_black' | 'filled_blue';
        size?: 'large' | 'medium' | 'small';
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
        shape?: 'rectangular' | 'pill';
        width?: number;
        logo_alignment?: 'left' | 'center';
      }
    ) => void;
  };
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (res: GoogleTokenResponse) => void;
      error_callback?: (err: { type?: string; message?: string }) => void;
    }) => { requestAccessToken: (override?: { prompt?: string }) => void };
  };
}

declare global {
  interface Window {
    google?: { accounts?: GoogleAccountsApi };
  }
}

const LS_CLIENT_ID_KEY = 'cadence_google_client_id_v1';
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let scriptLoadPromise: Promise<void> | null = null;

export function hasBuiltInGoogleClientId(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
}

export function getConfiguredGoogleClientId(): string {
  const fromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(LS_CLIENT_ID_KEY)?.trim() ?? '';
  } catch {
    return '';
  }
}

export function isValidGoogleClientId(raw: string): boolean {
  return /^[a-z0-9._-]+\.apps\.googleusercontent\.com$/i.test(raw.trim());
}

export function saveCustomGoogleClientId(raw: string): { ok: boolean; clientId: string; error?: string } {
  const clean = raw.trim();
  if (!isValidGoogleClientId(clean)) {
    return {
      ok: false,
      clientId: '',
      error: 'Client ID should end with .apps.googleusercontent.com',
    };
  }
  try {
    window.localStorage.setItem(LS_CLIENT_ID_KEY, clean);
  } catch {
    return { ok: false, clientId: '', error: 'Could not save Client ID to browser storage.' };
  }
  return { ok: true, clientId: clean };
}

export function clearCustomGoogleClientId(): void {
  try {
    window.localStorage.removeItem(LS_CLIENT_ID_KEY);
  } catch {
    // ignore
  }
}

export function loadGoogleGsiScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In requires a browser environment.'));
  }
  if (window.google?.accounts?.id && window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => {
          scriptLoadPromise = null;
          reject(new Error('Could not load Google Identity Services. Check your network connection.'));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts) {
        resolve();
      } else {
        scriptLoadPromise = null;
        reject(new Error('Google Identity script loaded without expected APIs.'));
      }
    };
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Unable to reach Google Sign-In servers (accounts.google.com).'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function decodeGoogleJwtCredential(credential: string): GoogleUserClaims | null {
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(bytes);
    const claims = JSON.parse(jsonStr) as {
      sub?: string;
      email?: string;
      name?: string;
      given_name?: string;
      picture?: string;
      exp?: number;
    };
    if (!claims.sub || !claims.email) return null;
    if (claims.exp && claims.exp * 1000 < Date.now()) return null;
    return {
      sub: claims.sub,
      email: claims.email,
      name: claims.name || claims.given_name || claims.email.split('@')[0],
      picture: claims.picture,
    };
  } catch {
    return null;
  }
}

export async function renderOfficialGoogleButton(
  container: HTMLElement,
  opts: {
    clientId: string;
    theme: 'dark' | 'light';
    width?: number;
    text?: 'signin_with' | 'signup_with' | 'continue_with';
    onUser: (user: GoogleUserClaims) => void;
    onError: (msg: string) => void;
  }
): Promise<void> {
  await loadGoogleGsiScript();
  const api = window.google?.accounts?.id;
  if (!api) {
    throw new Error('Google Identity API unavailable.');
  }

  container.innerHTML = '';
  api.initialize({
    client_id: opts.clientId,
    callback: (res) => {
      if (!res.credential) {
        opts.onError('Google did not return a sign-in credential.');
        return;
      }
      const user = decodeGoogleJwtCredential(res.credential);
      if (!user) {
        opts.onError('Could not verify Google profile information.');
        return;
      }
      opts.onUser(user);
    },
    cancel_on_tap_outside: true,
  });

  api.renderButton(container, {
    theme: opts.theme === 'dark' ? 'filled_black' : 'outline',
    size: 'large',
    text: opts.text ?? 'continue_with',
    shape: 'pill',
    width: opts.width ?? 320,
    logo_alignment: 'left',
  });
}

export async function promptGoogleOAuthSignIn(clientId: string): Promise<GoogleUserClaims> {
  await loadGoogleGsiScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Google OAuth2 client unavailable.');
  }

  return new Promise<GoogleUserClaims>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (tokenRes) => {
        if (tokenRes.error || !tokenRes.access_token) {
          reject(new Error(tokenRes.error_description || tokenRes.error || 'Google sign-in cancelled.'));
          return;
        }
        try {
          const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenRes.access_token}` },
          });
          if (!resp.ok) {
            reject(new Error('Failed to fetch Google user profile.'));
            return;
          }
          const profile = (await resp.json()) as {
            sub?: string;
            email?: string;
            name?: string;
            picture?: string;
          };
          if (!profile.sub || !profile.email) {
            reject(new Error('Google profile response missing verified email.'));
            return;
          }
          resolve({
            sub: profile.sub,
            email: profile.email,
            name: profile.name || profile.email.split('@')[0],
            picture: profile.picture,
          });
        } catch {
          reject(new Error('Network error while reading Google profile.'));
        }
      },
      error_callback: (err) => {
        reject(
          new Error(
            err.type === 'popup_closed'
              ? 'Google sign-in popup was closed before completing.'
              : err.message || 'Google sign-in popup could not open.'
          )
        );
      },
    });

    client.requestAccessToken({ prompt: 'select_account' });
  });
}
