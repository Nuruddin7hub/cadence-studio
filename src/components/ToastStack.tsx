import React from 'react';
import { Undo2, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const ToastStack: React.FC = () => {
  const { toasts, dismissToast, undoLast } = useWorkspace();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-5 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--rule-strong)',
            boxShadow: 'var(--shadow-panel)',
          }}
        >
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-[var(--ink-primary)] truncate">{t.message}</p>
            {t.detail && (
              <p className="text-[11.5px] text-[var(--ink-secondary)] truncate">{t.detail}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {t.canUndo && (
              <button
                type="button"
                onClick={() => {
                  undoLast();
                  dismissToast(t.id);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-medium bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--accent-amber)]"
              >
                <Undo2 className="w-3 h-3" />
                <span>Undo</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--ink-muted)]"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
