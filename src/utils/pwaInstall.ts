export type PwaPlatform = 'ios' | 'android' | 'desktop-chromium' | 'desktop-other';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

export function isRunningAsInstalledPwa(): boolean {
  if (typeof window === 'undefined') return false;
  const standaloneMedia = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
  const iosStandalone = Boolean((window.navigator as { standalone?: boolean }).standalone);
  return standaloneMedia || iosStandalone;
}

export function detectPwaPlatform(): PwaPlatform {
  if (typeof navigator === 'undefined') return 'desktop-other';
  const ua = navigator.userAgent || '';
  const isIos = /iPad|iPhone|iPod/i.test(ua) || (ua.includes('Mac') && navigator.maxTouchPoints > 1);
  if (isIos) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Chrome|Edg|Brave|OPR|Vivaldi|Arc/i.test(ua)) return 'desktop-chromium';
  return 'desktop-other';
}

export function getCanonicalAppUrl(): string {
  if (typeof window === 'undefined') return 'https://nuruddin7hub.github.io/cadence-studio/';
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  return cleanUrl.endsWith('/') ? cleanUrl : `${cleanUrl}/`;
}
