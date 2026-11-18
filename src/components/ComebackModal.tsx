import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Compass,
  Flame,
  Gift,
  Lock,
  ShieldCheck,
  Snowflake,
  Sparkles,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { VaultCrateSvg } from './TrophyEmblem';
import { BorderGlow, Counter, GlareHover } from '../lib/reactbits';

export const ComebackModal: React.FC = () => {
  const {
    snapshot,
    progression,
    comebackModalOpen,
    setComebackModalOpen,
    claimDailyCrate,
    setTomorrowAnchor,
    promoteTodayAnchorToTask,
    setActiveTab,
  } = useWorkspace();

  const [anchorDraft, setAnchorDraft] = useState(progression.tomorrowAnchor);

  useEffect(() => {
    setAnchorDraft(progression.tomorrowAnchor);
  }, [progression.tomorrowAnchor]);

  useEffect(() => {
    if (!comebackModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setComebackModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [comebackModalOpen, setComebackModalOpen]);

  if (!comebackModalOpen) return null;

  const isDark = snapshot.preferences.theme === 'dark';
  const emberInk = isDark ? '#FF6B3D' : '#C23102';
  const goldInk = isDark ? '#F5C466' : '#925402';
  const emeraldInk = isDark ? '#34D399' : '#047857';
  const skyInk = isDark ? '#38BDF8' : '#0369A1';

  const readySlot = progression.crateLadder.find((s) => s.status === 'ready');
  const nextSlot = progression.crateLadder.find((s) => s.status === 'locked');
  const recentLoot = progression.crateClaimedToday ? progression.lastLootDrop : null;
  const nextSlotScaledXp = nextSlot ? Math.round(nextSlot.baseXp * progression.flameMultiplier) : 0;

  const handleLockAnchor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anchorDraft.trim()) return;
    setTomorrowAnchor(anchorDraft);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/68 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-label="Daily Comeback Vault Briefing"
      onClick={() => setComebackModalOpen(false)}
    >
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <BorderGlow
          animated
          colors={['#E74004', '#F4C46C', '#14A4FC']}
          glowColor="18 92 52"
          backgroundColor="var(--bg-surface)"
          borderRadius={20}
          glowRadius={14}
          glowIntensity={isDark ? 0.32 : 0.14}
          fillOpacity={0.18}
        >
          <div
            className="studio-card rounded-[20px] overflow-hidden border"
            style={{
              borderColor: 'var(--rule-strong)',
              boxShadow: isDark
                ? '0 28px 72px -12px rgba(0, 0, 0, 0.86), inset 0 1px 0 rgba(255, 255, 255, 0.13)'
                : '0 24px 60px -12px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.92)',
            }}
          >
            {/* Header Bar */}
            <div className="px-5 py-4 border-b bg-[var(--bg-elevated)]/85 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-soft)] border border-[var(--accent-primary)]/40 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" style={{ color: emberInk }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-[17px] text-[var(--ink-primary)] truncate">
                      {progression.crateClaimedToday
                        ? `Day ${progression.todayCrateDayNumber} Vault Unlocked`
                        : `Welcome Back · Day ${progression.todayCrateDayNumber}`}
                    </h2>
                    <span
                      className="px-2 py-0.5 rounded-full bg-[var(--accent-amber-soft)] tabular-nums text-[11px] font-bold shrink-0"
                      style={{ color: goldInk }}
                    >
                      {progression.flameMultiplier}x XP
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--ink-secondary)] flex items-baseline flex-wrap gap-1.5">
                    <span>Level {progression.level} · {progression.rankTitle} ·</span>
                    <span className="inline-flex items-baseline font-mono-num font-semibold text-[var(--ink-primary)]">
                      <Counter
                        value={progression.currentStreak}
                        minDigits={1}
                        fontSize={12}
                        fontWeight={600}
                        textColor="var(--ink-primary)"
                        intro={false}
                        fade={0}
                        motionBlur={false}
                      />
                      <span>d streak active</span>
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComebackModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
                aria-label="Close comeback vault"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Auto-Protection Freeze Callout */}
              {progression.protectedYesterdayByFreeze && (
                <div className="p-3 rounded-xl border bg-[var(--accent-sky-soft)]/30 border-[var(--accent-sky)]/40 flex items-center gap-2.5 text-[12.5px] text-[var(--ink-primary)]">
                  <Snowflake className="w-4 h-4 shrink-0" style={{ color: skyInk }} />
                  <span>
                    <strong>Streak Freeze Shield activated automatically!</strong> Yesterday was saved cleanly so your streak never broke.
                  </span>
                </div>
              )}

              {/* Focal Daily Reward Crate Claim (Single Bright Ember CTA!) + Balanced Tomorrow Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
                <div
                  className="sm:col-span-7 p-4 rounded-xl border flex flex-col justify-between gap-3.5"
                  style={{
                    backgroundColor: progression.crateClaimedToday ? 'var(--bg-elevated)' : 'var(--accent-primary-soft)',
                    backgroundImage: !progression.crateClaimedToday
                      ? 'radial-gradient(circle at 92% 18%, rgba(231, 64, 4, 0.18), transparent 58%)'
                      : 'none',
                    borderColor: progression.crateClaimedToday ? 'rgba(44, 204, 116, 0.45)' : 'var(--accent-primary)',
                  }}
                >
                  {readySlot ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: emberInk }}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ready to Claim</span>
                          </div>
                          <h3 className="font-display font-bold text-[18px] text-[var(--ink-primary)] mt-1">
                            {readySlot.title}
                          </h3>
                          <p className="text-[12.5px] text-[var(--ink-secondary)] mt-0.5 leading-snug">
                            Grants{' '}
                            <strong className="tabular-nums font-bold" style={{ color: goldInk }}>
                              +{Math.round(readySlot.baseXp * progression.flameMultiplier)} XP
                            </strong>
                            {readySlot.freezeBonus > 0 ? ' and 1 Freeze Shield' : ''} with your{' '}
                            {progression.flameMultiplier}x flame.
                          </p>
                        </div>
                        <VaultCrateSvg tier={readySlot.tier} status="ready" size={44} isDark={isDark} />
                      </div>

                      <GlareHover glareColor="#ffffff" glareOpacity={0.22} borderRadius="12px" className="w-full flex">
                        <button
                          type="button"
                          onClick={claimDailyCrate}
                          className="w-full py-2.5 px-4 rounded-xl text-[13.5px] font-semibold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                          style={{
                            backgroundImage: 'linear-gradient(180deg, #ED4D10 0%, #C83300 100%)',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 4px 14px -2px rgba(231, 64, 4, 0.45)',
                          }}
                        >
                          <Gift className="w-4 h-4" />
                          <span>
                            Open Day {readySlot.day} Vault (+
                            {Math.round(readySlot.baseXp * progression.flameMultiplier)} XP)
                          </span>
                        </button>
                      </GlareHover>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-3 py-1">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: emeraldInk }}>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Collected Today</span>
                        </div>
                        <h3 className="font-display font-bold text-[16px] text-[var(--ink-primary)]">
                          {recentLoot?.title ?? 'Daily Reward Vault'} (+{recentLoot?.xpAwarded ?? 0} XP)
                        </h3>
                        <p className="text-[12px] text-[var(--ink-secondary)]">
                          Sweep today’s 3 rotating bounties to claim your Daily Trio Combo drop.
                        </p>
                      </div>
                      <span
                        className="w-10 h-10 rounded-xl bg-[var(--accent-emerald-soft)] flex items-center justify-center shrink-0"
                        style={{ color: emeraldInk }}
                      >
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </span>
                    </div>
                  )}
                </div>

                {/* Tomorrow Teaser Box (Balanced structured tier preview + editorial alignment) */}
                <div className="sm:col-span-5 p-4 rounded-xl bg-[var(--bg-inset)] flex flex-col justify-between gap-2.5">
                  {nextSlot ? (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-secondary)] whitespace-nowrap">
                            <Lock className="w-3 h-3 shrink-0" />
                            <span>Tomorrow · Day {nextSlot.day}</span>
                          </div>
                          <h3 className="font-display font-bold text-[17px] text-[var(--ink-primary)] mt-1 leading-tight">
                            {nextSlot.title}
                          </h3>
                          <div className="tabular-nums text-[12.5px] font-semibold text-[var(--ink-primary)]/85 mt-0.5">
                            +{nextSlotScaledXp} XP{nextSlot.freezeBonus > 0 ? ' + 1 Shield' : ''}
                          </div>
                        </div>
                        <VaultCrateSvg tier={nextSlot.tier} status="locked" size={44} isDark={isDark} />
                      </div>
                      <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)]/70 space-y-1 text-[11.5px]">
                        <div className="flex items-center justify-between text-[var(--ink-primary)]/75">
                          <span>Streak Target</span>
                          <span className="font-semibold text-[var(--ink-primary)] tabular-nums">
                            {progression.currentStreak + 1}d Chain
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[var(--ink-primary)]/75">
                          <span>Unlock Window</span>
                          <span className="font-medium text-[var(--ink-primary)]">Opens 00:00</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <div className="text-[13px] font-bold text-[var(--ink-primary)]">
                          Cycle {progression.cycleNumber + 1} Ready
                        </div>
                        <div className="text-[11.5px] text-[var(--ink-secondary)]">
                          Prestige weekly ladder resets tomorrow
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[var(--rule-hairline)] text-[11.5px] text-[var(--ink-secondary)] whitespace-nowrap">
                        Reach {progression.currentStreak + 1}d streak
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Yesterday's Promise -> Centered alignment icon */}
              {progression.todayAnchor ? (
                <div className="p-3.5 rounded-xl bg-[var(--bg-inset)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4" style={{ color: goldInk }} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold" style={{ color: goldInk }}>
                        Yesterday’s Priority Promise
                      </div>
                      <div className="text-[13.5px] font-semibold text-[var(--ink-primary)] truncate">
                        {progression.todayAnchor}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      promoteTodayAnchorToTask();
                      setComebackModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold hover:underline shrink-0"
                    style={{ color: emberInk }}
                  >
                    <span>Start Sprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}

              <form onSubmit={handleLockAnchor} className="p-3.5 rounded-xl bg-[var(--bg-inset)] space-y-2">
                <label className="text-[11.5px] font-medium text-[var(--ink-secondary)] block">
                  Tomorrow’s #1 Priority (+50 XP unlocks Tomorrow Lock)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={anchorDraft}
                    onChange={(e) => setAnchorDraft(e.target.value)}
                    placeholder="What makes tomorrow a win in 25 minutes?"
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-[var(--rule-strong)] bg-[var(--bg-surface)] text-[12.5px] text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg border border-[var(--rule-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[12px] font-semibold text-[var(--ink-primary)] shrink-0 transition-colors"
                  >
                    Lock
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('rewards');
                    setComebackModalOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--ink-primary)]/85 hover:text-[var(--ink-primary)] transition-colors"
                >
                  <span>Explore Trophy Cabinet & 16 Emblems</span>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: emberInk }} />
                </button>
                <button
                  type="button"
                  onClick={() => setComebackModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--rule-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[12.5px] font-semibold text-[var(--ink-primary)]"
                >
                  Enter Studio
                </button>
              </div>
            </div>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
};
