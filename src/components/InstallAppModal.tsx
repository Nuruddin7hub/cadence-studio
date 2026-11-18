import React, { useEffect, useState } from 'react';
import {
  Check,
  Cloud,
  Copy,
  Download,
  Laptop,
  MoreVertical,
  PlusSquare,
  Share,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WifiOff,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { getCanonicalAppUrl, type PwaPlatform } from '../utils/pwaInstall';
import { BorderGlow, GlareHover } from '../lib/reactbits';

const PLATFORM_TABS: { id: PwaPlatform; label: string }[] = [
  { id: 'ios', label: 'iPhone / iPad' },
  { id: 'android', label: 'Android' },
  { id: 'desktop-chromium', label: 'Desktop Chrome / Edge' },
];

export const InstallAppModal: React.FC = () => {
  const {
    snapshot,
    pwaInstalled,
    pwaCanPrompt,
    pwaPlatform,
    installModalOpen,
    setInstallModalOpen,
    triggerPwaInstall,
    pushToast,
  } = useWorkspace();

  const [selectedGuide, setSelectedGuide] = useState<PwaPlatform>(
    pwaPlatform === 'desktop-other' ? 'desktop-chromium' : pwaPlatform
  );
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    setSelectedGuide(pwaPlatform === 'desktop-other' ? 'desktop-chromium' : pwaPlatform);
  }, [pwaPlatform]);

  useEffect(() => {
    if (!installModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInstallModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [installModalOpen, setInstallModalOpen]);

  if (!installModalOpen) return null;

  const isDark = snapshot.preferences.theme === 'dark';
  const appUrl = getCanonicalAppUrl();

  const handleCopyUrl = () => {
    try {
      void navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      pushToast('App link copied', 'Open in mobile Safari or Chrome to install on your phone', false, 'success');
      window.setTimeout(() => setCopiedUrl(false), 1800);
    } catch {
      // ignore clipboard restriction
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Install Cadence Web App"
      onClick={() => setInstallModalOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl border bg-[var(--bg-surface)] overflow-hidden"
        style={{
          borderColor: 'var(--rule-strong)',
          boxShadow: 'var(--shadow-panel)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between bg-[var(--bg-elevated)]/70">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="./icons/icon-192.png"
              alt="Cadence Studio App Icon"
              className="w-10 h-10 rounded-xl border border-white/15 shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-display font-bold text-[16px] text-[var(--ink-primary)] truncate">
                Install Cadence Studio App
              </h2>
              <p className="text-[12px] text-[var(--ink-secondary)] truncate">
                Standalone window, home-screen icon, and offline vault
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInstallModalOpen(false)}
            className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
            aria-label="Close install guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {pwaInstalled ? (
            <div className="p-3.5 rounded-xl border bg-[var(--accent-emerald-soft)]/35 border-[var(--accent-emerald)]/40 flex items-center gap-3 text-[13px] text-[var(--ink-primary)]">
              <ShieldCheck className="w-5 h-5 text-[var(--accent-emerald)] shrink-0" />
              <div>
                <p className="font-semibold">Cadence Studio is installed as a Web App</p>
                <p className="text-[12px] text-[var(--ink-secondary)] mt-0.5">
                  You unlocked the Studio Native achievement (+75 XP). Offline shell caching is active.
                </p>
              </div>
            </div>
          ) : pwaCanPrompt ? (
            <BorderGlow
              animated
              colors={['#E74004', '#F4C46C', '#14A4FC']}
              glowColor="18 92 52"
              backgroundColor="var(--bg-elevated)"
              borderRadius={14}
              glowRadius={24}
              glowIntensity={isDark ? 0.55 : 0.25}
              fillOpacity={0.22}
            >
              <div className="p-4 rounded-xl border bg-[var(--bg-elevated)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--accent-emerald)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>One-tap native install ready</span>
                  </div>
                  <p className="text-[13px] font-medium text-[var(--ink-primary)] mt-1">
                    Download directly onto your device dock or desktop. Zero app store required.
                  </p>
                </div>
                <GlareHover glareColor="#ffffff" glareOpacity={0.2} borderRadius="10px" className="inline-flex shrink-0">
                  <button
                    type="button"
                    onClick={() => void triggerPwaInstall()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Now</span>
                  </button>
                </GlareHover>
              </div>
            </BorderGlow>
          ) : null}

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: WifiOff, title: 'Offline Ready', desc: 'Loads vault even offline' },
              { icon: Smartphone, title: 'App Window', desc: 'Launches full-screen' },
              { icon: Cloud, title: 'Live Sync', desc: 'Google, Email & Local' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-2.5 rounded-xl border bg-[var(--bg-inset)] space-y-1">
                  <Icon className="w-4 h-4 mx-auto text-[var(--accent-primary)]" />
                  <div className="text-[12px] font-semibold text-[var(--ink-primary)]">{item.title}</div>
                  <div className="text-[10.5px] text-[var(--ink-muted)] leading-tight">{item.desc}</div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border bg-[var(--bg-inset)]">
              {PLATFORM_TABS.map((tab) => {
                const active = selectedGuide === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedGuide(tab.id)}
                    className="flex-1 min-w-[100px] py-1.5 px-2.5 rounded-lg text-[12px] font-medium transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                      color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                      boxShadow: active ? 'inset 0 0 0 1px var(--rule-hairline)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {selectedGuide === 'ios' && (
              <ol className="p-3.5 rounded-xl border bg-[var(--bg-inset)] space-y-2.5 text-[12.5px] text-[var(--ink-secondary)]">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Open <strong className="text-[var(--ink-primary)]">Safari</strong> on your iPhone or iPad and tap the{' '}
                    <Share className="inline w-3.5 h-3.5 text-[var(--accent-sky)] mx-0.5" />
                    <strong className="text-[var(--ink-primary)]">Share</strong> button in the bar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Scroll down and tap <PlusSquare className="inline w-3.5 h-3.5 text-[var(--ink-primary)] mx-0.5" />{' '}
                    <strong className="text-[var(--ink-primary)]">Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[11px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-[var(--ink-primary)]">Add</strong> to place Cadence Studio on your Home Screen and unlock the Studio Native badge (+75 XP).
                  </span>
                </li>
              </ol>
            )}

            {selectedGuide === 'android' && (
              <ol className="p-3.5 rounded-xl border bg-[var(--bg-inset)] space-y-2.5 text-[12.5px] text-[var(--ink-secondary)]">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    In <strong className="text-[var(--ink-primary)]">Chrome, Brave, or Edge</strong>, tap the{' '}
                    <MoreVertical className="inline w-3.5 h-3.5 text-[var(--ink-primary)]" /> menu button in the toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Select <strong className="text-[var(--ink-primary)]">Install app</strong> or{' '}
                    <strong className="text-[var(--ink-primary)]">Add to Home screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[11px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-[var(--ink-primary)]">Install</strong>. Long-press the home icon anytime for Planner, Tasks, or Focus shortcuts.
                  </span>
                </li>
              </ol>
            )}

            {selectedGuide === 'desktop-chromium' && (
              <ol className="p-3.5 rounded-xl border bg-[var(--bg-inset)] space-y-2.5 text-[12.5px] text-[var(--ink-secondary)]">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    In <strong className="text-[var(--ink-primary)]">Chrome, Edge, or Brave</strong>, look at the right side of the URL bar for the{' '}
                    <Laptop className="inline w-3.5 h-3.5 text-[var(--accent-primary)] mx-0.5" /> install icon (or click ⋮ menu → Save and Share → Install page as app).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-mono-num text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Pin Cadence Studio to your Windows taskbar or macOS Dock for instant launch and standalone Alt+Tab switching.
                  </span>
                </li>
              </ol>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border bg-[var(--bg-inset)]">
            <span className="font-mono-num text-[11.5px] text-[var(--ink-secondary)] truncate pl-1">{appUrl}</span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[11.5px] font-medium text-[var(--ink-primary)] shrink-0"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-[var(--accent-emerald)]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied link' : 'Copy app link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
