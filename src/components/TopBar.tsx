import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckSquare,
  Command,
  Compass,
  Download,
  Flame,
  Gift,
  Menu,
  Moon,
  Plus,
  Search,
  Share2,
  Sun,
  Timer,
  User,
} from 'lucide-react';
import { TrophyEmblem } from './TrophyEmblem';
import { useWorkspace } from '../context/WorkspaceContext';
import type { WorkspaceTab } from '../types/workspace';
import { formatMinutes } from '../utils/date';
import { parseQuickInput } from '../utils/nlp';
import { Magnet } from '../lib/reactbits';
import { UserAvatar } from './UserAvatar';

const TABS: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'planner', label: 'Planner', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'focus', label: 'Focus & Habits', icon: Timer },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'overview', label: 'Overview', icon: Compass },
];

export const TopBar: React.FC = () => {
  const {
    snapshot,
    todayKey,
    nowMinutes,
    activeTab,
    setActiveTab,
    setSelection,
    toggleTheme,
    setCommandOpen,
    addTaskFromText,
    availabilityMode,
    setAvailabilityMode,
    availabilitySlots,
    setMobileSidebarOpen,
    pushToast,
    currentUser,
    openAccountModal,
    progression,
    setComebackModalOpen,
    pwaInstalled,
    triggerPwaInstall,
  } = useWorkspace();

  const [quickDraft, setQuickDraft] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const parsedPreview = useMemo(() => {
    if (!quickDraft.trim()) return null;
    return parseQuickInput(quickDraft, todayKey);
  }, [quickDraft, todayKey]);

  const upcomingToday = useMemo(() => {
    return snapshot.events
      .filter((e) => e.date === todayKey && !e.allDay && e.startMinutes >= nowMinutes - 15)
      .sort((a, b) => a.startMinutes - b.startMinutes)
      .slice(0, 4);
  }, [snapshot.events, todayKey, nowMinutes]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDraft.trim()) return;
    addTaskFromText(quickDraft);
    setQuickDraft('');
  };

  // Dedicated clean editorial header on Overview landing (Cron R01 / Linear R05 craft)
  if (activeTab === 'overview') {
    const jumpTo = (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
      <header
        className="sticky top-0 z-40 h-14 border-b px-4 sm:px-8 flex items-center justify-between gap-4 backdrop-blur-md"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-canvas) 88%, transparent)',
          borderColor: 'var(--rule-hairline)',
        }}
      >
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
          <Magnet padding={28} magnetStrength={5}>
            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2" y="3" width="12" height="10" rx="2" stroke="#FFFFFF" strokeWidth="1.6" />
                  <path d="M5 1.75V4M11 1.75V4M2 6.5H14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="9.8" r="1.35" fill="#FFFFFF" />
                </svg>
              </span>
              <span className="font-display font-bold text-[15px] tracking-tight text-[var(--ink-primary)]">
                Cadence
              </span>
            </button>
          </Magnet>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[var(--ink-secondary)]">
            <button type="button" onClick={() => jumpTo('overview-features')} className="hover:text-[var(--ink-primary)] transition-colors">
              Features
            </button>
            <button type="button" onClick={() => setActiveTab('rewards')} className="hover:text-[var(--ink-primary)] transition-colors">
              Rewards & Trophies
            </button>
            <button type="button" onClick={() => setActiveTab('tasks')} className="hover:text-[var(--ink-primary)] transition-colors">
              Tasks & Matrix
            </button>
            <button type="button" onClick={() => setActiveTab('analytics')} className="hover:text-[var(--ink-primary)] transition-colors">
              Analytics
            </button>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setComebackModalOpen(true)}
              aria-label={`Open Daily Vault (${progression.currentStreak}d streak)`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[12px] font-mono-num font-semibold transition-colors bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--ink-primary)]"
              style={{
                borderColor: !progression.crateClaimedToday ? 'rgba(231, 64, 4, 0.48)' : 'var(--rule-hairline)',
              }}
            >
              <Flame className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>{progression.currentStreak}d</span>
              {!progression.crateClaimedToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              )}
            </button>

            {!pwaInstalled && (
              <button
                type="button"
                onClick={() => void triggerPwaInstall()}
                aria-label="Download Cadence Web App"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[12px] font-medium text-[var(--ink-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
                style={{ borderColor: 'var(--rule-hairline)' }}
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Get App</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              aria-label="Toggle dark or light theme"
            >
              {snapshot.preferences.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={() => openAccountModal('profile')}
                aria-label={`Account menu for ${currentUser.name}`}
                className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border text-[12px] font-medium text-[var(--ink-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-colors"
                style={{ borderColor: 'var(--rule-strong)' }}
              >
                <UserAvatar user={currentUser} sizeClass="w-6 h-6" textClass="text-[10px]" />
                <span className="hidden sm:inline max-w-[110px] truncate">{currentUser.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAccountModal('signin')}
                aria-label="Sign in or create account"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[12px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                style={{ borderColor: 'var(--rule-strong)' }}
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className="studio-card inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-[12px] sm:text-[12.5px] font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
            >
              <span className="sm:hidden">Studio</span>
              <span className="hidden sm:inline">Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-40 h-14 border-b px-3 sm:px-5 flex items-center justify-between gap-3 backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 94%, transparent)',
        borderColor: 'var(--rule-hairline)',
      }}
    >
      {/* Left: Brand mark & primary views */}
      <div className="flex items-center gap-2.5 shrink-0">
        {activeTab === 'planner' && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)]"
            aria-label="Open workspace sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2 shrink-0 group focus:outline-none"
          title="Return to Cadence Overview"
        >
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-105"
            style={{
              backgroundColor: 'var(--accent-primary)',
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="#FFFFFF" strokeWidth="1.6" />
              <path d="M5 1.75V4M11 1.75V4M2 6.5H14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="9.8" r="1.35" fill="#FFFFFF" />
            </svg>
          </span>
          <span className="font-display font-bold text-[15px] tracking-tight text-[var(--ink-primary)]">
            Cadence
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-0.5 ml-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id || (activeTab === 'rewards' && t.id === 'focus');
            return (
              <button
                key={t.id}
                type="button"
                title={t.label}
                aria-label={t.label}
                onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                  color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center: Quick capture OR Search button on Tasks view (never overlaps nav at 860-960px!) */}
      {activeTab === 'tasks' ? (
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hidden sm:flex flex-1 min-w-0 max-w-sm items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-[12.5px] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] bg-[var(--bg-inset)] transition-colors"
        >
          <span className="inline-flex items-center gap-2 min-w-0 flex-1">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Jump to any event, view, or command...</span>
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-mono-num shrink-0">
            <Command className="w-3 h-3" />
            <span>K</span>
          </span>
        </button>
      ) : (
        <form
          onSubmit={handleQuickSubmit}
          className="hidden sm:flex flex-1 min-w-0 max-w-md relative items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors focus-within:border-[var(--accent-primary)]"
          style={{
            backgroundColor: 'var(--bg-inset)',
            borderColor: 'var(--rule-hairline)',
          }}
        >
          <Plus className="w-3.5 h-3.5 shrink-0 text-[var(--accent-primary)]" />
          <input
            type="text"
            value={quickDraft}
            onChange={(e) => setQuickDraft(e.target.value)}
            placeholder="Quick add: 'Review 2pm !p1'"
            aria-label="Quick capture task or event"
            className="flex-1 min-w-0 bg-transparent text-[12.5px] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
          />
          {parsedPreview && (
            <div className="hidden xl:flex items-center gap-1 shrink-0">
              {parsedPreview.startMinutes !== undefined && (
                <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono-num bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                  {formatMinutes(parsedPreview.startMinutes, true)}
                </span>
              )}
              {parsedPreview.priority && (
                <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono-num bg-[var(--accent-amber-soft)] text-[var(--accent-amber)]">
                  {parsedPreview.priority}
                </span>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            title="Open Command Palette (Ctrl+K / Cmd+K)"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-mono-num text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] shrink-0"
          >
            <Command className="w-3 h-3" />
            <span>K</span>
          </button>
        </form>
      )}

      {/* Right: Momentum Streak + Daily Vault, Install App, Availability share, Notifications, Theme toggle */}
      <div className="flex items-center gap-1.5 shrink-0 relative">
        <button
          type="button"
          onClick={() => setActiveTab('rewards')}
          aria-label={`Rewards Studio (${progression.currentStreak}d streak)`}
          title={`Level ${progression.level} ${progression.rankTitle} · ${progression.unlockedCount}/${progression.achievements.length} emblems`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-mono-num font-semibold transition-colors hover:bg-[var(--bg-hover)]"
          style={{
            backgroundColor: activeTab === 'rewards' ? 'var(--bg-elevated)' : 'var(--bg-surface)',
            borderColor: activeTab === 'rewards' ? 'var(--accent-primary)' : 'var(--rule-strong)',
            color: 'var(--ink-primary)',
          }}
        >
          <Flame className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>{progression.currentStreak}d</span>
          {!progression.crateClaimedToday && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          )}
        </button>

        {!pwaInstalled && (
          <button
            type="button"
            onClick={() => void triggerPwaInstall()}
            aria-label="Install Web App"
            title="Download Cadence Studio as a standalone app"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Get App</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setActiveTab('planner');
            setAvailabilityMode(!availabilityMode);
            if (!availabilityMode) {
              pushToast('Availability mode active', 'Click open slots on the calendar to copy times');
            }
          }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium transition-colors"
          style={{
            backgroundColor: availabilityMode ? 'var(--accent-primary-soft)' : 'var(--bg-elevated)',
            borderColor: availabilityMode ? 'var(--accent-primary)' : 'var(--rule-hairline)',
            color: availabilityMode ? 'var(--accent-primary)' : 'var(--ink-primary)',
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{availabilitySlots.length > 0 ? `Share (${availabilitySlots.length})` : 'Share times'}</span>
        </button>

        <span className="hidden sm:block h-4 w-px bg-[var(--rule-hairline)] mx-0.5" aria-hidden="true" />

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] relative"
            aria-label="Upcoming reminders"
          >
            <Bell className="w-4 h-4" />
            {upcomingToday.length > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border p-3 z-50"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--rule-strong)',
                boxShadow: 'var(--shadow-panel)',
              }}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b">
                <span className="text-[12.5px] font-semibold">Today upcoming</span>
                <span className="text-[11px] font-mono-num text-[var(--ink-muted)]">
                  {upcomingToday.length} blocks
                </span>
              </div>
              {upcomingToday.length === 0 ? (
                <p className="text-[12px] text-[var(--ink-muted)] py-3 text-center">
                  All scheduled events for today are complete.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {upcomingToday.map((ev) => (
                    <li key={ev.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelection({ type: 'event', id: ev.id });
                          setActiveTab('planner');
                          setNotifOpen(false);
                        }}
                        className="w-full flex items-start justify-between gap-2 p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[12px] text-left transition-colors"
                      >
                        <span className="font-medium text-[var(--ink-primary)] leading-snug">{ev.title}</span>
                        <span className="font-mono-num text-[11px] text-[var(--accent-amber)] shrink-0">
                          {formatMinutes(ev.startMinutes)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          aria-label="Toggle dark or light theme"
          title={`Switch to ${snapshot.preferences.theme === 'dark' ? 'Daylight Paper' : 'Obsidian Studio'} theme`}
        >
          {snapshot.preferences.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => openAccountModal()}
          aria-label={currentUser ? `Account: ${currentUser.name}` : 'Account & Vault'}
          title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign in or create local account'}
          className="inline-flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg border border-transparent hover:border-[var(--rule-hairline)] hover:bg-[var(--bg-hover)] text-[12px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors"
        >
          {currentUser ? (
            <>
              <UserAvatar user={currentUser} sizeClass="w-6 h-6" textClass="text-[10px]" />
              <span className="hidden xl:inline max-w-[90px] truncate text-[var(--ink-primary)] font-medium">
                {currentUser.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span className="hidden xl:inline font-medium">Account</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="sm:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--ink-primary)]"
          aria-label="Quick command"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
