import React, { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import type { CustomCategoryPreset, EventCategory } from '../types/workspace';
import { formatDurationHuman } from '../utils/date';
import {
  buildDynamicCategoryStyle,
  CUSTOM_COLOR_SWATCHES,
  EVENT_CATEGORY_STYLES,
} from '../utils/themeTokens';

const BASE_EVENT_CATEGORIES: Exclude<EventCategory, 'custom'>[] = [
  'deep',
  'meeting',
  'personal',
  'health',
  'deadline',
];

interface CategoryLabelSelectorProps {
  category: EventCategory;
  customLabel?: string;
  customColor?: string;
  savedCustomLabels: CustomCategoryPreset[];
  isDark: boolean;
  compact?: boolean;
  onSelectPreset: (cat: Exclude<EventCategory, 'custom'>) => void;
  onSelectCustom: (label: string, color: string) => void;
  onSaveCustomLabel?: (label: string, color: string) => CustomCategoryPreset;
}

export const CategoryLabelSelector: React.FC<CategoryLabelSelectorProps> = ({
  category,
  customLabel,
  customColor,
  savedCustomLabels,
  isDark,
  compact = false,
  onSelectPreset,
  onSelectCustom,
  onSaveCustomLabel,
}) => {
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState(customLabel ?? '');
  const [draftColor, setDraftColor] = useState(customColor ?? CUSTOM_COLOR_SWATCHES[0]);

  useEffect(() => {
    if (composerOpen) {
      setDraftLabel(customLabel ?? '');
      setDraftColor(customColor ?? CUSTOM_COLOR_SWATCHES[0]);
    }
  }, [composerOpen, customColor, customLabel]);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = draftLabel.trim() || 'Custom';
    const saved = onSaveCustomLabel ? onSaveCustomLabel(clean, draftColor) : { id: clean, label: clean, color: draftColor };
    onSelectCustom(saved.label, saved.color);
    setComposerOpen(false);
  };

  const hasUnsavedActiveCustom =
    category === 'custom' &&
    Boolean(customLabel) &&
    !savedCustomLabels.some((s) => s.label.toLowerCase() === customLabel!.toLowerCase());

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {BASE_EVENT_CATEGORIES.map((cat) => {
          const m = EVENT_CATEGORY_STYLES[cat];
          const active = category === cat && !customLabel;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectPreset(cat)}
              className={`${
                compact ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-[11.5px]'
              } rounded-full font-medium border transition-colors inline-flex items-center gap-1`}
              style={{
                borderColor: active ? m.bar : 'var(--rule-hairline)',
                backgroundColor: active ? (isDark ? m.bgDark : m.bgLight) : 'var(--bg-inset)',
                color: active ? (isDark ? m.textDark : m.textLight) : 'var(--ink-secondary)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: m.bar }} />
              <span>{m.label}</span>
            </button>
          );
        })}

        {savedCustomLabels.map((preset) => {
          const st = buildDynamicCategoryStyle(preset.label, preset.color);
          const active =
            category === 'custom' &&
            customLabel?.toLowerCase() === preset.label.toLowerCase();
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectCustom(preset.label, preset.color)}
              className={`${
                compact ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-[11.5px]'
              } rounded-full font-medium border transition-colors inline-flex items-center gap-1`}
              style={{
                borderColor: active ? st.bar : 'var(--rule-hairline)',
                backgroundColor: active ? (isDark ? st.bgDark : st.bgLight) : 'var(--bg-inset)',
                color: active ? (isDark ? st.textDark : st.textLight) : 'var(--ink-secondary)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: st.bar }} />
              <span>{preset.label}</span>
            </button>
          );
        })}

        {hasUnsavedActiveCustom && (
          <button
            type="button"
            onClick={() => onSelectCustom(customLabel!, customColor ?? CUSTOM_COLOR_SWATCHES[0])}
            className={`${
              compact ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-[11.5px]'
            } rounded-full font-medium border inline-flex items-center gap-1`}
            style={{
              borderColor: customColor ?? '#06B6D4',
              backgroundColor: buildDynamicCategoryStyle(customLabel!, customColor).bgDark,
              color: isDark ? '#F8FAFC' : buildDynamicCategoryStyle(customLabel!, customColor).textLight,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: customColor ?? '#06B6D4' }} />
            <span>{customLabel}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setComposerOpen((v) => !v)}
          className={`${
            compact ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-[11.5px]'
          } rounded-full font-medium border border-dashed inline-flex items-center gap-1 transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--ink-primary)]`}
          style={{
            borderColor: composerOpen ? 'var(--accent-primary)' : 'var(--rule-strong)',
            color: composerOpen ? 'var(--accent-primary)' : 'var(--ink-secondary)',
          }}
        >
          {composerOpen ? <X className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
          <span>{composerOpen ? 'Close' : 'Custom'}</span>
        </button>
      </div>

      {composerOpen && (
        <div
          className="p-2.5 rounded-xl border space-y-2"
          style={{
            backgroundColor: 'var(--bg-inset)',
            borderColor: 'var(--rule-strong)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Custom label name (e.g. Study, Client)"
              aria-label="Custom category label name"
              className="flex-1 min-w-0 px-2.5 py-1 rounded-lg border bg-[var(--bg-surface)] text-[12px] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
            <button
              type="button"
              onClick={() => handleSave()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold text-white shrink-0"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <Check className="w-3 h-3" />
              <span>Use</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {CUSTOM_COLOR_SWATCHES.map((hex) => {
              const selected = draftColor.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setDraftColor(hex)}
                  aria-label={`Select color ${hex}`}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                  style={{
                    backgroundColor: hex,
                    boxShadow: selected ? '0 0 0 2px var(--bg-surface), 0 0 0 3.5px var(--ink-primary)' : 'none',
                  }}
                />
              );
            })}
            <label
              className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-[var(--ink-secondary)] cursor-pointer"
              title="Pick any custom hex color"
            >
              <span>Color</span>
              <input
                type="color"
                value={draftColor}
                onChange={(e) => setDraftColor(e.target.value)}
                aria-label="Custom label color picker"
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

interface DurationSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
  presets?: number[];
  min?: number;
  max?: number;
  compact?: boolean;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  value,
  onChange,
  presets = [15, 30, 45, 60, 90, 120],
  min = 5,
  max = 720,
  compact = false,
}) => {
  const isPreset = presets.includes(value);
  const [customOpen, setCustomOpen] = useState(!isPreset);
  const [customInput, setCustomInput] = useState(String(value));

  useEffect(() => {
    setCustomInput(String(value));
    if (!presets.includes(value)) {
      setCustomOpen(true);
    }
  }, [value, presets]);

  const commitCustom = (raw: string) => {
    const num = Math.round(Number(raw));
    if (!Number.isFinite(num) || num <= 0) return;
    const clamped = Math.max(min, Math.min(max, num));
    onChange(clamped);
    setCustomInput(String(clamped));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1">
        {presets.map((m) => {
          const active = value === m && !customOpen;
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                setCustomOpen(false);
                onChange(m);
              }}
              className={`${
                compact ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-[11.5px]'
              } rounded-lg border font-medium tabular-nums transition-colors`}
              style={{
                backgroundColor: active ? 'var(--accent-primary-soft)' : 'var(--bg-inset)',
                borderColor: active ? 'var(--accent-primary)' : 'var(--rule-hairline)',
                color: active ? 'var(--accent-primary)' : 'var(--ink-secondary)',
              }}
            >
              {m >= 60 ? (m % 60 === 0 ? `${m / 60}h` : `${m / 60}h`) : `${m}m`}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className={`${
            compact ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-[11.5px]'
          } rounded-lg border font-medium transition-colors`}
          style={{
            backgroundColor: customOpen || !isPreset ? 'var(--accent-primary-soft)' : 'var(--bg-inset)',
            borderColor: customOpen || !isPreset ? 'var(--accent-primary)' : 'var(--rule-hairline)',
            color: customOpen || !isPreset ? 'var(--accent-primary)' : 'var(--ink-secondary)',
          }}
        >
          {!isPreset ? `Custom (${formatDurationHuman(value)})` : 'Custom'}
        </button>
      </div>

      {customOpen && (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={min}
            max={max}
            step={5}
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              const parsed = Math.round(Number(e.target.value));
              if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
                onChange(parsed);
              }
            }}
            onBlur={() => commitCustom(customInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitCustom(customInput);
              }
            }}
            aria-label="Custom duration minutes"
            className="w-20 px-2 py-1 rounded-lg border bg-[var(--bg-surface)] font-mono-num text-[12px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <span className="text-[11px] text-[var(--ink-secondary)]">minutes ({formatDurationHuman(value)})</span>
        </div>
      )}
    </div>
  );
};
