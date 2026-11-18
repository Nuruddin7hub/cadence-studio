import React from 'react';
import type { EmblemKind, TrophyRarity } from '../utils/gamification';

interface TrophyEmblemProps {
  emblem: EmblemKind;
  rarity: TrophyRarity;
  unlocked: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isDark?: boolean;
}

export const RARITY_STYLE: Record<
  TrophyRarity,
  {
    label: string;
    primary: string;
    secondary: string;
    lightInk: string;
    soft: string;
    lightSoft: string;
    border: string;
    lightBorder: string;
  }
> = {
  common: {
    label: 'Common',
    primary: '#B4BFCE',
    secondary: '#E2E8F0',
    lightInk: '#334155',
    soft: 'rgba(154, 165, 181, 0.14)',
    lightSoft: 'rgba(100, 116, 139, 0.10)',
    border: 'rgba(180, 191, 206, 0.36)',
    lightBorder: 'rgba(71, 85, 105, 0.25)',
  },
  rare: {
    label: 'Rare',
    primary: '#38BDF8',
    secondary: '#BAE6FD',
    lightInk: '#0369A1',
    soft: 'rgba(20, 164, 252, 0.15)',
    lightSoft: 'rgba(3, 105, 161, 0.10)',
    border: 'rgba(56, 189, 248, 0.45)',
    lightBorder: 'rgba(3, 105, 161, 0.30)',
  },
  epic: {
    label: 'Epic',
    primary: '#FF6B3D',
    secondary: '#FDBA74',
    lightInk: '#C23102',
    soft: 'rgba(231, 64, 4, 0.16)',
    lightSoft: 'rgba(231, 64, 4, 0.10)',
    border: 'rgba(231, 64, 4, 0.50)',
    lightBorder: 'rgba(194, 49, 2, 0.34)',
  },
  mythic: {
    label: 'Mythic',
    primary: '#F9CF6A',
    secondary: '#FEF3C7',
    lightInk: '#925402',
    soft: 'rgba(249, 207, 106, 0.20)',
    lightSoft: 'rgba(180, 108, 8, 0.12)',
    border: 'rgba(249, 207, 106, 0.56)',
    lightBorder: 'rgba(146, 84, 2, 0.38)',
  },
};

export function getRarityTheme(rarity: TrophyRarity, isDark: boolean) {
  const base = RARITY_STYLE[rarity];
  return {
    label: base.label,
    ink: isDark ? base.primary : base.lightInk,
    ring: isDark ? base.primary : base.lightInk,
    highlight: isDark ? base.secondary : base.lightInk,
    soft: isDark ? base.soft : base.lightSoft,
    border: isDark ? base.border : base.lightBorder,
  };
}

const SIZE_PX: Record<'xs' | 'sm' | 'md' | 'lg', number> = {
  xs: 22,
  sm: 36,
  md: 48,
  lg: 62,
};

