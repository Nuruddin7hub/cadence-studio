import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BellOff,
  Check,
  ChevronDown,
  Compass,
  Flame,
  Gift,
  Lock,
  Pin,
  Shield,
  Snowflake,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { TrophyCategory } from '../utils/gamification';
import { getRarityTheme, TrophyEmblem, VaultCrateSvg } from './TrophyEmblem';
import {
  BorderGlow,
  Counter,
  GlareHover,
  RubberSegment,
  SpotlightCard,
  TiltedCard,
} from '../lib/reactbits';

type TrophyFilter = 'all' | 'unlocked' | 'next' | TrophyCategory;

export const RewardsStudio: React.FC = () => {
  const {
    snapshot,
    progression,
    shotPreset,
    claimDailyCrate,
    claimComboBonus,
    pinShowcaseBadge,
    setTomorrowAnchor,
    promoteTodayAnchorToTask,
    toggleDailyReminder,
    setActiveTab,
    setComebackModalOpen,
    triggerPwaInstall,
  } = useWorkspace();

  const isDark = snapshot.preferences.theme === 'dark';
  const [filter, setFilter] = useState<TrophyFilter>('all');
  const [anchorDraft, setAnchorDraft] = useState(progression.tomorrowAnchor);

  useEffect(() => {
    setAnchorDraft(progression.tomorrowAnchor);
  }, [progression.tomorrowAnchor]);

  // Deterministic scroll framing for S02 still preset (frames full Pedestal + Filter Bar + All 16 Collectible Emblems)
  useEffect(() => {
    if (shotPreset === 'rewards-trophies-dark') {
      const timer = window.setTimeout(() => {
        const container = document.getElementById('rewards-scroll');
        const target = document.getElementById('trophy-cabinet');
        if (container && target) {
          const relativeTop =
            target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 14;
          container.scrollTop = Math.max(0, relativeTop);
        }
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [shotPreset]);

  const activeReadySlot = progression.crateLadder.find((s) => s.status === 'ready');
  const nextLockedSlot = progression.crateLadder.find((s) => s.status === 'locked');

  const filteredAchievements = progression.achievements.filter((item) => {
    if (filter === 'unlocked') return item.unlocked;
    if (filter === 'next') return !item.unlocked;
    if (filter === 'all') return true;
    return item.def.category === filter;
  });

  const handleSaveAnchor = (e: React.FormEvent) => {
    e.preventDefault();
    setTomorrowAnchor(anchorDraft);
  };

  const progRaw = snapshot.progression;
  const reminderEnabled = Boolean(progRaw?.reminderEnabled);
  const reminderHour = typeof progRaw?.reminderHour === 'number' ? progRaw.reminderHour : 9;

  // Theme-safe semantic inks with >=4.5:1 WCAG contrast on both Obsidian Dark and Daylight Paper Light
  const emberInk = isDark ? '#FF6B3D' : '#C23102';
  const goldInk = isDark ? '#F5C466' : '#854900';
  const emeraldInk = isDark ? '#34D399' : '#047857';
  const skyInk = isDark ? '#38BDF8' : '#0369A1';

  return (
    <div
      id="rewards-scroll"
      className="relative flex-1 min-w-0 overflow-y-auto px-3.5 pt-2.5 pb-24 sm:px-6 sm:pt-4 md:pb-8 bg-[var(--bg-canvas)] studio-spotlight-dark"
    >
      <div className="max-w-7xl mx-auto space-y-2.5 sm:space-y-4">
        {/* Studio Header Row (non-truncating responsive title + single briefing CTA) */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="font-display font-bold text-[18.5px] sm:text-[22px] tracking-tight text-[var(--ink-primary)] leading-tight whitespace-nowrap">
              <span className="sm:hidden">Momentum Vault</span>
              <span className="hidden sm:inline">Momentum Vault &amp; Trophy Studio</span>
            </h1>
            <p className="hidden sm:block text-[12.5px] text-[var(--ink-secondary)] mt-0.5">
              Claim daily escalating supply drops, defend streaks with Freeze Shields, and collect rarity emblems.
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => document.getElementById('trophy-cabinet')?.scrollIntoView({ behavior: 'smooth' })}
              className="studio-card inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11.5px] sm:text-[12px] font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors tabular-nums"
            >
              <Trophy className="w-3.5 h-3.5" style={{ color: goldInk }} />
              <span className="sm:hidden">{progression.unlockedCount}/{progression.achievements.length}</span>
              <span className="hidden sm:inline">
                Trophies ({progression.unlockedCount}/{progression.achievements.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setComebackModalOpen(true)}
              className="studio-card inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11.5px] sm:text-[12px] font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Gift className="w-3.5 h-3.5" style={{ color: emberInk }} />
              <span className="sm:hidden">Briefing</span>
              <span className="hidden sm:inline">Comeback Briefing</span>
            </button>
          </div>
        </div>

        {/* Sleek Single-Row Mobile Streak Summary Strip with clean contained XP bar */}
        <div className="lg:hidden rounded-xl bg-[var(--bg-surface)] px-3 py-2 border border-[var(--rule-hairline)] space-y-1.5 text-[11.5px] font-medium tabular-nums">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 font-semibold shrink-0" style={{ color: emberInk }}>
              <Flame className="w-3.5 h-3.5" />
              <span>
                {progression.currentStreak}d ({progression.flameMultiplier}x)
              </span>
            </span>
            <span className="text-[var(--ink-primary)] font-semibold truncate">
              Lv.{progression.level} · {progression.levelXpIntoCurrent}/{progression.levelXpNeeded} XP
            </span>
            <span className="inline-flex items-center gap-1 font-semibold shrink-0" style={{ color: skyInk }}>
              <Snowflake className="w-3 h-3" />
              <span>{progression.streakFreezesRemaining} Shields</span>
            </span>
          </div>
          <div className="h-1 rounded-full bg-[var(--bg-inset)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(8, progression.levelProgressPct)}%`,
                background: 'linear-gradient(90deg, #E74004, #F4C46C)',
              }}
            />
          </div>
        </div>

        {/* Aligned 2-Column Vertical Studio Grid (equalized columns, zero vertical mismatch!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 items-stretch">
          {/* LEFT COLUMN (4 cols): Passport + Comeback Anchor Bridge */}
          <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">
            {/* Desktop Passport Card */}
            <div className="hidden lg:block">
              <TiltedCard
                containerWidth="100%"
                containerHeight="244px"
                imageWidth="100%"
                imageHeight="244px"
                rotateAmplitude={3.2}
                scaleOnHover={1.008}
                glare={0.16}
                flipOnClick={false}
                showTooltip={false}
                radius={16}
                altText="Cadence Rank Passport"
                className="w-full"
              >
                <BorderGlow
                  animated
                  className="w-full h-full"
                  colors={['#E74004', '#F4C46C', '#14A4FC']}
                  glowColor="18 92 52"
                  backgroundColor="var(--bg-surface)"
                  borderRadius={16}
                  glowRadius={20}
                  glowIntensity={isDark ? 0.45 : 0.18}
                  fillOpacity={0.18}
                >
                  <div className="studio-card rounded-2xl p-4 h-full flex flex-col justify-between gap-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent-primary-soft)] text-[11px] font-semibold"
                          style={{ color: emberInk }}
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>{progression.flameTierLabel} Tier</span>
                        </div>
                        <h2 className="font-display font-bold text-[19px] tracking-tight text-[var(--ink-primary)] mt-2">
                          Level {progression.level} · {progression.rankTitle}
                        </h2>
                        <p className="text-[12px] text-[var(--ink-secondary)] mt-0.5 tabular-nums">
                          {progression.totalXp.toLocaleString()} XP · {progression.unlockedCount}/
                          {progression.achievements.length} emblems
                        </p>
                      </div>

                      {progression.pinnedBadge ? (
                        <div className="flex flex-col items-center gap-1 shrink-0 max-w-[116px] text-center">
                          <TrophyEmblem
                            emblem={progression.pinnedBadge.def.emblem}
                            rarity={progression.pinnedBadge.def.rarity}
                            unlocked
                            size="lg"
                            isDark={isDark}
                          />
                          <span className="text-[11px] font-medium text-[var(--ink-primary)]/85 leading-tight whitespace-nowrap">
                            {progression.pinnedBadge.def.title}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11.5px] tabular-nums font-medium text-[var(--ink-secondary)]">
                        <span>Next rank</span>
                        <span>
                          {progression.levelXpIntoCurrent}/{progression.levelXpNeeded} XP
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.max(5, progression.levelProgressPct)}%`,
                            background: 'linear-gradient(90deg, #E74004, #F4C46C)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-[var(--bg-inset)]">
                        <div
                          className="inline-flex items-center justify-center gap-1 font-bold text-[15.5px] tabular-nums"
                          style={{ color: emberInk }}
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span className="inline-flex items-baseline">
                            <Counter
                              value={progression.currentStreak}
                              minDigits={1}
                              fontSize={15}
                              fontWeight={700}
                              textColor={emberInk}
                              intro={false}
                              fade={0}
                              motionBlur={false}
                            />
                            <span>d</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--ink-secondary)] mt-0.5">Active Streak</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[var(--bg-inset)]">
                        <div
                          className="inline-flex items-center justify-center gap-1 font-bold text-[15.5px] tabular-nums"
                          style={{ color: skyInk }}
                        >
                          <Snowflake className="w-3.5 h-3.5" />
                          <span>{progression.streakFreezesRemaining}</span>
                        </div>
                        <div className="text-[11px] text-[var(--ink-secondary)] mt-0.5">Freeze Shields</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[var(--bg-inset)]">
                        <div
                          className="inline-flex items-center justify-center gap-1 font-bold text-[15.5px] tabular-nums"
                          style={{ color: goldInk }}
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{progression.bestStreak}d</span>
                        </div>
                        <div className="text-[11px] text-[var(--ink-secondary)] mt-0.5">Best Chain</div>
                      </div>
                    </div>
                  </div>
                </BorderGlow>
              </TiltedCard>
            </div>

            {/* Left Column Lower: Comeback Anchor Bridge (natural top-to-bottom rhythm, editable 1px input, Streak Defense tile!) */}
            <SpotlightCard
              theme={isDark ? 'dark' : 'light'}
              spotlightColor={isDark ? 'rgba(20, 164, 252, 0.10)' : 'rgba(20, 164, 252, 0.05)'}
              className="studio-card rounded-2xl p-4 flex-1 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4" style={{ color: goldInk }} />
                  <h2 className="font-display font-bold text-[15px]">Comeback Anchor Bridge</h2>
                </div>
                <span className="text-[11px] font-medium text-[var(--ink-secondary)]">Cross-Day Lock</span>
              </div>

              {progression.todayAnchor && (
                <div className="p-2.5 rounded-xl bg-[var(--bg-inset)] space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold" style={{ color: goldInk }}>
                      Yesterday’s Priority Promise
                    </span>
                    <button
                      type="button"
                      onClick={promoteTodayAnchorToTask}
                      className="font-semibold hover:underline"
                      style={{ color: emberInk }}
                    >
                      Launch P1 →
                    </button>
                  </div>
                  <p className="text-[12.5px] font-medium text-[var(--ink-primary)] leading-snug">
                    {progression.todayAnchor}
                  </p>
                </div>
              )}

              <form onSubmit={handleSaveAnchor} className="space-y-1.5">
                <label className="text-[11.5px] font-medium text-[var(--ink-secondary)] block">
                  Lock Tomorrow’s #1 Priority
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={anchorDraft}
                    onChange={(e) => setAnchorDraft(e.target.value)}
                    placeholder="What earns tomorrow’s first 25m sprint?"
                    aria-label="Tomorrow priority anchor"
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--rule-strong)] text-[12px] text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)]/85 focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl border border-[var(--rule-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[12px] font-semibold text-[var(--ink-primary)] shrink-0 transition-colors"
                  >
                    Lock
                  </button>
                </div>
              </form>

              {/* Freeze Shield Status Well: anchors middle space purposefully & pairs with Daily Reminder */}
              <div className="p-2.5 rounded-xl bg-[var(--bg-inset)] flex items-center justify-between gap-2 text-[11.5px]">
                <span className="inline-flex items-center gap-1.5 text-[var(--ink-secondary)]">
                  <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: skyInk }} />
                  <span>Streak Defense Reserve</span>
                </span>
                <span className="font-semibold tabular-nums" style={{ color: skyInk }}>
                  {progression.streakFreezesRemaining}/3 Shields · Days 3, 5, 7
                </span>
              </div>

              <div className="p-2 rounded-xl bg-[var(--bg-inset)] flex items-center justify-between gap-2 text-[11.5px] mt-auto">
                <span className="inline-flex items-center gap-1.5 text-[var(--ink-secondary)] pl-0.5">
                  {reminderEnabled ? (
                    <Bell className="w-3.5 h-3.5" style={{ color: emeraldInk }} />
                  ) : (
                    <BellOff className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                  )}
                  <span>Daily Reminder</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <select
                      aria-label="Daily reminder hour"
                      value={reminderHour}
                      onChange={(e) => void toggleDailyReminder(true, Number(e.target.value))}
                      className="appearance-none pl-2.5 pr-6 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--rule-hairline)] text-[11.5px] font-medium tabular-nums text-[var(--ink-primary)] cursor-pointer focus:outline-none focus:border-[var(--accent-primary)]"
                    >
                      {[7, 8, 9, 12, 18, 20].map((hr) => (
                        <option key={hr} value={hr}>
                          {String(hr).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-[var(--ink-secondary)] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="button"
                    aria-pressed={reminderEnabled}
                    onClick={() => void toggleDailyReminder(!reminderEnabled, reminderHour)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                    style={{
                      backgroundColor: reminderEnabled ? 'rgba(44, 204, 116, 0.14)' : 'var(--bg-surface)',
                      color: reminderEnabled ? emeraldInk : 'var(--ink-secondary)',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: reminderEnabled ? emeraldInk : 'var(--ink-muted)' }}
                    />
                    <span>{reminderEnabled ? 'Active' : 'Off'}</span>
                  </button>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* RIGHT COLUMN (8 cols): 7-Day Daily Reward Vault + Rotating Daily Bounties */}
          <div className="lg:col-span-8 flex flex-col gap-2.5 sm:gap-4 order-1 lg:order-2">
            {/* 7-Day Escalator Vault Path */}
            <SpotlightCard
              theme={isDark ? 'dark' : 'light'}
              spotlightColor={isDark ? 'rgba(244, 196, 108, 0.12)' : 'rgba(231, 64, 4, 0.05)'}
              className="studio-card rounded-2xl p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 order-1"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: goldInk }}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      Week {progression.cycleNumber} Escalation · Flame {progression.flameMultiplier}x
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-[17px] sm:text-[18px] tracking-tight text-[var(--ink-primary)]">
                    Daily Reward Vault
                  </h2>
                </div>

                {activeReadySlot ? (
                  <GlareHover glareColor="#ffffff" glareOpacity={0.22} borderRadius="12px" className="w-full sm:w-auto flex">
                    <button
                      type="button"
                      onClick={claimDailyCrate}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl text-[13px] font-semibold text-white transition-transform hover:scale-[1.015]"
                      style={{
                        backgroundImage: 'linear-gradient(180deg, #ED4D10 0%, #C83300 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 4px 14px -2px rgba(231, 64, 4, 0.44)',
                      }}
                    >
                      <Gift className="w-4 h-4 shrink-0" />
                      <span>
                        Claim Day {activeReadySlot.day} Vault (+
                        {Math.round(activeReadySlot.baseXp * progression.flameMultiplier)} XP)
                      </span>
                    </button>
                  </GlareHover>
                ) : (
                  <div
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[var(--accent-emerald-soft)]/35 border-[var(--accent-emerald)]/35 text-[12px] font-semibold"
                    style={{ color: emeraldInk }}
                  >
                    <Check className="w-4 h-4" />
                    <span>Day {progression.todayCrateDayNumber} Claimed</span>
                  </div>
                )}
              </div>

              {/* De-boxed 7-Day Escalator Grid: calm recessed tonal planes (ONLY Ready Day 5 glows rim) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-1.5 sm:gap-2">
                {progression.crateLadder.map((slot) => {
                  const isReady = slot.status === 'ready';
                  const isClaimed = slot.status === 'claimed';
                  const scaledXp = Math.round(slot.baseXp * progression.flameMultiplier);
                  const isDay7 = slot.day === 7;

                  const cardSurface = isReady
                    ? isDark
                      ? 'rgba(231, 64, 4, 0.14)'
                      : 'rgba(231, 64, 4, 0.085)'
                    : isClaimed
                      ? isDark
                        ? '#161922'
                        : '#EFF2F6'
                      : isDark
                        ? '#0E1016'
                        : '#F4F6F9';
                  const cardBorder = isReady
                    ? 'rgba(231, 64, 4, 0.72)'
                    : isDark
                      ? 'transparent'
                      : 'rgba(15, 23, 42, 0.09)';
                  const xpInk = isReady ? emberInk : isClaimed ? emeraldInk : 'var(--ink-secondary)';

                  const statusGlyph = isClaimed ? (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isDark ? 'rgba(44, 204, 116, 0.22)' : 'rgba(4, 120, 87, 0.16)',
                        color: emeraldInk,
                      }}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : isReady ? (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider shrink-0"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: '#FFFFFF',
                      }}
                    >
                      Ready
                    </span>
                  ) : (
                    <Lock className="w-3 h-3 text-[var(--ink-muted)] shrink-0" />
                  );

                  const shieldPill = slot.freezeBonus > 0 ? (
                    <span
                      title="+1 Freeze Shield"
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold tabular-nums shrink-0"
                      style={{
                        backgroundColor: isDark ? 'rgba(20, 164, 252, 0.14)' : 'rgba(11, 140, 224, 0.12)',
                        color: skyInk,
                      }}
                    >
                      <Snowflake className="w-2.5 h-2.5" />
                      <span>+1</span>
                    </span>
                  ) : null;

                  if (isDay7) {
                    return (
                      <button
                        key={slot.day}
                        type="button"
                        disabled={!isReady}
                        onClick={() => isReady && claimDailyCrate()}
                        className={`col-span-2 xl:col-span-1 px-2.5 py-1.5 sm:p-2.5 xl:px-2 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all ${
                          isReady ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
                        }`}
                        style={{
                          backgroundColor: cardSurface,
                          borderColor: cardBorder,
                          boxShadow: isReady ? '0 0 22px -6px rgba(231, 64, 4, 0.36)' : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between gap-1.5 w-full">
                          <span className="tabular-nums text-[11px] font-semibold text-[var(--ink-secondary)] shrink-0">
                            Day {slot.day}
                          </span>
                          {statusGlyph}
                        </div>

                        <div className="flex items-center gap-2.5 xl:block">
                          <div className="xl:flex xl:items-center xl:justify-between xl:gap-1.5">
                            <VaultCrateSvg tier={slot.tier} status={slot.status} size={26} isDark={isDark} />
                            {shieldPill && <span className="hidden xl:inline-flex">{shieldPill}</span>}
                          </div>
                          <div className="xl:mt-2 min-w-0 flex-1 xl:flex-none flex items-center justify-between xl:block gap-2">
                            <div className="text-[11.5px] font-semibold text-[var(--ink-primary)] leading-tight whitespace-nowrap">
                              {slot.title}
                            </div>
                            <div className="flex items-center gap-2 xl:mt-0.5">
                              {shieldPill && <span className="xl:hidden inline-flex">{shieldPill}</span>}
                              <span
                                className="text-[11px] font-semibold leading-tight tabular-nums whitespace-nowrap"
                                style={{ color: xpInk }}
                              >
                                +{scaledXp} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={slot.day}
                      type="button"
                      disabled={!isReady}
                      onClick={() => isReady && claimDailyCrate()}
                      className={`px-2.5 py-1.5 sm:p-2.5 xl:px-2 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all ${
                        isReady ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
                      }`}
                      style={{
                        backgroundColor: cardSurface,
                        borderColor: cardBorder,
                        boxShadow: isReady ? '0 0 22px -6px rgba(231, 64, 4, 0.36)' : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="tabular-nums text-[11px] font-semibold text-[var(--ink-secondary)] shrink-0">
                          Day {slot.day}
                        </span>
                        {statusGlyph}
                      </div>

                      <div className="flex items-center gap-2 xl:block">
                        <div className="xl:flex xl:items-center xl:justify-between xl:gap-1.5">
                          <VaultCrateSvg tier={slot.tier} status={slot.status} size={26} isDark={isDark} />
                          {shieldPill && <span className="hidden xl:inline-flex">{shieldPill}</span>}
                        </div>
                        <div className="xl:mt-2 min-w-0 flex-1 xl:flex-none">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11.5px] font-semibold text-[var(--ink-primary)] leading-tight whitespace-nowrap">
                              {slot.title}
                            </span>
                            {shieldPill && <span className="xl:hidden shrink-0">{shieldPill}</span>}
                          </div>
                          <div
                            className="text-[11px] font-semibold leading-tight mt-0.5 tabular-nums whitespace-nowrap"
                            style={{ color: xpInk }}
                          >
                            +{scaledXp} XP
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Clean Borderless Receipt Footer */}
              <div className="pt-2 border-t border-[var(--rule-strong)]/60 flex flex-wrap items-center justify-between gap-1.5 text-[11.5px]">
                <div className="flex items-center gap-1.5 min-w-0 text-[var(--ink-secondary)]">
                  {progression.protectedYesterdayByFreeze ? (
                    <>
                      <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: skyInk }} />
                      <span>
                        <strong className="text-[var(--ink-primary)]">Freeze Shield saved yesterday.</strong> Open today’s Vault to keep going.
                      </span>
                    </>
                  ) : progression.lastLootDrop ? (
                    <>
                      <Gift className="w-3.5 h-3.5 shrink-0" style={{ color: goldInk }} />
                      <span className="truncate">
                        Last drop: <strong className="text-[var(--ink-primary)]">{progression.lastLootDrop.title}</strong> (+
                        {progression.lastLootDrop.xpAwarded} XP)
                      </span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-3.5 h-3.5 shrink-0" style={{ color: goldInk }} />
                      <span>Open Day 1 Ignition to start stacking up to 2.5x XP.</span>
                    </>
                  )}
                </div>
                {nextLockedSlot && (
                  <span className="inline-flex items-center gap-1.5 font-medium shrink-0 text-[var(--ink-secondary)] tabular-nums">
                    <Lock className="w-3.5 h-3.5 sm:hidden shrink-0 text-[var(--ink-muted)]" />
                    <span>
                      Next: <strong className="text-[var(--ink-primary)]">Day {nextLockedSlot.day} · {nextLockedSlot.title}</strong> (+
                      {Math.round(nextLockedSlot.baseXp * progression.flameMultiplier)} XP)
                    </span>
                  </span>
                )}
              </div>
            </SpotlightCard>

            {/* Right Lower: Rotating Daily Bounties */}
            <SpotlightCard
              theme={isDark ? 'dark' : 'light'}
              spotlightColor={isDark ? 'rgba(231, 64, 4, 0.10)' : 'rgba(231, 64, 4, 0.05)'}
              className="studio-card rounded-2xl p-3 sm:p-4 mt-6 sm:mt-0 flex-1 flex flex-col justify-between gap-2.5 sm:gap-3 order-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-[15.5px]">Rotating Daily Bounties</h2>
                  <p className="text-[11.5px] sm:text-[12px] text-[var(--ink-secondary)]">
                    Sweep all 3 bounties today to unlock the Trio Combo (+{progression.comboBonusXp} XP).
                  </p>
                </div>
                <span className="tabular-nums text-[11px] sm:text-[11.5px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-inset)] text-[var(--ink-primary)] shrink-0">
                  {progression.todayBountiesCompletedCount}/{progression.todayBounties.length} Complete
                </span>
              </div>

              {/* Clean Linear Hairline List Rows (zero hollow center void, zero box-in-box nesting) */}
              <div className="rounded-xl bg-[var(--bg-inset)] divide-y divide-[var(--rule-hairline)] overflow-hidden">
                {progression.todayBounties.map((b) => {
                  const pct = Math.min(100, Math.round((b.current / b.target) * 100));
                  const actionable = !b.done;
                  return (
                    <div
                      key={b.id}
                      className="px-3 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors"
                      style={{
                        backgroundColor: actionable ? 'var(--bg-elevated)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: actionable
                              ? 'var(--accent-primary-soft)'
                              : isDark
                                ? 'rgba(44, 204, 116, 0.14)'
                                : 'rgba(20, 158, 86, 0.12)',
                            color: actionable ? emberInk : emeraldInk,
                          }}
                        >
                          {b.done ? <Check className="w-3.5 h-3.5 stroke-[2.8]" /> : <Zap className="w-3.5 h-3.5" />}
                        </span>
                        <div className="min-w-0">
                          <div
                            className="text-[13px] font-semibold truncate"
                            style={{ color: actionable ? 'var(--ink-primary)' : 'var(--ink-secondary)' }}
                          >
                            {b.title}
                          </div>
                          <div className="text-[11.5px] text-[var(--ink-secondary)] truncate">{b.detail}</div>
                        </div>
                      </div>

                      <div className="sm:grid sm:grid-cols-[120px_64px_124px] flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.13)',
                            }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${b.done ? 100 : pct}%`,
                                backgroundColor: b.done ? emeraldInk : 'var(--accent-primary)',
                              }}
                            />
                          </div>
                          <span className="tabular-nums text-[11px] font-medium text-[var(--ink-secondary)] w-9 text-left shrink-0">
                            {b.current}/{b.target}
                          </span>
                        </div>

                        <span
                          className="tabular-nums text-[12px] font-semibold text-right shrink-0"
                          style={{ color: actionable ? 'var(--ink-primary)' : 'var(--ink-secondary)' }}
                        >
                          +{Math.round(b.xp * progression.flameMultiplier)} XP
                        </span>

                        <div className="w-[124px] flex justify-center shrink-0">
                          {actionable ? (
                            <button
                              type="button"
                              onClick={() => (b.actionTab === 'rewards' ? claimDailyCrate() : setActiveTab(b.actionTab))}
                              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--accent-primary)]/45 bg-[var(--accent-primary-soft)] hover:border-[var(--accent-primary)] text-[11.5px] font-semibold transition-colors whitespace-nowrap"
                              style={{ color: emberInk }}
                            >
                              <span>{b.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span
                              className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[var(--bg-surface)]/45 text-[11.5px] font-medium"
                              style={{ color: emeraldInk }}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[var(--rule-hairline)] flex flex-wrap items-center justify-between gap-2">
                <div className="text-[12px] text-[var(--ink-secondary)]">
                  <strong className="text-[var(--ink-primary)]">Daily Trio Combo Vault:</strong> Finish all 3 for{' '}
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    +{progression.comboBonusXp} XP
                  </span>
                </div>
                {progression.comboClaimedToday ? (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: emeraldInk }}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Combo Claimed</span>
                  </span>
                ) : progression.allBountiesDone ? (
                  <button
                    type="button"
                    onClick={claimComboBonus}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    Claim +{progression.comboBonusXp} XP
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] text-[11px] font-medium text-[var(--ink-secondary)]">
                    <Lock className="w-3 h-3" />
                    <span>Complete 3 to Unlock</span>
                  </span>
                )}
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Full-Width 12-Col Bottom Streak Ribbon: balances bento symmetry with zero corner void! */}
        <SpotlightCard
          theme={isDark ? 'dark' : 'light'}
          spotlightColor={isDark ? 'rgba(231, 64, 4, 0.08)' : 'rgba(231, 64, 4, 0.04)'}
          className="hidden lg:flex studio-card rounded-2xl px-4 py-3 items-center justify-between gap-5"
        >
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-display font-bold text-[13.5px] text-[var(--ink-primary)]">
              28-Day Streak Pulse
            </span>
            <span className="text-[11.5px] text-[var(--ink-secondary)] tabular-nums font-medium">
              · {progression.mosaicDays.slice(-28).filter((d) => d.count > 0 || d.frozen).length}/28 days active
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 flex-1">
            {progression.mosaicDays.slice(-28).map((cell) => {
              const bg = cell.frozen
                ? 'rgba(20, 164, 252, 0.72)'
                : cell.count >= 4
                  ? '#E74004'
                  : cell.count >= 2
                    ? 'rgba(231, 64, 4, 0.52)'
                    : cell.count >= 1
                      ? 'rgba(231, 64, 4, 0.28)'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(15, 23, 42, 0.11)';
              return (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.frozen ? 'Shield Protected' : `${cell.count} action(s)`}`}
                  className="w-4 h-4 rounded-[4px]"
                  style={{
                    backgroundColor: bg,
                    boxShadow: cell.isToday ? '0 0 0 1.5px var(--bg-surface), 0 0 0 3px #E74004' : 'none',
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-[10.5px] text-[var(--ink-secondary)]">
              <span>Low</span>
              <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'rgba(231, 64, 4, 0.28)' }} />
              <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'rgba(231, 64, 4, 0.52)' }} />
              <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: '#E74004' }} />
              <span className="mr-1.5">Peak</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'rgba(20, 164, 252, 0.72)' }} />
                <span>Shield</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('trophy-cabinet')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[11.5px] font-semibold hover:underline inline-flex items-center gap-1"
              style={{ color: emberInk }}
            >
              <span>Trophy Cabinet</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </SpotlightCard>

        {/* S02 Showcase Section: Compact Passport Ribbon + Filter Bar + Restrained 16-Badge Grid (completely clear below 900px S01/S04) */}
        <section id="trophy-cabinet" className="space-y-3 mt-16 sm:mt-44 pt-2 scroll-mt-4">
          {/* Sleek Single-Bar Navigation & Active Passport Showcase Ribbon (zero duplicate giant banner!) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[var(--rule-hairline)]">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => document.getElementById('rewards-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Daily Vault</span>
              </button>
              {progression.pinnedBadge && (
                <>
                  <span className="h-3.5 w-px bg-[var(--rule-hairline)]" aria-hidden="true" />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11.5px] text-[var(--ink-secondary)] shrink-0">Pinned Emblem:</span>
                    <TrophyEmblem
                      emblem={progression.pinnedBadge.def.emblem}
                      rarity={progression.pinnedBadge.def.rarity}
                      unlocked
                      size="xs"
                      isDark={isDark}
                    />
                    <span className="text-[12.5px] font-semibold text-[var(--ink-primary)] truncate">
                      {progression.pinnedBadge.def.title}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                      style={{
                        backgroundColor: getRarityTheme(progression.pinnedBadge.def.rarity, isDark).soft,
                        color: getRarityTheme(progression.pinnedBadge.def.rarity, isDark).ink,
                      }}
                    >
                      {getRarityTheme(progression.pinnedBadge.def.rarity, isDark).label}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-[11.5px] text-[var(--ink-secondary)] shrink-0">
              <span className="hidden md:inline">Click Pin on any unlocked card to feature on Passport</span>
              <span className="inline-flex items-center gap-1.5 tabular-nums font-semibold text-[var(--ink-primary)]">
                <Trophy className="w-3.5 h-3.5" style={{ color: goldInk }} />
                <span>
                  {progression.unlockedCount}/{progression.achievements.length} Collected
                </span>
              </span>
            </div>
          </div>

          {/* Header & Filter Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <h2 className="font-display font-bold text-[18px] tracking-tight text-[var(--ink-primary)]">
                Collectible Trophy Cabinet
              </h2>
            </div>

            <div className="overflow-x-auto max-w-full rounded-xl border border-[var(--rule-strong)]">
              <RubberSegment
                items={[
                  { value: 'all', label: `All (${progression.achievements.length})` },
                  { value: 'unlocked', label: `Unlocked (${progression.unlockedCount})` },
                  { value: 'next', label: 'Next Up' },
                  { value: 'consistency', label: 'Streaks' },
                  { value: 'focus', label: 'Focus' },
                  { value: 'planning', label: 'Planning' },
                ]}
                value={filter}
                onChange={(v: string) => setFilter(v as TrophyFilter)}
                size="sm"
                radius={9}
                stretch={28}
                squash={18}
                trackColor={isDark ? '#151821' : '#eaedf3'}
                thumbColor={isDark ? '#242938' : '#ffffff'}
                textColor={isDark ? '#d2d8e4' : '#334155'}
                activeTextColor={isDark ? '#ffffff' : '#0f1115'}
                ariaLabel="Filter trophies"
              />
            </div>
          </div>

          {/* 4x4 Restrained Linear/DesignMaestro Cabinet Grid - Flush top rarity pill, footer Pin, rich Mythic/Epic tier polish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredAchievements.map((item) => {
              const pal = getRarityTheme(item.def.rarity, isDark);
              const pct = Math.min(100, Math.round((item.current / item.target) * 100));
              const isPinned = progression.pinnedBadge?.def.id === item.def.id;
              const isMythic = item.unlocked && item.def.rarity === 'mythic';
              const isEpic = item.unlocked && item.def.rarity === 'epic';
              const tierAura = isMythic
                ? 'radial-gradient(circle at 92% 8%, rgba(249, 207, 106, 0.18), transparent 58%)'
                : isEpic
                  ? 'radial-gradient(circle at 92% 8%, rgba(231, 64, 4, 0.11), transparent 54%)'
                  : item.unlocked && item.def.rarity === 'rare'
                    ? 'radial-gradient(circle at 92% 8%, rgba(56, 189, 248, 0.08), transparent 52%)'
                    : 'none';

              return (
                <SpotlightCard
                  key={item.def.id}
                  theme={isDark ? 'dark' : 'light'}
                  spotlightColor={item.unlocked ? pal.soft : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,17,21,0.03)'}
                  className="rounded-xl p-2.5 px-3 border flex flex-col gap-1.5 transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: item.unlocked ? 'var(--bg-surface)' : 'var(--bg-inset)',
                    backgroundImage: tierAura,
                    borderColor: isPinned || isMythic ? pal.border : item.unlocked ? 'var(--rule-strong)' : 'var(--rule-hairline)',
                    boxShadow: isMythic
                      ? 'inset 0 1px 0 rgba(249, 207, 106, 0.35)'
                      : item.unlocked
                        ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        : 'none',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 min-h-[36px]">
                    <TrophyEmblem
                      emblem={item.def.emblem}
                      rarity={item.def.rarity}
                      unlocked={item.unlocked}
                      size="sm"
                      isDark={isDark}
                    />
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-semibold tabular-nums shrink-0"
                      style={{
                        backgroundColor: item.unlocked ? pal.soft : 'var(--bg-elevated)',
                        color: item.unlocked ? pal.ink : 'var(--ink-secondary)',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pal.ink }} />
                      <span>
                        {pal.label} · +{item.def.xpReward} XP
                      </span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-[13.5px] text-[var(--ink-primary)] leading-tight">
                      {item.def.title}
                    </h3>
                    <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5 leading-snug min-h-[28px] line-clamp-2">
                      {item.def.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 mt-auto pt-1">
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.unlocked ? 100 : pct}%`,
                          backgroundColor: item.unlocked
                            ? item.def.rarity === 'common'
                              ? emeraldInk
                              : pal.ink
                            : isDark
                              ? '#9CA6BA'
                              : '#64748B',
                          opacity: item.unlocked ? 0.85 : 0.95,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] tabular-nums font-medium">
                      <span className="text-[var(--ink-secondary)]">
                        {item.current}/{item.target} {item.def.unit}
                      </span>
                      {!item.unlocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (item.def.id === 'pwa-installed') {
                              void triggerPwaInstall();
                            } else if (item.def.actionTab === 'rewards') {
                              setComebackModalOpen(true);
                            } else {
                              setActiveTab(item.def.actionTab);
                            }
                          }}
                          className="font-sans font-semibold text-[var(--ink-primary)] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{item.def.actionLabel}</span>
                          <span style={{ color: skyInk }}>→</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => pinShowcaseBadge(item.def.id)}
                            title={isPinned ? 'Pinned to Showcase' : 'Pin Emblem to Showcase'}
                            aria-label={isPinned ? `${item.def.title} pinned` : `Pin ${item.def.title}`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10.5px] font-medium hover:text-[var(--ink-primary)] transition-colors"
                            style={{
                              borderColor: isPinned ? pal.border : 'var(--rule-hairline)',
                              backgroundColor: isPinned ? pal.soft : 'var(--bg-elevated)',
                              color: isPinned ? pal.ink : 'var(--ink-secondary)',
                            }}
                          >
                            <Pin className="w-2.5 h-2.5" />
                            <span>{isPinned ? 'Pinned' : 'Pin'}</span>
                          </button>
                          <span className="inline-flex items-center gap-0.5 font-sans font-medium text-[var(--ink-secondary)]">
                            <Check className="w-3 h-3" style={{ color: emeraldInk }} />
                            <span>Unlocked</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </section>

        {/* 16-Week Momentum Mosaic (generous offset so S02 ends cleanly below Row 4) */}
        <section id="momentum-mosaic" className="mt-14 sm:mt-20 pt-2">
          <SpotlightCard
            theme={isDark ? 'dark' : 'light'}
            spotlightColor={isDark ? 'rgba(231, 64, 4, 0.08)' : 'rgba(231, 64, 4, 0.04)'}
            className="studio-card rounded-2xl p-4 sm:p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-[15px]">16-Week Consistency Mosaic</h2>
                <p className="text-[12px] text-[var(--ink-secondary)]">
                  Visual activity ledger across the last 112 days. Protected freeze tiles preserve unbroken streaks.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--ink-secondary)]">
                <span>Less</span>
                {[0, 1, 2, 4].map((lvl) => (
                  <span
                    key={lvl}
                    className="w-2.5 h-2.5 rounded-[3px]"
                    style={{
                      backgroundColor:
                        lvl === 4
                          ? '#E74004'
                          : lvl === 2
                            ? 'rgba(231, 64, 4, 0.65)'
                            : lvl === 1
                              ? 'rgba(231, 64, 4, 0.34)'
                              : isDark
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(15,17,21,0.08)',
                    }}
                  />
                ))}
                <span>More</span>
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: 'rgba(20, 164, 252, 0.6)' }} />
                  <span>Freeze</span>
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border bg-[var(--bg-inset)] overflow-x-auto">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[560px]">
                {progression.mosaicDays.map((cell) => {
                  const bg = cell.frozen
                    ? 'rgba(20, 164, 252, 0.6)'
                    : cell.count >= 4
                      ? '#E74004'
                      : cell.count >= 2
                        ? 'rgba(231, 64, 4, 0.68)'
                        : cell.count >= 1
                          ? 'rgba(231, 64, 4, 0.35)'
                          : isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(15, 17, 21, 0.07)';
                  return (
                    <div
                      key={cell.date}
                      title={`${cell.date}: ${cell.frozen ? 'Streak Freeze Shield Active' : `${cell.count} action(s)`}`}
                      className="w-3.5 h-3.5 rounded-[4px] transition-transform hover:scale-125"
                      style={{
                        backgroundColor: bg,
                        boxShadow: cell.isToday ? '0 0 0 1.5px var(--ink-primary)' : 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </SpotlightCard>
        </section>
      </div>
    </div>
  );
};
