import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Flame, Gift, Lock, Snowflake, Sparkles } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { TrophyEmblem, VaultCrateSvg } from './TrophyEmblem';
import { BorderGlow, GlareHover, SpotlightCard } from '../lib/reactbits';

export const ComebackOverviewBand: React.FC = () => {
  const {
    snapshot,
    progression,
    claimDailyCrate,
    setTomorrowAnchor,
    promoteTodayAnchorToTask,
    setActiveTab,
    setComebackModalOpen,
  } = useWorkspace();

  const isDark = snapshot.preferences.theme === 'dark';
  const emberInk = isDark ? '#FF6B3D' : '#C23102';
  const goldInk = isDark ? '#F5C466' : '#925402';
  const emeraldInk = isDark ? '#34D399' : '#047857';
  const skyInk = isDark ? '#38BDF8' : '#0369A1';

  const [anchorDraft, setAnchorDraft] = useState(progression.tomorrowAnchor);

  useEffect(() => {
    setAnchorDraft(progression.tomorrowAnchor);
  }, [progression.tomorrowAnchor]);

  const readySlot = progression.crateLadder.find((s) => s.status === 'ready');
  const nextSlot = progression.crateLadder.find((s) => s.status === 'locked');
  const nextSlotScaledXp = nextSlot ? Math.round(nextSlot.baseXp * progression.flameMultiplier) : 0;

  const handleLockAnchor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anchorDraft.trim()) return;
    setTomorrowAnchor(anchorDraft);
  };

  return (
    <section aria-label="Daily comeback vault and trophy momentum" className="max-w-6xl mx-auto px-6 sm:px-10 py-6">
      <BorderGlow
        animated
        colors={['#E74004', '#F4C46C', '#14A4FC']}
        glowColor="18 92 52"
        backgroundColor="var(--bg-surface)"
        borderRadius={18}
        glowRadius={28}
        glowIntensity={isDark ? 0.55 : 0.24}
        fillOpacity={0.22}
      >
        <SpotlightCard
          theme={isDark ? 'dark' : 'light'}
          spotlightColor={isDark ? 'rgba(231, 64, 4, 0.14)' : 'rgba(231, 64, 4, 0.06)'}
          className="studio-card rounded-[18px] p-5 space-y-4"
        >
          {/* Top Bar: Streak, Shield, Equipped Trophy & Open Studio */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary-soft)] font-mono-num text-[12.5px] font-bold"
                style={{ color: emberInk }}
              >
                <Flame className="w-4 h-4" />
                <span>
                  {progression.currentStreak}d · {progression.flameMultiplier}x XP
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border bg-[var(--bg-inset)] font-mono-num text-[12px] text-[var(--ink-secondary)]">
                <Snowflake className="w-3.5 h-3.5" style={{ color: skyInk }} />
                <span>
                  {progression.streakFreezesRemaining} Shield{progression.streakFreezesRemaining === 1 ? '' : 's'}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 text-[12.5px] text-[var(--ink-secondary)]">
                {progression.pinnedBadge ? (
                  <TrophyEmblem
                    emblem={progression.pinnedBadge.def.emblem}
                    rarity={progression.pinnedBadge.def.rarity}
                    unlocked
                    size="xs"
                    isDark={isDark}
                  />
                ) : null}
                <span>
                  <strong className="text-[var(--ink-primary)]">
                    Lv.{progression.level} {progression.rankTitle}
                  </strong>{' '}
                  · <span className="font-mono-num">{progression.totalXp} XP</span> ·{' '}
                  <span className="font-mono-num font-semibold" style={{ color: emeraldInk }}>
                    {progression.unlockedCount}/{progression.achievements.length} Emblems
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {readySlot ? (
                <GlareHover glareColor="#ffffff" glareOpacity={0.2} borderRadius="12px" className="inline-flex">
                  <button
                    type="button"
                    onClick={claimDailyCrate}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>
                      Claim Day {readySlot.day} Crate (+{Math.round(readySlot.baseXp * progression.flameMultiplier)} XP)
                    </span>
                  </button>
                </GlareHover>
              ) : (
                <button
                  type="button"
                  onClick={() => setComebackModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[var(--accent-emerald-soft)]/35 border-[var(--accent-emerald)]/35 text-[12px] font-medium"
                  style={{ color: emeraldInk }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Day {progression.todayCrateDayNumber} Claimed</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('rewards')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-[var(--bg-inset)] hover:bg-[var(--bg-hover)] text-[12px] font-semibold text-[var(--ink-primary)] transition-colors"
              >
                <span>Open Rewards Studio</span>
                <ArrowRight className="w-3.5 h-3.5" style={{ color: emberInk }} />
              </button>
            </div>
          </div>

          {/* 3-Column Specimen Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* 7-Day Escalator Mini Bar */}
            <div className="lg:col-span-5 p-3 rounded-xl border bg-[var(--bg-inset)] space-y-2">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-[var(--ink-primary)] inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: goldInk }} />
                  <span>7-Day Reward Escalator</span>
                </span>
                {nextSlot && (
                  <span className="font-mono-num text-[11px] font-medium" style={{ color: goldInk }}>
                    Next: Day {nextSlot.day} (+{nextSlotScaledXp} XP)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {progression.crateLadder.map((slot) => {
                  const isReady = slot.status === 'ready';
                  const isClaimed = slot.status === 'claimed';
                  return (
                    <div
                      key={slot.day}
                      title={`Day ${slot.day}: ${slot.title} (+${Math.round(slot.baseXp * progression.flameMultiplier)} XP)`}
                      className="py-1.5 px-1 rounded-lg border text-center flex flex-col items-center justify-center gap-0.5"
                      style={{
                        backgroundColor: isReady
                          ? 'var(--accent-primary-soft)'
                          : isClaimed
                            ? 'var(--bg-elevated)'
                            : 'var(--bg-surface)',
                        borderColor: isReady
                          ? 'var(--accent-primary)'
                          : isClaimed
                            ? 'rgba(44, 204, 116, 0.38)'
                            : 'var(--rule-hairline)',
                      }}
                    >
                      <span className="font-mono-num text-[10px] text-[var(--ink-secondary)]">D{slot.day}</span>
                      {isClaimed ? (
                        <Check className="w-3 h-3" style={{ color: emeraldInk }} />
                      ) : isReady ? (
                        <VaultCrateSvg tier={slot.tier} status="ready" size={16} isDark={isDark} />
                      ) : (
                        <Lock className="w-2.5 h-2.5 text-[var(--ink-muted)]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3 Daily Bounties Status */}
            <div className="lg:col-span-4 p-3 rounded-xl border bg-[var(--bg-inset)] space-y-2">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-[var(--ink-primary)]">Daily Trio Quests</span>
                <span className="font-mono-num text-[11px] text-[var(--ink-secondary)]">
                  {progression.todayBountiesCompletedCount}/3 · Bonus +{progression.comboBonusXp} XP
                </span>
              </div>
              <div className="space-y-1">
                {progression.todayBounties.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-2 text-[11.5px]">
                    <span className="inline-flex items-center gap-1.5 min-w-0 text-[var(--ink-primary)]">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: b.done ? emeraldInk : emberInk }}
                      />
                      <span className="truncate">{b.title}</span>
                    </span>
                    <span className="font-mono-num text-[10.5px] text-[var(--ink-secondary)] shrink-0">
                      {b.current}/{b.target}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-day Anchor */}
            <div className="lg:col-span-3 p-3 rounded-xl border bg-[var(--bg-inset)] space-y-2">
              <div className="flex items-center justify-between gap-2 text-[11.5px]">
                <span className="font-semibold text-[var(--ink-primary)]">
                  {progression.todayAnchor ? 'Today’s Priority' : 'Tomorrow Lock'}
                </span>
                {progression.todayAnchor && (
                  <button
                    type="button"
                    onClick={promoteTodayAnchorToTask}
                    className="text-[11px] font-semibold hover:underline shrink-0"
                    style={{ color: emberInk }}
                  >
                    Sprint →
                  </button>
                )}
              </div>
              {progression.todayAnchor ? (
                <div className="px-2.5 py-2 rounded-lg border bg-[var(--bg-surface)] text-[12px] text-[var(--ink-primary)] font-medium truncate">
                  {progression.todayAnchor}
                </div>
              ) : (
                <form onSubmit={handleLockAnchor} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={anchorDraft}
                    onChange={(e) => setAnchorDraft(e.target.value)}
                    placeholder="Set #1 win for tomorrow..."
                    aria-label="Tomorrow priority anchor"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border bg-[var(--bg-surface)] text-[12px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    Lock
                  </button>
                </form>
              )}
            </div>
          </div>
        </SpotlightCard>
      </BorderGlow>
    </section>
  );
};
