import React from 'react';
import { BarChart3, Calendar, CheckSquare, Compass, Timer } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { WorkspaceTab } from '../types/workspace';

const MOBILE_TABS: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'planner', label: 'Planner', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'overview', label: 'Overview', icon: Compass },
];

export const MobileDock: React.FC = () => {
  const { activeTab, setActiveTab } = useWorkspace();

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-1.5 flex items-center justify-around backdrop-blur-xl"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 94%, transparent)',
        borderColor: 'var(--rule-hairline)',
        boxShadow: '0 -12px 28px -8px rgba(0, 0, 0, 0.35)',
      }}
    >
      {MOBILE_TABS.map((t) => {
        const Icon = t.icon;
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg min-w-[56px] relative"
            style={{
              color:
                active || (activeTab === 'rewards' && t.id === 'focus')
                  ? 'var(--accent-primary)'
                  : 'var(--ink-secondary)',
            }}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10.5px] font-medium">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