export const TrophyEmblem: React.FC<TrophyEmblemProps> = ({
  emblem,
  rarity,
  unlocked,
  size = 'md',
  isDark = true,
}) => {
  const px = SIZE_PX[size];
  const pal = getRarityTheme(rarity, isDark);
  const stroke = unlocked ? pal.ring : isDark ? '#94A3B8' : '#64748B';
  const fillInner = unlocked ? pal.soft : isDark ? 'rgba(148, 163, 184, 0.11)' : 'rgba(15, 23, 42, 0.06)';
  const highlight = unlocked ? pal.highlight : isDark ? '#CBD5E1' : '#475569';
  const coreInk = unlocked ? (isDark ? '#FFFFFF' : pal.ink) : isDark ? '#CBD5E1' : '#475569';

  const renderGlyph = () => {
    switch (emblem) {
      case 'ignition':
        return (
          <>
            <path
              d="M24 11c2.5 5.2 7 7.8 7 13.5a7 7 0 1 1-14 0c0-3 1.4-5.7 3.5-8 .4 2.4 1.8 3.6 3.5 3.6-1.1-3.1-.7-6.1 0-9.1z"
              fill={highlight}
              opacity={unlocked ? 0.92 : 0.45}
            />
            <circle cx="24" cy="26.5" r="2.6" fill={coreInk} />
          </>
        );
      case 'escalator':
        return (
          <>
            <path
              d="M13 31h5v-5h5v-5h5v-6h6"
              stroke={highlight}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M28 15h6v6"
              stroke={coreInk}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'vault':
        return (
          <>
            <rect x="13" y="14" width="22" height="20" rx="4" stroke={highlight} strokeWidth="2.2" fill="none" />
            <circle cx="24" cy="24" r="4.5" stroke={highlight} strokeWidth="2.2" fill={fillInner} />
            <path d="M24 19.5V28.5M19.5 24H28.5" stroke={coreInk} strokeWidth="1.7" strokeLinecap="round" />
          </>
        );
      case 'striker':
        return (
          <>
            <rect x="14" y="14" width="20" height="20" rx="5" stroke={highlight} strokeWidth="2.2" fill="none" />
            <path
              d="M18.5 24.5l3.6 3.5 7.4-8"
              stroke={coreInk}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'engine':
        return (
          <>
            <polygon points="24,11 35,17.5 35,30.5 24,37 13,30.5 13,17.5" stroke={highlight} strokeWidth="2" fill="none" />
            <path
              d="M19 24l3.5 3.5L29 20"
              stroke={coreInk}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'architect':
        return (
          <>
            <rect x="13" y="15" width="22" height="19" rx="3" stroke={highlight} strokeWidth="2" fill="none" />
            <path d="M13 21h22M19 12v5M29 12v5" stroke={highlight} strokeWidth="2" strokeLinecap="round" />
            <rect x="18" y="25" width="12" height="4" rx="1.5" fill={coreInk} />
          </>
        );
      case 'sculptor':
        return (
          <>
            <rect x="13" y="14" width="22" height="6" rx="2" fill={highlight} opacity={unlocked ? 0.9 : 0.45} />
            <rect x="17" y="22" width="18" height="5" rx="2" stroke={highlight} strokeWidth="1.8" fill="none" />
            <rect x="13" y="29" width="15" height="5" rx="2" fill={coreInk} opacity={unlocked ? 0.9 : 0.45} />
          </>
        );
      case 'immersion':
        return (
          <>
            <circle cx="24" cy="24" r="10.5" stroke={highlight} strokeWidth="2.2" fill="none" />
            <path
              d="M24 17.5V24l4.5 3"
              stroke={coreInk}
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'centurion':
        return (
          <>
            <polygon
              points="24,11 28,19 37,20.5 30.5,26.8 32,35.5 24,31.2 16,35.5 17.5,26.8 11,20.5 20,19"
              stroke={highlight}
              strokeWidth="2"
              fill={unlocked ? pal.soft : 'none'}
              strokeLinejoin="round"
            />
            <circle cx="24" cy="24.5" r="3" fill={coreInk} />
          </>
        );
      case 'cadence3':
      case 'rhythm7':
      case 'unbroken14':
        return (
          <>
            <path
              d="M24 10l10 4.5v9c0 6.5-4.3 11.4-10 13.5-5.7-2.1-10-7-10-13.5v-9L24 10z"
              stroke={highlight}
              strokeWidth="2.1"
              fill={unlocked ? pal.soft : 'none'}
              strokeLinejoin="round"
            />
            <text
              x="24"
              y="27"
              textAnchor="middle"
              fontSize={emblem === 'unbroken14' ? '10' : '11.5'}
              fontWeight="800"
              fontFamily="Inter, sans-serif"
              fill={coreInk}
            >
              {emblem === 'unbroken14' ? '14' : emblem === 'rhythm7' ? '7' : '3'}
            </text>
          </>
        );
      case 'combo':
        return (
          <path
            d="M26 11L15 25h8l-1 12 11-14h-8l1-12z"
            stroke={highlight}
            strokeWidth="2"
            fill={unlocked ? highlight : 'none'}
            opacity={unlocked ? 0.92 : 0.6}
            strokeLinejoin="round"
          />
        );
      case 'chain':
        return (
          <>
            <rect x="13" y="18" width="12" height="12" rx="6" stroke={highlight} strokeWidth="2.4" fill="none" />
            <rect x="23" y="18" width="12" height="12" rx="6" stroke={coreInk} strokeWidth="2.4" fill="none" />
          </>
        );
      case 'anchor':
        return (
          <>
            <circle cx="24" cy="17" r="3.5" stroke={highlight} strokeWidth="2.2" fill="none" />
            <path
              d="M24 20.5V35M17 24h14M14.5 29.5c2 3.5 5.5 5.5 9.5 5.5s7.5-2 9.5-5.5"
              stroke={coreInk}
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      case 'native':
        return (
          <>
            <rect x="16" y="12" width="16" height="24" rx="3.5" stroke={highlight} strokeWidth="2.1" fill="none" />
            <circle cx="24" cy="22" r="3" fill={coreInk} />
            <path d="M21 31h6" stroke={highlight} strokeWidth="2" strokeLinecap="round" />
          </>
        );
    }
  };

  return (
    <svg width={px} height={px} viewBox="0 0 48 48" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={`rim-${rarity}-${isDark ? 'd' : 'l'}`} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={unlocked ? highlight : stroke} />
          <stop offset="55%" stopColor={stroke} />
          <stop offset="100%" stopColor={unlocked ? pal.ring : stroke} stopOpacity={unlocked ? 0.72 : 0.65} />
        </linearGradient>
        <radialGradient id={`medal-${rarity}-${isDark ? 'd' : 'l'}`} cx="34%" cy="22%" r="74%">
          <stop offset="0%" stopColor={unlocked ? highlight : stroke} stopOpacity={unlocked ? 0.45 : 0.16} />
          <stop offset="55%" stopColor={fillInner} stopOpacity={unlocked ? 0.65 : 0.18} />
          <stop offset="100%" stopColor={isDark ? '#0B0E14' : '#E2E8F0'} stopOpacity={unlocked ? 0.78 : 0.28} />
        </radialGradient>
      </defs>
      {/* Obsidian/Paper Coin Core */}
      <circle
        cx="24"
        cy="24"
        r="21.2"
        fill={`url(#medal-${rarity}-${isDark ? 'd' : 'l'})`}
        stroke={`url(#rim-${rarity}-${isDark ? 'd' : 'l'})`}
        strokeOpacity={unlocked ? 1 : 0.76}
        strokeWidth={unlocked ? (rarity === 'mythic' ? '2.35' : '2.05') : '1.6'}
      />
      {/* Sculpted Bevel Gloss Arc */}
      <path
        d="M10.5 13a16.8 16.8 0 0 1 26.5-0.5"
        stroke="#FFFFFF"
        strokeOpacity={unlocked ? 0.55 : 0.22}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle
        cx="24"
        cy="24"
        r="17.4"
        fill="none"
        stroke={unlocked ? highlight : stroke}
        strokeOpacity={unlocked ? 0.48 : 0.32}
        strokeWidth="1"
      />
      {/* Collector Tier Cardinal Notches for Epic & Mythic */}
      {unlocked && (rarity === 'mythic' || rarity === 'epic') && (
        <path
          d="M24 2.4v2.4M24 43.2v2.4M2.4 24h2.4M43.2 24h2.4"
          stroke={highlight}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
      <g opacity={unlocked ? 1 : 0.92}>{renderGlyph()}</g>
    </svg>
  );
};

interface VaultCrateSvgProps {
  tier: TrophyRarity;
  status: 'claimed' | 'ready' | 'locked';
  size?: number;
  isDark?: boolean;
}

/**
 * Escalating multi-tier supply-vault chest artwork: Common Box -> Rare Reinforced Dome -> Epic Trim -> Mythic Crowned Citadel.
 */
export const VaultCrateSvg: React.FC<VaultCrateSvgProps> = ({
  tier,
  status,
  size = 34,
  isDark = true,
}) => {
  const gradId = `crate-${tier}-${status}-${isDark ? 'd' : 'l'}`;
  const isMythic = tier === 'mythic';
  const isEpic = tier === 'epic';
  const isRare = tier === 'rare';
  const rim =
    status === 'ready'
      ? '#FF6B3D'
      : status === 'claimed'
        ? isDark
          ? '#34D399'
          : '#059669'
        : isDark
          ? '#94A3B8'
          : '#64748B';
  const topGrad =
    status === 'ready'
      ? '#FDE047'
      : status === 'claimed'
        ? isDark
          ? '#34D399'
          : '#10B981'
        : isDark
          ? '#CBD5E1'
          : '#94A3B8';
  const baseGrad =
    status === 'ready'
      ? '#E74004'
      : status === 'claimed'
        ? isDark
          ? '#064E3B'
          : '#047857'
        : isDark
          ? '#1E293B'
          : '#CBD5E1';

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={topGrad} stopOpacity={status === 'ready' ? 0.65 : status === 'claimed' ? 0.42 : 0.28} />
          <stop offset="55%" stopColor={baseGrad} stopOpacity={status === 'ready' ? 0.45 : status === 'claimed' ? 0.26 : 0.16} />
          <stop offset="100%" stopColor={isDark ? '#090D16' : '#E2E8F0'} stopOpacity="0.82" />
        </linearGradient>
      </defs>

      {/* Mythic Crowned Pediment OR Rare/Epic Wing Shoulder */}
      {isMythic && (
        <path
          d="M14 9.5L20 5.5L26 9.5"
          stroke={status === 'ready' ? '#F5C466' : rim}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Escalating Lid Silhouette */}
      <path
        d={
          status === 'ready' || isEpic || isMythic
            ? 'M6.5 15L11 8.5h18L33.5 15H6.5z'
            : isRare
              ? 'M7.5 16Q20 8.5 32.5 16H7.5z'
              : 'M8.5 16.5L12 11.5h16l3.5 5H8.5z'
        }
        fill={`url(#${gradId})`}
        stroke={rim}
        strokeWidth="1.65"
        strokeLinejoin="round"
      />

      {/* Heavy Vault Body */}
      <rect
        x="7.5"
        y="16.5"
        width="25"
        height="15.5"
        rx={isEpic || isMythic ? '4' : '3'}
        fill={`url(#${gradId})`}
        stroke={rim}
        strokeWidth="1.65"
      />

      {/* Tier Reinforced Straps & Specular Lid Reflection */}
      <path d="M10.5 18.8h19" stroke="#FFFFFF" strokeOpacity={status === 'ready' ? 0.62 : 0.28} strokeWidth="1.15" strokeLinecap="round" />
      <path d="M7.5 23h25" stroke={rim} strokeOpacity="0.48" strokeWidth="1.2" />
      {(isRare || isEpic || isMythic) && (
        <>
          <path d="M13 17v14.5M27 17v14.5" stroke={rim} strokeOpacity="0.42" strokeWidth="1.25" />
        </>
      )}

      {/* Sculpted Jewel / Crest Clasp */}
      {isEpic || isMythic ? (
        <path
          d="M20 12.2l4 5.2-4 5.2-4-5.2 4-5.2z"
          fill={status === 'ready' ? '#F5C466' : status === 'claimed' ? '#34D399' : rim}
          stroke={rim}
          strokeWidth="1.25"
        />
      ) : (
        <rect
          x="16.8"
          y="13.8"
          width="6.4"
          height="7.4"
          rx="2"
          fill={status === 'ready' ? '#F4C46C' : status === 'claimed' ? (isDark ? '#34D399' : '#059669') : baseGrad}
          stroke={rim}
          strokeWidth="1.35"
        />
      )}
      {status === 'ready' && <circle cx="20" cy="17.5" r="1.2" fill="#FFFFFF" fillOpacity="0.95" />}
    </svg>
  );
};
