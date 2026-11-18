import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckSquare,
  Command,
  Compass,
  Menu,
  Moon,
  Plus,
  Search,
  Share2,
  Sun,
  Timer,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { WorkspaceTab } from '../types/workspace';
import { formatMinutes } from '../utils/date';
import { parseQuickInput } from '../utils/nlp';
import { Magnet } from '../lib/reactbits';

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
    toggleTheme,
    setCommandOpen,
    addTaskFromText,
    availabilityMode,
    setAvailabilityMode,
    availabilitySlots,
    setMobileSidebarOpen,
    pushToast,
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
            <button type="button" onClick={() => jumpTo('overview-shortcuts')} className="hover:text-[var(--ink-primary)] transition-colors">
              Shortcuts
            </button>
            <button type="button" onClick={() => setActiveTab('tasks')} className="hover:text-[var(--ink-primary)] transition-colors">
              Tasks & Matrix
            </button>
            <button type="button" onClick={() => setActiveTab('analytics')} className="hover:text-[var(--ink-primary)] transition-colors">
              Analytics
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              aria-label="Toggle dark or light theme"
            >
              {snapshot.preferences.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className="studio-card inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <span>Open Studio</span>
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
      <div className="flex items-center gap-2.5 min-w-0">
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
          onClick={() => setActiveTab('planner')}
          className="flex items-center gap-2 shrink-0 group focus:outline-none"
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

        <nav className="hidden md:flex items-center gap-0.5 ml-2 p-0.5 rounded-lg border bg-[var(--bg-inset)]">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12.5px] font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                  color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  boxShadow: active ? 'inset 0 0 0 1px var(--rule-hairline)' : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center: Quick capture OR Search button on Tasks view (never duplicates Tasks inline bar!) */}
      {activeTab === 'tasks' ? (
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hidden sm:flex flex-1 max-w-sm items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-[12.5px] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] bg-[var(--bg-inset)] transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Jump to any event, view, or command...</span>
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-mono-num">
            <Command className="w-3 h-3" />
            <span>K</span>
          </span>
        </button>
      ) : (
        <form
          onSubmit={handleQuickSubmit}
          className="hidden sm:flex flex-1 max-w-md relative items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors focus-within:border-[var(--accent-primary)]"
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
            placeholder="Quick add: 'Review 2pm 45m !p1 #work'"
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

      {/* Right: Availability share, Notifications, Theme toggle */}
      <div className="flex items-center gap-1.5 shrink-0 relative">
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

        <div className="relative">
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
              className="absolute right-0 mt-2 w-72 rounded-xl border p-3 z-50"
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
                    <li
                      key={ev.id}
                      className="flex items-start justify-between gap-2 p-2 rounded-lg bg-[var(--bg-elevated)] text-[12px]"
                    >
                      <span className="font-medium text-[var(--ink-primary)] leading-snug">{ev.title}</span>
                      <span className="font-mono-num text-[11px] text-[var(--accent-amber)] shrink-0">
                        {formatMinutes(ev.startMinutes)}
                      </span>
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
