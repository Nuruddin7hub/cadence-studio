import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { InspectorRail } from './components/InspectorRail';
import { TasksWorkspace } from './components/TasksWorkspace';
import { FocusHabitsStudio } from './components/FocusHabitsStudio';
import { AnalyticsSuite } from './components/AnalyticsSuite';
import { ProductivityOverview } from './components/ProductivityOverview';
import { CommandPalette } from './components/CommandPalette';
import { FocusCurtain } from './components/FocusCurtain';
import { MobileDock } from './components/MobileDock';
import { ToastStack } from './components/ToastStack';

const WorkspaceShell: React.FC = () => {
  const { activeTab } = useWorkspace();

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--ink-primary)] pb-14 md:pb-0">
      <TopBar />

      <main className="flex-1 min-h-0 flex overflow-hidden">
        {(activeTab === 'planner' || activeTab === 'tasks') && <Sidebar />}

        {activeTab === 'planner' && (
          <>
            <CalendarView />
            <InspectorRail />
          </>
        )}

        {activeTab === 'tasks' && (
          <>
            <TasksWorkspace />
            <InspectorRail />
          </>
        )}

        {activeTab === 'focus' && <FocusHabitsStudio />}

        {activeTab === 'analytics' && <AnalyticsSuite />}

        {activeTab === 'overview' && <ProductivityOverview />}
      </main>

      <MobileDock />
      <CommandPalette />
      <FocusCurtain />
      <ToastStack />
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}
